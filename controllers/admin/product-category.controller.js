// Models
const productCategory = require("../../models/product-category.model");
const Account = require("../../models/account.model");

// Config
const systemConfig = require("../../config/system");

// Helpers
const filterStatusHelper = require("../../helpers/filterStatus");
const searchHelper = require("../../helpers/search");
const paginationHelper = require("../../helpers/pagination");
const createTreeHelper = require("../../helpers/createTree");


// [GET] /admin/products-category
module.exports.index = async (req, res) => {
    // Filter status
    const filterStatus = filterStatusHelper(req.query);
    let find = {
        deleted: false
    };
    if (req.query.status) {
        find.status = req.query.status;
    }

    // Search
    const objectSearch = searchHelper(req.query);
    if (objectSearch.regex) {
        find.title = objectSearch.regex;
    }

    // // Pagination
    // const countProductCategory = await productCategory.countDocuments(find);
    // let objectPagination = paginationHelper({
    //     currentPage: 1,
    //     limitItems: 4
    //     },
    //     req.query,
    //     countProductCategory
    // );

    // Sort
    let sort = {};
    if (req.query.sortKey && req.query.sortValue) {
        sort[req.query.sortKey] = req.query.sortValue;
    }
    else {
        sort.position = "desc";
    }   

    const records = await productCategory.find(find)
                                         .sort(sort)
                                        // .limit(objectPagination.limitItems)
                                        // .skip(objectPagination.skip);

    const newRecords = createTreeHelper.tree(records);

    for (const record of records) {
        // Take information of created person
        const createdPerson = await Account.findOne({ _id: record.createdBy.account_id });
        
        if (createdPerson) {
            record.createdUserFullName = createdPerson.fullName;
        }
        // End Take information of created person

        // Take information of latest updated person
        const latestUpdatedPerson = record.updatedBy[record.updatedBy.length - 1];

        if (latestUpdatedPerson) {
            const updatedUser = await Account.findOne({ _id: latestUpdatedPerson.account_id });

            record.updatedUserFullName = updatedUser.fullName;
        }
        // End Take information of latest updated person
    }
    
    res.render('admin/pages/products-category/index', {
        pageTitle: "Danh mục sản phẩm",
        records: newRecords,
        filterStatus: filterStatus,
        keyword: objectSearch.keyword,
        // pagination: objectPagination
    });
}

// [PATCH] /admin/products-category/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
    const status = req.params.status;
    const id = req.params.id;

    await productCategory.updateOne({ _id: id }, { status: status });

    req.flash("success", "Cập nhật trạng thái sản phẩm thành công!");

    res.redirect("back");
}

// [PATCH] /admin/products-category/change-multi
module.exports.changeMulti = async (req, res) => {
    const type = req.body.type;
    const ids = req.body.ids.split(', ');

    switch (type) {
        case "active":
            await productCategory.updateMany({ _id: { $in: ids } }, { status: "active" });
            req.flash("success", `Cập nhật trạng thái cho ${ids.length} sản phẩm thành công!`);
            break;
        case "inactive":
            await productCategory.updateMany({ _id: { $in: ids } }, { status: "inactive" });
            req.flash("success", `Cập nhật trạng thái cho ${ids.length} sản phẩm thành công!`);
            break;
        case "delete-all":
            await productCategory.updateMany({ _id: { $in: ids } }, { deleted: true, deletedAt: new Date() });
            req.flash("success", `Đã xóa ${ids.length} sản phẩm!`);
            break;
        case "change-position":
            for (const item of ids) {
                let [id, position] = item.split("-");
                position = parseInt(position);
                await productCategory.updateOne({ _id: id }, { position: position });
            }
            req.flash("success", `Cập nhật trạng thái cho ${ids.length} sản phẩm thành công!`);
            break;
        default:
            break;
    }
    res.redirect("back");
}

// [DELETE] /admin/products-category/delete/:id
module.exports.deleteItem = async (req, res) => {
    const id = req.params.id;

    await productCategory.updateOne({ _id: id }, { deleted: true, deletedAt: new Date() });

    res.redirect("back");
}

// [GET] /admin/products-category/create
module.exports.create = async (req, res) => {
    let find = {
        deleted: false
    };

    const records = await productCategory.find(find);
    const newRecords = createTreeHelper.tree(records);

    res.render('admin/pages/products-category/create', {
        pageTitle: "Tạo danh mục sản phẩm",
        records: newRecords
    });
}

// [POST] /admin/products-category/create
module.exports.createPost = async (req, res) => {
    const permissions = res.locals.role.permissions;

    if (permissions.includes("products-category_create")) {
        if (req.body.position == "") {
            const count = await productCategory.countDocuments();
            req.body.position = count + 1;
        }
        else {
            req.body.position = parseInt(req.body.position);
        }

        req.body.createdBy = {
            account_id: res.locals.user.id
        }
    
        const record = new productCategory(req.body);
        await record.save();
    
        res.redirect(`${systemConfig.prefixAdmin}/products-category`);
    }
    else {
        res.send("403");
    }
}

// [GET] /admin/products-category/edit/:id
module.exports.edit = async (req, res) => {
    try {
        const id = req.params.id;

        const data = await productCategory.findOne({
            _id: id,
            deleted: false
        });

        const records = await productCategory.find({
            deleted: false
        });

        const newRecords = createTreeHelper.tree(records);

        res.render('admin/pages/products-category/edit', {
            pageTitle: "Chi tiết danh mục sản phẩm",
            data: data,
            records: newRecords
        });
    } catch (error) {
        res.redirect(`${systemConfig.prefixAdmin}/products-category`)
    }
}

// [PATCH] /admin/products-category/edit/:id
module.exports.editPatch = async (req, res) => {
    const id = req.params.id;
    
    req.body.position = parseInt(req.body.position);
    const updatedBy = {
        account_id: res.locals.user.id,
        updatedAt: new Date()
    };

    await productCategory.updateOne({ _id: id }, {
        ...req.body,
        $push: { updatedBy: updatedBy }
    });
    
    req.flash("success", "Cập nhật thành công!");
    res.redirect(`${systemConfig.prefixAdmin}/products-category`)
}

// [GET] /admin/products-category/detail/:id
module.exports.detail = async (req, res) => {
    try {
        const find = {
            deleted: false,
            _id: req.params.id
        }
    
        const product = await productCategory.findOne(find);
    
        res.render("admin/pages/products-category/detail", {
            pageTitle: product.title,
            product: product
        });
    } catch (error) {
        res.redirect(`${systemConfig.prefixAdmin}/products-category`);
    }
}
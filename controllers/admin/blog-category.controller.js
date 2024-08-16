// Models
const blogCategory = require("../../models/blog-category.model");
const Account = require("../../models/account.model");

// Config
const systemConfig = require("../../config/system");

// Helpers
const filterStatusHelper = require("../../helpers/filterStatus");
const searchHelper = require("../../helpers/search");
const paginationHelper = require("../../helpers/pagination");
const createTreeHelper = require("../../helpers/createTree");

// [GET] /admin/roles
module.exports.index = async (req, res) => {
    // Filter Status
    const filterStatus = filterStatusHelper(req.query);
    let find = {
        deleted: false
    };

    if (req.query.status) {
        find.status = req.query.status;
    }
    // End Filter Status

    // Search
    const objectSearch = searchHelper(req.query);

    if (objectSearch.regex) {
        find.title = objectSearch.regex;
    }
    // End Search

    // Pagination
    // End Pagination

    // Sort
    let sort = {};

    if (req.query.sortKey && req.query.sortValue) {
        sort[req.query.sortKey] = req.query.sortValue;
    }
    else {
        sort.position = "desc";
    }
    // End Sort

    const records = await blogCategory.find(find)
                                      .sort(sort);

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

    res.render('admin/pages/blogs-category/index', {
        pageTitle: "Danh mục bài viết",
        filterStatus: filterStatus,
        records: newRecords,
        keyword: objectSearch.keyword
    });
}

// [GET] /admin/blogs-category/create
module.exports.create = async (req, res) => {
    let find = {
        deleted: false
    };

    const records = await blogCategory.find(find);
    const newRecords = createTreeHelper.tree(records);

    res.render('admin/pages/blogs-category/create', {
        pageTitle: "Tạo danh mục bài viết",
        records: newRecords
    })
}

// [POST] /admin/blogs-category/create
module.exports.createPost = async (req, res) => {
    const permissions = res.locals.role.permissions;

    if (permissions.includes("blogs-category_create")) {
        if (req.body.position == "") {
            const count = await blogCategory.countDocuments();
            req.body.position = count + 1;
        }
        else {
            req.body.position = parseInt(req.body.position);
        }

        req.body.createdBy = {
            account_id: res.locals.user.id
        }

        const record = new blogCategory(req.body);
        await record.save();

        res.redirect(`${systemConfig.prefixAdmin}/blogs-category`)
    }
    else {
        res.send("403");
    }
}

// [PATCH] /admin/blogs-category/change-multi
module.exports.changeMulti = async (req, res) => {
    const type = req.body.type;
    const ids = req.body.ids.split(', ');

    switch (type) {
        case "active":
            await blogCategory.updateMany({ _id: { $in: ids } }, { status: "active" });
            req.flash("success", `Cập nhật trạng thái cho ${ids.length} sản phẩm thành công!`);
            break;
        case "inactive":
            await blogCategory.updateMany({ _id: { $in: ids } }, { status: "inactive" });
            req.flash("success", `Cập nhật trạng thái cho ${ids.length} sản phẩm thành công!`);
            break;
        case "delete-all":
            await blogCategory.updateMany({ _id: { $in: ids } }, { deleted: true, deletedAt: new Date() });
            req.flash("success", `Đã xóa ${ids.length} sản phẩm!`);
            break;
        case "change-position":
            for (const item of ids) {
                let [id, position] = item.split("-");
                position = parseInt(position);
                await blogCategory.updateOne({ _id: id }, { position: position });
            }
            req.flash("success", `Cập nhật trạng thái cho ${ids.length} sản phẩm thành công!`);
            break;
        default:
            break;
    }
    res.redirect("back");
}

// [PATCH] /admin/blogs-category/:status/:id
module.exports.changeStatus = async (req, res) => {
    const status = req.params.status;
    const id = req.params.id;

    await blogCategory.updateOne(
        { _id: id },
        { status: status }
    );

    req.flash("success", "Cập nhật trạng thái bài viết thành công!");

    res.redirect("back");
}

// [DELETE] /admin/blogs-category/delete/:id
module.exports.deleteItem = async (req, res) => {
    const id = req.params.id;

    await blogCategory.updateOne(
        { _id: id },
        { deleted: true }
    );

    req.flash("success", "Xóa bài viết thành công!");

    res.redirect("back");
}

// [GET] /admin/blogs-category/detail/:id
module.exports.detail = async (req, res) => {
    const id = req.params.id;
    const record = await blogCategory.findOne(
        { _id: id },
        { deleted: false }
    );

    res.render("admin/pages/blogs-category/detail", {
        pageTitle: record.title,
        record: record
    });
}

// [GET] /admin/blogs-category/edit/:id
module.exports.edit = async (req, res) => {
    try {
        const id = req.params.id;

        const data = await blogCategory.findOne({
            _id: id,
            deleted: false
        });

        const records = await blogCategory.find({
            deleted: false
        });

        const newRecords = createTreeHelper.tree(records);

        res.render('admin/pages/blogs-category/edit', {
            pageTitle: "Chi tiết danh mục bài viết",
            data: data,
            records: newRecords
        });
    } catch (error) {
        res.redirect(`${systemConfig.prefixAdmin}/blogs-category`)
    }
}

// [PATCH] /admin/blogs-category/edit/:id
module.exports.editPatch = async (req, res) => {
    const id = req.params.id;
    
    req.body.position = parseInt(req.body.position);
    const updatedBy = {
        account_id: res.locals.user.id,
        updatedAt: new Date()
    };

    await blogCategory.updateOne({ _id: id }, {
        ...req.body,
        $push: { updatedBy: updatedBy }
    });
    
    req.flash("success", "Cập nhật thành công!");
    res.redirect(`${systemConfig.prefixAdmin}/blogs-category`)
}
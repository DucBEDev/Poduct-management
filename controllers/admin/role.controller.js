// Models
const Role = require('../../models/role.model');
const Account = require('../../models/account.model');

// Config
const systemConfig = require("../../config/system");


// [GET] /admin/roles
module.exports.index = async (req, res) => {
    let find = {
        deleted: false
    };

    const records = await Role.find(find);

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
            const updatedPerson = await Account.findOne({ _id: latestUpdatedPerson.account_id });

            record.updatedUserFullName = updatedPerson.fullName;
        }
        // End Take information of latest updated person
        
    }

    res.render('admin/pages/roles/index', {
        pageTitle: "Nhóm quyền",
        records: records
    });
}

// [GET] /admin/roles/create
module.exports.create = async (req, res) => {
    res.render('admin/pages/roles/create', {
        pageTitle: "Tạo nhóm quyền"
    });
}

// [POST] /admin/roles/create
module.exports.createPost = async (req, res) => {
    req.body.createdBy = { 
        account_id: res.locals.user.id
    }
    
    const record = new Role(req.body);

    await record.save();

    res.redirect(`${systemConfig.prefixAdmin}/roles`);
}

// [GET] /admin/roles/edit/:id
module.exports.edit = async (req, res) => {
    try {
        let find = {
            _id: req.params.id,
            deleted: false
        };
        const role = await Role.findOne(find);
        
        res.render("admin/pages/roles/edit", {
            pageTitle: "Chỉnh sửa nhóm quyền",
            records: role
        });
    } catch (error) {
        res.redirect(`${systemConfig.prefixAdmin}/roles`)
    }
}

// [PATCH] /admin/roles/edit/:id
module.exports.editPatch = async (req, res) => {
    try {
        const updatedBy = {
            account_id: res.locals.user.id,
            updatedAt: new Date()
        };

        await Role.updateOne({ _id: req.params.id }, {
            ...req.body,
            $push: { updatedBy: updatedBy }
        });
        req.flash("success", "Cập nhật thành công!");
    } catch (error) {
        req.flash("error", "Cập nhật thất bại!");v
    } 

    res.redirect(`${systemConfig.prefixAdmin}/roles`);
}

// [DELETE] /admin/roles/delete/:id
module.exports.deleteItem = async (req, res) => {
    const id = req.params.id;

    await Role.updateOne({ _id: id }, { deleted: true, deleteAt: new Date() });

    res.redirect("back");
}

// [GET] /admin/roles/detail/:id
module.exports.detailItem = async (req, res) => {
    try {
        const id = req.params.id;
        let find = {
            _id: id,
            deleted: false
        };

        const record = await Role.findOne(find);

        res.render("admin/pages/roles/detail", {
            pageTitle: "Chi tiết nhóm quyền",
            records: record
        })
    } catch (error) {
        res.redirect(`${systemConfig.prefixAdmin}/roles`)
    }
}

// [GET] /admin/roles/permissions
module.exports.permissions = async (req, res) => {
    let find = {
        deleted: false
    };
    const records = await Role.find(find);

    res.render("admin/pages/roles/permissions", {
        pageTitle: "Phân quyền",
        records: records
    })
}

// [PATCH] /admin/roles/permissions
module.exports.permissionsPatch = async (req, res) => {
    const permissions = JSON.parse(req.body.permissions);

    for (const item of permissions) {
        const id = item.id;
        const permissions = item.permissions;

        await Role.updateOne({ _id: id }, { permissions: permissions});
    }
    req.flash("success", "Cập nhật phân quyền thành công!");
    res.redirect("back");
}
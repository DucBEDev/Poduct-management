const md5 = require('md5');
const Account = require("../../models/account.model")


// [GET] /admin/my-account
module.exports.index = async (req, res) => {
    res.render("admin/pages/my-account/index", {
        pageTitle: "Thông tin tài khoản"
    })
}

// [GET] /admin/my-account/edit
module.exports.edit = async (req, res) => {
    res.render("admin/pages/my-account/edit", {
        pageTitle: "Chỉnh sửa thông tin tài khoản"
    })
}

// [PATCH] /admin/my-account/edit
module.exports.editPatch = async (req, res) => {
    const id = res.locals.user.id;

    const emailExist = await Account.findOne({
        _id: { $ne: id },
        email: req.body.email,
        deleted: false
    });

    if (!emailExist) {
        if (req.body.password) {
            req.body.password  = md5(req.body.password);
        } 
        else { 
            delete req.body.password;
        }
    
        await Account.updateOne({ _id: id }, req.body);
        req.flash("success", "Cập nhật tài khoản thành công!");
    }
    else {
        req.flash("error", "Email đã tồn tại!");
    }
    res.redirect(`back`);
}
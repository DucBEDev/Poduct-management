const express = require('express');
const router = express.Router();

const controller = require("../../controllers/admin/blog-category.controller")
const validate = require("../../validates/admin/product-category.validate");

router.get('/', controller.index);
router.get('/create', controller.create);
router.post('/create', validate.createPost, controller.createPost);
router.patch('/change-multi', controller.changeMulti);
router.patch('/change-status/:status/:id', controller.changeStatus);
router.delete('/delete/:id', controller.deleteItem);
router.get('/detail/:id', controller.detail);
router.get('/edit/:id', controller.edit);
router.patch('/edit/:id', validate.createPost, controller.editPatch);


module.exports = router;
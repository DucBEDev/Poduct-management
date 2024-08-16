const express = require('express');
const router = express.Router();

// Connect Multer library to upload images
const multer = require('multer');
// const storageMulter = require("../../helpers/storageMulter");
const upload = multer();
const uploadCloud = require("../../middlewares/admin/uploadCloud.middleware")

const controller = require("../../controllers/admin/account.controller")
const validate = require("../../validates/admin/account.validate")

router.get('/', controller.index);
router.get('/create', controller.create);
router.post('/create', upload.single('avatar'), uploadCloud.upload, validate.createPost, controller.createPost);
router.get('/edit/:id', controller.edit);
router.patch('/edit/:id', upload.single('avatar'), uploadCloud.upload, validate.editPatch, controller.editPatch);
router.get('/detail/:id', controller.detail);
router.delete('/delete/:id', controller.delete);
router.patch('/change-status/:status/:id', controller.changeStatus);

module.exports = router;
const express = require('express');
const router = express.Router();

const controller = require("../../controllers/admin/my-account.controller");
// Connect Multer library to upload images
const multer = require('multer');
// const storageMulter = require("../../helpers/storageMulter");
const upload = multer();
const uploadCloud = require("../../middlewares/admin/uploadCloud.middleware")


router.get('/', controller.index);
router.get('/edit', controller.edit);
router.patch('/edit', upload.single('avatar'), uploadCloud.upload, controller.editPatch);

module.exports = router;
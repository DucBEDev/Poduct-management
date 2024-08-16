const Product = require("../../models/product.model");

const productsHelper = require("../../helpers/products");

// [GET] /
module.exports.index = async (req, res) => {
    // Take featured product
    const productFeatured = await Product.find({
        featured: "1",
        deleted: false,
        status: "active"
    }).limit(6);

    const newProductsFeatured = productsHelper.priceNewProducts(productFeatured);
    // End Take featured product

    // Display latest product
    const productsNew = await Product.find({
        deleted: false,
        status: "active"
    }).sort({ position: "desc"}).limit(6);

    const newProductsNew = productsHelper.priceNewProducts(productsNew);
    // End Display latest product

    res.render('client/pages/home/index', {
        pageTitle: "Dashboard",
        productsFeatured: newProductsFeatured,
        productsNew: newProductsNew
    });
}
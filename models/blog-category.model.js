const mongoose = require("mongoose");

// Connect Slug to change url's name of a product detail
const slug = require("mongoose-slug-updater");
mongoose.plugin(slug);

const blogCategorySchema = new mongoose.Schema({
    title: String,
    parent_id: {
        type: String,
        default: ""
    },
    description: String,
    status: String,
    position: Number,
    slug: {
        type: String,
        slug: "title",
        unique: true
    },
    createdBy: {
        account_id: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    },
    updatedBy: [
        {
            account_id: String,
            updatedAt: Date
        }
    ],
    deleted: {
        type: Boolean,
        default: false
    },
    deletedAt: Date
}, {
    timestamps: true
});

const BlogCategory = mongoose.model("BlogCategory", blogCategorySchema, "blogs-category");

module.exports = BlogCategory;
const Blog = require("../models/Blog");

function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-');
}

async function generateUniqueSlug(title) {
    let slug = slugify(title);
    let slugExists = await Blog.findOne({ slug });
    let count = 1;

    while (slugExists) {
        slug = `${slugify(title)}-${count++}`;
        slugExists = await Blog.findOne({ slug });
    }

    return slug;
}

module.exports = { generateUniqueSlug };
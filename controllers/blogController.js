const Blog = require('../models/Blog');
const fs = require('fs');
const path = require('path');

exports.createBlog = async (req, res) => {
    try {
        const { title, description } = req.body;
        const userId = req.user.userId;
        const image = req.file;
        if (!title || !description || !image) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const blog = new Blog({
            title,
            description,
            image: `/uploads/${image.filename}`,
            createdBy: userId
        });

        await blog.save();

        res.status(201).json({ message: 'Blog created successfully', blog });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find().populate('createdBy', 'email').sort({ createdAt: -1 });
        res.json(blogs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getBlogById = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id).populate('createdBy', 'email');
        if (!blog) return res.status(404).json({ message: 'Blog not found' });

        res.json(blog);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateBlog = async (req, res) => {
    try {
        const { title, description } = req.body;
        const blogId = req.params.id;
        const userId = req.user.userId;
        const image = req.file;
        if (!title && !description && !image) {
            return res.status(400).json({ message: 'At least one field is required' });
        }

        const blog = await Blog.findById(blogId);
        if (!blog) return res.status(404).json({ message: 'Blog not found' });

        if (blog.createdBy.toString() !== userId) {
            return res.status(403).json({ message: 'Not authorized to edit this blog' });
        }

        blog.description = description || blog.description;
        blog.title = title || blog.title;

        if (image) {
            if (blog.image) {
                const oldPath = path.resolve(blog.image);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
            blog.image = `/uploads/${image.filename}`;
        }

        await blog.save();
        res.json({ message: 'Blog updated', blog });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteBlog = async (req, res) => {
    try {
        const blogId = req.params.id;
        const userId = req.user.userId;

        const blog = await Blog.findById(blogId);
        if (!blog) return res.status(404).json({ message: 'Blog not found' });

        if (blog.createdBy.toString() !== userId) {
            return res.status(403).json({ message: 'Not authorized to delete this blog' });
        }

        if (blog.image) {
            const oldPath = path.resolve(blog.image);
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }

        await blog.deleteOne();
        res.json({ message: 'Blog deleted' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getFeeds = async (req, res) => {
    try {
        const blogs = await Blog.find().sort({ createdAt: -1 }); // latest first
        res.json(blogs);
    } catch (err) {
        res.status(500).json({ message: 'Failed to load feed' });
    }
}

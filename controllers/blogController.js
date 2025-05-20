const Blog = require('../models/Blog');
const fs = require('fs');
const path = require('path');

exports.createBlog = async (req, res) => {
    try {
        const { title, description } = req.body;
        const userId = req.user.userId;
        const image = req.file;
        if (!title || !description) {
            return res.status(400).json({ message: 'title or desscription missing!' });
        }

        if (title.trim().length < 3) {
            return res.status(400).json({ message: 'Title must be atleast 3 characters' });
        }

        if (description.trim().length < 10) {
            return res.status(400).json({ message: 'Description must be atleast 10 characters' });
        }

        const allowedTypes = ['.jpg', '.jpeg', '.png', '.gif'];
        const ext = path.extname(image.originalname).toLowerCase();
        if (!allowedTypes.includes(ext)) {
            return res.status(400).json({ message: 'Only JPEG, JPG, PNG, and GIF image types are allowed.' });
        }

        const MAX_SIZE = 2 * 1024 * 1024;
        if (image.size > MAX_SIZE) {
            return res.status(400).json({ message: 'Image must be less than 2MB' });
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
        console.log(req.user);
        const userId = req.user.userId;
        const blogs = await Blog.find({ createdBy: userId }).populate('createdBy', 'email').sort({ createdAt: -1 });
        if (!blogs || blogs.length === 0) {
            return res.status(404).json({ message: 'No blogs found' });
        }
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
        if (!title && !description) {
            return res.status(400).json({ message: 'title or desscription missing!' });
        }

        if (title && title.trim().length < 3) {
            return res.status(400).json({ message: 'Title must be atleast 3 characters' });
        }

        if (description && description.trim().length < 10) {
            return res.status(400).json({ message: 'Description must be atleast 10 characters long' });
        }

        if (image) {
            const allowedTypes = ['.jpg', '.jpeg', '.png', '.gif'];
            const ext = path.extname(image.originalname).toLowerCase();
            if (!allowedTypes.includes(ext)) {
                return res.status(400).json({ message: 'Only JPG, PNG, and GIF files are allowed' });
            }

            const MAX_SIZE = 2 * 1024 * 1024;
            if (image.size > MAX_SIZE) {
                return res.status(400).json({ message: 'Image must be less than 2MB' });
            }
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

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
    createBlog,
    getBlogs,
    getBlogById,
    updateBlog,
    deleteBlog,
    getFeeds
} = require('../controllers/blogController');
const upload = require('../middleware/upload');

router.post('/', authMiddleware, upload.single('image'), createBlog);
router.get('/', getBlogs);
router.get('/feed', getFeeds);
router.get('/:id', getBlogById);
router.put('/:id', authMiddleware, upload.single('image'), updateBlog);
router.delete('/:id', authMiddleware, deleteBlog);


module.exports = router;

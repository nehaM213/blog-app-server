const Blog = require('../models/Blog');
const User = require('../models/User');

exports.getDashboard = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await User.findById(userId).select('email profileImage');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({
            email: user.email,
            profileImage: user.profileImage,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

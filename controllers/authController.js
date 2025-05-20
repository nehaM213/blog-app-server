const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

exports.signup = async (req, res) => {
    try {
        const { email, password } = req.body;
        const profileImage = req.file;
        if (!email || !password) {
            console.log('Missing fields:', { email, password });
            return res.status(400).json({ message: 'email or password missing!' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        const allowedTypes = ['.jpg', '.jpeg', '.png', '.gif'];
        const ext = path.extname(profileImage.originalname).toLowerCase();
        if (!allowedTypes.includes(ext)) {
            return res.status(400).json({ message: 'Only JPG, JPEG, PNG, and GIF images are allowed' });
        }

        const MAX_SIZE = 2 * 1024 * 1024; // 2MB
        if (profileImage.size > MAX_SIZE) {
            return res.status(400).json({ message: 'Image must be less than 2MB' });
        }


        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            email,
            password: hashedPassword,
            profileImage: `/uploads/${profileImage.filename}`,
        });

        await user.save();

        res.status(201).json({ message: 'User created successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Email is not registered!' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Wrong password' });

        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            token,
            user: {
                email: user.email,
                profileImage: user.profileImage,
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

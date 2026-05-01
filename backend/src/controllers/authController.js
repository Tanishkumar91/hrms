const User = require('../models/User');
const Employee = require('../models/Employee');
const { generateToken, generateRefreshToken } = require('../utils/tokenUtils');
const crypto = require('crypto');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public (or Admin only depending on HRMS policy)
exports.register = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            password,
            role: role || 'employee'
        });

        // If user is an employee, create an employee profile
        if (user.role === 'employee') {
            await Employee.create({
                user: user._id,
                employeeId: `EMP${Math.floor(1000 + Math.random() * 9000)}`,
                designation: 'New Associate',
                department: 'Operations',
                dateOfJoining: new Date(),
                salary: { base: 30000, allowances: 0, deductions: 0 }
            });
        }

        sendTokenResponse(user, 201, res);
    } catch (err) {
        next(err);
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email and password' });
        }

        const user = await User.findOne({ email }).select('+password');
        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        sendTokenResponse(user, 200, res);
    //   res.send('Login successful'); // Temporary response for testing
    } catch (err) {
        next(err);
    }
};

// @desc    Log user out / clear cookie
// @route   GET /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    });

    res.status(200).json({ success: true, data: {} });
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({ success: true, data: user });
    } catch (err) {
        next(err);
    }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 mins

        await user.save({ validateBeforeSave: false });

        const sendEmail = require('../services/emailService');
        const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
        const message = `You are receiving this email because you (or someone else) requested a password reset for your HRMS account.\n\nPlease click the link below to reset your password:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email.`;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Password Reset Request',
                message
            });

            res.status(200).json({ success: true, message: 'Reset link sent to your email.' });
        } catch (err) {
            console.error('Password reset email failed:', err);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save({ validateBeforeSave: false });

            return res.status(500).json({ success: false, message: 'Email could not be sent' });
        }
    } catch (err) {
        next(err);
    }
};

// @desc    Reset Password
// @route   PUT /api/auth/reset-password/:resettoken
// @access  Public
exports.resetPassword = async (req, res, next) => {
    try {
        const resetPasswordToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex');
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid or expired token' });
        }

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.status(200).json({ success: true, message: 'Password reset successful' });
    } catch (err) {
        next(err);
    }
};

// Helper function to get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token to DB
    user.refreshToken = refreshToken;
    user.save({ validateBeforeSave: false });

    const options = {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    };

    res.status(statusCode)
        .cookie('token', token, options)
        .json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
};

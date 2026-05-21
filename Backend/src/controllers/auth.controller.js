const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


// =============================
// 🔐 CREATE JWT TOKEN
// =============================
function createToken(user) {
    return jwt.sign(
        {
            id: user._id,
            username: user.username
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    );
}


// =============================
// 🍪 SET COOKIE FUNCTION
// =============================
function setCookie(res, token) {
    res.cookie("token", token, {
        httpOnly: true,
        secure: true,        // required for Render (HTTPS)
        sameSite: "none",    // IMPORTANT for cross-site (Vercel ↔ Render)
        maxAge: 24 * 60 * 60 * 1000
    });
}


// =============================
// 🟢 REGISTER CONTROLLER
// =============================
async function registerUserController(req, res) {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const existingUser = await userModel.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await userModel.create({
            username,
            email,
            password: hashedPassword
        });

        const token = createToken(user);
        setCookie(res, token);

        return res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });

    } catch (err) {
        return res.status(500).json({
            message: "Server error",
            error: err.message
        });
    }
}


// =============================
// 🔵 LOGIN CONTROLLER
// =============================
async function loginUserController(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password required"
            });
        }

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(400).json({
                message: "Invalid credentials"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid credentials"
            });
        }

        const token = createToken(user);
        setCookie(res, token);

        return res.status(200).json({
            message: "Login successful",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });

    } catch (err) {
        return res.status(500).json({
            message: "Server error",
            error: err.message
        });
    }
}


// =============================
// 🔴 LOGOUT CONTROLLER
// =============================
async function logoutUserController(req, res) {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: true,
            sameSite: "none"
        });

        return res.status(200).json({
            message: "Logged out successfully"
        });

    } catch (err) {
        return res.status(500).json({
            message: "Server error",
            error: err.message
        });
    }
}


// =============================
// 👤 GET ME CONTROLLER
// =============================
async function getMeController(req, res) {
    try {
        const userId = req.user.id;

        const user = await userModel.findById(userId).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.status(200).json({
            message: "User fetched successfully",
            user
        });

    } catch (err) {
        return res.status(500).json({
            message: "Server error",
            error: err.message
        });
    }
}


// =============================
// 📤 EXPORTS
// =============================
module.exports = {
    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController
};
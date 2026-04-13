import http from 'http';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Enhanced MongoDB connection configuration
const mongoURI = process.env.MONGO_URI || "mongodb+srv://vmmoreb23:vedangmore123@aajiskitchen.0ykggjn.mongodb.net/aajiskitchen?retryWrites=true&w=majority";

const mongooseOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000, // 30 seconds timeout
    socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    connectTimeoutMS: 30000, // 30 seconds to establish connection
    retryWrites: true,
    w: 'majority'
};

// Improved connection handling with retries
async function connectToDatabase() {
    try {
        await mongoose.connect(mongoURI, mongooseOptions);
        console.log("Successfully connected to MongoDB Atlas");
    } catch (err) {
        console.error("MongoDB connection error:", err);
        console.log("Retrying connection in 5 seconds...");
        setTimeout(connectToDatabase, 5000);
    }
}

// Connection event handlers
mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to DB');
});

mongoose.connection.on('error', (err) => {
    console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected - attempting to reconnect...');
    connectToDatabase();
});

// Initialize connection
connectToDatabase();

// Define User Schema
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: String,
    address: String,
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model("User", UserSchema);

// Define the Order Schema
const OrderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    username: String,
    phone: String,
    address: String,
    cartItems: Array,
    totalPrice: Number,
    orderDate: { type: Date, default: Date.now }
});

const Order = mongoose.model("Order", OrderSchema);

// JWT Secret Key
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';


// Supercharged Registration Endpoint 🚀
app.post("/register", async (req, res) => {
    console.log("Registration attempt with:", req.body);

    try {
        // Check if the database is awake and caffeinated
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({
                message: "Database not ready. Please try again later.",
                code: "DB_NOT_READY"
            });
        }

        const { username, email, password, phone, address } = req.body;

        // Basic vibes check
        if (!username || !email || !password) {
            return res.status(400).json({
                message: "Username, email, and password are required",
                code: "MISSING_FIELDS"
            });
        }

        // See if username or email are already taken (no squatting allowed)
        const existingUser = await User.findOne({ $or: [{ username }, { email }] })
            .maxTimeMS(20000) // 20 second timeout for this search party
            .exec();

        if (existingUser) {
            return res.status(400).json({
                message: existingUser.username === username
                    ? "Username already exists"
                    : "Email already exists",
                code: "DUPLICATE_ENTRY"
            });
        }

        // Protect the password like it's the last slice of pizza
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Spawn a new User
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            phone: phone || null,
            address: address || null
        });

        await newUser.save();

        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                phone: newUser.phone,
                address: newUser.address,
                createdAt: newUser.createdAt // assuming your User schema has timestamps enabled
            }
        });

    } catch (error) {
        console.error("Registration error:", error);

        let statusCode = 500;
        let message = "Registration failed";
        let code = "INTERNAL_ERROR";

        if (error.name === 'MongooseError') {
            message = "Database operation timed out. Please try again.";
            code = "DB_TIMEOUT";
        } else if (error.name === 'ValidationError') {
            statusCode = 400;
            message = Object.values(error.errors).map(e => e.message).join(', ');
            code = "VALIDATION_ERROR";
        }

        res.status(statusCode).json({ message, code });
    }
});

// Login Endpoint
app.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find user
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Create JWT token
        const token = jwt.sign(
            { id: user._id, username: user.username },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                phone: user.phone,
                address: user.address
            }
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Login failed" });
    }
});

const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        // Here you could check if token is in a blacklist
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};
// Logout Endpoint
app.post("/logout", authenticate, (req, res) => {
    try {
        // In a real application, you might want to:
        // 1. Add the token to a blacklist
        // 2. Set token expiration to now
        // 3. Clear any server-side sessions

        res.json({
            message: "Logged out successfully",
            success: true
        });
    } catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({
            message: "Logout failed",
            success: false
        });
    }
});

// Updated Order Submission with User Authentication
app.post("/submit-order", authenticate, async (req, res) => {
    console.log("Order received:", req.body);

    try {
        const { phone, address, cartItems } = req.body;
        const userId = req.user.id;
        const username = req.user.username;

        if (!phone || !address || cartItems.length === 0) {
            return res.status(400).json({
                status: "error",
                message: "Invalid order details",
            });
        }

        const totalPrice = cartItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        );

        const newOrder = new Order({
            user: userId,
            username,
            phone,
            address,
            cartItems,
            totalPrice
        });
        await newOrder.save();

        res.status(201).json({
            status: "success",
            message: "Order saved successfully!",
        });

    } catch (error) {
        console.error("Error processing order:", error);
        res.status(500).json({
            status: "error",
            message: "Failed to process order",
        });
    }
});

// Order History Endpoint
app.get("/order-history", authenticate, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id })
            .sort({ orderDate: -1 });

        res.json({
            status: "success",
            orders
        });
    } catch (error) {
        console.error("Error fetching order history:", error);
        res.status(500).json({
            status: "error",
            message: "Failed to fetch order history",
        });
    }
});

// User Profile Endpoint
app.get("/profile", authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .select('-password');

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            status: "success",
            user
        });
    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({
            status: "error",
            message: "Failed to fetch user profile",
        });
    }
});

app.get("/user-details", authenticate, async (req, res) => {
    console.log('Received token:', req.headers.authorization); // Logs the token being passed
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({
            status: "success",
            user
        });
    } catch (error) {
        console.error("Error fetching user details:", error);
        res.status(500).json({
            status: "error",
            message: "Failed to fetch user details",
        });
    }
});




// Start servers only after initial DB connection
mongoose.connection.once('open', () => {
    // API server
    app.listen(3000, () => console.log("API server running on port 3000"));

    // Static file server
    const port = process.env.PORT || 8000;
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const server = http.createServer(async (req, res) => {
        try {
            if (req.method !== 'GET') {
                res.writeHead(405, { 'Content-Type': 'text/plain' });
                return res.end('Method Not Allowed (Only GET supported for static files)');
            }

            let filePath = '';
            if (req.url === '/' || req.url === '/login.html') {
                filePath = path.join(__dirname, 'login.html');
            } else if (req.url === '/index.html') {
                filePath = path.join(__dirname, 'index.html');
            } else if (req.url === '/menu' || req.url === '/menu.html') {
                filePath = path.join(__dirname, 'menu', 'menu.html');
            } else if (req.url === '/aboutUs' || req.url === '/aboutUs.html') {
                filePath = path.join(__dirname, 'aboutUs', 'aboutUs.html');
            } else if (req.url === '/register' || req.url === '/register.html') {
                filePath = path.join(__dirname, 'register.html');
            } else {
                filePath = path.join(__dirname, req.url);
            }

            const ext = path.extname(filePath).toLowerCase();
            const contentTypes = {
                '.html': 'text/html',
                '.css': 'text/css',
                '.js': 'application/javascript',
                '.json': 'application/json',
                '.png': 'image/png',
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.svg': 'image/svg+xml',
                '.ico': 'image/x-icon'
            };

            const contentType = contentTypes[ext] || 'application/octet-stream';
            const data = await fs.readFile(filePath);
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        } catch (error) {
            console.error(error);
            if (error.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('404 Not Found');
            } else {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('500 Internal Server Error');
            }
        }
    });

    server.listen(port, () => {
        console.log(`Static file server running on http://localhost:${port}`);
    });
});
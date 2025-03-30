import http from 'http';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const mongoURI = process.env.MONGO_URI || "mongodb+srv://vmmoreb23:vedangmore123@aajiskitchen.0ykggjn.mongodb.net/?retryWrites=true&w=majority&appName=AajisKitchen";

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("Connected to MongoDB Atlas"))
    .catch(err => console.error("MongoDB connection error:", err));

// Define the Order Schema
const OrderSchema = new mongoose.Schema({
    username: String,
    phone: String,
    address: String,
    cartItems: Array,
    totalPrice: Number,
    orderDate: { type: Date, default: Date.now }
});

const Order = mongoose.model("Order", OrderSchema);

// API route to handle order submissions
app.post("/submit-order", async (req, res) => {
    console.log("Order received:", req.body);  // Debugging log

    try {
        const { username, phone, address, cartItems } = req.body;

        if (!username || !phone || !address || cartItems.length === 0) {
            return res.status(400).json({ status: "error", message: "Invalid order details" });
        }

        const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

        const newOrder = new Order({ username, phone, address, cartItems, totalPrice });
        await newOrder.save();

        // ✅ Fix: Add "status: success" to the response
        res.status(201).json({ status: "success", message: "Order saved successfully" });

    } catch (error) {
        console.error("Error saving order:", error);
        res.status(500).json({ status: "error", message: "Failed to save order" });
    }
});

// Start server
app.listen(3000, () => console.log("Server running on port 3000"));


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
        if (req.url === '/' || req.url === '/index.html') {
            filePath = path.join(__dirname, 'index.html');
        } else if (req.url === '/menu' || req.url === '/menu.html') {
            filePath = path.join(__dirname, 'menu', 'menu.html');
        } else if (req.url === '/aboutUs' || req.url === '/aboutUs.html') {
            filePath = path.join(__dirname, 'aboutUs', 'aboutUs.html');
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
    console.log(`Server running on http://localhost:${port}`);
    console.log('PHP support enabled');
});

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Inventory = require("./models/inventoryModel");
const User = require("./models/userModel");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));

app.get("/inventory", async (req, res) => {
    try {
        const data = await Inventory.find().sort({ srNo: 1 });
        res.json(data);
    } catch (err) {
        res.status(500).send("Server error");
    }
});

app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username, password });
        if (!user) return res.status(401).json({ msg: "Invalid credentials" });
        res.json({ username: user.username, role: user.role });
    } catch (err) {
        res.status(500).json({ msg: "Server error" });
    }
});

// Add Item
app.post("/inventory", async (req, res) => {
    try {
        const data = req.body;

        // 1. Find the item with the highest srNo
        const lastItem = await Inventory.findOne().sort({ srNo: -1 });
        // 2. If no items exist, start at 1, otherwise lastItem.srNo + 1
        data.srNo = lastItem ? lastItem.srNo + 1 : 1;

        // 3. Calculate sell rate
        const pRate = Number(data.purchaseRate) || 0;
        const pPercent = Number(data.profitPercent) || 0;
        data.sellRate = pRate + (pRate * pPercent / 100);

        const item = new Inventory(data);
        await item.save();
        res.json(item);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update Item
app.put("/inventory/:id", async (req, res) => {
    try {
        const item = await Inventory.findById(req.params.id);
        if (!item) return res.status(404).json({ message: "Not found" });

        item.qty = req.body.qty ?? item.qty;
        item.remainingQty = req.body.remainingQty ?? item.remainingQty;
        item.purchaseRate = req.body.purchaseRate ?? item.purchaseRate;
        item.profitPercent = req.body.profitPercent ?? item.profitPercent;

        const pRate = Number(item.purchaseRate) || 0;
        const pPercent = Number(item.profitPercent) || 0;
        item.sellRate = pRate + (pRate * pPercent / 100);

        await item.save();
        res.json(item);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.delete("/inventory/:id", async (req, res) => {
    try {
        await Inventory.findByIdAndDelete(req.params.id);
        res.json({ message: "Item deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.listen(5050, () => console.log("Server running on 5050"));
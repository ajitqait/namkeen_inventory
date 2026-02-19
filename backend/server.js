require('dotenv').config();   // MUST BE FIRST

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Inventory = require("./models/inventoryModel");
const User = require("./models/userModel");


const app = express();

app.use(cors());
app.use(express.json());

// app.use('/api/auth', authRoutes);
// app.use('/api/inventory', inventoryRoutes);



mongoose.connect(process.env.MONGO_URI)
.then(()=>console.log("MongoDB Connected"))
.catch(err=>console.log(err));

app.get("/inventory", async (req, res) => {
    try {
        const data = await Inventory.find();
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
});

/* Add Item */
app.post("/inventory", async (req,res)=>{
    const item = new Inventory(req.body);
    await item.save();
    res.json(item);
});

app.post("/login", async (req,res)=>{
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username, password }); // hash in production
        if(!user) return res.status(401).json({ msg: "Invalid credentials" });

        res.json({ username: user.username, role: user.role });
    } catch(err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});

/* Update Item */
app.put("/inventory/:id", async (req,res)=>{
    const updated = await Inventory.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new:true }
    );
    res.json(updated);
});
app.use(express.static("public"));

app.listen(5050, ()=>console.log("Server running on 5050"));

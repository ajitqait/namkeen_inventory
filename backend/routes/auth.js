const express = require('express');
const router = express.Router();
const User = require('../models/userModel');

// Login
router.post('/login', async (req,res)=>{
    const { username, password } = req.body;
    const user = await User.findOne({ username, password }); // hash in real app
    if(!user) return res.status(401).json({ msg: "Invalid credentials" });

    res.json({ username: user.username, role: user.role });
});

module.exports = router;

const express = require('express');
const Inventory = require('../models/inventoryModel');
const auth = require('../middleware/authMiddleware');
const multer = require('multer');
const XLSX = require('xlsx');

const router = express.Router();

/* ===============================
   GET ALL ITEMS (Admin + Staff)
================================ */
router.get('/', auth(), async (req, res) => {
    try {
        const items = await Inventory.find().sort({ srNo: 1 });
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/* ===============================
   ADD NEW ITEM (Admin Only)
================================ */
const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({

    srNo:{ type:Number, required:true, unique:true },
    namkeenVariety:{ type:String, required:true },

    qty:{ type:Number, required:true },
    remainingQty:{ type:Number, required:true },

    purchaseRate:{ type:Number, required:true },
    profitPercent:{ type:Number, required:true },

    sellRate:{ type:Number, required:true }

},{timestamps:true});

module.exports = mongoose.model('Inventory', inventorySchema);

/* ===============================
   UPDATE ITEM (Admin Only)
================================ */
router.put('/:id', auth('admin'), async(req,res)=>{

    const item = await Inventory.findById(req.params.id);
    if(!item) return res.status(404).json({message:"Not found"});

    item.qty = req.body.qty ?? item.qty;
    item.remainingQty = req.body.remainingQty ?? item.remainingQty;
    item.purchaseRate = req.body.purchaseRate ?? item.purchaseRate;
    item.profitPercent = req.body.profitPercent ?? item.profitPercent;

    /* AUTO SELL RATE */
    item.sellRate = item.purchaseRate + (item.purchaseRate * item.profitPercent / 100);

    await item.save();

    res.json(item);
});

module.exports = router;

/* ===============================
   DELETE ITEM (Optional - Admin)
================================ */
router.delete('/:id', auth('admin'), async (req, res) => {
    try {
        await Inventory.findByIdAndDelete(req.params.id);
        res.json({ message: "Item deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/* ===============================
   EXCEL UPLOAD (Admin Only)
================================ */
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', auth('admin'), upload.single('file'), async (req, res) => {
    try {
        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet);

        for (let r of rows) {
            await Inventory.findOneAndUpdate(
                { srNo: r["SR No"] },
                {
                    srNo: r["SR No"],
                    namkeenVariety: r["Namkeen Variety"],
                    qty: r["Total Qty"],
                    rate: r["Rate"],
                    remainingQty: r["Remaining Qty"]
                },
                { upsert: true, new: true }
            );
        }

        res.json({ message: "Inventory uploaded successfully" });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;

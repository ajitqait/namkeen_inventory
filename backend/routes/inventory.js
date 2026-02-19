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
router.post('/', auth('admin'), async (req, res) => {
    try {
        const existing = await Inventory.findOne({ srNo: req.body.srNo });

        if (existing) {
            return res.status(400).json({ message: "SR No already exists" });
        }

        const item = new Inventory(req.body);
        await item.save();

        res.json(item);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/* ===============================
   UPDATE ITEM (Admin Only)
================================ */
router.put('/:id', auth('admin'), async (req, res) => {
    try {
        const item = await Inventory.findById(req.params.id);

        if (!item) {
            return res.status(404).json({ message: "Item not found" });
        }

        // Update fields only if provided
        if (req.body.qty !== undefined)
            item.qty = Number(req.body.qty);

        if (req.body.remainingQty !== undefined)
            item.remainingQty = Number(req.body.remainingQty);

        if (req.body.rate !== undefined)
            item.rate = Number(req.body.rate);

        if (req.body.namkeenVariety !== undefined)
            item.namkeenVariety = req.body.namkeenVariety;

        await item.save();

        res.json(item);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

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

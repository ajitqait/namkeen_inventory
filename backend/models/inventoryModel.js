const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
    srNo: { type: Number, required: true, unique: true },
    namkeenVariety: { type: String, required: true },
    qty: { type: Number, required: true },
    remainingQty: { type: Number, required: true },
    purchaseRate: { type: Number, required: true },
    profitPercent: { type: Number, required: true },
    sellRate: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Inventory', inventorySchema);
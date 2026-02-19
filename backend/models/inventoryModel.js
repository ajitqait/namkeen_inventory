const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema({
    srNo: { type: Number, required: true },
    namkeenVariety: { type: String, required: true },
    qty: { type: Number, required: true },
    rate: { type: Number, required: true },
    remainingQty: { type: Number, required: true }
});

module.exports = mongoose.model("Inventory", inventorySchema);

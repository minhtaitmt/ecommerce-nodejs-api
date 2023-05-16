const mongoose = require("mongoose");

const rateSchema = new mongoose.Schema(
    {
        productId: {type: String, required: true},
        customerId: {type: String, required: true},
        score: {type: Number, required: true},
        content: {type: String},
    },
    { timestamps: true }
)


module.exports = mongoose.model("Rate", rateSchema);
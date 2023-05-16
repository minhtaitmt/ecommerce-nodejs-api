const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true },
        desc:{ type: String, required: true },
        img: { type: Array, required: true },
        categories: { type: Array },
        brand: { type: String, required: true },
        size: { type: Array },
        color: { type: Array },
        quantity: {type: Number, default: 0},
        price: { type: Number, required: true },
        discount: { type: Number, required: true },
        inStock: {type: Boolean, default: false},
        rate: {type: Number, default: 0},
        bestSeller: {type: Boolean, default: false},
        active: {type: Boolean, default: true},
    },
    { timestamps: true }
)


module.exports = mongoose.model("Product", productSchema);
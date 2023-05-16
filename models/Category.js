const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
    {
        title: {type: String, required: true},
        img: {type: String, required: true},
        cat: {type: String, required: true},
        active: {type: Boolean, default: true},
    },
    { timestamps: true }
)


module.exports = mongoose.model("Category", categorySchema);
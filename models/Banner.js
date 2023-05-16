const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema(
    {
        title: {type: String, required: true},
        img: {type: String, required: true},
        desc: {type: String, required: true},
        background: {type: String, required: true},
        active: {type: Boolean, default: true},
    },
    { timestamps: true }
)


module.exports = mongoose.model("Banner", bannerSchema);
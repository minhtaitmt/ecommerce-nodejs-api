const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
    {
        email: {type: String},
        otp: {type: String, unique: true},
        time: {type: Date, default: Date.now, index: {expires: 180}},
    },
    { timestamps: true }
)


module.exports = mongoose.model("Otp", otpSchema);
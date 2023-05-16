const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
    {
        username: {type: String, required: true, unique: true},
        fullname: {type: String, required: true},
        phone: {type: String, required: true},
        gender: {type: String, required: true},
        address: {type: String, required: true},
        birth: {type: String, required: true},
        email: {type: String, required: true, unique: true},
        password: {type: String, required: true},
        avatar: {type: String, required: true},
        active: {type: Boolean, default: true},
        isFirst: {type: Boolean, default: false},

    },
    { timestamps: true }
)


module.exports = mongoose.model("Customer", customerSchema);
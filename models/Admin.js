const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
    {
        id: {type: String, required: true, unique: true},
        fullname: {type: String, required: true},
        phone: {type: String, required: true, unique: true},
        gender: {type: String, required: true},
        address: {type: String, required: true},
        birth: {type: String, required: true},
        email: {type: String, required: true, unique: true},
        password: {type: String, required: true},
        role: {type: String, required: true},
        active: {type: Boolean, default: true},
        isFirst: {type: Boolean, default: true}, // kiem tra neu user dang nhap lan dau thi bat buoc doi mat khau
    },
    { timestamps: true }
)


module.exports = mongoose.model("Admin", adminSchema);
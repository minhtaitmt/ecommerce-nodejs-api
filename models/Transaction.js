const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
    {
        customerId: { type: String, required: true },
        orders:[
            {
                productId: { type: String },
                quantity: { type: Number, default: 1}
            }
        ],
        total: { type: Number, required: true },
        subTotal: { type: Number, required: true },
        discount: { type: Number, required: true }, // số tiền được giảm, không để % vào
        phone: { type: String, required: true },
        address: { type: String, required: true },
        note: { type: String },
        status: { type: String, default: "chua thanh toan" },
        delivery: { type: String, default: "cho xac nhan" },
    },
    { timestamps: true }
)


module.exports = mongoose.model("Transaction", transactionSchema);
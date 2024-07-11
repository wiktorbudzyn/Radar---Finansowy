const mongoose = require("mongoose");
const { transactionSchema } = require("./transactionSchema");

const categorySchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ["WYDATKI", "WPŁYWY", "Wydatki", "Wpływy"],
        required: true
    },
    name: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        default: 0
    },
    actualAmount: {
        type: Number,
        default: 0
    },
    lose: {
        type: Number,
        default: 0
    },
    gain: {
        type: Number,
        default: 0
    },
    transactions: [transactionSchema]
});

exports.categorySchema = categorySchema;

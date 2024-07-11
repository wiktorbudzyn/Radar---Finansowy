const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ["WYDATKI", "WPŁYWY", "Wydatki", "Wpływy"],
        required: true
    },
    walletId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Wallet',
        required: true
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    transactionType: {
        type: String,
        enum: ["Gotówka", "Karta płatnicza", "Przelew"],
        required: true
    },
    description: {
        type: String,
        default: "Brak"
    },
    date: {
        type: Date,
        default: Date.now,
        get: (date) => date ? date.toISOString().slice(0, 10) : null,
        set: (dateString) => new Date(dateString)
    }
});

exports.transactionSchema = transactionSchema;
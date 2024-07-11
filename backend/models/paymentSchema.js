const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
    financialGoalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FinancialGoal',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    date: {
        type: Date,
        default: Date.now
    }
});

exports.paymentSchema = paymentSchema;

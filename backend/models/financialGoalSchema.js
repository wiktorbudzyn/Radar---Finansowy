const mongoose = require("mongoose");
const { paymentSchema } = require("./paymentSchema");

const financialGoalSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    targetAmount: {
        type: Number,
        required: true
    },
    currentAmount: {
        type: Number,
        default: 0
    },
    deadline: {
        type: Date,
        required: true
    },
    payments: [paymentSchema]
});

module.exports = { financialGoalSchema };
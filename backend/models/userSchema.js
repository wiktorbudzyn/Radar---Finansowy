const mongoose = require("mongoose");
const { categorySchema } = require("./categorySchema");
const { financialGoalSchema } = require("./financialGoalSchema");


const walletSchema = new mongoose.Schema({
    name: { type: String },
    budget: { type: Number, default: 0 },
    actualbudget: { type: Number, default: 0 },
    WholeBudget: { type: Number, default: 0 },
    categories: [categorySchema],
    WholeLoses: {
        type: Number,
        default: 0
    },
    WholeGains: {
        type: Number,
        default: 0
    },
});

walletSchema.pre('save', function (next) {
    const wallet = this;

    if (!wallet.isModified('categories')) {
        return next();
    }

    const originalBudget = wallet.budget;
    wallet.actualbudget = originalBudget;
    wallet.WholeBudget = originalBudget;

    wallet.categories.forEach(category => {
        if (category && category.isModified('amount') && category.amount !== undefined) {
            const originalAmount = category._original ? category._original.amount : 0;
            if (category.type.toUpperCase() === "WYDATKI") {
                wallet.actualbudget -= (category.amount - originalAmount);
            } else if (category.type.toUpperCase() === "WPŁYWY") {
                wallet.actualbudget += (category.amount - originalAmount);
            }
        }
    });

    wallet.WholeLoses = 0;
    wallet.WholeGains = 0;

    wallet.categories.forEach(category => {
        if (category.type.toUpperCase() === "WYDATKI") {
            const loses = category.transactions.reduce((acc, transaction) => acc + transaction.amount, 0);
            category.lose = loses;
            wallet.WholeLoses += loses;
            wallet.WholeBudget -= loses;
        } else if (category.type.toUpperCase() === "WPŁYWY") {
            const gains = category.transactions.reduce((acc, transaction) => acc + transaction.amount, 0);
            category.gain = gains;
            wallet.WholeGains += gains;
            wallet.WholeBudget += gains;
        }
    });

    next();
});


const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    avatar: { type: String, default: '/uploads/avatars/1700417842428-avatar.png' },
    wallets: [walletSchema],
    financialGoals: [financialGoalSchema]
});


// Logika do wykluczenia zapisywania actualbudget podczas zapisywania użytkownika
userSchema.pre('save', function (next) {
    const user = this;

    if (!user.isModified('wallets')) {
        return next();
    }

    user.wallets.forEach(wallet => {
        wallet.categories.forEach(category => {
            category.actualAmount = category.amount - category.lose;
        });
    });

    next();
});

exports.userSchema = userSchema;

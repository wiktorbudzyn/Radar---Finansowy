const express = require('express');
const router = express.Router();
const { User } = require('../models/user');
const auth = require("../middleware/auth");


// Dodawanie wpłaty do celu finansowego
router.post('/add', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { financialGoalId, amount, description, date } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send("Użytkownik nie został znaleziony");
        }

        const goal = user.financialGoals.id(financialGoalId);
        if (!goal) {
            return res.status(404).send("Cel finansowy nie został znaleziony");
        }

        goal.currentAmount += Number(amount);
        await goal.save();

        const payment = { financialGoalId, amount, description, date: date || Date.now() };
        goal.payments.push(payment);

        await user.save();
        res.status(201).send(payment);
    } catch (error) {
        console.error('Error when adding payment:', error);
        res.status(500).send("Błąd serwera");
    }
});


// Edycja wpłaty do celu finansowego
router.put('/edit/:financialGoalId/:paymentId', auth, async (req, res) => {
    try {
        const { financialGoalId, paymentId } = req.params;
        const { amount, description, date } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).send("Użytkownik nie został znaleziony");
        }

        const goal = user.financialGoals.id(financialGoalId);
        if (!goal) {
            return res.status(404).send("Cel finansowy nie został znaleziony");
        }

        const payment = goal.payments.id(paymentId);
        if (!payment) {
            return res.status(404).send("Płatność nie została znaleziona");
        }

        payment.amount = amount || payment.amount;
        payment.description = description || payment.description;
        payment.date = date || payment.date;

        await user.save();
        res.status(200).send("Płatność została zaktualizowana");
    } catch (error) {
        console.error('Błąd podczas edycji płatności:', error);
        res.status(500).send("Błąd serwera");
    }
});

// Usuwanie wpłaty do celu finansowego
router.delete('/delete/:financialGoalId/:paymentId', auth, async (req, res) => {
    try {
        const { financialGoalId, paymentId } = req.params;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).send("Użytkownik nie został znaleziony");
        }

        const goal = user.financialGoals.id(financialGoalId);
        if (!goal) {
            return res.status(404).send("Cel finansowy nie został znaleziony");
        }

        const payment = goal.payments.id(paymentId);
        if (!payment) {
            return res.status(404).send("Płatność nie została znaleziona");
        }

        goal.payments.pull(paymentId);
        await user.save();
        res.status(200).send("Płatność została usunięta");
    } catch (error) {
        console.error('Błąd podczas usuwania płatności:', error);
        res.status(500).send("Błąd serwera");
    }
});
module.exports = router;

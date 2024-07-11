const express = require('express');
const router = express.Router();
const { User } = require('../models/user');
const { FinancialGoal } = require('../models/financialGoalSchema');
const auth = require("../middleware/auth");


// Pobranie wszystkich celów finansowych użytkownika
router.get('/user/:userId', async (req, res) => {
    try {
        console.log("Żądanie pobrania celów finansowych dla użytkownika o ID:", req.params.userId);
        const user = await User.findById(req.params.userId);
        if (!user) {
            console.log("Użytkownik o ID", req.params.userId, "nie został znaleziony");
            return res.status(404).send("Użytkownik nie został znaleziony");
        }
        console.log("Znaleziono cele finansowe:", user.financialGoals);
        res.send(user.financialGoals);
    } catch (error) {
        console.error('Błąd podczas pobierania celów finansowych:', error);
        res.status(500).send("Błąd serwera");
    }
});


// Dodanie nowego celu finansowego
router.post('/add', async (req, res) => {
    console.log('Received request to add financial goal:', req.body);
    const userId = req.body.userId;
    console.log(`Looking for user with ID: ${userId}`);
    const newGoalData = {
        name: req.body.name,
        targetAmount: req.body.targetAmount,
        currentAmount: req.body.currentAmount || 0,
        deadline: req.body.deadline,
    };

    try {
        const user = await User.findById(userId);
        if (!user) {
            console.log("User not found");
            return res.status(404).send("Użytkownik nie został znaleziony");
        }

        user.financialGoals.push(newGoalData);
        await user.save();
        res.status(201).send(newGoalData);
    } catch (error) {
        console.error('Error when adding financial goal:', error);
        res.status(400).send("Błąd przy dodawaniu celu finansowego");
    }
});


// Edycja celu finansowego
router.put('/:id', async (req, res) => {
    try {
        const goal = await FinancialGoal.findById(req.params.id);
        if (!goal) {
            console.log("Financial goal not found");
            return res.status(404).send("Cel finansowy nie został znaleziony");
        }

        goal.name = req.body.name || goal.name;
        goal.targetAmount = req.body.targetAmount || goal.targetAmount;
        goal.currentAmount = req.body.currentAmount || goal.currentAmount;
        goal.deadline = req.body.deadline || goal.deadline;

        await goal.save();
        res.send(goal);
    } catch (error) {
        res.status(400).send("Błąd przy aktualizacji celu finansowego");
    }
});


// Usunięcie celu finansowego
router.delete('/:id', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).send("Użytkownik nie został znaleziony");
        }

        user.financialGoals = user.financialGoals.filter(
            (goal) => goal._id.toString() !== req.params.id
        );

        await user.save();
        res.send("Cel finansowy został usunięty");
    } catch (error) {
        console.error('Error when deleting financial goal:', error);
        res.status(500).send("Błąd serwera podczas usuwania celu finansowego");
    }
});


// Pobranie szczegółów konkretnego celu finansowego
router.get('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "Użytkownik nie znaleziony" });
        }

        let goal = null;
        user.financialGoals.forEach((financialGoal) => {
            if (financialGoal._id.toString() === id) {
                goal = financialGoal;
            }
        });

        if (!goal) {
            return res.status(404).json({ message: "Cel finansowy nie znaleziony" });
        }
        res.status(200).json({ goal });
    } catch (error) {
        console.error("Błąd podczas pobierania szczegółów celu finansowego:", error.message);
        res.status(500).json({ message: "Wewnętrzny błąd serwera" });
    }
});

module.exports = router;

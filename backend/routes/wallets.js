const router = require("express").Router();
const { User } = require("../models/user");
const auth = require("../middleware/auth");

// Usuwanie portfela po jego ID
router.delete("/delete-wallet/:id", auth, async (req, res) => {
    try {
        const walletId = req.params.id;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: "Użytkownik nie znaleziony" });
        }

        const userWallets = user.wallets;
        console.log('Portfele użytkownika:', userWallets.map((wallet) => wallet._id));
        console.log('Identyfikator portfela:', walletId);
        console.log('Użytkownik:', user);

        user.wallets = user.wallets.filter(
            (wallet) => wallet._id.toString() !== walletId.toString()
        );

        await user.save();

        res.status(200).json({ message: "Pomyślnie usunięto portfel" });
    } catch (error) {
        console.error("Błąd podczas usuwania portfela:", error.message);
        res.status(500).json({ message: "Wewnętrzny błąd serwera" });
    }
});


// Edycja danych portfela po jego ID
router.put("/edit-wallet/:id", auth, async (req, res) => {
    try {
        const walletId = req.params.id;
        const { name, budget } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: "Użytkownik nie znaleziony" });
        }

        const selectedWallet = user.wallets.find(
            (wallet) => wallet._id.toString() === walletId.toString()
        );

        if (!selectedWallet) {
            return res.status(404).json({ message: "Portfel nie znaleziony" });
        }

        const oldBudget = selectedWallet.budget;

        selectedWallet.name = name;
        selectedWallet.budget = budget;

        const expenseCategories = selectedWallet.categories.filter(
            (category) => category.type.toUpperCase() === "WYDATKI"
        );

        const totalExpenses = expenseCategories.reduce(
            (acc, category) => acc + category.amount,
            0
        );

        selectedWallet.actualbudget = budget - totalExpenses;
        await user.save();

        res.status(200).json({ message: "Pomyślnie zaktualizowano portfel" });
    } catch (error) {
        console.error("Błąd podczas edycji portfela:", error.message);
        res.status(500).json({ message: "Wewnętrzny błąd serwera" });
    }
});


// Pobieranie danych portfela po jego ID
router.get("/user-wallets/:id", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            console.error("Nie znaleziono użytkownika");
            return res.status(404).json({ message: "Użytkownik nie znaleziony" });
        }

        const walletId = req.params.id;
        console.log('Identyfikator portfela:', walletId);

        const userWallets = user.wallets;
        const requestedWallet = userWallets.find(
            (wallet) => wallet._id.toString() === walletId.toString()
        );
        if (!requestedWallet) {
            console.error("Nie znaleziono portfela");
            return res.status(404).json({ message: "Portfel nie znaleziony" });
        }

        res.status(200).json({ wallet: requestedWallet });
    } catch (error) {
        console.error("Błąd podczas pobierania danych portfela:", error.message);
        res.status(500).json({ message: "Wewnętrzny błąd serwera" });
    }
});


// Pobieranie wszystkich portfeli zalogowanego użytkownika
router.get("/user-wallets", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: "Użytkownik nie znaleziony" });
        }

        const userWallets = user.wallets;

        res.status(200).json({ userWallets });
    } catch (error) {
        console.error(
            "Błąd podczas pobierania portfeli użytkownika:",
            error.message
        );
        res.status(500).json({ message: "Wewnętrzny błąd serwera" });
    }
});


// Dodawanie nowego portfela
router.post("/add-wallet", auth, async (req, res) => {
    try {
        const { walletName, budget } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: "Użytkownik nie znaleziony" });
        }

        const newWallet = {
            name: walletName,
            budget: budget,
            actualbudget: budget,
        };

        user.wallets.push(newWallet);

        await user.save();

        res.status(200).json({ message: "Portfel został dodany pomyślnie" });
    } catch (error) {
        console.error("Błąd podczas dodawania portfela:", error.message);
        res.status(500).json({ message: "Wewnętrzny błąd serwera" });
    }
});


// Edycja kategorii finansowej w określonym portfelu
router.put("/edit-category/:walletId/:categoryId", auth, async (req, res) => {
    try {
        const { type, name, amount } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: "Użytkownik nie znaleziony" });
        }

        const walletId = req.params.walletId;
        const categoryId = req.params.categoryId;

        const selectedWallet = user.wallets.id(walletId);

        if (!selectedWallet) {
            return res.status(404).json({ message: "Portfel nie znaleziony" });
        }

        const selectedCategory = selectedWallet.categories.id(categoryId);

        if (!selectedCategory) {
            return res.status(404).json({ message: "Kategoria nie znaleziona" });
        }

        selectedCategory.type = type;
        selectedCategory.name = name;
        selectedCategory.amount = type === "Wydatki" ? amount : 0;


        await user.save();

        res.status(200).json({ message: "Kategoria w portfelu została zaktualizowana" });
    } catch (error) {
        console.error("Błąd podczas edycji kategorii:", error.message);
        res.status(500).json({ message: "Wewnętrzny błąd serwera" });
    }
});


// Usuwanie kategorii finansowej z określonego portfela
router.delete("/delete-category/:walletId/:categoryId", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "Użytkownik nie znaleziony" });
        }

        const walletId = req.params.walletId;
        const categoryId = req.params.categoryId;

        const selectedWallet = user.wallets.id(walletId);

        if (!selectedWallet) {
            return res.status(404).json({ message: "Portfel nie znaleziony" });
        }

        const selectedCategory = selectedWallet.categories.id(categoryId);

        if (!selectedCategory) {
            return res.status(404).json({ message: "Kategoria nie znaleziona" });
        }

        const categoryType = selectedCategory.type.toUpperCase();
        const categoryAmount = selectedCategory.amount;

        selectedWallet.categories.id(categoryId).remove();

        if (type.toUpperCase() === "WYDATKI") {
            selectedWallet.actualbudget += categoryAmount;
        }

        await user.save();

        res.status(200).json({ message: "Kategoria została usunięta z portfela" });
    } catch (error) {
        console.error("Błąd podczas usuwania kategorii:", error.message);
        res.status(500).json({ message: "Wewnętrzny błąd serwera" });
    }
});


module.exports = router;
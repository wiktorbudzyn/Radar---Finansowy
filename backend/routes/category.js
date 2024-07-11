const router = require("express").Router();
const { User } = require("../models/user");
const auth = require("../middleware/auth");
const mongoose = require('mongoose');


// Pobieranie kategorii po jej ID
router.get("/:categoryId", auth, async (req, res) => {
    try {
        const { categoryId } = req.params;
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "Użytkownik nie znaleziony" });
        }

        let category = null;
        user.wallets.forEach((wallet) => {
            const foundCategory = wallet.categories.find(
                (category) => category._id.toString() === categoryId
            );
            if (foundCategory) {
                category = foundCategory;
            }
        });

        if (!category) {
            return res.status(404).json({ message: "Kategoria nie znaleziona" });
        }
        res.status(200).json({ category });
    } catch (error) {
        console.error("Błąd podczas pobierania nazwy kategorii:", error.message);
        res.status(500).json({ message: "Wewnętrzny błąd serwera" });
    }
});


// Dodawanie nowej kategorii do portfela
router.post("/add-category/:walletId", auth, async (req, res) => {
    try {
        const { type, name, amount } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: "Użytkownik nie znaleziony" });
        }

        const walletId = req.params.walletId;
        const selectedWallet = user.wallets.id(walletId);

        if (!selectedWallet) {
            return res.status(404).json({ message: "Portfel nie znaleziony" });
        }

        const newCategory = {
            type,
            name,
            amount
        };
        newCategory.actualAmount = amount;
        selectedWallet.categories.push(newCategory);

        await user.save();

        res.status(200).json({ message: "Kategoria została dodana do portfela" });
    } catch (error) {
        console.error("Błąd podczas dodawania kategorii:", error.message);
        res.status(500).json({ message: "Wewnętrzny błąd serwera" });
    }
});


// Usuwanie kategorii z portfela po jej ID
router.delete('/delete-category/:categoryId', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'Użytkownik nie znaleziony' });
        }

        const categoryId = req.params.categoryId;
        let categoryType = null;

        let found = false;
        let categoryAmount = 0;

        user.wallets.forEach((wallet) => {
            const categoryIndex = wallet.categories.findIndex(cat => cat._id.toString() === categoryId);

            if (categoryIndex !== -1) {
                const categoryToRemove = wallet.categories[categoryIndex];
                categoryAmount = categoryToRemove.amount;

                wallet.categories.splice(categoryIndex, 1);

                categoryToRemove.actualAmount = 0;
                categoryType = categoryToRemove.type.toUpperCase();
                found = true;
            }
        });

        if (!found) {
            return res.status(404).json({ message: 'Kategoria nie znaleziona w żadnym z portfeli' });
        }

        await user.save();

        res.status(200).json({ message: 'Kategoria została usunięta z portfela' });
    } catch (error) {
        console.error('Błąd podczas usuwania kategorii:', error.message);
        res.status(500).json({ message: 'Wewnętrzny błąd serwera' });
    }
});


// Pobieranie kategorii na podstawie jej typu i ID portfela
router.get("/:type/:walletId/categories", auth, async (req, res) => {
    try {
        const { type, walletId } = req.params;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: "Użytkownik nie znaleziony" });
        }

        let categories = [];

        user.wallets.forEach((wallet) => {
            if (wallet._id.toString() === walletId) {
                console.log("ID portfela:", wallet._id.toString());
                console.log("Typ kategorii do filtrowania:", type);
                console.log("Kategorie w tym porflelu:", wallet.categories);

                categories = wallet.categories.filter((category) => category.type.toUpperCase() === type.toUpperCase());
                console.log("Znalezione kategorie:", categories);
            }
        });

        res.status(200).json({ categories });
    } catch (error) {
        console.error("Błąd podczas pobierania kategorii dla portfela:", error.message);
        res.status(500).json({ message: "Wewnętrzny błąd serwera" });
    }
});


// Edycja istniejącej kategorii po jej ID
router.put("/edit-category/:categoryId", auth, async (req, res) => {
    try {
        const { amount: newAmount } = req.body;
        const categoryId = req.params.categoryId;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: "Użytkownik nie znaleziony" });
        }

        let categoryToUpdate = null;
        let walletToUpdate = null;

        user.wallets.forEach((wallet) => {
            const foundCategory = wallet.categories.find(
                (category) => category._id.toString() === categoryId
            );
            if (foundCategory) {
                categoryToUpdate = foundCategory;
                walletToUpdate = wallet;
            }
        });

        if (!categoryToUpdate) {
            return res
                .status(404)
                .json({ message: "Nie znaleziono kategorii do edycji" });
        }

        const previousAmount = categoryToUpdate.amount;
        const difference = newAmount - previousAmount;

        categoryToUpdate.amount = newAmount;
        categoryToUpdate.actualAmount = newAmount - categoryToUpdate.lose;

        if (difference > 0) {
            walletToUpdate.actualbudget -= difference;
        } else if (difference < 0) {
            walletToUpdate.actualbudget += Math.abs(difference);
        }

        updateWalletActualBudget(walletToUpdate);

        await user.save();

        res.status(200).json({ message: "Kategoria została zaktualizowana" });
    } catch (error) {
        console.error("Błąd podczas edycji kategorii:", error.message);
        res.status(500).json({ message: "Wewnętrzny błąd serwera" });
    }
});


// Funkcja do aktualizacji actualbudget w danym porfelu
function updateWalletActualBudget(wallet) {
    wallet.actualbudget = wallet.budget;

    wallet.categories.forEach(category => {
        if (category.type.toUpperCase() === "WYDATKI") {
            wallet.actualbudget -= category.amount;
        } else if (category.type.toUpperCase() === "WPŁYWY") {
            wallet.actualbudget += category.amount;
        }
    });
}

module.exports = router;
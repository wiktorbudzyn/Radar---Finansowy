const router = require("express").Router();
const { User } = require("../models/user");
const auth = require("../middleware/auth");


// Dodawanie nowej transakcji do danej kategorii
router.post("/add-entry/:categoryId", auth, async (req, res) => {
    try {
        const categoryId = req.params.categoryId;
        const { selectedWallet, amount, transactionType, description, date, selectedCategory } = req.body;

        const categoryType = req.body.selectedCategory ? req.body.selectedCategory.toUpperCase() : null;

        if (categoryType && (categoryType === "WYDATKI" || categoryType === "WPŁYWY")) {
            const user = await User.findById(req.user.id);
            if (!user) {
                return res.status(404).json({ message: "Użytkownik nie znaleziony" });
            }

            const wallet = user.wallets.id(selectedWallet);
            if (!wallet) {
                return res.status(404).json({ message: "Portfel nie znaleziony" });
            }

            const category = wallet.categories.id(categoryId);
            if (!category) {
                return res.status(404).json({ message: "Kategoria nie znaleziona w wybranym portfelu" });
            }

            const newTransaction = {
                type: categoryType,
                walletId: selectedWallet,
                categoryId: categoryId,
                amount,
                transactionType,
                description,
                date
            };

            category.transactions.push(newTransaction);

            if (categoryType.toUpperCase() === "WYDATKI" || categoryType.toUpperCase() === "WPŁYWY") {
                const isExpense = categoryType.toUpperCase() === "WYDATKI";
                category.actualAmount = isExpense ? category.amount - category.transactions.reduce((acc, transaction) => {
                    if (transaction.type.toUpperCase() === "WYDATKI") {
                        return acc + transaction.amount;
                    }
                    return acc;
                }, 0) : category.amount;

                if (isExpense) {
                    category.lose += amount;
                }

                wallet.markModified('categories');
                await user.save();

                return res.status(200).json({ message: "Wpis został dodany do kategorii" });
            } else if (categoryType === "WPŁYWY" || categoryType === "Wpływy") {
                category.actualAmount = category.transactions.reduce((acc, transaction) => {
                    if (transaction.type.toUpperCase() === "WPŁYWY") {
                        return acc + transaction.amount;
                    }
                    return acc;
                }, 0);

                wallet.markModified('categories');
                await user.save();

                return res.status(200).json({ message: "Wpis został dodany do kategorii" });
            }

            res.status(400).json({ message: "Nieprawidłowy typ wpisu lub brak przekazanego entryType" });
        } else {
            console.error("Błędny lub brakujący typ wpisu:", categoryType);
            return res.status(400).json({ message: "Nieprawidłowy typ wpisu lub brak przekazanego entryType" });
        }
    } catch (error) {
        console.error("Błąd podczas dodawania wpisu:", error.message);
        res.status(500).json({ message: "Wewnętrzny błąd serwera" });
    }
});


// Pobieranie wszystkich transakcji dla danej kategorii
router.get("/:categoryId/transactions", auth, async (req, res) => {
    try {
        const { categoryId } = req.params;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: "Użytkownik nie znaleziony" });
        }

        let transactions = [];

        user.wallets.forEach((wallet) => {
            const category = wallet.categories.id(categoryId);
            if (category) {
                transactions = category.transactions;
            }
        });

        res.status(200).json({ transactions });
    } catch (error) {
        console.error("Błąd podczas pobierania transakcji:", error.message);
        res.status(500).json({ message: "Wewnętrzny błąd serwera" });
    }
});


// Usuwanie wybranej transakcji z danej kategorii
router.delete("/:categoryId/transactions/delete/:transactionId", auth, async (req, res) => {
    try {
        const { transactionId } = req.params;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: "Użytkownik nie znaleziony" });
        }

        let foundTransaction = null;
        let foundCategory = null;
        let foundWallet = null;

        user.wallets.forEach((wallet) => {
            const category = wallet.categories.find((cat) =>
                cat.transactions.some((trans) => trans.id === transactionId)
            );
            if (category) {
                foundCategory = category;
                foundWallet = wallet;
                foundTransaction = category.transactions.id(transactionId);
            }
        });

        if (!foundTransaction) {
            return res.status(404).json({ message: "Transakcja nie znaleziona" });
        }

        foundCategory.transactions.pull({ _id: transactionId });

        if (foundCategory) {
            if (foundCategory.type.toUpperCase() === "WYDATKI") {
                foundCategory.lose -= foundTransaction.amount;
            } else if (foundCategory.type.toUpperCase() === "WPŁYWY") {
                foundCategory.gain -= foundTransaction.amount;
            }

            foundCategory.actualAmount = foundCategory.amount - foundCategory.lose;

            foundWallet.markModified("categories");
            await user.save();
        }

        res.status(200).json({ message: "Transakcja została usunięta" });
    } catch (error) {
        console.error("Błąd podczas usuwania transakcji:", error.message);
        res.status(500).json({ message: "Wewnętrzny błąd serwera" });
    }
});


// Pobieranie wszystkich transakcji dla wszystkich kategorii i portfeli użytkownika
router.get("/all-transactions", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: "Użytkownik nie znaleziony" });
        }

        let allTransactions = [];

        user.wallets.forEach((wallet) => {
            wallet.categories.forEach((category) => {
                const transactions = category.transactions.map((transaction) => ({
                    date: transaction.date,
                    walletName: wallet.name,
                    categoryName: category.name,
                    categoryType: category.type,
                    description: transaction.description,
                    transactionType: transaction.transactionType,
                    amount: transaction.amount,
                }));
                allTransactions = allTransactions.concat(transactions);
            });
        });

        res.status(200).json({ transactions: allTransactions });
    } catch (error) {
        console.error("Błąd podczas pobierania transakcji:", error.message);
        res.status(500).json({ message: "Wewnętrzny błąd serwera" });
    }
});

module.exports = router;

require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const path = require('path');
const connection = require("./db");
const userRoutes = require("./routes/users");
const authRoutes = require("./routes/auth");
const walletRoutes = require("./routes/wallets");
const categoryRoutes = require("./routes/category");
const entriesRoutes = require("./routes/entries");
const financialGoals = require('./routes/financialGoals');
const paymentsRouter = require('./routes/payments');

connection();

app.use('/images', express.static(path.join(__dirname, '../frontend/app/src/Assets')));
app.use('/uploads', express.static('uploads'));

// middlewares
app.use(express.json());
app.use(cors());

// routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/wallets", walletRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/entries", entriesRoutes);
app.use('/api/financial-goals', financialGoals);
app.use('/api/payments', paymentsRouter);

const port = process.env.PORT || 8080;
app.listen(port, console.log(`Listening on port ${port}...`));
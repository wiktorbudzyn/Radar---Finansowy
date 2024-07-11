import { Route, Routes, Navigate } from "react-router-dom";
import Main from "./Components/Main";
import Signup from "./Components/Start/Signup";
import Login from "./Components/Start/Login";
import Start from "./Components/Start";
import Description from "./Components/Start/Description";
import Account from "./Components/Account";
import ChangePassword from "./Components/Account/ChangePassword";
import Contact from "./Components/Contact";
import Wallet from "./Components/Wallet";
import AddWallet from "./Components/Wallet/AddWallet";
import EditWallet from "./Components/Wallet/EditWallet";
import AddCategory from "./Components/Wallet/Category/AddCategory";
import EditCategory from "./Components/Wallet/Category/EditCategory";
import Category from "./Components/Wallet/Category";
import Entries from "./Components/Entries";
import AddEntries from "./Components/Entries/AddEntries";
import EditEntries from "./Components/Entries/EditEntries";
import FinancialGoal from "./Components/FinancialGoal";
import AddFinancialGoal from "./Components/FinancialGoal/AddFinancialGoal";
import EditFinancialGoal from "./Components/FinancialGoal/EditFinancialGoal";
import DescriptionFinancialGoal from "./Components/FinancialGoal/DescriptionFinancialGoal";
import AddPayments from "./Components/FinancialGoal/Payments/AddPayments";



function App() {
  const user = localStorage.getItem("token");

  return (
    <Routes>
      {user && <Route path="/main" exact element={<Main />} />}
      <Route path="/signup" exact element={<Signup />} />
      <Route path="/login" exact element={<Login />} />
      <Route path="/" element={<Navigate replace to="/start" />} />
      <Route path="/start" exact element={<Start />} />
      <Route path="/description" exact element={<Description />} />
      <Route path="/account" exact element={<Account />} />
      <Route path="/changePassword" exact element={<ChangePassword />} />
      <Route path="/contact" exact element={<Contact />} />
      <Route path="/wallet" exact element={<Wallet />} />
      <Route path="/addWallet" exact element={<AddWallet />} />
      <Route path="/editWallet/:walletId" element={<EditWallet />} />
      <Route path="/add-category/:walletId" element={<AddCategory />} />
      <Route path="/editCategory/:categoryId" element={<EditCategory />} />
      <Route path="/category/:categoryId" element={<Category />} />
      <Route path="/entries" exact element={<Entries />} />
      <Route path="/addEntries" exact element={<AddEntries />} />
      <Route path="/editEntries" exact element={<EditEntries />} />
      <Route path="/financialGoal" exact element={<FinancialGoal />} />
      <Route path="/addFinancialGoal" exact element={<AddFinancialGoal />} />
      <Route path="/editFinancialGoal" exact element={<EditFinancialGoal />} />
      <Route path="/descriptionFinancialGoal/:financialGoalId" element={<DescriptionFinancialGoal />} />
      <Route path="/addPayments" exact element={<AddPayments />} />

    </Routes>
  );
}

export default App;

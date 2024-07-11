import React, { useState, useEffect } from "react";
import { Navbar, Nav, NavDropdown } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import Logo from "../../../Assets/Logo.png";
import styles from "./styles.module.css";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import Settings from "../../../Assets/settings.svg";
import Trash from "../../../Assets/trash.svg";

const Category = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const { categoryId } = useParams();
  const [categoryName, setCategoryName] = useState("");
  const [categoryData, setCategoryData] = useState(null);
  const [transactions, setTransactions] = useState([]);

  // Efekt pobierający informacje o kategorii z serwera
  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get(`http://localhost:8080/api/categories/${categoryId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        console.log("Nazwa kategorii:", response.data.category.name);
        setCategoryName(response.data.category.name);
        setCategoryData(response.data.category);
      })
      .catch((error) => {
        console.error("Błąd pobierania nazwy kategorii:", error);
      });
  }, [categoryId]);

  // Efekt wykorzystywany do pobierania danych użytkownika z serwera.
  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("Token JWT z localStorage:", token);

    axios
      .get("http://localhost:8080/api/users/user-data", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        console.log("Dane użytkownika:", response.data);
        setUserData(response.data.user);
      })
      .catch((error) => {
        console.error("Błąd pobierania danych użytkownika:", error);
      });
  }, []);

  const [showMenu, setShowMenu] = useState(false);

  // Funkcja obsługująca kliknięcie w menu.
  const handleMenuClick = () => {
    setShowMenu(!showMenu);
  };

  // Funkcja obsługująca proces wylogowania użytkownika.
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/start");
  };

  // Funkcja obsługująca usunięcie kategorii.
  const handleDeleteCategory = () => {
    if (window.confirm("Czy na pewno chcesz usunąć tę kategorię?")) {
      const token = localStorage.getItem("token");
      axios
        .delete(
          `http://localhost:8080/api/categories/delete-category/${categoryId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((response) => {
          console.log(response.data.message);
          alert("Kategoria została usunięta");
          const newActualBudget = response.data.actualbudget;
          navigate("/wallet");
          window.location.reload();
        })
        .catch((error) => {
          console.error("Błąd podczas usuwania kategorii:", error);
        });
    }
  };

  // Funkcja obsługująca usunięcie transakcji.
  const handleDeleteTransaction = async (transactionId) => {
    const confirmDelete = window.confirm(
      "Czy na pewno chcesz usunąć tę transakcję?"
    );
    try {
      const token = localStorage.getItem("token");
      console.log("Category ID (front):", categoryId);
      console.log("Transaction ID (front):", transactionId);
      const response = await axios.delete(
        `http://localhost:8080/api/entries/${categoryId}/transactions/delete/${transactionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Category ID (front):", categoryId);
      console.log("Transaction ID (front):", transactionId);

      setTransactions((prevTransactions) =>
        prevTransactions.filter(
          (transaction) => transaction._id !== transactionId
        )
      );
      alert("Transakcja została usunięta");

      window.location.reload();
    } catch (error) {
      console.error("Błąd podczas usuwania transakcji:", error);
    }
  };

  // Efekt pobierający listę transakcji dla danej kategorii
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:8080/api/entries/${categoryId}/transactions`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const sortedTransactions = response.data.transactions.sort(sortByDate);
        setTransactions(sortedTransactions);
      } catch (error) {
        console.error("Błąd podczas pobierania transakcji:", error);
      }
    };

    fetchTransactions();
  }, [categoryId]);

  // Komponent prezentujący pasek postępu dla kategorii
  const CustomProgressBar = ({ category }) => {
    if (category.type.toUpperCase() === "WYDATKI") {
      const progress = (category.lose / category.amount) * 100;
      let backgroundColor = "#002d80";

      if (category.lose === category.amount) {
        backgroundColor = "green";
      } else if (category.lose > category.amount) {
        backgroundColor = "red";
      } else if (category.lose > 0.75 * category.amount) {
        backgroundColor = "orange";
      }

      return (
        <div className={styles.progressBarDiv}>
          <div
            className={styles.fillStyles}
            style={{
              width: `${progress > 100 ? 100 : progress}%`,
              backgroundColor: backgroundColor,
            }}
          />

          <div className={styles.categoryDetails}>
            <div>Wydano: {category.lose} zł</div>
            <div>Zostało: {category.actualAmount} zł</div>
            <div className={styles.categoryAmount}>
              Budżet: {category.amount} zł
            </div>
          </div>
        </div>
      );
    } else if (category.type.toUpperCase() === "WPŁYWY") {
      return (
        <div className={styles.categoryAmountW}>
          Uzyskany przychód:{" "}
          <span className={styles.amount}>+{category.gain} zł</span>
        </div>
      );
    } else {
      return null;
    }
  };

  // Funkcja obsługująca kliknięcie przycisku dodania wpisu
  const handleAddEntryClick = () => {
    navigate("/addEntries");
  };

  // Funkcja sortująca transakcje według daty
  const sortByDate = (a, b) => {
    return new Date(b.date) - new Date(a.date);
  };

  // Funkcja obsługująca edycję kategorii
  const handleEditCategory = () => {
    navigate(`/editCategory/${categoryId}`);
  };

  return (
    <div className={styles.bodyCategory}>
      <Navbar expand="lg" variant="light" className="text-dark">
        <Link to="/main">
          <Navbar.Brand>
            <img
              src={Logo}
              width="150"
              height="150"
              className="d-inline-block align-top"
              alt="Logo"
            />
          </Navbar.Brand>
        </Link>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mx-auto">
            <Link
              to="/wallet"
              className={styles.navbarWyb + " " + styles["navbar-contact"]}
            >
              Portfel
            </Link>
            <Link to="/entries" className={styles.navbar}>
              Transakcje
            </Link>
            <Link to="/financialGoal" className={styles.navbar}>
              Cele finansowe
            </Link>
            <Link to="/contact" className={styles.navbar}>
              Kontakt
            </Link>
          </Nav>
          <Nav className="ml-auto align-items-center d-flex">
            {userData && userData.avatar ? (
              <NavDropdown
                title={
                  <img
                    src={`http://localhost:8080/${userData.avatar}`}
                    alt="Avatar użytkownika"
                    className={styles.avatar}
                  />
                }
                id="basic-nav-dropdown"
                className={styles.navbarAv}
              >
                <Link to="/account" className="dropdown-item">
                  Konto
                </Link>
                <NavDropdown.Item onClick={handleLogout}>
                  Wyloguj się
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <NavDropdown
                title="Opcje"
                id="basic-nav-dropdown"
                className={styles.navbar}
              >
                <Link to="/account" className="dropdown-item">
                  Konto
                </Link>
                <NavDropdown.Item onClick={handleLogout}>
                  Wyloguj się
                </NavDropdown.Item>
              </NavDropdown>
            )}
          </Nav>
          <Nav className="mr-auto align-items-center d-flex">
            {userData && (
              <div className={styles.navbar1}>
                {`${userData.firstName} ${userData.lastName}`}
              </div>
            )}
          </Nav>
        </Navbar.Collapse>
      </Navbar>
      <div className={styles.panel}>
        {categoryData && (
          <>
            <h2 className={styles.categoryHeader}>Kategoria: {categoryName}</h2>
            <div className={styles.section}>
              {categoryData && <CustomProgressBar category={categoryData} />}
            </div>
            <div className={styles.section}>
              <button
                className={styles.editButton}
                onClick={handleEditCategory}
              >
                Edytuj kategorię <img src={Settings} alt="Settings" />
              </button>
              <button
                className={styles.deleteButton}
                onClick={handleDeleteCategory}
              >
                Usuń kategorię <img src={Trash} alt="Trash" />
              </button>
              <button
                className={styles.AddEntriesButton}
                onClick={handleAddEntryClick}
              >
                Dodaj nowy wpis
              </button>
              <Link to="/wallet">
                <button className={styles.goBackButton}>Powrót</button>
              </Link>
            </div>
            <div className={styles.section}>
              {categoryData.type.toUpperCase() === "WYDATKI" ? (
                <h3 className={styles.h3wyd}>
                  Wydatki w kategorii: {categoryName}
                </h3>
              ) : categoryData.type.toUpperCase() === "WPŁYWY" ? (
                <h3 className={styles.h3wyd}>
                  Wpływy w kategorii: {categoryName}
                </h3>
              ) : null}

              <table className={styles.transactionTable}>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Opis</th>
                    <th>Tryb transakcji</th>
                    <th>Kwota</th>
                    <th>Opcje</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction, index) => (
                    <tr key={index}>
                      <td>
                        {new Date(transaction.date).toLocaleDateString(
                          "pl-PL",
                          {
                            day: "numeric",
                            month: "numeric",
                            year: "numeric",
                          }
                        )}
                      </td>
                      <td>{transaction.description}</td>
                      <td>{transaction.transactionType}</td>
                      <td>{transaction.amount} zł</td>
                      <td>
                        <button className={styles.optionButton}>
                          <img src={Settings} alt="Settings" />
                        </button>
                        <button
                          className={styles.optionButton}
                          onClick={() =>
                            handleDeleteTransaction(transaction._id)
                          }
                        >
                          <img src={Trash} alt="Trash" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Category;

import React, { useState, useEffect } from "react";
import { Navbar, Nav, NavDropdown } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import Logo from "../../../../Assets/Logo.png";
import styles from "./styles.module.css";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const AddPayments = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [financialGoals, setFinancialGoals] = useState([]);
  const [selectedGoal, setSelectedGoal] = useState("");
  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

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

  // Efekt do pobierania celów finansowych z serwera na podstawie dostępności danych użytkownika.
  useEffect(() => {
    if (userData) {
      axios
        .get("http://localhost:8080/api/financial-goals/user/" + userData._id, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        .then((response) => {
          setFinancialGoals(response.data);
          if (response.data.length > 0) {
            setSelectedGoal(response.data[0]._id);
          }
        })
        .catch((error) => {
          console.error("Błąd pobierania celów finansowych:", error);
        });
    }
  }, [userData]);

  const [showMenu, setShowMenu] = useState(false);

  // Funkcja do obsługi wysyłania formularza.
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Wybrany cel finansowy:", selectedGoal);
    if (!selectedGoal) {
      alert("Proszę wybrać cel finansowy");
      return;
    }
    const paymentData = {
      financialGoalId: selectedGoal,
      amount,
      description,
      date,
    };
    axios
      .post("http://localhost:8080/api/payments/add", paymentData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((response) => {
        console.log("Płatność dodana:", response.data);
        navigate("/financialGoal");
      })
      .catch((error) => {
        console.error("Błąd dodawania płatności:", error);
      });
  };

  // Funkcja obsługująca kliknięcie w menu.
  const handleMenuClick = () => {
    setShowMenu(!showMenu);
  };

  // Funkcja obsługująca proces wylogowania użytkownika.
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/start");
  };

  return (
    <div className={styles.bodyEditEntries}>
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
            <Link to="/wallet" className={styles.navbar}>
              Portfel
            </Link>
            <Link to="/entries" className={styles.navbar}>
              Transakcje
            </Link>
            <Link
              to="/financialGoal"
              className={styles.navbarWyb + " " + styles["navbar-contact"]}
            >
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

      <div className={styles.addPaymentsContainer}>
        <h2 className={styles.texh2}>
          Dodawanie nowej wpłaty na cel finansowy
        </h2>
        <form onSubmit={handleSubmit} className="mt-4">
          <div className={styles.inputGroup}>
            <div className={styles.inputContainer}>
              <label htmlFor="goalSelect" className={styles.inputLabel}>
                Wybierz cel finansowy
              </label>
              <select
                value={selectedGoal}
                onChange={(e) => setSelectedGoal(e.target.value)}
                disabled={financialGoals.length === 0}
                className={styles.select}
              >
                {financialGoals.map((goal) => (
                  <option key={goal._id} value={goal._id}>
                    {goal.name}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.inputContainer}>
              <label htmlFor="amount" className={styles.inputLabel}>
                Kwota wpłaty
              </label>
              <div className={styles.amountContainer}>
                <input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <span className={styles.currency}>zł</span>
              </div>
            </div>
          </div>
          <div className={styles.inputGroup}>
            <div className={styles.inputContainer}>
              <label htmlFor="description" className={styles.inputLabel}>
                Opis (opcjonalnie)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>
            <div className={styles.inputContainer}>
              <label htmlFor="date" className={styles.inputLabel}>
                Data wpłaty
              </label>
              <input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>
          <div className={styles.buttonsContainer}>
            <Link to="/financialGoal">
              <button className={styles.BtnCan} type="button">
                Powrót
              </button>
            </Link>
            <button type="submit" className={styles.BtnAcc}>
              Dodaj wpłatę
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPayments;

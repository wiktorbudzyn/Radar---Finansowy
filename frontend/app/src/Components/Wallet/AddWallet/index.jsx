import React, { useState, useEffect } from "react";
import { Navbar, Nav, NavDropdown } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import Logo from "../../../Assets/Logo.png";
import styles from "./styles.module.css";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { AiOutlineInfoCircle } from "react-icons/ai";

const AddWallet = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [walletName, setWalletName] = useState("");
  const [budget, setBudget] = useState("");
  const [showTypeTooltip, setShowTypeTooltip] = useState(false);

  // Efekt wykorzystywany do pobierania danych użytkownika z serwera.
  useEffect(() => {
    const token = localStorage.getItem("token");

    axios
      .get("http://localhost:8080/api/users/user-data", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setUserData(response.data.user);
      })
      .catch((error) => {
        console.error("Błąd pobierania danych użytkownika:", error);
      });
  }, []);

  // Funkcja obsługująca proces wylogowania użytkownika.
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/start");
  };

  // Funkcja do dodawania nowego portfela na serwerze.
  const handleAddWallet = () => {
    const newWalletData = {
      walletName: walletName,
      budget: budget,
    };

    axios
      .post("http://localhost:8080/api/wallets/add-wallet", newWalletData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((response) => {
        console.log("Odpowiedź z dodawania portfela:", response.data.message);
        navigate("/wallet");
      })
      .catch((error) => {
        console.error("Błąd podczas dodawania portfela:", error);
      });
  };

  //Funckja sprawdzająca poprawność wprowadzonej kworty.
  const handleBudgetChange = (e) => {
    const value = e.target.value;
    if (/^\d+(\.\d{0,2})?$/.test(value) || value === "") {
      setBudget(value);
    }
  };

  return (
    <div className={styles.bodyAddWallet}>
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
              className={`${styles.navbarWyb} ${styles["navbar-contact"]}`}
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

      <div className={styles.addWalletContainer}>
        <div className={styles.addWalletPanel}>
          <h2 className={styles.panelHeader}>Dodawanie nowego portfela</h2>
          <div className={styles.inputFields}>
            <div className={styles.inputContainer}>
              <label className={styles.inputLabel}>
                Nazwa portfela:
                <div className={styles.inputWithIcon}>
                  <input
                    type="text"
                    value={walletName}
                    onChange={(e) => setWalletName(e.target.value)}
                    className={styles.inputField}
                    placeholder="Wprowadź nazwę"
                  />
                  <AiOutlineInfoCircle
                    size={18}
                    color="#555"
                    data-tip
                    data-for="nameTooltip"
                    className={styles.infoIcon}
                    onMouseEnter={() => setShowTypeTooltip(true)}
                    onMouseLeave={() => setShowTypeTooltip(false)}
                  />
                  {showTypeTooltip && (
                    <div className={styles.tooltip}>
                      To będzie nazwa twojego portfela, którym będziesz
                      zarządzał/a.
                    </div>
                  )}
                </div>
              </label>
            </div>
            <div className={styles.inputContainer}>
              <label className={styles.inputLabel}>
                Budżet startowy:
                <div className={styles.inputWithIcon}>
                  <input
                    type="text"
                    value={`${budget}`}
                    onChange={handleBudgetChange}
                    className={styles.inputField}
                    placeholder="Wprowadź kwotę"
                  />
                  <AiOutlineInfoCircle
                    size={18}
                    color="#555"
                    data-tip
                    data-for="nameTooltip"
                    className={styles.infoIcon}
                    onMouseEnter={() => setShowTypeTooltip(true)}
                    onMouseLeave={() => setShowTypeTooltip(false)}
                  />
                  {showTypeTooltip && (
                    <div className={styles.tooltip}>
                      Budżet z którym zaczynasz. Będzie on dodany do twojego
                      portfela by można było nim dysponować.
                    </div>
                  )}
                  <span className={styles.currencyLabel}>zł</span>
                </div>
              </label>
            </div>
          </div>
          <div className={styles.buttonGroup}>
            <Link to="/wallet">
              <button className={styles.backButton}>Powrót</button>
            </Link>

            <button className={styles.saveButton} onClick={handleAddWallet}>
              Zapisz
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddWallet;

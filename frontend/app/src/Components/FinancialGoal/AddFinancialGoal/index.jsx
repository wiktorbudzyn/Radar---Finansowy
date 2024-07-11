import React, { useState, useEffect } from "react";
import { Navbar, Nav, NavDropdown } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import Logo from "../../../Assets/Logo.png";
import styles from "./styles.module.css";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const AddFinancialGoal = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [form, setForm] = useState({
    name: "",
    targetAmount: "",
    currentAmount: "",
    deadline: "",
  });

  // Efekt do pobierania danych użytkownika z serwera.
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

  // Funkcja do obsługi zmiany w formularzu.
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Funkcja do obsługi wysyłania formularza.
  const handleSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (token && userData) {
      const updatedForm = {
        ...form,
        userId: userData._id,
      };

      axios
        .post("http://localhost:8080/api/financial-goals/add", updatedForm, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          navigate("/financialGoal");
        })
        .catch((error) => {
          console.error("Błąd podczas dodawania celu finansowego:", error);
          if (error.response) {
            console.error("Response data:", error.response.data);
          }
        });
    } else {
      navigate("/login");
    }
  };

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

  return (
    <div className={styles.bodyAddFinancialGoal}>
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
              className={styles.navbar + " " + styles["navbar-contact"]}
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
                className={styles.navbar}
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

      <div className={styles.formContainer}>
        <h2 className={styles.textGlH2}>Dodawanie nowego celu finansowego</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Nazwa celu finansowego:</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className={styles.input}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>
              Cel finansowy do realizowania:
            </label>
            <input
              type="text"
              name="targetAmount"
              value={form.targetAmount}
              onChange={handleChange}
              className={styles.input}
              required
            />
            <span className={styles.zlSpan}>zł</span>
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>
              Kwota już uzyskana (opcjonalnie):
            </label>

            <input
              type="text"
              name="currentAmount"
              value={form.currentAmount}
              onChange={handleChange}
              className={styles.input}
            />
            <span className={styles.zlSpan}>zł</span>
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>
              Termin spełnienia celu finansowego (opcjonalnie):
            </label>
            <input
              type="date"
              name="deadline"
              value={form.deadline}
              onChange={handleChange}
              className={styles.input}
            />
          </div>
          <div className={styles.formButtons}>
            <button
              type="button"
              className={styles.BtnCa}
              onClick={() => navigate(-1)}
            >
              Powrót
            </button>
            <button type="submit" className={styles.BtnAc}>
              Zapisz
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFinancialGoal;

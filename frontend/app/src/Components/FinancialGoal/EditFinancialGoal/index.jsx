import React, { useState, useEffect } from "react";
import { Navbar, Nav, NavDropdown } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import Logo from "../../../Assets/Logo.png";
import styles from "./styles.module.css";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const EditFinancialGoal = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);

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
    <div className={styles.bodyEditFinancialGoal}>
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
    </div>
  );
};

export default EditFinancialGoal;

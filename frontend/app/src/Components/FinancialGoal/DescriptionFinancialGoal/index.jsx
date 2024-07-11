import React, { useState, useEffect } from "react";
import { Navbar, Nav, NavDropdown } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import Logo from "../../../Assets/Logo.png";
import styles from "./styles.module.css";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import Settings from "../../../Assets/settings.svg";
import Trash from "../../../Assets/trash.svg";

const DescriptionFinancialGoal = () => {
  const navigate = useNavigate();
  const { financialGoalId } = useParams();
  const [userData, setUserData] = useState(null);
  const [financialGoal, setFinancialGoal] = useState(null);

  // Efekt do pobierania danych celu finansowego oraz danych użytkownika z serwera.
  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("Fetching financial goal details for ID:", financialGoalId);
    axios
      .get(`http://localhost:8080/api/financial-goals/${financialGoalId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        console.log("Financial goal details received:", response.data);
        setFinancialGoal(response.data);
      })
      .catch((error) => {
        console.error("Error fetching financial goal details:", error);
      });

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
  }, [financialGoalId]);

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

  // Funkcja do nawigacji do strony edycji celu finansowego.
  const handleEditGoal = (goalId) => {
    navigate(`/editFinancialGoal/${goalId}`);
  };

  // Funkcja do nawigacji do strony dodawania nowych wpłat.
  const handleAddEntryClick = () => {
    navigate("/addPayments");
  };

  // Funkcja do usuwania celu finansowego.
  const handleDeleteGoal = () => {
    const token = localStorage.getItem("token");
    if (window.confirm("Czy na pewno chcesz usunąć ten cel finansowy?")) {
      axios
        .delete(
          `http://localhost:8080/api/financial-goals/${financialGoalId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then(() => {
          navigate("/financialGoal");
        })
        .catch((error) => {
          console.error("Błąd usuwania celu finansowego:", error);
        });
    }
  };

  // Komponent do renderowania paska postępu celu finansowego.
  const CustomProgressBar = ({ goal }) => {
    const progressPercent = (goal.currentAmount / goal.targetAmount) * 100;
    const remainingAmount = goal.targetAmount - goal.currentAmount;

    let backgroundColor = progressPercent >= 100 ? "green" : "#002d80";
    let message = progressPercent >= 100 ? "Udało się! :)" : "";

    return (
      <>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${progressPercent}%`, backgroundColor }}
          />
        </div>
        <div className={styles.progressInfo}>
          <span>Wpłacono: {goal.currentAmount} zł</span>
          <span>Pozostało: {remainingAmount} zł</span>
        </div>
        {message && <div className={styles.successMessage}>{message}</div>}
      </>
    );
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

      <div className={styles.panel}>
        {financialGoal && (
          <>
            <div>
              <h2 className={styles.goalHeader}>
                Cel finansowy: {financialGoal.goal.name}
              </h2>
              <div className={styles.Pgoal}>
                <p className={styles.goalText}>
                  Zakładany cel finansowy:{" "}
                  <span className={styles.boldText}>
                    {financialGoal.goal.targetAmount} zł
                  </span>
                </p>
                <p className={styles.goalText}>
                  Planowany termin zakończenia celu:{" "}
                  <span className={styles.boldText}>
                    {new Date(financialGoal.goal.deadline).toLocaleDateString(
                      "en-GB"
                    )}
                  </span>
                </p>
              </div>

              <CustomProgressBar goal={financialGoal.goal} />
            </div>
            <div className={styles.section}>
              <button className={styles.editButton} onClick={handleEditGoal}>
                Edytuj cel finansowy <img src={Settings} alt="Settings" />
              </button>
              <button
                className={styles.deleteButton}
                onClick={handleDeleteGoal}
              >
                Usuń cel finansowy <img src={Trash} alt="Trash" />
              </button>
              <button
                className={styles.AddPaymentButton}
                onClick={handleAddEntryClick}
              >
                Dodaj nową wpłatę
              </button>
              <Link to="/financialGoal">
                <button className={styles.goBackButton}>Powrót</button>
              </Link>
            </div>
            <div className={styles.section}>
              <h3 className={styles.h3wyd}>
                Wpłaty na cel finansowy: {financialGoal.goal.name}
              </h3>
              <table className={styles.paymentTable}>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Opis</th>
                    <th>Kwota</th>
                    <th>Opcje</th>
                  </tr>
                </thead>
                <tbody>
                  {financialGoal?.goal?.payments.map((payment, index) => (
                    <tr key={index}>
                      <td>{new Date(payment.date).toLocaleDateString()}</td>
                      <td>{payment.description}</td>
                      <td>{payment.amount} zł</td>
                      <td>
                        <button className={styles.optionButton}>
                          <img src={Settings} alt="Settings" />
                        </button>
                        <button className={styles.optionButton}>
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

export default DescriptionFinancialGoal;

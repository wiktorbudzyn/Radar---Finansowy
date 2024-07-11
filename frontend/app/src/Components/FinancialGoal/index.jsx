import React, { useState, useEffect } from "react";
import { Navbar, Nav, NavDropdown } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import Logo from "../../Assets/Logo.png";
import styles from "./styles.module.css";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const FinancialGoal = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [financialGoals, setFinancialGoals] = useState([]);

  // Efekt do pobierania danych użytkownika i celów finansowych z serwera.
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
        return axios.get(
          `http://localhost:8080/api/financial-goals/user/${response.data.user._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      })
      .then((response) => {
        setFinancialGoals(response.data);
      })
      .catch((error) => {
        console.error("Błąd:", error);
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

  // Funkcja do obliczania liczby dni pozostałych do terminu celu finansowego.
  const calculateDaysUntilDeadline = (deadline) => {
    const deadlineDate = new Date(deadline);
    const todayDate = new Date();
    const timeDiff = deadlineDate.getTime() - todayDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysDiff;
  };

  // Komponent CustomProgressBar do renderowania paska postępu celu finansowego.
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

  // Funkcja obsługująca kliknięcie na opis celu finansowego.
  const handleDescriptionClick = (goalId) => {
    navigate(`/descriptionFinancialGoal/${goalId}`);
  };

  return (
    <div className={styles.bodyFinancialGoal}>
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
      <div className={styles.financialGoalsSection}>
        <div className={styles.financialGoalsButtons}>
          <button
            className={styles.addBtn}
            onClick={() => navigate("/addFinancialGoal")}
          >
            Dodaj nowy cel finansowy
          </button>
          <button
            className={styles.addBtn}
            onClick={() => navigate("/addPayments")}
          >
            Dodaj wpłatę na cel finansowy
          </button>
        </div>
        <div className={styles.financialGoalsList}>
          <h2 className={styles.naglH2}>
            {financialGoals.length > 0
              ? "Twoje cele finansowe:"
              : "Brak celów finansowych."}
          </h2>
          <div className={styles.goalsContainer}>
            {financialGoals.map((goal) => (
              <div key={goal._id} className={styles.goalCard}>
                <p className={styles.GoalName}>{goal.name}</p>
                <div className={styles.GoalTargetAmount}>
                  Cel finansowy: {goal.targetAmount} zł
                </div>
                <div className={styles.GoalDayEnding}>
                  Do planowanego zakończenia <br /> celu finansowego pozostało:{" "}
                  {calculateDaysUntilDeadline(goal.deadline)} dni
                </div>
                <CustomProgressBar goal={goal} />
                <button
                  className={styles.showDetailsButton}
                  onClick={() => handleDescriptionClick(goal._id)}
                >
                  Pokaż szczegóły
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialGoal;

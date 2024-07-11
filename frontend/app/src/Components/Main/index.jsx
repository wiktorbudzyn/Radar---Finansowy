import React, { useState, useEffect, useRef } from "react";
import { Navbar, Nav, NavDropdown } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import Logo from "../../Assets/Logo.png";
import styles from "./styles.module.css";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Chart from "chart.js/auto";

const Main = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [WholeBudget, setWholeBudget] = useState(null);
  const [chartData, setChartData] = useState(null);
  const chartRef = useRef(null);
  const [transactions, setTransactions] = useState([]);

  // Efekt do pobierania danych portfeli użytkownika oraz danych użytkownika z serwera.
  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("Token JWT z localStorage:", token);

    axios
      .get("http://localhost:8080/api/wallets/user-wallets", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        console.log("Otrzymane portfele:", response.data.userWallets);
        if (response.data.userWallets.length > 0) {
          setWholeBudget(response.data.userWallets[0].WholeBudget);
          const selected = response.data.userWallets[0];
          setChartData({
            labels: [
              "Kwota do rozdysponowania na kategorie",
              "Wszystkie wydatki",
              "Wszystkie przychody",
            ],
            datasets: [
              {
                label: "Budżet",
                data: [
                  selected.actualbudget,
                  selected.WholeLoses,
                  selected.WholeGains,
                ],
                backgroundColor: ["#002d80", "#a2c0f8", "#55a630"],
                hoverOffset: 4,
              },
            ],
          });
        }
      })
      .catch((error) => {
        console.error("Błąd pobierania portfeli użytkownika:", error);
      });

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

  // Efekt do pobierania danych transakcji użytkownika z serwera.
  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get("http://localhost:8080/api/entries/all-transactions", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const sortedTransactions = response.data.transactions
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 5);
        setTransactions(sortedTransactions);
      })
      .catch((error) => {
        console.error("Błąd pobierania transakcji:", error);
      });
  }, []);

  // Efekt do generowania wykresu za pomocą biblioteki Chart.js.
  useEffect(() => {
    if (chartRef.current !== null && chartData !== null) {
      const ctx = chartRef.current.getContext("2d");
      new Chart(ctx, {
        type: "pie",
        data: chartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
        },
      });
    }
  }, [chartData]);

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

  //Funkcja do renderowania kwoty transakcji z odpowiednim stylem w zależności od rodzaju transakcji (przychód/wydatek).
  const renderAmount = (transaction) => {
    const amount = parseFloat(transaction.amount);
    const categoryType = transaction.categoryType.toUpperCase(); // Pobranie typu kategorii transakcji

    let sign = "";
    let color = "";

    if (categoryType === "WYDATKI") {
      sign = "-";
      color = "red";
    } else if (categoryType === "WPŁYWY") {
      sign = "+";
      color = "green";
    }

    return <span style={{ color }}>{`${sign} ${amount.toFixed(2)} zł`}</span>;
  };

  return (
    <div className={styles.bodyMain}>
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

      <div className={styles.panelContainer}>
        <div className={styles.panel}>
          <div className={styles.FirstDivPanel}>
            <h2>Aktualne saldo domyślnego portfela</h2>
          </div>
          <div className={styles.SecDivPanel1}>
            <p>{WholeBudget !== null ? `${WholeBudget} zł` : "Brak danych"}</p>
          </div>
          <div className={styles.PieChart}>
            <canvas ref={chartRef}></canvas>
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.FirstDivPanel}>
            <h2>Ostatnie przepływy</h2>
          </div>
          <div className={styles.SecDivPanel2}>
            {transactions.length > 0 ? (
              transactions.map((transaction, index) => (
                <div key={index} className={styles.transactionItem}>
                  <div className={styles.transactionRow}>
                    <span>
                      {new Date(transaction.date).toLocaleDateString("pl-PL")}
                    </span>
                    <span>{transaction.categoryName}</span>
                    <span>{renderAmount(transaction)}</span>
                  </div>
                  <div className={styles.transactionRow1}>
                    <span className={styles.desOP}>
                      {transaction.description}
                    </span>
                  </div>
                  <hr className={styles.transactionSeparator} />
                </div>
              ))
            ) : (
              <p>Brak transakcji do wyświetlenia.</p>
            )}
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.FirstDivPanel}>
            <h2>Skróty</h2>
          </div>
          <div className={styles.SecDivPanel3}>
            <button
              className={styles.addButton}
              onClick={() => navigate("/addEntries")}
            >
              Dodaj wpis
            </button>
            <button
              className={styles.addButton}
              onClick={() => navigate("/addPayments")}
            >
              Dodaj nową wpłatę na cel finansowy
            </button>
            <button
              className={styles.addButton}
              onClick={() => navigate("/addFinancialGoal")}
            >
              Dodaj nowy cel finansowy
            </button>
            <button
              className={styles.addButton}
              onClick={() => navigate("/addWallet")}
            >
              Dodaj nowy portfel
            </button>
          </div>
        </div>
      </div>
      <div></div>
    </div>
  );
};

export default Main;

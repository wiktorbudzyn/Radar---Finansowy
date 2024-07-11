import React, { useState, useEffect } from "react";
import { Navbar, Nav, NavDropdown } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import Logo from "../../Assets/Logo.png";
import styles from "./styles.module.css";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Settings from "../../Assets/settings.svg";
import Trash from "../../Assets/trash.svg";
import { differenceInDays, subDays } from "date-fns";

const Entries = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState("Wszystko");
  const [filteredTransactions, setFilteredTransactions] = useState([]);

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

  // Efekt do pobierania transakcji użytkownika z serwera.
  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get(`http://localhost:8080/api/entries/all-transactions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const sortedTransactions = response.data.transactions.sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );
        setTransactions(sortedTransactions);
      })
      .catch((error) => {
        console.error("Błąd pobierania transakcji:", error);
      });
  }, []);

  // Funkcja do renderowania kwoty z odpowiednim stylem.
  const renderAmount = (transaction) => {
    const amount = parseFloat(transaction.amount);
    const categoryType = transaction.categoryType.toUpperCase();

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

  // Funkcja do nawigacji do strony dodawania nowego wpisu.
  const handleAddEntryClick = () => {
    navigate("/addEntries");
  };

  // Funkcja do obsługi zmiany wybranego okresu czasu.
  const handlePeriodChange = (e) => {
    setSelectedPeriod(e.target.value);
  };

  // Efekt do filtrowania transakcji na podstawie wybranego okresu czasu.
  useEffect(() => {
    const filterTransactions = () => {
      const currentDate = new Date();

      const filtered = transactions.filter((transaction) => {
        const transactionDate = new Date(transaction.date);

        if (selectedPeriod === "Wszystko") {
          return true;
        }

        if (selectedPeriod === "Ostatni tydzień") {
          return differenceInDays(currentDate, transactionDate) <= 7;
        } else if (selectedPeriod === "Ostatnie 30 dni") {
          return differenceInDays(currentDate, transactionDate) <= 30;
        } else if (selectedPeriod === "Ostatnie 90 dni") {
          return differenceInDays(currentDate, transactionDate) <= 90;
        } else if (selectedPeriod === "Ostatnie 180 dni") {
          return differenceInDays(currentDate, transactionDate) <= 180;
        } else if (selectedPeriod === "Ostatni rok") {
          const oneYearAgo = subDays(currentDate, 365);
          return transactionDate >= oneYearAgo;
        }

        return true;
      });

      return filtered;
    };

    const filtered = filterTransactions();
    setFilteredTransactions(filtered);
  }, [selectedPeriod, transactions]);

  return (
    <div className={styles.EntriesBody}>
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
            <Link
              to="/entries"
              className={styles.navbarWyb + " " + styles["navbar-contact"]}
            >
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

      <div className={styles.optionsSection}>
        <div className={styles.addEntryButton}>
          <button onClick={handleAddEntryClick}>Dodaj wpis</button>
        </div>
        <div className={styles.dateOptions}>
          <span>Wybierz okres: </span>
          <select value={selectedPeriod} onChange={handlePeriodChange}>
            <option>Wszystko</option>
            <option>Ostatni tydzień</option>
            <option>Ostatnie 30 dni</option>
            <option>Ostatnie 90 dni</option>
            <option>Ostatnie 180 dni</option>
            <option>Ostatni rok</option>
          </select>
        </div>
      </div>

      <hr className={styles.line} />
      <div className={`${styles.GLD}`}>
        <div className={styles.tableSection}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Lp.</th>
                <th>Data</th>
                <th>Portfel</th>
                <th>Kategoria</th>
                <th>Opis</th>
                <th>Tryb transakcji</th>
                <th>Kwota</th>
                <th>Opcje</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((transaction, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>
                    {new Date(transaction.date).toLocaleDateString("pl-PL", {
                      day: "numeric",
                      month: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td>{transaction.walletName}</td>
                  <td>{transaction.categoryName}</td>
                  <td>{transaction.description}</td>
                  <td>{transaction.transactionType}</td>
                  <td>{renderAmount(transaction)}</td>
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
      </div>
    </div>
  );
};

export default Entries;

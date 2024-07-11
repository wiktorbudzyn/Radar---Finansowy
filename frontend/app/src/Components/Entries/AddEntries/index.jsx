import React, { useState, useEffect } from "react";
import { Navbar, Nav, NavDropdown } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import Logo from "../../../Assets/Logo.png";
import styles from "./styles.module.css";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const AddEntries = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [entryType, setEntryType] = useState("");
  const [wallets, setWallets] = useState([]);
  const [selectedWallet, setSelectedWallet] = useState("");
  const [amount, setAmount] = useState(0);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [transactionType, setTransactionType] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const validEntryTypes = ["WPŁYWY", "WYDATKI"];

  // Efekt do pobierania danych użytkownika z serwera.
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

  // Efekt do ustawienia domyślnej wartości daty na obecną datę.
  useEffect(() => {
    const currentDate = new Date().toISOString().slice(0, 10);
    setDate(currentDate);
  }, []);

  // Efekt do pobierania portfeli użytkownika z serwera.
  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get("http://localhost:8080/api/wallets/user-wallets", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const userWallets = response.data.userWallets;
        console.log(
          "Portfele użytkownika:",
          userWallets.map((wallet) => wallet._id)
        );

        setWallets(userWallets);
      })
      .catch((error) => {
        console.error("Błąd pobierania portfeli użytkownika:", error);
      });
  }, []);

  // Funkcja do pobierania kategorii dla danego typu wpisu i portfela.
  const fetchCategories = async (type, selectedWallet) => {
    try {
      console.log("Typ wpisu w warunku:", type);
      console.log("ID wybranego portfela:", selectedWallet);
      const token = localStorage.getItem("token");
      const categoryType = type.toUpperCase();
      const response = await axios.get(
        `http://localhost:8080/api/categories/${categoryType}/${selectedWallet}/categories`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const fetchedCategories = response.data.categories;
      if (fetchedCategories && fetchedCategories.length > 0) {
        setCategories([...fetchedCategories]);
        setSelectedCategory(fetchedCategories[0]._id);
      } else {
        console.log("Brak kategorii dla tego typu i portfela");
      }
    } catch (error) {
      console.error("Błąd pobierania kategorii:", error);
    }
  };

  // Efekt do pobierania kategorii na podstawie wybranego typu wpisu i portfela.
  useEffect(() => {
    if ((entryType === "WPŁYWY" || entryType === "WYDATKI") && selectedWallet) {
      console.log("Typ wpisu w warunku:", entryType);
      fetchCategories(entryType, selectedWallet);
    }
  }, [entryType, selectedWallet]);

  // Funkcja obsługująca wysyłanie formularza.
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!entryType) {
      return alert("Wybierz rodzaj wpisu!");
    }

    if (!selectedWallet) {
      return alert("Wybierz portfel!");
    }

    if (!selectedCategory) {
      return alert("Wybierz kategorię!");
    }

    if (!transactionType) {
      return alert("Wybierz tryb transakcji!");
    }
    if (!description) {
      setDescription("brak");
    }

    if (amount <= 0) {
      if (amount < 0) {
        return alert("Nie możesz dodać ujemnej kwoty!");
      } else if (amount === 0) {
        return alert("Nie możesz dodać kwoty 0 zł.");
      } else {
        return alert("Wpisz kwotę!");
      }
    }

    if (validEntryTypes.includes(entryType)) {
      try {
        const token = localStorage.getItem("token");
        const newEntry = {
          selectedWallet,
          amount,
          selectedCategory: entryType,
          transactionType,
          description,
          date,
        };
        console.log("Nowy wpis:", newEntry);

        const response = await axios.post(
          `http://localhost:8080/api/entries/add-entry/${selectedCategory}`,
          newEntry,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("Dodano nowy wpis:", response.data);
        alert("Wpis został dodany");
        navigate("/Entries", { replace: true });
        window.location.reload();
      } catch (error) {
        console.error("Błąd dodawania wpisu:", error);
      }
    } else {
      console.error("Błędny typ wpisu:", entryType);
    }
  };

  // Funkcja do renderowania opcji kategorii.
  const renderCategories = () => {
    return categories.map((category) => (
      <option key={category._id} value={category._id}>
        {category.name}
      </option>
    ));
  };

  // Funkcja do renderowania opcji portfeli.
  const renderWallets = () => {
    return wallets.map((wallet) => (
      <option key={wallet._id} value={wallet._id}>
        {wallet.name}
      </option>
    ));
  };

  // Funkcja do renderowania opcji typów transakcji.
  const renderTransactionOptions = () => {
    return (
      <>
        <option value="">Wybierz typ transakcji</option>
        <option value="Gotówka">Gotówka</option>
        <option value="Karta płatnicza">Karta płatnicza</option>
        <option value="Przelew">Przelew</option>
      </>
    );
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
    <div className={styles.bodyAddEntries}>
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

      <div className={styles.addEntriesContainer}>
        <h2 className={styles.texh2}>Dodawanie nowej transakcji</h2>
        <form className="mt-4" onSubmit={handleFormSubmit}>
          <div className={styles.inputGroup}>
            <div className={styles.inputContainer}>
              <label htmlFor="entryType" className={styles.inputLabel}>
                Rodzaj transakcji:
              </label>
              <select
                id="entryType"
                onChange={(e) => setEntryType(e.target.value)}
                value={entryType}
                className={styles.select}
              >
                <option value="">Wybierz rodzaj transakcji</option>
                <option value="WPŁYWY">Wpływy</option>
                <option value="WYDATKI">Wydatki</option>
              </select>
            </div>

            <div className={styles.inputContainer}>
              <label htmlFor="selectedWallet" className={styles.inputLabel}>
                Wybór portfela:
              </label>
              <select
                id="selectedWallet"
                onChange={(e) => setSelectedWallet(e.target.value)}
                value={selectedWallet}
                className={styles.select}
              >
                <option value="">Wybierz portfel</option>
                {renderWallets()}
              </select>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <div className={styles.inputContainer}>
              <label htmlFor="amount" className={styles.inputLabel}>
                Kwota:
              </label>
              <div className={styles.amountContainer}>
                <input
                  type="number"
                  id="amount"
                  onChange={(e) => setAmount(e.target.value)}
                  value={amount}
                />
                <span className={styles.currency}>zł</span>
              </div>
            </div>
            <div className={styles.inputContainer}>
              <label htmlFor="date" className={styles.inputLabel}>
                {" "}
                Data:
              </label>
              <input
                type="date"
                id="date"
                onChange={(e) => setDate(e.target.value)}
                value={date}
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <div className={styles.inputContainer}>
              <label htmlFor="selectedCategory" className={styles.inputLabel}>
                Kategoria:
              </label>
              <select
                id="selectedCategory"
                onChange={(e) => setSelectedCategory(e.target.value)}
                value={selectedCategory}
                className={styles.select}
              >
                <option value="">Wybierz kategorię</option>
                {renderCategories()}
              </select>
            </div>

            <div className={styles.inputContainer}>
              <label htmlFor="transactionType" className={styles.inputLabel}>
                Typ transakcji:
              </label>
              <select
                id="transactionType"
                onChange={(e) => setTransactionType(e.target.value)}
                value={transactionType}
                className={styles.select}
              >
                {renderTransactionOptions()}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="description" className={styles.inputLabel}>
              Opis:
            </label>
            <textarea
              id="description"
              rows={3}
              onChange={(e) => setDescription(e.target.value)}
              value={description}
            ></textarea>
          </div>

          <div className={styles.buttonsContainer}>
            <Link to="/entries">
              <button className={styles.BtnCan} type="button">
                Powrót
              </button>
            </Link>
            <button className={styles.BtnAcc} type="submit">
              Dodaj wpis
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEntries;

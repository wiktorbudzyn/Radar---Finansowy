import React, { useState, useEffect } from "react";
import { Navbar, Nav, NavDropdown } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import Logo from "../../../../Assets/Logo.png";
import styles from "./styles.module.css";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AiOutlineInfoCircle } from "react-icons/ai";

const AddCategory = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const { walletId } = useParams();
  const [showCustomNameInput, setShowCustomNameInput] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState("");
  const [showTypeTooltip, setShowTypeTooltip] = useState(false);
  const [categoryData, setCategoryData] = useState({
    type: "",
    name: "",
    amount: 0,
  });

  // Funkcja obsługująca zmiany w formularzu
  const handleCategoryNameChange = (e) => {
    const { name, value } = e.target;
    setCategoryData({ ...categoryData, [name]: value });
    if (value === "Własna nazwa") {
      setShowCustomNameInput(true);
    } else {
      setShowCustomNameInput(false);
      setCustomCategoryName("");
    }
  };

  // Funkcja obsługująca zmiany w formularzu
  const handleCustomNameChange = (e) => {
    setCustomCategoryName(e.target.value);
  };

  // Funkcja obsługująca zmiany w formularzu
  const handleCategoryTypeChange = (e) => {
    const { name, value } = e.target;
    setCategoryData((prevData) => ({
      ...prevData,
      [name]: value,
      name:
        value === "Wydatki"
          ? "Paliwo"
          : value === "Wpływy"
          ? "Zwrot"
          : prevData.name,
    }));
    if (value === "Własna nazwa") {
      setShowCustomNameInput(true);
    } else {
      setShowCustomNameInput(false);
    }
  };

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCategoryData({ ...categoryData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      let dataToSend = { ...categoryData };

      if (
        categoryData.name === "Własna nazwa" &&
        customCategoryName.trim() !== ""
      ) {
        dataToSend = { ...dataToSend, name: customCategoryName.trim() };
      }

      axios.post(
        `http://localhost:8080/api/categories/add-category/${walletId}`,
        dataToSend,
        config
      );

      navigate("/wallet");
      window.location.reload();
    } catch (error) {
      console.error("Błąd podczas dodawania kategorii:", error.message);
    }
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
    <div className={styles.bodyAddCategory}>
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

      <div className={styles.formContainer}>
        <h2>Dodawanie nowej kategorii</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label>
              Rodzaj kategorii:
              <br />
              <div className={styles.inputContainer}>
                <select
                  name="type"
                  value={categoryData.type}
                  onChange={handleCategoryTypeChange}
                  className={`${styles.input} ${styles.select}`}
                >
                  <option value="">-</option>
                  <option value="Wpływy">Wpływy</option>
                  <option value="Wydatki">Wydatki</option>
                </select>
                <AiOutlineInfoCircle
                  size={18}
                  color="#555"
                  data-tip
                  data-for="typeTooltip"
                  className={styles.infoIcon}
                  onMouseEnter={() => setShowTypeTooltip(true)}
                  onMouseLeave={() => setShowTypeTooltip(false)}
                />
                {showTypeTooltip && (
                  <div className={styles.tooltip}>Wybór kategorii portfela</div>
                )}
              </div>
            </label>
          </div>
          <div className={styles.inputGroup}>
            <label>
              Nazwa kategorii:
              <br />
              <div className={styles.inputContainer}>
                <select
                  name="name"
                  value={categoryData.name}
                  onChange={handleCategoryNameChange}
                  className={`${styles.input} ${styles.textInput}`}
                >
                  <option value="">-</option>
                  {categoryData.type === "Wydatki" ? (
                    <>
                      <option value="Paliwo">Paliwo</option>
                      <option value="Subskrybcje">Subskrybcje</option>
                      <option value="Artykuły spożywcze">
                        Artykuły spożywcze
                      </option>
                      <option value="Artykuły kosmetyczne">
                        Artykuły kosmetyczne
                      </option>
                      <option value="Inne">Inne</option>
                    </>
                  ) : (
                    categoryData.type === "Wpływy" && (
                      <>
                        <option value="Zwrot">Zwrot</option>
                        <option value="Wypłata">Wypłata</option>
                        <option value="Inne">Inne</option>
                      </>
                    )
                  )}
                  <option value="Własna nazwa">Własna nazwa</option>
                </select>
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
                    Nazwa kategorii w portfelu
                  </div>
                )}
              </div>
            </label>
            {showCustomNameInput && (
              <div className={styles.inputGroup}>
                <label>
                  Wprowadź swoją nazwę kategorii:
                  <br />
                  <input
                    type="text"
                    name="customName"
                    value={customCategoryName}
                    onChange={handleCustomNameChange}
                    placeholder="Wprowadź swoją nazwę kategorii"
                    className={styles.input}
                  />
                </label>
              </div>
            )}
          </div>
          {categoryData.type === "Wydatki" && (
            <div className={styles.inputGroup}>
              <label>
                Kwota:
                <br />
                <div className={styles.inputContainer}>
                  <input
                    type="number"
                    name="amount"
                    value={categoryData.amount}
                    onChange={handleChange}
                    className={`${styles.input} ${styles.amountTextInput}`}
                  />
                  <div className={styles.amountLabel}>
                    <span>zł</span>
                  </div>
                  <AiOutlineInfoCircle
                    size={18}
                    color="#555"
                    data-tip
                    data-for="amountTooltip"
                    className={styles.infoIcon}
                    onMouseEnter={() => setShowTypeTooltip(true)}
                    onMouseLeave={() => setShowTypeTooltip(false)}
                  />
                  {showTypeTooltip && (
                    <div className={styles.tooltip}>
                      Kwota którą przeznaczasz na tą kategorię
                    </div>
                  )}
                </div>
              </label>
            </div>
          )}
          <Link to="/wallet">
            <button className={`${styles.button} ${styles.backButton}`}>
              Powrót
            </button>
          </Link>
          <button type="submit" className={styles.button}>
            Zapisz
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddCategory;

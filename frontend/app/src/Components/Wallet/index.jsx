import React, { useState, useEffect, useRef } from "react";
import { Navbar, Nav, NavDropdown } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import Logo from "../../Assets/Logo.png";
import styles from "./styles.module.css";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "react-datepicker/dist/react-datepicker.css";
import Settings from "../../Assets/settings.svg";
import Trash from "../../Assets/trash.svg";
import Chart from "chart.js/auto";

const Wallet = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [userWallets, setUserWallets] = useState([]);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [walletToDelete, setWalletToDelete] = useState(null);
  const [walletDeleted, setWalletDeleted] = useState(false);
  const [walletId, setWalletId] = useState(null);
  const [selectedWallet, setSelectedWallet] = useState(null);

  // Funkcja obsługująca potwierdzenie usunięcia portfela
  const handleDeleteConfirmation = (walletId, walletName, userWallets) => {
    setWalletToDelete(walletId);
    setShowDeleteConfirmation(true);
  };

  // Funkcja obsługująca usunięcie portfela
  const handleDeleteWallet = (walletId) => {
    if (walletToDelete) {
      const confirmation = window.confirm(
        `Czy na pewno chcesz usunąć portfel ${
          userWallets.find((wallet) => wallet._id === walletToDelete)?.name
        }?`
      );
      setWalletToDelete(walletId);
      if (confirmation) {
        const token = localStorage.getItem("token");
        axios
          .delete(
            `http://localhost:8080/api/wallets/delete-wallet/${walletToDelete}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          )
          .then((response) => {
            console.log(response.data.message);
            alert("Usunięto portfel");
            setWalletDeleted(true);
            navigate("/wallet");
          })
          .catch((error) => {
            console.error("Błąd podczas usuwania portfela:", error);
          });
      }
    }
  };

  // Efekt po usunięciu portfela - odświeżenie strony
  useEffect(() => {
    if (walletDeleted) {
      window.location.reload();
    }
  }, [walletDeleted]);

  // Funkcja obsługująca edycję portfela
  const handleEditWallet = () => {
    if (selectedWallet !== null) {
      navigate(`/editWallet/${selectedWallet}`);
    }
  };

  // Efekt pobierający portfele użytkownika z serwera
  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get("http://localhost:8080/api/wallets/user-wallets", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        console.log("Otrzymane portfele:", response.data.userWallets);
        setUserWallets(response.data.userWallets);
      })
      .catch((error) => {
        console.error("Błąd pobierania portfeli użytkownika:", error);
      });
  }, [walletId]);

  // Efekt pobierający dane użytkownika z serwera
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

  // Funkcja obsługująca wylogowanie użytkownika
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/start");
  };

  // Funkcja obsługująca dodanie nowego portfela
  const handleAddWallet = () => {
    navigate("/addWallet");
  };

  // Funkcja obsługująca dodanie nowej kategorii
  const handleAddCategory = () => {
    if (selectedWallet !== null) {
      setWalletId(selectedWallet);
      navigate(`/add-category/${selectedWallet}`);
    }
  };

  // Funkcja obsługująca kliknięcie na portfel
  const handleWalletClick = (walletId) => {
    setSelectedWallet(walletId === selectedWallet ? null : walletId);
  };

  // Referencja do wykresu
  const chartRef = useRef(null);
  // Stan przechowujący dane dla wykresu
  const [chartData, setChartData] = useState(null);

  // Efekt reakcji na zmianę wybranego portfela - aktualizacja danych do wykresu
  useEffect(() => {
    if (selectedWallet !== null) {
      const selected = userWallets.find(
        (wallet) => wallet._id === selectedWallet
      );
      if (selected) {
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
    }
  }, [selectedWallet, userWallets]);

  // Referencja do instancji wykresu
  const chartInstance = useRef(null);

  // Efekt zmieniający wykres - tworzenie i aktualizacja wykresu na podstawie danych
  useEffect(() => {
    if (chartInstance.current !== null && chartInstance.current !== undefined) {
      chartInstance.current.destroy();
    }

    if (
      selectedWallet !== null &&
      chartRef.current !== null &&
      chartData !== null
    ) {
      const ctx = chartRef.current.getContext("2d");
      chartInstance.current = new Chart(ctx, {
        type: "pie",
        data: chartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
        },
      });
    }
  }, [selectedWallet, chartData]);

  // Funkcja obsługująca kliknięcie na Kategorię
  const handleCategoryClick = (categoryId) => {
    navigate(`/category/${categoryId}`);
  };

  // Komponent paseka postępu dla kategorii
  const CustomProgressBar = ({ category }) => {
    if (category.type.toUpperCase() === "WYDATKI") {
      const progress = (category.lose / category.amount) * 100;
      let backgroundColor = "#002d80";

      if (category.lose === category.amount) {
        backgroundColor = "green";
      } else if (category.lose > category.amount) {
        backgroundColor = "red";
      } else if (category.lose > 0.75 * category.amount) {
        backgroundColor = "orange";
      }

      return (
        <div className={styles.progressBarDiv}>
          <div
            className={styles.fillStyles}
            style={{
              width: `${progress > 100 ? 100 : progress}%`,
              backgroundColor: backgroundColor,
            }}
          />

          <div className={styles.categoryDetails}>
            <div>Wydano: {category.lose} zł</div>
            <div>Zostało: {category.actualAmount} zł</div>
          </div>
        </div>
      );
    } else {
      return null;
    }
  };

  return (
    <div className={styles.bodyWallet}>
      <Navbar expand="lg" variant="light" className="text-dark">
        {/* Nawigacja główna */}
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
        {/* Rozwijane menu nawigacyjne */}
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

      <div className={styles.walletList}>
        <div className={styles.walletButtons}>
          {/* Lista przycisków reprezentujących portfele użytkownika */}
          {userWallets.map((wallet) => (
            <button
              key={wallet._id}
              className={`${styles.walletBtn} ${
                selectedWallet === wallet._id ? styles.selectedWallet : ""
              }`}
              onClick={() => handleWalletClick(wallet._id)}
            >
              {wallet.name}
            </button>
          ))}
          {/* Przycisk dodawania nowego portfela */}
          <button className={styles.AddwalletBtn} onClick={handleAddWallet}>
            Dodaj nowy portfel
          </button>
        </div>
      </div>

      {selectedWallet !== null && (
        <div>
          <div className={styles.selectedWalletInfo}>
            {/* Informacje o wybranym portfelu */}
            <div className={styles.walletDetails}>
              <h1>Aktualne saldo</h1>
              {/* Aktualne saldo wybranego portfela */}
              <p className={styles.PSaldo}>
                {
                  userWallets.find((wallet) => wallet._id === selectedWallet)
                    .WholeBudget
                }{" "}
                zł
              </p>

              {/* Pozostała kwota do rozdysponowania na kategorie */}
              <h2>Pozostała kwota do rozdysponowania na kategorie</h2>
              <p className={styles.PActualbudget}>
                {
                  userWallets.find((wallet) => wallet._id === selectedWallet)
                    .actualbudget
                }{" "}
                zł
              </p>

              {/* Początkowy stan portfela */}
              <h2>Początkowy stan portfela</h2>
              <p className={styles.Pbudget}>
                {
                  userWallets.find((wallet) => wallet._id === selectedWallet)
                    .budget
                }{" "}
                zł
              </p>
            </div>

            {/* Wykres kołowy reprezentujący wybrany portfel */}
            <div className={styles.PieChart}>
              <canvas ref={chartRef}></canvas>
            </div>

            {/* Przyciski akcji dla wybranego portfela */}
            <div className={styles.actionButtons}>
              <button className={styles.editButton} onClick={handleEditWallet}>
                Edytuj portfel <img src={Settings} alt="Settings" />
              </button>
              <button
                className={styles.deleteButton}
                onClick={() => {
                  handleDeleteConfirmation(selectedWallet);
                  handleDeleteWallet();
                }}
              >
                Usuń portfel <img src={Trash} alt="Trash" />
              </button>
            </div>
          </div>

          {/* Lista kategorii dla wybranego portfela */}
          <div className={styles.categoryList}>
            <div className={styles.categoryButtons}>
              {userWallets.find((wallet) => wallet._id === selectedWallet)
                ?.categories.length > 0 ? (
                <div className={styles.categoriesContainer}>
                  {/* Lista kategorii */}
                  {userWallets
                    .find((wallet) => wallet._id === selectedWallet)
                    .categories.map((category) => (
                      <div key={category._id} className={styles.categoryDiv}>
                        {/* Wyświetlanie informacji o kategorii typu "WYDATKI" */}
                        {category.type.toUpperCase() === "WYDATKI" && (
                          <div className={styles.categoryInfo}>
                            <div className={styles.categoryName}>
                              {category.name}
                            </div>
                            <div className={styles.categoryAmount}>
                              Budżet: {category.amount} zł
                            </div>
                          </div>
                        )}
                        {/* Wyświetlanie informacji o kategorii typu "WPŁYWY" */}
                        {category.type.toUpperCase() === "WPŁYWY" && (
                          <div className={styles.categoryInfo}>
                            <div className={styles.categoryNameWCenter}>
                              {category.name}
                            </div>
                            <div className={styles.categoryAmountW}>
                              Uzyskany przychód:{" "}
                              <span className={styles.amount}>
                                +{category.gain} zł
                              </span>
                            </div>
                          </div>
                        )}
                        {/* Własny komponent paska postępu dla kategorii */}
                        <CustomProgressBar category={category} />
                        <button
                          className={styles.showDetailsButton}
                          onClick={() => handleCategoryClick(category._id)}
                        >
                          Pokaż szczegóły
                        </button>
                      </div>
                    ))}
                  {/* Przycisk dodawania nowej kategorii */}
                  <div>
                    <button
                      className={styles.AddCategoryBtn}
                      onClick={handleAddCategory}
                    >
                      Nowa kategoria
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <button
                    className={styles.AddCategoryBtn}
                    onClick={handleAddCategory}
                  >
                    Nowa kategoria
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wallet;

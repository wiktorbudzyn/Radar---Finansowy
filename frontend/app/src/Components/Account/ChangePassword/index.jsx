import React, { useState, useEffect } from "react";
import styles from "./styles.module.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Logo from "../../../Assets/Logo.png";

const ChangePassword = () => {
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  // Efekt służący do sprawdzenia tokena JWT w localStorage.
  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("Token JWT z localStorage:", token);
  }, []);

  // Funkcja obsługująca zmianę stanu formularza.
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswords({
      ...passwords,
      [name]: value,
    });
  };

  // Funkcja obsługująca wysyłanie formularza.
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("Token JWT nie istnieje w localStorage");
        return;
      }

      const response = await axios.post(
        "http://localhost:8080/api/users/change-password",
        passwords,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Dane wysyłane do zmiany hasła:", passwords);
      console.log(response.data.message);
      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      navigate("/account");
      alert("Hasło zostało pomyślnie zmienione");
    } catch (error) {
      const errorMessage = error.response.data.message;
      let alertMessage = "";

      switch (errorMessage) {
        case "Obecne hasło jest nieprawidłowe":
          alertMessage = "Obecne hasło jest nieprawidłowe";
          break;
        case "Nowe hasła nie pasują do siebie":
          alertMessage = "Nowe hasła nie pasują do siebie";
          break;
        case "Hasło musi zawierać co najmniej 1 dużą literę, 1 symbol, 1 cyfrę i mieć co najmniej 8 znaków":
          alertMessage =
            "Hasło musi zawierać co najmniej 1 dużą literę, 1 symbol, 1 cyfrę i mieć co najmniej 8 znaków";
          break;
        default:
          alertMessage = errorMessage;
          break;
      }

      setErrorMessage(alertMessage);
      alert(alertMessage);
    }
  };

  return (
    <div className={styles.changePasswordWrapper}>
      <div className={styles.leftImage}>
        <img src={Logo} alt="Logo aplikacji" className={styles.logo} />
      </div>
      <div className={styles.changePasswordContainer}>
        <h2>Zmień hasło</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Obecne hasło:
            <input
              type="password"
              name="currentPassword"
              value={passwords.currentPassword}
              onChange={handleChange}
              placeholder="Wprowadź obecne hasło"
              required
            />
          </label>
          <label>
            Nowe hasło:
            <input
              type="password"
              name="newPassword"
              value={passwords.newPassword}
              onChange={handleChange}
              placeholder="Wprowadź nowe hasło"
              required
            />
          </label>
          <label>
            Potwierdź nowe hasło:
            <input
              type="password"
              name="confirmPassword"
              value={passwords.confirmPassword}
              onChange={handleChange}
              placeholder="Wprowadź jeszcze raz nowe hasło"
              required
            />
          </label>
          <div className={styles.rightContent}>
            <button type="submit" className={styles.changePasswordButton}>
              Zmień hasło
            </button>
            <Link to="/account">
              <button className={styles.goBack}>Powrót</button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;

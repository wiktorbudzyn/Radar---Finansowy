import React, { useState, useEffect, useRef } from "react";
import styles from "./styles.module.css";
import axios from "axios";
import { Link } from "react-router-dom";
import Logo from "../../Assets/Logo.png";

const Account = () => {
  const [userData, setUserData] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const fileInputRef = useRef(null);

  // Efekt służący do pobrania danych użytkownika z serwera.
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
        console.log("Ścieżka do avatar:", response.data.user.avatar);
      })
      .catch((error) => {
        console.error("Błąd pobierania danych użytkownika:", error);
      });
  }, [refresh]);

  // Funkcja obsługująca zmianę avatara użytkownika.
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("Token JWT nie istnieje w localStorage");
        return;
      }

      const response = await axios.post(
        "http://localhost:8080/api/users/change-avatar",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log(response.data.message);
      setUserData((prevUserData) => ({
        ...prevUserData,
        avatar: response.data.avatar,
      }));
      setRefresh((prevRefresh) => !prevRefresh);
    } catch (error) {
      console.error(
        "Błąd podczas zmiany avatara:",
        error.response.data.message
      );
    }
  };

  // Funkcja obsługująca kliknięcie przycisku zmiany avatara.
  const handleUploadButtonClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className={styles.userPanelContainer}>
      <div className={styles.content}>
        <div className={styles.userPanel}>
          <h2>Panel użytkownika</h2>
          <div className={styles.userHeader}>
            {userData && userData.avatar ? (
              <img
                src={`http://localhost:8080/${userData.avatar}`}
                alt="Avatar użytkownika"
                className={styles.avatar}
              />
            ) : (
              <p>Brak avatara</p>
            )}
            <input
              ref={fileInputRef}
              type="file"
              style={{ display: "none" }}
              onChange={handleAvatarChange}
            />
          </div>
          {userData ? (
            <div className={styles.userInfo}>
              <p>
                {userData.firstName} {userData.lastName}
              </p>
              <p>Email: {userData.email}</p>
            </div>
          ) : (
            <p>Ładowanie danych użytkownika...</p>
          )}
          <div className={styles.userActions}>
            <Link to="/changePassword">
              <button className={styles.changePassword}>Zmień hasło</button>
            </Link>
            <button
              className={styles.changeAvatar}
              onClick={handleUploadButtonClick}
            >
              Zmień zdjęcie
            </button>
            <Link to="/main">
              <button className={styles.goBack}>Powrót</button>
            </Link>
          </div>
        </div>
        <div className={styles.rightImage}>
          <img src={Logo} alt="Logo aplikacji" />
        </div>
      </div>
    </div>
  );
};

export default Account;

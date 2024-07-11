import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import styles from "./styles.module.css";
import Logo from "../../../Assets/Logo.png";

const Login = () => {
  const [data, setData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = ({ target }) => {
    setData({ ...data, [target.name]: target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Rozpoczęcie procesu logowania...");

    try {
      const url = "http://localhost:8080/api/auth";
      const response = await axios.post(url, data);
      console.log("Odpowiedź z serwera:", response);

      localStorage.setItem("token", response.data.data.token);

      console.log("Token został zapisany w localStorage.");

      window.location = "/main";
    } catch (error) {
      if (
        error.response &&
        error.response.status >= 400 &&
        error.response.status <= 500
      ) {
        setError(error.response.data.message);
      }
    }
  };

  return (
    <div className={styles.login_container}>
      <Link to="/start" className={styles.logo}>
        <img src={Logo} alt="Logo aplikacji" />
      </Link>

      <div className={styles.login_form_container}>
        <div className={styles.left}>
          <form className={styles.form_container} onSubmit={handleSubmit}>
            <h1>Logowanie!</h1>
            <input
              type="email"
              placeholder="Email"
              name="email"
              onChange={handleChange}
              value={data.email}
              required
              className={styles.input}
            />
            <input
              type="password"
              placeholder="Hasło"
              name="password"
              onChange={handleChange}
              value={data.password}
              required
              className={styles.input}
            />
            {error && <div className={styles.error_msg}>{error}</div>}
            <button type="submit" className={styles.green_btn}>
              Zaloguj się
            </button>
          </form>
        </div>
        <div className={styles.right}>
          <h1>Rejestracja!</h1>
          <Link to="/signup">
            <button type="button" className={styles.white_btn}>
              Zarejestruj się
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;

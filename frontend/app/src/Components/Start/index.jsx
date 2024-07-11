import React from "react";
import { Link } from "react-router-dom";
import styles from "./styles.module.css";
import Logo from "../../Assets/Logo.png";

const Start = () => {
  return (
    <div className={styles.startContainer}>
      <div className={styles.textContainer}>
        <div className={styles.leftText}>
          <h1>
            PRZEJMIJ KONTROLĘ <br />
            <span> NAD SWOIM BUDŻETEM</span>
          </h1>
          <Link to="/login">
            <button>DOŁĄCZ DO NAS</button>
          </Link>
          <Link to="/description">
            <button>O NAS</button>
          </Link>
        </div>

        <div className={styles.rightImage}>
          <img src={Logo} alt="Logo aplikacji" />
        </div>
      </div>
    </div>
  );
};

export default Start;

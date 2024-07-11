import React from "react";
import { Link } from "react-router-dom";
import styles from "./styles.module.css";
import Logo from "../../../Assets/Logo.png";

const Descritpion = () => {
  return (
    <div className={styles.startContainer}>
      <div className={styles.textContainer}>
        <div className={styles.leftText}>
          <h1>
            Radar<span> Finansowy</span>
          </h1>
          <p className={styles.paragraf}>
            Radar Finansowy to narzędzie do łatwej kontroli nad domowym
            budżetem. Pozwala na precyzyjne określenie miesięcznych środków
            przeznaczonych na wydatki oraz ich przypisanie do różnych kategorii.
            Dodatkowo, umożliwia wprowadzanie zarówno wpływów do konta, jak i
            wydatków dla poszczególnych kategorii, co pozwala na szczegółowe
            monitorowanie i kontrolowanie finansów. Radar finansowy prezentuje
            procentowy podział budżetu oraz informuje użytkowników o
            przekroczeniach w danej kategorii, ułatwiając kontrolę wydatków.
            Radar finansowy to narzędzie wspierające efektywne zarządzanie
            finansami, pozwalające lepiej kontrolować budżet oraz kategoryzować
            wydatki, wspierając osiąganie celów finansowych.
          </p>
          <Link to="/start">
            <button>POWRÓT</button>
          </Link>
        </div>

        <div className={styles.rightImage}>
          <img src={Logo} alt="Logo aplikacji" />
        </div>
      </div>
    </div>
  );
};

export default Descritpion;

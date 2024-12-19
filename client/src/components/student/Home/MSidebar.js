import React, { useState } from "react";
import styles from "../../../styles/Student/MSidebar.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown,  faTachometerAlt } from "@fortawesome/free-solid-svg-icons";

const Msidebar = () => {
  const [showSubmenu, setShowSubmenu] = useState(false);

  const toggleSubmenu = () => {
    setShowSubmenu(!showSubmenu); 
  };

  return (
    <div className={styles.msidebar}>
      <h2 className={styles.msidebarTitle}>Apptitude</h2>
      <ul className={styles.msidebarMenu}>
        <FontAwesomeIcon icon={faTachometerAlt} />
        <li className={`${styles.msidebarItem} ${styles.active}`}>Dashboard</li>

        <li className={styles.msidebarItem} onClick={toggleSubmenu}>
          All Tests <FontAwesomeIcon icon={faChevronDown} />
          {showSubmenu && (
            <ul className={styles.msidebarSubmenu}>
              <li className={styles.msidebarSubmenuItem}>Upcoming Test</li>
              <li className={styles.msidebarSubmenuItem}>Past Test</li>
            </ul>
          )}
        </li>
      </ul>
    </div>
  );
};

export default Msidebar;

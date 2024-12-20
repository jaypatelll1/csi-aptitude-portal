import React from 'react';
import styles from '../../styles/admin/Adm_DashboardTiles.module.css'; // Add CSS for styling

const Tile = ({ title, count, color, icon }) => {
  return (
    <div className={styles.tile} style={{ backgroundColor: color }}>
      <div className={styles.tileContent}>
        <div className={styles.tile-count}>{count}</div>
        <div className={styles.tile-title}>{title}</div>
      </div>
      <div className={styles.tile-icon}>{icon}</div>
    </div>
  );
};

export default Tile;
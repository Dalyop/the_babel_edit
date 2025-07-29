import React, { useState } from 'react';
import styles from './ProductTabs.module.css';

interface Tab {
  label: string;
  content: React.ReactNode;
}

interface ProductTabsProps {
  tabs: Tab[];
}

const ProductTabs: React.FC<ProductTabsProps> = ({ tabs }) => {
  const [activeIdx, setActiveIdx] = useState(0);

  return (
    <div className={styles.tabsWrapper}>
      <div className={styles.tabList}>
        {tabs.map((tab, idx) => (
          <button
            key={tab.label}
            className={`${styles.tabBtn} ${activeIdx === idx ? styles.active : ''}`}
            onClick={() => setActiveIdx(idx)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className={styles.tabContent}>{tabs[activeIdx].content}</div>
    </div>
  );
};

export default ProductTabs; 
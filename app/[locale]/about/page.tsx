'use client';

import React from 'react';
import styles from './about.module.css';
import Navbar from '@/app/components/features/Navbar/Navbar';
import Footer from '@/app/components/features/Footer/Footer';

export default function AboutPage() {
  return (
    <div>
      <Navbar />
      <div className={styles.container}>
        <h1 className={styles.header}>About Us</h1>
        <div className={styles.subheader}>
          At Babel, we believe in the power of fashion to express individuality while respecting our planet. Our mission is to make second-hand fashion accessible and desirable, offering a curated selection of high-quality, pre-loved clothing that tells a story and reduces environmental impact.
        </div>
        <div className={styles.sectionTitle}>Our Story</div>
        <div className={styles.story}>
          Babel was founded in 2020 by Nkem Sky, a fashion enthusiast with a passion for sustainability. Frustrated by the wastefulness of fast fashion, she envisioned a platform where unique, pre-owned pieces could find new homes and continue their journey. What started as a small online shop has grown into a thriving community of conscious consumers who share a love for style and sustainability.
        </div>
        <div className={styles.sectionTitle}>Our Value</div>
        <div className={styles.valuesRow}>
          <div className={styles.valueCard}>
            <span className={styles.valueIcon} role="img" aria-label="recycle">♻️</span>
            <div className={styles.valueTitle}>Sustainability</div>
            <div className={styles.valueDesc}>We are committed to reducing fashion waste and promoting circularity by giving pre-loved clothes a new life.</div>
          </div>
          <div className={styles.valueCard}>
            <span className={styles.valueIcon} role="img" aria-label="heart">♡</span>
            <div className={styles.valueTitle}>Quality</div>
            <div className={styles.valueDesc}>We carefully curate each item to ensure it meets our high standards of quality and style.</div>
          </div>
          <div className={styles.valueCard}>
            <span className={styles.valueIcon} role="img" aria-label="community">👥</span>
            <div className={styles.valueTitle}>Community</div>
            <div className={styles.valueDesc}>We foster a community of like-minded individuals who share a passion for sustainable fashion and unique finds.</div>
          </div>
        </div>
        <div className={styles.teamSection}>
          <div className={styles.sectionTitle}>Meet the Team</div>
          <div className={styles.teamRow}>
            <div>
              <div className={styles.teamCard}>
                <img className={styles.teamAvatar} src="https://randomuser.me/api/portraits/women/68.jpg" alt="Sarah Chen" />
              </div>
              <div className={styles.teamName}>Sarah Chen</div>
              <div className={styles.teamRole}>Founder & CEO</div>
            </div>
            <div>
              <div className={styles.teamCard}>
                <img className={styles.teamAvatar} src="https://randomuser.me/api/portraits/men/32.jpg" alt="David Lee" />
              </div>
              <div className={styles.teamName}>David Lee</div>
              <div className={styles.teamRole}>Head of Curation</div>
            </div>
            <div>
              <div className={styles.teamCard}>
                <img className={styles.teamAvatar} src="https://randomuser.me/api/portraits/women/65.jpg" alt="Emily Wong" />
              </div>
              <div className={styles.teamName}>Emily Wong</div>
              <div className={styles.teamRole}>Customer Experience Manager</div>
            </div>
          </div>
        </div>
        <div className={styles.howItWorks}>
          <div className={styles.sectionTitle}>How it works</div>
          <ul className={styles.howList}>
            <li className={styles.howItem}><span className={styles.howDot}></span><span><b>Sourcing</b><br />We carefully source our items from trusted sellers and vintage stores.</span></li>
            <li className={styles.howItem}><span className={styles.howDot}></span><span><b>Curation</b><br />Our team inspects and curates each piece to ensure quality and style.</span></li>
            <li className={styles.howItem}><span className={styles.howDot}></span><span><b>Shipping</b><br />We ship your order with eco-friendly packaging and fast delivery.</span></li>
          </ul>
        </div>
      </div>
      <Footer />
    </div>
  );
} 
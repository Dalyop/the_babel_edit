'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { IMAGES } from './constants/constants';
import styles from './landing.module.css';

export default function LandingPage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <Image 
            src={IMAGES.LOGO_WHITE}
            alt="Babel Edit Logo"
            width={120}
            height={120}
            priority
          />
        </div>
        <nav className={styles.nav}>
          <Link href="/dashboard" className={styles.navLink}>Dashboard</Link>
          <Link href="/about" className={styles.navLink}>About</Link>
          <Link href="/contact" className={styles.navLink}>Contact</Link>
        </nav>
      </header>

      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.title}>Welcome to Babel Edit</h1>
            <p className={styles.subtitle}>Your Ultimate Fashion Destination</p>
            <Link href="/dashboard" className={styles.ctaButton}>
              Explore Collection
            </Link>
          </div>
        </section>

        <section className={styles.features}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>👗</div>
            <h2>Exclusive Styles</h2>
            <p>Discover our curated collection of premium fashion items</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🛍️</div>
            <h2>Easy Shopping</h2>
            <p>Seamless shopping experience with secure checkout</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🚚</div>
            <h2>Fast Delivery</h2>
            <p>Quick and reliable shipping to your doorstep</p>
          </div>
        </section>

        <section className={styles.cta}>
          <h2>Ready to Start Shopping?</h2>
          <p>Join us today and discover the latest trends</p>
          <Link href="/dashboard" className={styles.ctaButton}>
            Visit Dashboard
          </Link>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerSection}>
            <h3>Babel Edit</h3>
            <p>Your fashion destination</p>
          </div>
          <div className={styles.footerSection}>
            <h3>Quick Links</h3>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
          </div>
          <div className={styles.footerSection}>
            <h3>Connect With Us</h3>
            <div className={styles.socialLinks}>
              <a href="#" aria-label="Facebook">📘</a>
              <a href="#" aria-label="Instagram">📸</a>
              <a href="#" aria-label="Twitter">🐦</a>
            </div>
          </div>
        </div>
        <div className={styles.copyright}>
          © 2024 Babel Edit. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { IMAGES } from './constants/constants';
import styles from './landing.module.css';
import Footer from './components/features/Footer/Footer';
import { useParams } from 'next/navigation';

export default function LandingPage() {
  const params = useParams();
  const currentLocale = typeof params.locale === 'string' ? params.locale : 'en';
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <Image
            src={IMAGES.LOGO_WHITE_RM}
            alt="Babel Edit Logo"
            width={120}
            height={120}
            priority
          />
        </div>
        <nav className={styles.nav}>
          <Link href={`/${currentLocale}/dashboard`} className={styles.navLink}>Shop now</Link>
          <Link href={`/${currentLocale}/about`} className={styles.navLink}>About</Link>
          <Link href={`/${currentLocale}/contact`} className={styles.navLink}>Contact</Link>
        </nav>
      </header>

      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.title}>Welcome to Babel Edit</h1>
            <p className={styles.subtitle}>Your Ultimate Fashion Destination</p>
            <Link href={`/${currentLocale}/dashboard`} className={styles.ctaButton}>
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
          <Link href={`/${currentLocale}/dashboard`} className={styles.ctaButton}>
            Visit Dashboard
          </Link>
        </section>
      </main>
      <Footer />
    </div>
  );
}

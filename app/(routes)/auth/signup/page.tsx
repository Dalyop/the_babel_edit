"use client";
import React, { useState } from "react";
import Link from "next/link";
import Navbar from '@/app/components/features/Navbar/Navbar';
import Footer from '@/app/components/features/Footer/Footer';
import styles from "./signup.module.css";

export default function SignupPage() {
  const [newsletter, setNewsletter] = useState(false);
  const [agree, setAgree] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder: No real signup endpoint yet
    alert("Account creation is not implemented yet.");
  };

  return (
    <div>
      <Navbar />
      <div className={styles.signupBg}>
        <form className={styles.signupCard} onSubmit={handleSubmit}>
          <h1 className={styles.title}>Create Your Account</h1>
          <p className={styles.subtitle}>
            Sign up to enjoy faster checkout, track orders,<br />
            and save favorites.
          </p>
          <label className={styles.inputLabel}>
            <span className={styles.labelRow}><span className={styles.labelIcon}>🔑</span> Name</span>
            <input
              className={styles.input} type="text" placeholder="Name" required />
          </label>
          <label className={styles.inputLabel}>
            <span className={styles.labelRow}><span className={styles.labelIcon}>✉️</span> Email</span>
            <input
              className={styles.input} type="email" placeholder="Email" required />
          </label>
          <label className={styles.inputLabel}>
            <span className={styles.labelRow}><span className={styles.labelIcon}>📞</span> Phone Number</span>
            <input
              className={styles.input} type="tel" placeholder="Phone Number" required />
          </label>
          <label className={styles.inputLabel}>
            <span className={styles.labelRow}><span className={styles.labelIcon}>🔒</span> Password</span>
            <input
              className={styles.input} type="password" placeholder="Password" required />
          </label>
          <label className={styles.inputLabel}>
            <span className={styles.labelRow}><span className={styles.labelIcon}>🔒</span> Confirm Password</span>
            <input
              className={styles.input} type="password" placeholder="Confirm Password" required />
          </label>
          <div className={styles.checkRow}>
            <input
              className={styles.input}
              type="checkbox"
              id="newsletter"
              checked={newsletter}
              onChange={() => setNewsletter(!newsletter)}
            />
            <label htmlFor="newsletter">Subscribe to newsletter and exclusive offers</label>
          </div>
          <div className={styles.checkRow}>
            <input
              className={styles.input}
              type="checkbox"
              id="agree"
              checked={agree}
              onChange={() => setAgree(!agree)}
              required
            />
            <label htmlFor="agree">
              i agree to the <span className={styles.terms}>Term & Conditions and Privacy Policy</span>
            </label>
          </div>
          <button className={styles.createBtn} type="submit">Create Account</button>
          <div className={styles.dividerRow}>
            <span className={styles.divider}></span>
            <span className={styles.orText}>or sign up with:</span>
            <span className={styles.divider}></span>
          </div>
          <div className={styles.socialRow}>
            <button type="button" className={styles.socialBtn}><img src="/images/google.svg" alt="Google" />Google</button>
            <button type="button" className={styles.socialBtn}><img src="/images/facebook.svg" alt="Facebook" />Facebook</button>
            <button type="button" className={styles.socialBtn}><img src="/images/apple.svg" alt="Apple" />Apple</button>
          </div>
          <div className={styles.signinRow}>
            Already have an account?{' '}
            <Link href="/auth/login" className={styles.signinLink}><span className={styles.lockIcon}>🔒</span> Sign in</Link>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
} 
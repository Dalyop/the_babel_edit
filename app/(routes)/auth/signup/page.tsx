"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from '@/app/components/features/Navbar/Navbar';
import Footer from '@/app/components/features/Footer/Footer';
import styles from "./signup.module.css";

export default function SignupPage() {
  const [newsletter, setNewsletter] = useState(false);
  const [agree, setAgree] = useState(false);
  const [email, setEmail] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`https://the-babel-edit-backend.onrender.com/api/users/register`, {
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          firstname,
          lastname,
          password
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Registration failed.");
      } else {
        setSuccess("Account created successfully! Please log in.");
        router.push('/auth/login');
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
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
            <span className={styles.labelRow}><span className={styles.labelIcon}>🔑</span> First Name</span>
            <input
              className={styles.input} type="text" placeholder="First Name" required
              value={firstname}
              onChange={e => setFirstname(e.target.value)}
            />
          </label>
          <label className={styles.inputLabel}>
            <span className={styles.labelRow}><span className={styles.labelIcon}>🔑</span> Last Name</span>
            <input
              className={styles.input} type="text" placeholder="Last Name" required
              value={lastname}
              onChange={e => setLastname(e.target.value)}
            />
          </label>
          <label className={styles.inputLabel}>
            <span className={styles.labelRow}><span className={styles.labelIcon}>✉️</span> Email</span>
            <input
              className={styles.input} type="email" placeholder="Email" required
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </label>
          <label className={styles.inputLabel}>
            <span className={styles.labelRow}><span className={styles.labelIcon}>📞</span> Phone Number</span>
            <input
              className={styles.input} type="tel" placeholder="Phone Number"
            />
          </label>
          <label className={styles.inputLabel}>
            <span className={styles.labelRow}><span className={styles.labelIcon}>🔒</span> Password</span>
            <input
              className={styles.input} type="password" placeholder="Password" required
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </label>
          <label className={styles.inputLabel}>
            <span className={styles.labelRow}><span className={styles.labelIcon}>🔒</span> Confirm Password</span>
            <input
              className={styles.input} type="password" placeholder="Confirm Password" required
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
            />
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
          {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
          {success && <div style={{ color: 'green', marginBottom: 8 }}>{success}</div>}
          <button className={styles.createBtn} type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Account'}</button>
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
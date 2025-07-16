"use client";
import React, { useState } from "react";
import Link from "next/link";
import Navbar from '@/app/components/features/Navbar/Navbar';
import Footer from '@/app/components/features/Footer/Footer';
import styles from "./login.module.css";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [remember, setRemember] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("https://the-babel-edit-backend.onrender.com/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Login failed.");
      } else {
        // Handle successful login (e.g., save token, 
        // redirect)
        // alert("Login successful!");
        Optionally: router.push('/dashboard');
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
      <div className={styles.loginBg}>
        <form className={styles.loginCard} onSubmit={handleSubmit}>
          <h1 className={styles.title}>Sign in to your account</h1>
          <p className={styles.subtitle}>Welcome back: Please enter your details.</p>
          <label className={styles.inputLabel}>
            <span className={styles.labelRow}><span className={styles.labelIcon}>✉️</span> Email</span>
            <input className={styles.input} type="email" placeholder="Email" required
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </label>
          <label className={styles.inputLabel}>
            <span className={styles.labelRow}><span className={styles.labelIcon}>🔒</span> Password</span>
            <input className={styles.input} type="password" placeholder="Password" required
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </label>
          <div className={styles.checkRow}>
            <input
              className={styles.input}
              type="checkbox"
              id="remember"
              checked={remember}
              onChange={() => setRemember(!remember)}
            />
            <label htmlFor="remember">Remember me</label>
            <Link href="/auth/forgot" className={styles.forgotLink}>Forgot Password</Link>
          </div>
          {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
          <button className={styles.signinBtn} type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</button>
          <div className={styles.dividerRow}>
            <span className={styles.divider}></span>
            <span className={styles.orText}>or sign in with:</span>
            <span className={styles.divider}></span>
          </div>
          <div className={styles.socialRow}>
            <button type="button" className={styles.socialBtn}><img src="/images/google.svg" alt="Google" />Google</button>
            <button type="button" className={styles.socialBtn}><img src="/images/facebook.svg" alt="Facebook" />Facebook</button>
            <button type="button" className={styles.socialBtn}><img src="/images/apple.svg" alt="Apple" />Apple</button>
          </div>
          <div className={styles.signupRow}>
            Dont have an account?{' '}
            <Link href="/auth/signup" className={styles.signupLink}><span className={styles.lockIcon}>🔒</span> Create one</Link>
          </div>
        </form>
      </div>
      <Footer />
    </div>

  );
} 
"use client";
import React, { useState } from "react";
import Link from "next/link";
import styles from "./login.module.css";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { useParams } from "next/navigation";

export default function LoginPage() {
  const params = useParams();
  const currentLocale = typeof params.locale === 'string' ? params.locale : 'en';

  const [remember, setRemember] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const result = await login(email, password);

      if (result.success) {
        router.push(`/${currentLocale}/dashboard`);
      } else {
        setError(result.error || "Login failed. Please try again.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Login error:", err);
    }

    setLoading(false);
  };

  return (
    <div>
      <div className={styles.loginBg}>
        <form className={styles.loginCard} onSubmit={handleSubmit}>
          <h1 className={styles.title}>Sign in to your account</h1>
          <p className={styles.subtitle}>Welcome back: Please enter your details.</p>
          
          {/* Error Display */}
          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}
          
          <label className={styles.inputLabel}>
            <span className={styles.labelRow}>
              <span className={styles.labelIcon}>✉️</span> Email
            </span>
            <input 
              className={styles.input} 
              type="email" 
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </label>
          
          <label className={styles.inputLabel}>
            <span className={styles.labelRow}>
              <span className={styles.labelIcon}>🔒</span> Password
            </span>
            <input 
              className={styles.input} 
              type="password" 
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </label>
          
          <div className={styles.checkRow}>
            <input
              className={styles.checkbox}
              type="checkbox"
              id="remember"
              checked={remember}
              onChange={() => setRemember(!remember)}
              disabled={loading}
            />
            <label htmlFor="remember">Remember me</label>
            <Link href={`/${currentLocale}/auth/forgot`} className={styles.forgotLink}>
              Forgot Password
            </Link>
          </div>
          
          <button 
            className={styles.signinBtn} 
            type="submit" 
            disabled={loading || !email || !password}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          
          <div className={styles.dividerRow}>
            <span className={styles.divider}></span>
            <span className={styles.orText}>or sign in with:</span>
            <span className={styles.divider}></span>
          </div>
          
          <div className={styles.socialRow}>
            <button type="button" className={styles.socialBtn} disabled={loading}>
              <img src="/images/google.svg" alt="Google" />
              Google
            </button>
            <button type="button" className={styles.socialBtn} disabled={loading}>
              <img src="/images/facebook.svg" alt="Facebook" />
              Facebook
            </button>
            <button type="button" className={styles.socialBtn} disabled={loading}>
              <img src="/images/apple.svg" alt="Apple" />
              Apple
            </button>
          </div>
          
          <div className={styles.signupRow}>
            Don't have an account?{' '}
            <Link href={`/${currentLocale}/auth/signup`} className={styles.signupLink}>
              <span className={styles.lockIcon}>🔒</span> Create one
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
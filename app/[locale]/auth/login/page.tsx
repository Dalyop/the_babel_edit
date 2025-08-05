"use client";
import React, { use, useState } from "react";
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
    
    const result = await login(email, password);

    if (result.success) {
      router.push(`/${currentLocale}/dashboard`);
    } else {
      setError(result.error);
    }

    setLoading(false);
  }

  return (

    <div>

      <div className={styles.loginBg}>
        <form className={styles.loginCard} onSubmit={handleSubmit}>
          <h1 className={styles.title}>Sign in to your account</h1>
          <p className={styles.subtitle}>Welcome back: Please enter your details.</p>
          <label className={styles.inputLabel}>
            <span className={styles.labelRow}><span className={styles.labelIcon}>✉️</span> Email</span>
            <input className={styles.input} type="email" placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </label>
          <label className={styles.inputLabel}>
            <span className={styles.labelRow}><span className={styles.labelIcon}>🔒</span> Password</span>
            <input className={styles.input} type="password" placeholder="Password"
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
            <Link href={`/${currentLocale}/auth/signup`} className={styles.signupLink}><span className={styles.lockIcon}>🔒</span> Create one</Link>
          </div>
        </form>
      </div>
    </div>
  );
} 
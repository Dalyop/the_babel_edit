"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./signup.module.css";
import { useAuth } from "@/app/context/AuthContext";

export default function SignupPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [agree, setAgree] = useState(false);
  const [newsletter, setNewsletter] = useState(false);
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const { signup } = useAuth();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const result = await signup({
        firstName: formData.firstname,
        lastName: formData.lastname,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword
      });

      if (result.success) {
        router.push('/dashboard');
      } else {
        setError(result.error);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
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
              className={styles.input} 
              type="text" 
              name="firstname"
              placeholder="First Name"
              value={formData.firstname}
              onChange={handleChange}
              
            />
          </label>
          <label className={styles.inputLabel}>
            <span className={styles.labelRow}><span className={styles.labelIcon}>🔑</span> Last Name</span>
            <input
              className={styles.input} 
              type="text" 
              name="lastname"
              placeholder="Last Name"
              value={formData.lastname}
              onChange={handleChange}
              
            />
          </label>
          <label className={styles.inputLabel}>
            <span className={styles.labelRow}><span className={styles.labelIcon}>✉️</span> Email</span>
            <input
              className={styles.input} 
              type="email" 
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              
            />
          </label>
          <label className={styles.inputLabel}>
            <span className={styles.labelRow}><span className={styles.labelIcon}>📞</span> Phone Number</span>
            <input
              className={styles.input} 
              type="tel" 
              name="phone" 
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
            />
          </label>
          <label className={styles.inputLabel}>
            <span className={styles.labelRow}><span className={styles.labelIcon}>🔒</span> Password</span>
            <input
              className={styles.input} 
              type="password" 
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              
            />
          </label>
          <label className={styles.inputLabel}>
            <span className={styles.labelRow}><span className={styles.labelIcon}>🔒</span> Confirm Password</span>
            <input
              className={styles.input} 
              type="password" 
              name="confirmPassword" 
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              
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
              
            />
            <label htmlFor="agree">
              I agree to the <span className={styles.terms}>Terms & Conditions and Privacy Policy</span>
            </label>
          </div>
          <button 
            className={styles.createBtn} 
            type="submit" 
            disabled={loading || !agree}
          >
            {loading ? 'Creating...' : 'Create Account'}
          </button>
          <div className={styles.dividerRow}>
            <span className={styles.divider}></span>
            <span className={styles.orText}>or sign up with:</span>
            <span className={styles.divider}></span>
          </div>
          <div className={styles.socialRow}>
            <button type="button" className={styles.socialBtn}>
              <img src="/images/google.svg" alt="Google" />Google
            </button>
            <button type="button" className={styles.socialBtn}>
              <img src="/images/facebook.svg" alt="Facebook" />Facebook
            </button>
            <button type="button" className={styles.socialBtn}>
              <img src="/images/apple.svg" alt="Apple" />Apple
            </button>
          </div>
          <div className={styles.signinRow}>
            Already have an account?{' '}
            <Link href="/auth/login" className={styles.signinLink}>
              <span className={styles.lockIcon}>🔒</span> Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
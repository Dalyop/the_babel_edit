"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./signup.module.css";
import { useAuth } from "@/app/context/AuthContext";
import { useParams } from "next/navigation";

export default function SignupPage() {
  const params = useParams();
  const currentLocale = typeof params.locale === 'string' ? params.locale : 'en';

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

  // Password validation states
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [showPasswordHelp, setShowPasswordHelp] = useState(false);

  const { signup } = useAuth();
  const router = useRouter();

  // Password validation function
  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];

    if (password.length < 6) {
      errors.push("Password must be at least 6 characters long");
    }

    if (!/[a-zA-Z]/.test(password)) {
      errors.push("Password must contain at least one letter");
    }

    if (!/[0-9]/.test(password)) {
      errors.push("Password must contain at least one number");
    }

    return errors;
  };

  // Show toast function (you'll need to implement this based on your toast system)
  const showToast = (message: string, type: 'error' | 'success' = 'error') => {
    // Replace this with your actual toast implementation
    // Example: toast.error(message) or toast.success(message)
    console.log(`${type.toUpperCase()}: ${message}`);

    // If you're using a toast library like react-hot-toast:
    // if (type === 'error') {
    //   toast.error(message);
    // } else {
    //   toast.success(message);
    // }

    // Or if you have a custom toast context:
    // showToast(message, type);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Real-time password validation
    if (name === 'password') {
      const errors = validatePassword(value);
      setPasswordErrors(errors);
    }
  };

  const handlePasswordFocus = () => {
    setShowPasswordHelp(true);
  };

  const handlePasswordBlur = () => {
    // Keep help visible if there are errors
    if (passwordErrors.length === 0) {
      setShowPasswordHelp(false);
    }
  };

  const validateForm = (): boolean => {
    // Check if all required fields are filled
    if (!formData.firstname.trim()) {
      showToast("First name is required");
      return false;
    }

    if (!formData.lastname.trim()) {
      showToast("Last name is required");
      return false;
    }

    if (!formData.email.trim()) {
      showToast("Email is required");
      return false;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showToast("Please enter a valid email address");
      return false;
    }

    // Password validation
    const passwordValidationErrors = validatePassword(formData.password);
    if (passwordValidationErrors.length > 0) {
      showToast(passwordValidationErrors[0]); // Show first error
      return false;
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      showToast("Passwords do not match");
      return false;
    }

    // Terms agreement validation
    if (!agree) {
      showToast("You must agree to the Terms & Conditions");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const result = await signup({
        firstName: formData.firstname,
        lastName: formData.lastname,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        isAgree: agree
      });

      if (result.success) {
        showToast("Account created successfully!", 'success');
        router.push(`/${currentLocale}/dashboard`);
      } else {
        showToast(result.error || "Failed to create account");
        setError(result.error);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      showToast(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Get password strength indicator
  const getPasswordStrength = () => {
    const { password } = formData;
    if (password.length === 0) return null;

    const errors = validatePassword(password);
    if (errors.length === 0) return 'strong';
    if (errors.length === 1) return 'medium';
    return 'weak';
  };

  const passwordStrength = getPasswordStrength();

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
              required
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
              required
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
              required
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
            <span className={styles.labelRow}>
              <span className={styles.labelIcon}>🔒</span> Password
              {passwordStrength && (
                <span className={`${styles.strengthIndicator} ${styles[passwordStrength]}`}>
                  {passwordStrength === 'strong' ? '✓ Strong' :
                    passwordStrength === 'medium' ? '⚠ Medium' : '✗ Weak'}
                </span>
              )}
            </span>
            <input
              className={`${styles.input} ${passwordErrors.length > 0 ? styles.inputError : ''}`}
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              onFocus={handlePasswordFocus}
              onBlur={handlePasswordBlur}
              required
            />
            {(showPasswordHelp || passwordErrors.length > 0) && (
              <div className={styles.passwordHelp}>
                <div className={styles.passwordRequirements}>
                  <div className={formData.password.length >= 6 ? styles.requirementMet : styles.requirementUnmet}>
                    {formData.password.length >= 6 ? '✓' : '•'} At least 6 characters
                  </div>
                  <div className={/[a-zA-Z]/.test(formData.password) ? styles.requirementMet : styles.requirementUnmet}>
                    {/[a-zA-Z]/.test(formData.password) ? '✓' : '•'} Contains letters
                  </div>
                  <div className={/[0-9]/.test(formData.password) ? styles.requirementMet : styles.requirementUnmet}>
                    {/[0-9]/.test(formData.password) ? '✓' : '•'} Contains numbers
                  </div>
                </div>
              </div>
            )}
          </label>

          <label className={styles.inputLabel}>
            <span className={styles.labelRow}><span className={styles.labelIcon}>🔒</span> Confirm Password</span>
            <input
              className={`${styles.input} ${formData.confirmPassword && formData.password !== formData.confirmPassword ? styles.inputError : ''
                }`}
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <div className={styles.errorText}>Passwords do not match</div>
            )}
            {formData.confirmPassword && formData.password === formData.confirmPassword && formData.confirmPassword.length > 0 && (
              <div className={styles.successText}>✓ Passwords match</div>
            )}
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
              I agree to the <span className={styles.terms}>Terms & Conditions and Privacy Policy</span>
            </label>
          </div>

          <button
            className={styles.createBtn}
            type="submit"
            disabled={loading || !agree || passwordErrors.length > 0}
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
            <Link href={`/${currentLocale}/auth/login`} className={styles.signinLink}>
              <span className={styles.lockIcon}>🔒</span> Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
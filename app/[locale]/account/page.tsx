"use client";
import React from "react";
import { useRouter } from "next/navigation";
import styles from "./account.module.css";
import Navbar from "@/app/components/features/Navbar/Navbar";
import Footer from "@/app/components/features/Footer/Footer";

// Placeholder for authentication check
const isAuthenticated = true; // Replace with your real auth logic

const user = {
  name: "Sophia Carter",
  email: "reelsofy@sophia.com",
  avatar: "/images/babel_logo_black.jpg", // Replace with real avatar
  addresses: [
    { type: "Home", address: "123 Elm Street, Anytown, CA 91234" },
    { type: "Work", address: "456 Oak Avenue, Anytown, CA 91234" },
  ],
};

export default function AccountPage() {
  const router = useRouter();

  React.useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/auth/login");
    }
  }, [isAuthenticated, router]);

  return (
    <div className={styles.accountBg}>
      <Navbar />
      <main className={styles.accountMain}>
        <div className={styles.sidebar}>
          <div className={styles.sidebarTitle}>My Account</div>
          <ul className={styles.sidebarMenu}>
            <li>Orders</li>
            <li>Track Orders</li>
            <li>Payment Method</li>
            <li>Wishlist</li>
            <li className={styles.active}>Account Settings</li>
          </ul>
          <div className={styles.logout}>Logout</div>
        </div>
        <div className={styles.profileContent}>
          <div className={styles.profileHeader}>
            <img src={user.avatar} alt="avatar" className={styles.avatar} />
            <div>
              <div className={styles.profileName}>{user.name}</div>
              <div className={styles.profileEmail}>{user.email}</div>
            </div>
            <button className={styles.editProfileBtn}>Edit Profile</button>
          </div>
          <form className={styles.profileForm}>
            <label>
              <span className={styles.labelRow}><span className={styles.labelIcon}>🔑</span> Name</span>
              <input type="text" placeholder="Name" />
            </label>
            <label>
              <span className={styles.labelRow}><span className={styles.labelIcon}>✉️</span> Email</span>
              <input type="email" placeholder="Email" />
            </label>
            <label>
              <span className={styles.labelRow}><span className={styles.labelIcon}>📞</span> Phone Number</span>
              <input type="tel" placeholder="Phone Number" />
            </label>
            <div className={styles.addressSection}>
              <div className={styles.addressTitile}><span className={styles.labelIcon}>🏠</span> Address</div>
              {user.addresses.map((addr, idx) => (
                <div className={styles.addressCard} key={idx}>
                  <span className={styles.addressType}>{addr.type}</span>
                  <span className={styles.addressText}>{addr.address}</span>
                  <span className={styles.addressArrow}>›</span>
                </div>
              ))}
              <button className={styles.addAddressBtn} type="button">Add New Address</button>
            </div>
            <div className={styles.sectionBox}>
              <div className={styles.sectionTitle}><span className={styles.labelIcon}>📦</span> Returns & Exchanges</div>
              <button className={styles.sectionBtn} type="button">View Returns & Exchanges</button>
            </div>
            <div className={styles.sectionBox}>
              <div className={styles.sectionTitle}><span className={styles.labelIcon}>👤</span> Account Management</div>
              <button className={styles.sectionBtn} type="button">Change Password</button>
              <button className={styles.sectionBtn} type="button">Delete Account</button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
} 
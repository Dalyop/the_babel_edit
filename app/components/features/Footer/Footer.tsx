import React from 'react';
import styles from './Footer.module.css';

const Footer = () => (
  <footer className={styles.footer}>
    <div className={styles.footerMain}>
      <div className={styles.footerColumns}>
        <div className={styles.footerCol}>
          <h4 className={styles.footerColTitle}>COMPANY INFO</h4>
          <ul>
            <li><a href="#">About Babel's</a></li>
            <li><a href="#">Social Responsibility</a></li>
            <li><a href="#">Fashion Blogger</a></li>
          </ul>
        </div>
        <div className={styles.footerCol}>
          <h4 className={styles.footerColTitle}>HELP & SUPPORT</h4>
          <ul>
            <li><a href="#">Shipping Info</a></li>
            <li><a href="#">Returns</a></li>
            <li><a href="#">How to Order</a></li>
            <li><a href="#">How to Track</a></li>
            <li><a href="#">Size Chart</a></li>
          </ul>
        </div>
        <div className={styles.footerCol}>
          <h4 className={styles.footerColTitle}>CUSTOMER CARE</h4>
          <ul>
            <li><a href="#">Contact Us</a></li>
            <li><a href="#">Payment</a></li>
            <li><a href="#">Bonus Point</a></li>
            <li><a href="#">Notices</a></li>
          </ul>
        </div>
        <div className={styles.footerColSocials}>
          <h4 className={styles.footerColTitle}>SOCIALS</h4>
          <div className={styles.socialIcons}>
            <a href="#" aria-label="Facebook"><span className={styles.iconFb}></span></a>
            <a href="#" aria-label="Twitter"><span className={styles.iconTw}></span></a>
            <a href="#" aria-label="Instagram"><span className={styles.iconIg}></span></a>
            <a href="#" aria-label="TikTok"><span className={styles.iconTt}></span></a>
            <a href="#" aria-label="Snapchat"><span className={styles.iconSc}></span></a>
          </div>
          <h4 className={styles.footerColTitle} style={{marginTop: '2rem'}}>PLATFORMS</h4>
          <div className={styles.platformIcons}>
            <span className={styles.iconAndroid}></span>
            <span className={styles.iconApple}></span>
          </div>
        </div>
      </div>
      <div className={styles.footerNewsletter}>
        <h4>SIGN UP FOR LAURA'S CLOSET STYLE NEWS</h4>
        <form className={styles.newsletterForm}>
          <input type="email" placeholder="Your email" className={styles.newsletterInput} />
          <button type="submit" className={styles.newsletterButton}>SUBSCRIBE</button>
        </form>
        <div className={styles.privacyText}>
          By clicking the SUBSCRIBE button, you are agreeing to our <a href="#">Privacy & Cookie Policy</a>
        </div>
      </div>
    </div>
    <div className={styles.footerPaymentsBottom}>
      <h4>WE ACCEPT</h4>
      <div className={styles.paymentIconsBottom}>
        <span className={styles.iconMastercard}></span>
        <span className={styles.iconPaypal}></span>
        <span className={styles.iconEbay}></span>
        <span className={styles.iconGpay}></span>
        <span className={styles.iconApplepay}></span>
        <span className={styles.iconAmex}></span>
        <span className={styles.iconAmazon}></span>
        <span className={styles.iconAlipay}></span>
        <span className={styles.iconBitcoin}></span>
        <span className={styles.iconDiscover}></span>
        <span className={styles.iconWesterunion}></span>
        <span className={styles.iconPayoneer}></span>
      </div>
    </div>
    <div className={styles.footerBottom}>
      <div className={styles.footerCopyright}>
        ©2025 Babel's Closet All Rights Reserved
      </div>
      <div className={styles.footerLegalLinks}>
        <a href="#">Privacy Center</a>
        <a href="#">Privacy & Cookie Policy</a>
        <a href="#">Manage Cookies</a>
        <a href="#">Terms & Conditions</a>
        <a href="#">Copyright Notice</a>
        <a href="#">Imprint</a>
      </div>
    </div>
  </footer>
);

export default Footer; 
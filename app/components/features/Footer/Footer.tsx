import React from 'react';
import styles from './Footer.module.css';
import en from '@/locales/en/common.json';
import fr from '@/locales/fr/common.json';
import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const options = [
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'French' },
];

const Footer = () => {
  const router = useRouter();
  const pathname = usePathname();
  // Get current locale from the path (e.g., /en/..., /fr/...)
  const currentLocale = pathname.split('/')[1] || 'en';
  const [selectOption, setSelectedOption] = useState(currentLocale);

  // Translation setup
  const translations: Record<string, Record<string, string>> = { en, fr };
  const t = (key: string) => (translations[currentLocale] || translations['en'])[key] || key;

  const handleLanguageChange = (locale: string) => {
    setSelectedOption(locale);
    // Replace the first segment of the path with the new locale
    const segments = pathname.split('/');
    segments[1] = locale;
    router.push(segments.join('/'));
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.footerMain}>
        <div className={styles.footerColumns}>
          <div className={styles.footerCol}>
            <h4 className={styles.footerColTitle}>{t('companyInfo')}</h4>
            <ul>
              <li><a href={`/${currentLocale}/about`}>{t('about')}</a></li>
              <li><a href="#">{t('socialResponsibility')}</a></li>
              <li><a href="#">{t('fashionBlogger')}</a></li>
            </ul>
          </div>
          <div className={styles.footerCol}>
            <h4 className={styles.footerColTitle}>{t('helpSupport')}</h4>
            <ul>
              <li><a href={`/${currentLocale}/contact`}>{t('shippingInfo')}</a></li>
              <li><a href="#">{t('returns')}</a></li>
              <li><a href="#">{t('howToOrder')}</a></li>
              <li><a href="#">{t('howToTrack')}</a></li>
              <li><a href="#">{t('sizeChart')}</a></li>
            </ul>
          </div>
          <div className={styles.footerCol}>
            <h4 className={styles.footerColTitle}>{t('customerCare')}</h4>
            <ul>
              <li><a href={`/${currentLocale}/contact`}>{t('contactUs')}</a></li>
              <li><a href="#">{t('payment')}</a></li>
              <li><a href="#">{t('bonusPoint')}</a></li>
              <li><a href="#">{t('notices')}</a></li>
            </ul>
          </div>
          {/* <div className={styles.footerColSocials}>
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
        </div> */}
        </div>
        <div className={styles.footerNewsletter}>
          <h4>{t('signUpForNews')}</h4>
          <form className={styles.newsletterForm}>
            <input type="email" placeholder={t('yourEmail')} className={styles.newsletterInput} />
            <button type="submit" className={styles.newsletterButton}>{t('subscribe')}</button>
          </form>
          <div className={styles.privacyText}>
            {t('privacyText')}<a href="#">{t('privacyCookiePolicy')}</a>
          </div>
        </div>
      </div>
      <div className={styles.footerPaymentsBottom}>
        <h4>{t('weAccept')}</h4>
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
          {t('allRightsReserved')}
        </div>
        <div className={styles.footerLegalLinks}>
          <a href="#">{t('privacyCenter')}</a>
          <a href="#">{t('privacyCookiePolicy')}</a>
          <a href="#">{t('manageCookies')}</a>
          <a href="#">{t('termsConditions')}</a>
          <a href="#">{t('copyrightNotice')}</a>
          <a href="#">{t('imprint')}</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 
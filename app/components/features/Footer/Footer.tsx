'use client';

import React, { useState } from 'react';
import styles from './Footer.module.css';
import en from '@/locales/en/common.json';
import fr from '@/locales/fr/common.json';
import { useRouter, usePathname } from 'next/navigation';
import { ChevronDown, ChevronUp } from 'lucide-react';

const options = [
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'French' },
];

const Footer = () => {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = pathname.split('/')[1] || 'en';
  const [selectOption, setSelectedOption] = useState(currentLocale);

  // Mobile accordion states
  const [expandedSections, setExpandedSections] = useState({
    companyInfo: false,
    helpSupport: false,
    customerCare: false,
    newsletter: false
  });

  const translations: Record<string, Record<string, string>> = { en, fr };
  const t = (key: string) => (translations[currentLocale] || translations['en'])[key] || key;

  const handleLanguageChange = (locale: string) => {
    setSelectedOption(locale);
    const segments = pathname.split('/');
    segments[1] = locale;
    router.push(segments.join('/'));
  };
  
  type SectionKey = 'companyInfo' | 'helpSupport' | 'customerCare' | 'newsletter';

  const toggleSection = (section: SectionKey) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };


  return (
    <footer className={styles.footer}>
      <div className={styles.footerMain}>
        <div className={styles.footerColumns}>
          {/* Company Info */}
          <div className={styles.footerCol}>
            <div
              className={styles.footerColHeader}
              onClick={() => toggleSection('companyInfo')}
            >
              <h4 className={styles.footerColTitle}>{t('companyInfo')}</h4>
              <span className={styles.accordionIcon}>
                {expandedSections.companyInfo ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </span>
            </div>
            <div className={`${styles.footerColContent} ${expandedSections.companyInfo ? styles.expanded : ''}`}>
              <ul>
                <li><a href={`/${currentLocale}/about`}>{t('about')}</a></li>
                <li><a href="#">{t('socialResponsibility')}</a></li>
                <li><a href="#">{t('fashionBlogger')}</a></li>
              </ul>
            </div>
          </div>

          {/* Help & Support */}
          <div className={styles.footerCol}>
            <div
              className={styles.footerColHeader}
              onClick={() => toggleSection('helpSupport')}
            >
              <h4 className={styles.footerColTitle}>{t('helpSupport')}</h4>
              <span className={styles.accordionIcon}>
                {expandedSections.helpSupport ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </span>
            </div>
            <div className={`${styles.footerColContent} ${expandedSections.helpSupport ? styles.expanded : ''}`}>
              <ul>
                <li><a href={`/${currentLocale}/contact`}>{t('shippingInfo')}</a></li>
                <li><a href="#">{t('returns')}</a></li>
                <li><a href="#">{t('howToOrder')}</a></li>
                <li><a href="#">{t('howToTrack')}</a></li>
                <li><a href="#">{t('sizeChart')}</a></li>
              </ul>
            </div>
          </div>

          {/* Customer Care */}
          <div className={styles.footerCol}>
            <div
              className={styles.footerColHeader}
              onClick={() => toggleSection('customerCare')}
            >
              <h4 className={styles.footerColTitle}>{t('customerCare')}</h4>
              <span className={styles.accordionIcon}>
                {expandedSections.customerCare ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </span>
            </div>
            <div className={`${styles.footerColContent} ${expandedSections.customerCare ? styles.expanded : ''}`}>
              <ul>
                <li><a href={`/${currentLocale}/contact`}>{t('contactUs')}</a></li>
                <li><a href="#">{t('payment')}</a></li>
                <li><a href="#">{t('bonusPoint')}</a></li>
                <li><a href="#">{t('notices')}</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className={styles.footerNewsletter}>
          <div
            className={styles.footerColHeader}
            onClick={() => toggleSection('newsletter')}
          >
            <h4>{t('signUpForNews')}</h4>
            <span className={styles.accordionIcon}>
              {expandedSections.newsletter ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </span>
          </div>
          <div className={`${styles.newsletterContent} ${expandedSections.newsletter ? styles.expanded : ''}`}>
            <form className={styles.newsletterForm}>
              <input type="email" placeholder={t('yourEmail')} className={styles.newsletterInput} />
              <button type="submit" className={styles.newsletterButton}>{t('subscribe')}</button>
            </form>
            <div className={styles.privacyText}>
              {t('privacyText')}<a href="#">{t('privacyCookiePolicy')}</a>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className={styles.footerPaymentsBottom}>
        <h4>{t('weAccept')}</h4>
        <div className="grid grid-cols-4 gap-3 max-w-sm mx-auto">
          {[
            { name: "Mastercard", src: "https://cdn.worldvectorlogo.com/logos/mastercard-2.svg" },
            { name: "Visa", src: "https://cdn.worldvectorlogo.com/logos/visa-10.svg" },
            { name: "PayPal", src: "https://cdn.worldvectorlogo.com/logos/paypal-3.svg" },
            { name: "Apple Pay", src: "https://cdn.worldvectorlogo.com/logos/apple-pay-payment-mark-logo.svg" }
          ].map((payment, index) => (
            <div key={index} className="flex items-center justify-center p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-300">
              <img
                src={payment.src}
                alt={payment.name}
                className="h-5 w-auto object-contain"
                onError={(e) => {
                  // Fallback if image fails to load
                  e.currentTarget.src = `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30"><rect width="60" height="30" fill="#f9fafb" stroke="#e5e7eb" stroke-width="1" rx="6"/><text x="30" y="20" font-family="Arial, sans-serif" font-size="8" fill="#6b7280" text-anchor="middle">${payment.name}</text></svg>`)}`;
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Footer Bottom */}
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
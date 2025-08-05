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

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
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
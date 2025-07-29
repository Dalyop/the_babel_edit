'use client';
import React, { useState } from 'react'
import Image from 'next/image';
import Link from 'next/link';
import { IMAGES } from '@/app/constants/constants';
import SearchInput from '@/app/components/ui/SearchInput/SearchInput';
import styles from './Navbar.module.css';
// icon imports
import { Shirt, Footprints, BriefcaseBusiness, Gem, PlaneLanding, Tag, ShoppingBasket } from 'lucide-react';
import Select from '../../ui/Select/Select';
import { useRouter, usePathname } from 'next/navigation';
import en from '@/locales/en/common.json';
import fr from '@/locales/fr/common.json';

const options = [
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'French' },
];

function Navbar() {
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
    <nav>
      <div className={styles.top_nav}>
        <Select
          options={options}
          value={selectOption}
          onChange={handleLanguageChange}
          placeholder="Language"
        />
        <Link href={`/${currentLocale}/account`}>{t('account')}</Link>
        <Link href={`/${currentLocale}/wishlist`}>{t('wishlist')}</Link>
        <div style={{ display: 'flex' }}>
          <Link href={`/${currentLocale}/cart`}>{t('cart')}</Link>
          <ShoppingBasket color='black' />
        </div>
      </div>

      <div className={styles.navbar}>

          <div className='brand'>
            <Image src={IMAGES.LOGO_WHITE}
              alt='logo'
              width={100}
              height={100}
            />
          </div>

        <div className={styles.nav_links}>
          <div className={styles.links}>
            <Shirt color='black' />
            <Link href={`/${currentLocale}/products?category=clothes`}>{t('clothes')}</Link>
          </div>
          <div className={styles.links}>
            <Footprints color='black' />
            <Link href={`/${currentLocale}/products?category=shoes`}>{t('shoes')}</Link>
          </div>
          <div className={styles.links}>
            <BriefcaseBusiness />
            <Link href={`/${currentLocale}/products?category=bags`}>{t('bags')}</Link>
          </div>
          <div className={styles.links}>
            <Gem color='black' />
            <Link href={`/${currentLocale}/products?category=accessories`}>{t('accessories')}</Link>
          </div>
          <div className={styles.links}>
            <PlaneLanding />
            <Link href={`/${currentLocale}/products?category=new-arrivals`}>{t('newArrivals')}</Link>
          </div>
          <div className={styles.links}>
            <Tag color='black' />
            <Link href={`/${currentLocale}/products?category=sale`}>{t('sale')}</Link>
          </div>
        </div>
        <div className='search'>
          <SearchInput
            onSearch={() => { "This is a test" }}
            placeholder={t('searchPlaceholder')}
          />
        </div>
      </div>
    </nav>
  )
}

export default Navbar
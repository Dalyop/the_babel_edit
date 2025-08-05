'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { IMAGES } from '@/app/constants/constants';
import SearchInput from '@/app/components/ui/SearchInput/SearchInput';
import styles from './Navbar.module.css';
// icon imports
import { Shirt, Footprints, BriefcaseBusiness, Gem, PlaneLanding, Tag, ShoppingBasket } from 'lucide-react';
import Select from '../../ui/Select/Select';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import en from '@/locales/en/common.json';
import fr from '@/locales/fr/common.json';

const options = [
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'French' },
];

function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const category = searchParams.get('category');
  const currentLocale = pathname.split('/')[1] || 'en';
  const [selectOption, setSelectedOption] = useState(currentLocale);

  const translations: Record<string, Record<string, string>> = { en, fr };
  const t = (key: string) => (translations[currentLocale] || translations['en'])[key] || key;

  const handleLanguageChange = (locale: string) => {
    setSelectedOption(locale);
    const segments = pathname.split('/');
    segments[1] = locale;
    router.push(segments.join('/'));
  };

  return (
    <nav>
      {/* Top Navigation */}
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

      {/* Main Navbar */}
      <div className={styles.navbar}>
        <Link href={`/${currentLocale}/dashboard`}>
          <div className="brand">
            <Image
              src={IMAGES.LOGO_WHITE}
              alt="logo"
              width={100}
              height={100}
            />
          </div>
        </Link>

        {/* Links Section */}
        <div className={styles.nav_links}>
          <div className={styles.links}>
            <Shirt color="black" />
            <Link
              href={`/${currentLocale}/products?category=clothes`}
              className={category === 'clothes' ? styles.activeLink : ''}
            >
              {t('clothes')}
            </Link>
          </div>

          <div className={styles.links}>
            <Footprints color="black" />
            <Link
              href={`/${currentLocale}/products?category=shoes`}
              className={category === 'shoes' ? styles.activeLink : ''}
            >
              {t('shoes')}
            </Link>
          </div>

          <div className={styles.links}>
            <BriefcaseBusiness />
            <Link
              href={`/${currentLocale}/products?category=bags`}
              className={category === 'bags' ? styles.activeLink : ''}
            >
              {t('bags')}
            </Link>
          </div>

          <div className={styles.links}>
            <Gem color="black" />
            <Link
              href={`/${currentLocale}/products?category=accessories`}
              className={category === 'accessories' ? styles.activeLink : ''}
            >
              {t('accessories')}
            </Link>
          </div>

          <div className={styles.links}>
            <PlaneLanding />
            <Link
              href={`/${currentLocale}/products?category=new-arrivals`}
              className={category === 'new-arrivals' ? styles.activeLink : ''}
            >
              {t('newArrivals')}
            </Link>
          </div>

          <div className={styles.links}>
            <Tag color="black" />
            <Link
              href={`/${currentLocale}/products?category=sale`}
              className={category === 'sale' ? styles.activeLink : ''}
            >
              {t('sale')}
            </Link>
          </div>
        </div>

        {/* Search Input */}
        <div className="search">
          <SearchInput
            onSearch={() => {
              console.log('This is a test');
            }}
            placeholder={t('searchPlaceholder')}
          />
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
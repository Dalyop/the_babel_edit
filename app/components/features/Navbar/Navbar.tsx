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

const options = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },

]

function Navbar() {
  const [selectOption, setSelectedOption] = useState('');

  return (
    <nav>
      <div className={styles.top_nav}>
        <Select
          options={options}
          value={selectOption}
          onChange={setSelectedOption}
          placeholder="Language"
        />
        <Link href='/account'>Account</Link>
        <Link href='/wishlist'>Wish List</Link>
        <div style={{ display: 'flex' }}>
          <Link href='/cart'>Cart</Link>
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
            <Link href='/products?category=clothes'>Clothes</Link>
          </div>
          <div className={styles.links}>
            <Footprints color='black' />
            <Link href='/products?category=shoes'>Shoes</Link>
          </div>
          <div className={styles.links}>
            <BriefcaseBusiness />
            <Link href='/products?category=bags'>Bags</Link>
          </div>
          <div className={styles.links}>
            <Gem color='black' />
            <Link href='/products?category=accessories'>Accessories</Link>
          </div>
          <div className={styles.links}>
            <PlaneLanding />
            <Link href='/products?category=new-arrivals'>New Arrivals</Link>
          </div>
          <div className={styles.links}>
            <Tag color='black' />
            <Link href='/products?category=sale'>Sale</Link>
          </div>
        </div>
        <div className='search'>
          <SearchInput
            onSearch={() => { "This is a test" }}
            placeholder='Search for products, brands and more'
          />
        </div>
      </div>
    </nav>
  )
}

export default Navbar
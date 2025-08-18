'use client';

import React, { FC } from 'react';
import Image from 'next/image';
import { BrandProps } from './types';
import styles from './ComingSoonPage.module.css';

/**
 * Brand component displaying logo and company information
 */
const Brand: FC<BrandProps> = ({ logoSrc, logoAlt, tag, title }) => {
    return (
        <header className={styles.brand} aria-label="Brand">
            <div className={styles.logo} aria-hidden="true">
                <Image
                    className={styles.logoImg}
                    src={logoSrc}
                    alt={logoAlt}
                    width={56}
                    height={56}
                    priority
                />
            </div>
            <div className={styles.heading}>
                <div className={styles.tag}>{tag}</div>
                <h1 className={styles.title}>{title}</h1>
            </div>
        </header>
    );
};

export default Brand;

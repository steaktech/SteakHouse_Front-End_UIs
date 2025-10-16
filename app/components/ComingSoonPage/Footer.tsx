'use client';

import React, { FC, useEffect, useState } from 'react';
import { FooterProps } from './types';
import styles from './ComingSoonPage.module.css';

/**
 * Footer component with dynamic year and company information
 */
const Footer: FC<FooterProps> = ({ companyName, tagline }) => {
    const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());

    useEffect(() => {
        // Update year if component mounts in a different year
        setCurrentYear(new Date().getFullYear());
    }, []);

    return (
        <div className={styles.footer}>
            <div>© {currentYear} {companyName}. All rights reserved.</div>
            <div aria-hidden="true">{tagline}</div>
        </div>
    );
};

export default Footer;

'use client';

import React, { FC, useEffect } from 'react';
import Script from 'next/script';
import { ComingSoonPageProps } from './types';
import styles from './ComingSoonPage.module.css';
import Brand from './Brand';
import Status from './Status';
import ActionButtons from './ActionButtons';
import Features from './Features';
import Footer from './Footer';
import EffectsCanvas from './EffectsCanvas';

/**
 * Main Coming Soon Page component
 */
const ComingSoonPage: FC<ComingSoonPageProps> = ({
    brand,
    description,
    status,
    actionButtons,
    features,
    footer,
    showBackButton = false,
    backButtonHref = "/"
}) => {
    useEffect(() => {
        // Prefetch Iconify icons for better performance
        const iconifyScript = document.querySelector('script[src*="iconify"]');
        if (iconifyScript) {
            iconifyScript.addEventListener('load', () => {
                // Icons will be loaded automatically by Iconify
            });
        }
    }, []);

    return (
        <>
            {/* Load Iconify script */}
            <Script
                src="https://code.iconify.design/3/3.1.1/iconify.min.js"
                strategy="afterInteractive"
            />
            
            <div className={styles.root}>
                <EffectsCanvas />
                
                {/* Back Button */}
                {showBackButton && (
                    <a 
                        href={backButtonHref} 
                        className={styles.backButton}
                        aria-label="Go back to home page"
                    >
                        <svg 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2"
                        >
                            <path d="M19 12H5" />
                            <path d="M12 19l-7-7 7-7" />
                        </svg>
                        Back
                    </a>
                )}
                
                <main className={styles.wrap}>
                    <section className={styles.card} aria-label="SteakHouse Coming Soon">
                        <Brand {...brand} />

                        <div className={styles.divider} role="separator"></div>

                        <p className={styles.lead}>
                            {description}
                        </p>

                        <Status {...status} />

                        <ActionButtons buttons={actionButtons} />

                        <Features features={features} />

                        <Footer {...footer} />
                    </section>
                </main>
            </div>
        </>
    );
};

export default ComingSoonPage;

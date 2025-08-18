'use client';

import React, { FC } from 'react';
import { FeaturesProps } from './types';
import styles from './ComingSoonPage.module.css';

/**
 * Features component displaying key highlights
 */
const Features: FC<FeaturesProps> = ({ features }) => {
    return (
        <div className={styles.features} aria-label="Highlights">
            {features.map((feature, index) => (
                <div key={index} className={styles.pill}>
                    <span
                        className={`iconify ${styles.ico}`}
                        data-icon={feature.icon}
                        aria-hidden="true"
                    ></span>
                    {feature.label}
                </div>
            ))}
        </div>
    );
};

export default Features;

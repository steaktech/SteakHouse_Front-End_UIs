'use client';

import React, { FC } from 'react';
import { ActionButtonsProps } from './types';
import styles from './ComingSoonPage.module.css';

/**
 * Action buttons component with shine effect
 */
const ActionButtons: FC<ActionButtonsProps> = ({ buttons }) => {
    return (
        <div className={styles.ctaRow} role="group" aria-label="Actions">
            {buttons.map((button, index) => (
                <a 
                    key={index}
                    className={`${styles.btn} ${styles.ctaRowBtn}`} 
                    href={button.href} 
                    aria-label={button.ariaLabel}
                >
                    <span className={styles.btnShine} aria-hidden="true"></span>
                    <span
                        className={`iconify ${styles.ico}`}
                        data-icon={button.icon}
                        aria-hidden="true"
                    ></span>
                    {button.label}
                </a>
            ))}
        </div>
    );
};

export default ActionButtons;

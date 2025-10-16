'use client';

import React, { FC } from 'react';
import { StatusProps } from './types';
import styles from './ComingSoonPage.module.css';

/**
 * Status component showing current development status
 */
const Status: FC<StatusProps> = ({ message }) => {
    return (
        <div className={styles.status} title="Build status">
            <span className={styles.statusDot} aria-hidden="true"></span>
            🔥 {message}
        </div>
    );
};

export default Status;

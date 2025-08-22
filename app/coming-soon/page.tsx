import React from 'react';
import { Metadata } from 'next';
import ComingSoonPage from '../components/ComingSoonPage';
import { ComingSoonPageProps } from '../components/ComingSoonPage/types';

export const metadata: Metadata = {
    title: 'SteakHouse — Coming Soon',
    description: 'SteakHouse Launchpad — Sizzling DeFi Innovation. A premium crypto launchpad experience. Coming soon.',
    openGraph: {
        title: 'SteakHouse — Coming Soon',
        description: 'Sizzling DeFi Innovation. A premium crypto launchpad experience. Coming soon.',
        type: 'website',
    },
    themeColor: '#ff6b35',
};

const comingSoonData: ComingSoonPageProps = {
    brand: {
        logoSrc: '/images/steakhouse-logo-v2.png',
        logoAlt: 'SteakHouse logo',
        tag: 'Sizzling DeFi Innovation',
        title: 'SteakHouse Launchpad'
    },
    description: "We're cooking up a premium, fair and gas-efficient launchpad experience thoughtful token distributions, non-custodial allocations and chef-kissed UX. The grill's heating up…coming soon.",
    status: {
        message: 'Currently in Development'
    },
    actionButtons: [
        {
            href: '#',
            label: 'Docs',
            icon: 'mdi:file-document-outline',
            ariaLabel: 'Read our docs'
        },
        {
            href: '#',
            label: 'Twitter',
            icon: 'mdi:twitter',
            ariaLabel: 'Twitter'
        },
        {
            href: '#',
            label: 'Telegram',
            icon: 'mdi:telegram',
            ariaLabel: 'Telegram'
        },
        {
            href: '#',
            label: 'Discord',
            icon: 'mdi:discord',
            ariaLabel: 'Discord'
        },
        {
            href: '#',
            label: 'GitHub',
            icon: 'mdi:github',
            ariaLabel: 'GitHub'
        }
    ],
    features: [
        {
            icon: 'mdi:shield-check',
            label: 'Audited contracts'
        },
        {
            icon: 'mdi:chart-line',
            label: 'Fair allocations'
        },
        {
            icon: 'mdi:ethereum',
            label: 'Ethereum chain'
        },
        {
            icon: 'mdi:cloud-upload-outline',
            label: 'Non‑custodial'
        }
    ],
    footer: {
        companyName: 'SteakHouse',
        tagline: 'Built with care, heat, and a hint of smoke.'
    },
    showBackButton: true,
    backButtonHref: '/'
};

export default function Page() {
    return <ComingSoonPage {...comingSoonData} />;
}

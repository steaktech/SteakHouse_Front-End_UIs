/**
 * Types and interfaces for the ComingSoonPage component
 */

export interface ActionButton {
    href: string;
    label: string;
    icon: string;
    ariaLabel: string;
}

export interface Feature {
    icon: string;
    label: string;
}

export interface BrandProps {
    logoSrc: string;
    logoAlt: string;
    tag: string;
    title: string;
}

export interface StatusProps {
    message: string;
}

export interface ActionButtonsProps {
    buttons: ActionButton[];
}

export interface FeaturesProps {
    features: Feature[];
}

export interface FooterProps {
    companyName: string;
    tagline: string;
}

export interface ComingSoonPageProps {
    brand: BrandProps;
    description: string;
    status: StatusProps;
    actionButtons: ActionButton[];
    features: Feature[];
    footer: FooterProps;
}

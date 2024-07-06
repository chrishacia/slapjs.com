import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

export type NavSideBarProps = {
    children?: React.ReactNode;
    title?: string;
};

export type SubNavItem = {
    icon?: IconDefinition
    text: string;
    routeMatch: string;
    url: string;
};

export type NavItem = {
    icon: IconDefinition;
    text: string;
    routeMatch: string;
    url: string;
    subNav: SubNavItem[];
};
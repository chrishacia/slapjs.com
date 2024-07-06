import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faEnvelope,
    faHome,
    faMessage,
    faUser
} from '@fortawesome/free-solid-svg-icons';
import { NavItem, NavSideBarProps } from '../../types/NavSidebar.types';

const navItems: NavItem[] = [
    {
        icon: faHome,
        text: 'Dashboard',
        routeMatch: 'dashboard',
        url: '/dashboard',
        subNav: []
    },
    {
        icon: faEnvelope,
        text: 'Messages',
        routeMatch: 'messages',
        url: '/messages',
        subNav: [
            {
                text: 'Inbox',
                routeMatch: 'inbox',
                url: '/messages/inbox'
            },
            {
                text: 'Sent',
                routeMatch: 'sent',
                url: '/messages/sent'
            },
            {
                text: 'Trash',
                routeMatch: 'trash',
                url: '/messages/trash'
            }
        ]
    },
    {
        icon: faMessage,
        text: 'Chat',
        routeMatch: 'chat',
        url: '/chat',
        subNav: []
    },
    {
        icon: faUser,
        text: 'Profile',
        routeMatch: 'profile',
        url: '/profile',
        subNav: []
    }
];

export const NavSidebar: React.FC<NavSideBarProps> = (props) => {
    const { children } = props;

    const handleActivePath = (str: string): string => {
        const baseClass = 'nav-link';
        const currentPath = window.location.pathname.split('/')[1];
        console.log(currentPath, str, str === currentPath);
        return `${baseClass}${str === currentPath ? ' active' : ''}`;
    };

    const isActivePath = (str: string): boolean => {
        const currentPath = window.location.pathname.split('/')[1];
        return str === currentPath;
    };

    return (
        <div className="col-md-3 col-lg-2 d-md-block bg-light sidebar collapse">
            <div className="nav-list-group">
                {navItems.map((item, index) => (
                    item.subNav.length === 0 ? (
                        <div key={index} className="nav-list-group-item d-flex align-items-center">
                            <div className="nav-icon-container">
                                <FontAwesomeIcon icon={item.icon} />
                            </div>
                            <div className="nav-text-container">
                                <a className={handleActivePath(item.routeMatch)} href={`${item.url}`}>
                                    {item.text}
                                </a>
                            </div>
                        </div>
                    ) : (
                        <div key={index}>
                            <div className="nav-list-group-item d-flex align-items-center">
                                <div className="nav-icon-container">
                                    <FontAwesomeIcon icon={item.icon} />
                                </div>
                                <div className="nav-text-container">
                                    <a className={handleActivePath(item.routeMatch)} href={`${item.url}`}>
                                        {item.text}
                                    </a>
                                </div>
                            </div>
                            <div className="nav-sub-list-group">
                                {
                                    isActivePath(item.routeMatch) &&
                                    item.subNav.map((subItem, subIndex) => (
                                        <div key={subIndex} className="nav-list-group-item d-flex align-items-center">
                                            <div className="nav-icon-container">
                                                {subItem.icon && <FontAwesomeIcon icon={subItem.icon} />}
                                            </div>
                                            <div className="nav-text-container">
                                                <a href={`${subItem.url}`}>
                                                    {subItem.text}
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )
                ))}
            </div>
            {children && (
                <div className="col-md-3 col-lg-2 d-md-block">
                    {children}
                </div>
            )}
        </div>
    );

};

// {
//     item.subNav.length === 0 ? null :
//         <div className="nav-sub-list-group">
//             {
//                 item.subNav.map((subItem, subIndex) => (
//                     <div key={subIndex} className="nav-list-group-item d-flex align-items-center">
//                         <div className="nav-icon-container">
//                             {subItem.icon && <FontAwesomeIcon icon={subItem.icon} />}
//                         </div>
//                         <div className="nav-text-container">
//                             <a className={isActivePath(subItem.routeMatch) ? 'active' : ''} href={`/${item.routeMatch}/${subItem.routeMatch}`}>{subItem.text}</a>
//                         </div>
//                     </div>
//                 ))
//             }
//         </div>
// }
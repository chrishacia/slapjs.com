import React from 'react';

type Props = {
    children?: React.ReactNode;
    title?: string;
};

export const NavSidebar: React.FC<Props> = (props) => {
    const { children } = props;

    const isActivePath = (str: string): string => {
        const baseClass = 'nav-link';
        const currentPath = window.location.pathname.split('/')[1];
        return `${baseClass}${str === currentPath ? ' active' : ''}`;
    };


    return (
        <>
            <nav id="sidebar" className="col-md-3 col-lg-2 d-md-block bg-light sidebar collapse">
                <div className="position-sticky">
                    <ul className="nav flex-column">
                        <li className="nav-item">
                            <a className={isActivePath('dashboard')} href="/dashboard" aria-label="User Dashboard">Dashboard</a>
                        </li>
                        <li className="nav-item">
                            <a className={isActivePath('messages')} href="/messages">Messages</a>
                        </li>
                        <li className="nav-item">
                            <a className={isActivePath('chat')} href="/chat">Chat</a>
                        </li>
                    </ul>
                </div>
            </nav>
            {
                !children ? null :
                    <div className="col-md-3 col-lg-2 d-md-block bg-light sidebar collapse">
                        {children}
                    </div>

            }
        </>
    );
};

//export default NavSidebar;

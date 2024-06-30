import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import { UserProvider } from '../../context/UserContext';
import { ConfigProvider } from '../../context/ConfigContext';
import { env as config } from '../../config/env';
import Header from './Header.tsx';
import Footer from './Footer.tsx';
import { MainContent } from './MainContent.tsx';

type Props = {
    children: React.ReactNode;
    title?: string;
};

const TemplateContent: React.FC<Props> = ({ children }) => {
    const { refreshAccessToken, isAuthenticated } = useAuth();
    const TOTAL_MINUTES = 300000;

    useEffect(() => {
        if (isAuthenticated) {
            const interval = setInterval(() => {
                const refreshToken = localStorage.getItem('refreshToken');
                refreshAccessToken(refreshToken);
            }, TOTAL_MINUTES); // Refresh every 15 minutes
            return () => clearInterval(interval);
        }
    }, [isAuthenticated, refreshAccessToken]);

    return (
        <div className="d-flex flex-column h-100">
            <Header />
            <div className="container-fluid flex-grow-1 d-flex flex-column">
                <MainContent>
                    {children}
                </MainContent>
            </div>
            <Footer />
        </div>
    );
};

export const Template: React.FC<Props> = (props) => {
    return (
        <ConfigProvider config={config}>
            <AuthProvider>
                <UserProvider>
                    <TemplateContent {...props} />
                </UserProvider>
            </AuthProvider>
        </ConfigProvider>
    );
};

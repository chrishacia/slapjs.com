import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { useAuth, AuthProvider } from '../context/AuthContext';

const ForgotPassword: React.FC = () => {
    const USER_ID_SEGMENT = 1;
    const TOKEN_SEGMENT = 2;
    const [isValid, setIsValid] = useState<boolean>(false);
    const [isChecked, setIsChecked] = useState<boolean>(false);
    const { isAuthenticated } = useAuth();
    const urlSegments = window.location.pathname.split('/');
    const userId = urlSegments[urlSegments.length - USER_ID_SEGMENT];
    const token = urlSegments[urlSegments.length - TOKEN_SEGMENT];

    useEffect(() => {
        fetch('/api/register-verify', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId, token }),
        })
            .then((res) => res.json())
            .then((res) => {
                if (!res.error) {
                    setIsValid(true);
                    setIsChecked(true);
                } else {
                    setIsValid(false);
                    alert(res.data.error);
                }
            });
    }, [userId, token]);

    if (isAuthenticated) {
        window.location.href = '/dashboard';
        return null;
    }

    return (
        <main className="form-signin w-100 m-auto centered-box-container">
            <img className="mb-4 img-fluid" src="/img/logo.png" alt="Logo" />
            <h1 className="h4 mb-3 fw-normal">Account Verification</h1>
            {isChecked && isValid ? (
                <p>
                    Your account has been verified. Please <a href="/login">login</a>.
                </p>
            ) : (
                <p>Verifying...</p>
            )}
            {isChecked && !isValid ? (
                <p>
                    Your account could not be verified. Please <a href="/register">register</a> again.
                </p>
            ) : null}
            <hr className="my-4" />
            <a href="/login" className="btn btn-primary w-100 py-2 mb-2">Login</a>
            <p className="mt-5 mb-3 text-body-secondary text-center">&copy; {new Date().getFullYear()}</p>
        </main>
    );
};

const root = createRoot(document.getElementById('root')!);
root.render(
    <AuthProvider>
        <ForgotPassword />
    </AuthProvider>
);

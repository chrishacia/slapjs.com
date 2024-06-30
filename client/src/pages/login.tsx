import React, { useState, ChangeEvent, FormEvent } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { createRoot } from 'react-dom/client';
import validator from 'email-validator';
import { env } from '../config/env';
import logger from '../utils/logger';
import { useAuth, AuthProvider } from '../context/AuthContext';

interface FormData {
    email: string;
    password: string;
    rememberMe: boolean;
}

const Login: React.FC = () => {
    const { isAuthenticated } = useAuth();

    const { base_url } = env;
    const [formData, setFormData] = useState<FormData>({
        email: '',
        password: '',
        rememberMe: false,
    });

    if (isAuthenticated) {
        window.location.href = '/dashboard';
        return null;
    }

    const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
        const { id, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [id]: type === 'checkbox' ? checked : value,
        });
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        const { email, password, rememberMe } = formData;

        if (!email || !password) {
            alert('Please enter an email and password');
            return;
        }

        if (!validator.validate(email)) {
            alert('Invalid email');
            return;
        }

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password, rememberMe }),
            });

            const res = await response.json();

            if (!res.data.error) {
                localStorage.setItem('userId', res.data.id);
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('refreshToken', res.data.refreshToken);
                window.location.href = '/dashboard';
            } else {
                alert(res.error);
            }
        } catch (error) {
            logger.error(error);
        }
    };

    return (
        <main className="form-signin w-100 m-auto centered-box-container">
            <form onSubmit={handleSubmit}>
                <img className="mb-4 img-fluid" style={{ maxWidth: '350px' }} src={`${base_url}/img/temp_logo.png`} alt="Logo" />
                <h1 className="h4 mb-3 fw-normal">Please sign in</h1>

                <div className="form-floating mb-1">
                    <input
                        type="email"
                        className="form-control"
                        id="email"
                        placeholder="name@example.com"
                        value={formData.email}
                        onChange={handleChange}
                    />
                    <label htmlFor="email">Email address</label>
                </div>
                <div className="form-floating mb-1">
                    <input
                        type="password"
                        className="form-control"
                        id="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                    />
                    <label htmlFor="password">Password</label>
                </div>

                <div className="form-check text-start my-3">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        value="remember-me"
                        id="rememberMe"
                        checked={formData.rememberMe}
                        onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="rememberMe">
                        Remember me
                    </label>
                </div>
                <button className="btn btn-primary w-100 py-2" type="submit">Sign in</button>
                <hr className="my-4" />
                <a href="/forgot-password" className="btn btn-outline-primary w-100 py-2 mb-2">Forgot Password</a>
                <a href="/register" className="btn btn-outline-primary w-100 py-2">Sign up</a>
                <p className="mt-5 mb-3 text-body-secondary text-center">&copy; {new Date().getFullYear()}</p>
            </form>
        </main>
    );
};

const root = createRoot(document.getElementById('root')!);
root.render(
    <AuthProvider>
        <Login />
    </AuthProvider>
);

const validator = require('email-validator');
import React, { useState } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { createRoot } from 'react-dom/client';
import { baseUrl } from '../config/index.js';

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const vType = 'vfp';

    const handleEmailChange = (e) => setEmail(e.target.value);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!email) {
            alert('Please enter your email address');
            return;
        }

        if (!validator.validate(email)) {
            alert('Invalid email');
            return;
        }

        fetch('/api/fpw', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, vType }),
        })
            .then((res) => res.json())
            .then((res) => {
                if (!res.error) {
                    alert('Please check your email for a link to reset your password.');
                    window.location.href = '/login';
                } else {
                    alert(res.data.error);
                }
            });
    };

    return (
        <main className="form-signin w-100 m-auto centered-box-container">
            <form onSubmit={handleSubmit}>
                <img className="mb-4 img-fluid" style={{ maxWidth: '350px' }} src={`${baseUrl}/img/temp_logo.png`} alt="" />
                <h1 className="h4 mb-3 fw-normal">Forgot Password</h1>

                <div className="form-floating mb-1">
                    <input
                        type="email"
                        className="form-control"
                        id="floatingInput"
                        placeholder="name@example.com"
                        value={email}
                        onChange={handleEmailChange}
                    />
                    <label htmlFor="floatingInput">Email address</label>
                </div>

                <button className="btn btn-primary w-100 py-2" type="submit">
                    Submit
                </button>
                <hr className="my-4" />
                <a href="/login" className="btn btn-outline-primary w-100 py-2 mb-2">
                    Login
                </a>
                <a href="/register" className="btn btn-outline-primary w-100 py-2">
                    Sign up
                </a>
                <p className="mt-5 mb-3 text-body-secondary text-center">
                    &copy; {new Date().getFullYear()}
                </p>
            </form>
        </main>
    );
}

const root = createRoot(document.getElementById('root'));
root.render(<ForgotPassword />);

import React, { useState, ChangeEvent, FormEvent } from 'react';
import { createRoot } from 'react-dom/client';
import validator from 'email-validator';
import { env } from '../config/env';
import { useAuth, AuthProvider } from '../context/AuthContext';

// TODO: Password Strength Meter and Password Requirements

interface FormData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    confirmPassword: string;
    dobMonth: string;
    dobDay: string;
    dobYear: string;
}

const Register: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const { base_url } = env;

    const [formData, setFormData] = useState<FormData>({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        confirmPassword: '',
        dobMonth: '',
        dobDay: '',
        dobYear: '',
    });

    if (isAuthenticated) {
        window.location.href = '/dashboard';
        return null;
    }

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
        const { id, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [id]: value }));
    };

    const { email, password, firstName, lastName, confirmPassword, dobMonth, dobDay, dobYear } = formData;

    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

    const LEGAL_AGE = 18;
    const BASE_YEAR = 1970;

    const isDobLessThan18 = (): boolean => {
        const dob = new Date(`${dobMonth}/${dobDay}/${dobYear}`);
        const ageDiff = Date.now() - dob.getTime();
        const age = new Date(ageDiff).getUTCFullYear() - BASE_YEAR;
        return age < LEGAL_AGE;
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
        e.preventDefault();

        if (isDobLessThan18()) {
            alert('You must be at least 18 years old to register.');
            return;
        }

        if (Object.values(formData).some((value) => value === '')) {
            alert('Please fill out all fields.');
            return;
        }

        if (!validator.validate(email)) {
            alert('Invalid email');
            return;
        }

        if (password !== confirmPassword) {
            alert('Passwords do not match.');
            return;
        }

        fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    window.location.href = '/dashboard';
                } else {
                    alert(data.message);
                }
            });
    };

    return (
        <main className="form-signin w-100 m-auto centered-box-container">
            <form onSubmit={handleSubmit}>
                <img className="mb-4 img-fluid" style={{ maxWidth: '350px' }} src={`${base_url}/img/temp_logo.png`} alt="Logo" />
                <h1 className="h4 mb-3 fw-normal">Please sign up</h1>

                <div className="d-flex flex-row mb-1">
                    <div className="form-floating">
                        <input type="text" className="form-control" id="firstName" placeholder="John" value={firstName} onChange={handleChange} />
                        <label htmlFor="firstName">First name</label>
                    </div>
                    <div className="form-floating">
                        <input type="text" className="form-control" id="lastName" placeholder="Doe" value={lastName} onChange={handleChange} />
                        <label htmlFor="lastName">Last name</label>
                    </div>
                </div>

                <div className="row mb-1">
                    <div className="col">
                        <div className="form-floating">
                            <select className="form-select" id="dobMonth" value={dobMonth} onChange={handleChange}>
                                <option value="">Month</option>
                                {months.map((v) => <option value={v} key={`month_${v}`}>{v}</option>)}
                            </select>
                            <label htmlFor="dobMonth">Month</label>
                        </div>
                    </div>
                    <div className="col">
                        <div className="form-floating">
                            <select className="form-select" id="dobDay" value={dobDay} onChange={handleChange}>
                                <option value="">Day</option>
                                {days.map((v) => <option value={v} key={`day_${v}`}>{v}</option>)}
                            </select>
                            <label htmlFor="dobDay">Day</label>
                        </div>
                    </div>
                    <div className="col">
                        <div className="form-floating">
                            <select className="form-select" id="dobYear" value={dobYear} onChange={handleChange}>
                                <option value="">Year</option>
                                {years.map((v) => <option value={v} key={`year_${v}`}>{v}</option>)}
                            </select>
                            <label htmlFor="dobYear">Year</label>
                        </div>
                    </div>
                </div>

                <div className="form-floating mb-1">
                    <input type="email" className="form-control" id="email" placeholder="name@example.com" value={email} onChange={handleChange} />
                    <label htmlFor="email">Email address</label>
                </div>
                <div className="form-floating mb-1">
                    <input type="password" className="form-control" id="password" placeholder="Password" value={password} onChange={handleChange} />
                    <label htmlFor="password">Password</label>
                </div>
                <div className="form-floating mb-1">
                    <input type="password" className="form-control" id="confirmPassword" placeholder="Confirm Password" value={confirmPassword} onChange={handleChange} />
                    <label htmlFor="confirmPassword">Confirm Password</label>
                </div>

                <button className="btn btn-primary w-100 py-2" type="submit">Sign up</button>
                <hr className="my-4" />
                <a href="/login" className="btn btn-outline-primary w-100 py-2 mt-2">Login</a>
                <p className="mt-5 mb-3 text-body-secondary text-center">&copy; {new Date().getFullYear()}</p>
            </form>
        </main>
    );
};

const root = createRoot(document.getElementById('root')!);
root.render(
    <AuthProvider>
        <Register />
    </AuthProvider>
);

const validator = require('email-validator');
import React, { useState } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { createRoot } from 'react-dom/client';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleRememberMeChange = (e) => {
    setRememberMe(e.target.checked);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if(!email || !password) {
      alert('Please enter an email and password');
      return;
    }

    if (!validator.validate(email)) {
      alert('Invalid email');
      return;
    }

    // Add your login logic here
    fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, rememberMe }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (!res.error) {
          localStorage.setItem('userId', res.data.id);
          localStorage.setItem('token', res.data.token);
          localStorage.setItem('refreshToken', res.data.refreshToken);
          window.location.href = '/dashboard';
        } else {
          alert(res.data.error);
        }
      });
  };

  return (
    <main className="form-signin w-100 m-auto centered-box-container">
      <form onSubmit={handleSubmit}>
        <img className="mb-4 img-fluid" src="/img/logo.png" alt="" />
        <h1 className="h4 mb-3 fw-normal">Please sign in</h1>

        <div className="form-floating mb-1">
          <input type="email" className="form-control" id="floatingInput" placeholder="name@example.com" value={ email } onChange={ handleEmailChange } />
          <label htmlFor="floatingInput">Email address</label>
        </div>
        <div className="form-floating mb-1">
          <input type="password" className="form-control" id="floatingPassword" placeholder="Password" value={ password } onChange={ handlePasswordChange } />
          <label htmlFor="floatingPassword">Password</label>
        </div>

        <div className="form-check text-start my-3">
          <input className="form-check-input" type="checkbox" value="remember-me" id="flexCheckDefault" onChange={ handleRememberMeChange } />
          <label className="form-check-label" htmlFor="flexCheckDefault">
            Remember me
          </label>
        </div>
        <button className="btn btn-primary w-100 py-2" type="submit">Sign in</button>
        <hr className="my-4" />
        <a href="/forgot-password" className="btn btn-outline-primary w-100 py-2 mb-2">Forgot Password</a>
        <a href="/register" className="btn btn-outline-primary w-100 py-2">Sign up</a>
        <p className="mt-5 mb-3 text-body-secondary text-center">&copy; { new Date().getFullYear() }</p>
      </form>
    </main>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<Login />);

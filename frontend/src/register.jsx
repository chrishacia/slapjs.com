const validator = require('email-validator');
import React, { useState } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { createRoot } from 'react-dom/client';

// TODO: Password Strength Meter and Password Requirements

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dobMonth, setDobMonth] = useState('');
  const [dobDay, setDobDay] = useState('');
  const [dobYear, setDobYear] = useState('');


  const days = Array.from(Array(31).keys()).map((i) => i + 1);
  const months = Array.from(Array(12).keys()).map((i) => i + 1);
  const currentYear = new Date().getFullYear();
  const hundredYearsAgo = new Date().getFullYear() - 100;
  const years = Array.from(Array(100).keys()).map((i) => i + hundredYearsAgo).sort((a, b) => b - a);

  const handleFirstNameChange = (e) => {
    setFirstName(e.target.value);
  }

  const handleLastNameChange = (e) => {
    setLastName(e.target.value);
  }

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handlePasswordConfirmChange = (e) => {
    setConfirmPassword(e.target.value);
  };

  const handleDobMonthChange = (e) => {
    setDobMonth(e.target.value);
  }

  const handleDobDayChange = (e) => {
    setDobDay(e.target.value);
  }

  const handleDobYearChange = (e) => {
    setDobYear(e.target.value);
  }

  const isDobLessThan18 = () => {
    const dob = new Date(`${dobMonth}/${dobDay}/${dobYear}`);
    const diff = Date.now() - dob.getTime();
    const ageDate = new Date(diff);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);
    return age < 18;
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isDobLessThan18()) {
      alert('You must be at least 18 years old to register.');
      return;
    }

    if (email === '' || password === '' || firstName === '' || lastName === '' || confirmPassword === '' || dobMonth === '' || dobDay === '' || dobYear === '') {
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
      body: JSON.stringify({ email, password, firstName, lastName, dobMonth, dobDay, dobYear }),
    })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        window.location.href = '/dashboard';
      } else {
        alert(data.message);
      }
    });

    alert(`Email: ${email}\nPassword: ${password}\nFirst Name: ${firstName}\nLast Name: ${lastName}\nConfirm Password: ${confirmPassword}`);
    // Add your login logic here
  };

  return (
    <main className="form-signin w-100 m-auto centered-box-container">
      <form onSubmit={handleSubmit}>
        <img className="mb-4 img-fluid" src="/img/logo.png" alt="" />
        <h1 className="h4 mb-3 fw-normal">Please sign up</h1>

        <div className="d-flex flex-row mb-1">
          <div className="form-floating">
            <input type="text" className="form-control" id="firstName" placeholder="John" value={ firstName } onChange={ handleFirstNameChange } />
            <label htmlFor="floatingInput">First name</label>
          </div>
          <div className="form-floating">
            <input type="text" className="form-control" id="lastName" placeholder="Doe" value={ lastName } onChange={ handleLastNameChange } />
            <label htmlFor="floatingInput">Last name</label>
          </div>
        </div>

        <div className="row mb-1">
          <div className="col">
            <div className="form-floating">
              <select className="form-select" id="dob_month" aria-label="DOB Month" selected={ dobMonth } onChange={ handleDobMonthChange }>
                <option  value="">Month</option>
                { months.map((v, i) => <option value={ v } key={`days_${i}`}>{ v }</option>) }
              </select>
              <label htmlFor="floatingInput">Month</label>
            </div>
          </div>
          <div className="col">
            <div className="form-floating">
              <select className="form-select" id="dob_day" aria-label="DOB Day" selected={ dobDay } onChange={ handleDobDayChange }>
                <option  value="">Day</option>
                { days.map((v, i) => <option value={ v } key={`days_${i}`}>{ v }</option>) }
              </select>
              <label htmlFor="floatingInput">Day</label>
            </div>
          </div>
          <div className="col">
            <div className="form-floating">
              <select className="form-select" id="dob_year" aria-label="DOB Year" selected={ dobYear } onChange={ handleDobYearChange }>
                <option value="">Year</option>
                <option value={currentYear}>{currentYear}</option>
                { years.map((v, i) => <option value={ v } key={`days_${i}`}>{ v }</option>) }
              </select>
              <label htmlFor="floatingInput">Year</label>
            </div>
          </div>
        </div>

        <div className="form-floating mb-1">
          <input type="email" className="form-control" id="floatingInput" placeholder="name@example.com" value={ email } onChange={ handleEmailChange } />
          <label htmlFor="floatingInput">Email address</label>
        </div>
        <div className="form-floating mb-1">
          <input type="password" className="form-control" id="floatingPassword" placeholder="Password" value={ password } onChange={ handlePasswordChange } />
          <label htmlFor="floatingPassword">Password</label>
        </div>
        <div className="form-floating mb-1">
          <input type="password" className="form-control" id="floatingConfirmPassword" placeholder="Confirm Password" value={ confirmPassword } onChange={ handlePasswordConfirmChange } />
          <label htmlFor="floatingConfirmPassword">Confirm Password</label>
        </div>

        <button className="btn btn-primary w-100 py-2" type="submit">Sign in</button>
        <hr className="my-4" />
        <a href="/login" className="btn btn-outline-primary w-100 py-2 mt-2">Login</a>
        <p className="mt-5 mb-3 text-body-secondary text-center">&copy; { new Date().getFullYear() }</p>
      </form>
    </main>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<Register />);

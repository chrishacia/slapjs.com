import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

function ForgotPassword() {
  const [isValid, setIsValid] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  const urlSegments = window.location.pathname.split('/');
  const userId = urlSegments[urlSegments.length - 1];
  const token = urlSegments[urlSegments.length - 2];

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
  });

  return (
    <main className="form-signin w-100 m-auto centered-box-container">
        <img className="mb-4 img-fluid" src="/img/logo.png" alt="" />
        <h1 className="h4 mb-3 fw-normal">Accout Verification</h1>
        {
          isChecked && isValid ? <p>Your account has been verified. Please <a href="/login">login</a>.</p>
          :
          <p>Verifying...</p>
        }
        {
          isChecked && !isValid ? <p>Your account could not be verified. Please <a href="/register">register</a> again.</p>
          : null
        }
        <hr className="my-4" />
        <a href="/login" className="btn btn-primary w-100 py-2 mb-2">Login</a>
        <p className="mt-5 mb-3 text-body-secondary text-center">&copy; {new Date().getFullYear()}</p>
    </main>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<ForgotPassword />);

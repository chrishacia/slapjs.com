import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';

function Logout() {

    useEffect(() => {
        fetch('/api/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
        })
            .then((res) => res.json())
            .then(() => {
                localStorage.clear();
                window.location.href = '/dashboard';
            });
    });

    return (
        <h1>Logout</h1>
    );
}

const root = createRoot(document.getElementById('root'));
root.render(<Logout />);
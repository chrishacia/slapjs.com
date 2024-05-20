import React from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { createRoot } from 'react-dom/client';

function Dashboard() {

  return (
    <h1>Dashboard</h1>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<Dashboard />);

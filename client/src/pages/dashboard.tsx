import React from 'react';
import { createRoot } from 'react-dom/client';
import {Template} from '../components/template/index';
import logger from '../utils/logger';

// Define the Dashboard component
const Dashboard: React.FC = () => {
  return (
    <Template>
      <h1>Dashboard</h1>
    </Template>
  );
};

// Ensure the 'root' element exists and is of type HTMLElement
const rootElement = document.getElementById('root');

if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<Dashboard />);
} else {
    logger.error('Root element not found');
}

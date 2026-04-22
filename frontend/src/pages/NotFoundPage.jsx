import React from 'react';
import { Link } from 'react-router-dom';
const NotFoundPage = () => (
  <div className="min-h-screen flex items-center justify-center text-center px-4">
    <div>
      <div className="text-8xl font-bold text-primary-orange mb-4">404</div>
      <h1 className="text-3xl font-bold text-gray-800 mb-3">Page Not Found</h1>
      <p className="text-gray-500 mb-8">The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/" className="btn-primary inline-block">Go Home</Link>
    </div>
  </div>
);
export default NotFoundPage;

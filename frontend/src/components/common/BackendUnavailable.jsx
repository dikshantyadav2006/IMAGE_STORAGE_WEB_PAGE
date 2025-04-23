import React from 'react';

const BackendUnavailable = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-4 text-center">
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4 max-w-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              {message || 'Backend server is not available. Please make sure the server is running.'}
            </p>
          </div>
        </div>
      </div>
      
      <div className="mt-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          How to start the backend server:
        </h3>
        <ol className="mt-2 list-decimal list-inside text-left text-gray-700 dark:text-gray-300">
          <li className="mb-2">Open a terminal in the project root directory</li>
          <li className="mb-2">Navigate to the backend directory: <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">cd backend</code></li>
          <li className="mb-2">Install dependencies (if not already done): <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">npm install</code></li>
          <li className="mb-2">Start the server: <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">npm run dev</code></li>
          <li>Refresh this page once the server is running</li>
        </ol>
      </div>
      
      <button
        onClick={() => window.location.reload()}
        className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
      >
        Refresh Page
      </button>
    </div>
  );
};

export default BackendUnavailable;

import React from 'react';

// Main component must be named App and be the default export
const App = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      {/*
        This style block contains the custom keyframe for the spinner animation,
        which Tailwind doesn't provide directly.
      */}
      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      
      <div className="bg-white p-10 sm:p-16 rounded-3xl shadow-2xl max-w-lg w-full text-center">
        
        {/* Title */}
        <h1 className="text-5xl sm:text-6xl font-extrabold text-blue-700 mb-4 tracking-tight">
          Share and Work
        </h1>
        
        {/* Subtitle */}
        <p className="text-xl sm:text-2xl text-gray-600 mb-8 font-medium">
          Work in Progress
        </p>
        
        {/* Spinner */}
        <div 
          className="mx-auto" 
          style={{
            border: '5px solid #e5e7eb', /* gray-200 */
            borderTop: '5px solid #3b82f6', /* blue-500 */
            borderRadius: '50%',
            width: '60px',
            height: '60px',
            animation: 'spin 1s linear infinite',
          }}
          aria-label="Loading"
        >
        </div>

        {/* Status Message */}
        <p className="mt-8 text-sm text-gray-500">
          We're busy building something awesome. Check back soon!
        </p>
      </div>
    </div>
  );
};

export default App;

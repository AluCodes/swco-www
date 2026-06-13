import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

const ThankYouPage = () => {
  return (
    <>
      <Head>
        <title>Thank You | Da Nang Tours</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen theme-hero-bg flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-10 md:p-16 max-w-lg w-full text-center">
          <div className="text-7xl mb-6">🙏</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Thank You!</h1>
          <p className="text-lg text-gray-600 mb-8">
            We've received your enquiry and will be in touch within 24 hours with your personalised quote.
          </p>
          <Link
            href="/"
            className="inline-block theme-btn-primary text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-300 shadow-lg"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </>
  );
};

export default ThankYouPage;

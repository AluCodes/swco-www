import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

const ThankYouPage = () => {
  return (
    <>
      <Head>
        <title>Enquiry Received | SWCO Consulting</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-[#0F2647] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-10 md:p-16 max-w-lg w-full text-center">
          <div className="w-16 h-16 rounded-full bg-[#71C9CE]/20 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-[#1B3A5C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Enquiry received</h1>
          <p className="text-lg text-gray-600 mb-8">
            Thanks for reaching out. A member of our team will be in touch within one business day.
          </p>
          <Link
            href="/"
            className="inline-block bg-[#1B3A5C] hover:bg-[#0F2647] text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-300 shadow-lg"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </>
  );
};

export default ThankYouPage;

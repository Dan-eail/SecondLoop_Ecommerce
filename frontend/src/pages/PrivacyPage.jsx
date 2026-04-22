import React from 'react';
import { Helmet } from 'react-helmet-async';

const SECTIONS = [
  { title: 'Information We Collect', content: 'We collect your phone number (required for verification), name, email (optional), location (city/subcity), profile photo (optional), and transaction history. We also collect usage data to improve our services.' },
  { title: 'How We Use Your Information', content: 'Your information is used to verify your identity, process transactions, send order notifications, improve our platform, and prevent fraud. We do not sell your personal data to third parties.' },
  { title: 'Data Security', content: 'We use industry-standard encryption (bcrypt for passwords, JWT for sessions, HTTPS for all communications). Payment information is never stored on our servers — all payments go through Telebirr\'s secure infrastructure.' },
  { title: 'Data Sharing', content: 'We share limited data with: (1) Other users as needed for transactions (name and city only), (2) SMS providers for OTP delivery, (3) Cloudinary for image storage, (4) Law enforcement when required by Ethiopian law.' },
  { title: 'Your Rights', content: 'You have the right to: access your personal data, correct inaccurate data, delete your account and data, opt out of marketing communications, and export your data.' },
  { title: 'Cookies', content: 'We use minimal cookies for session management and security. We do not use tracking cookies or advertising cookies.' },
  { title: 'Contact Us', content: 'For privacy concerns, contact us at privacy@tena.et or +251 911 111 111. Our Data Protection Officer is available Monday to Friday, 9 AM to 5 PM EAT.' },
];

const PrivacyPage = () => (
  <>
    <Helmet><title>Privacy Policy | ተና SecondLoop</title></Helmet>
    <div className="container-custom py-16 max-w-3xl">
      <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-gray-400 mb-10 text-sm">Last updated: January 2025</p>
      <div className="bg-white rounded-2xl shadow-md p-8 space-y-8">
        {SECTIONS.map(({ title, content }) => (
          <div key={title}>
            <h2 className="text-xl font-bold mb-3 text-primary-orange">{title}</h2>
            <p className="text-gray-600 leading-relaxed">{content}</p>
          </div>
        ))}
      </div>
    </div>
  </>
);
export default PrivacyPage;

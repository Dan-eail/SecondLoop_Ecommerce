import React from 'react';
import { Helmet } from 'react-helmet-async';

const SECTIONS = [
  { title: '1. Acceptance of Terms', content: 'By accessing and using the ተና SecondLoop marketplace ("TENA"), you agree to these Terms of Service. If you do not agree, please do not use the platform.' },
  { title: '2. User Accounts', content: 'You must be at least 18 years old to use TENA. You must provide a valid Ethiopian phone number for verification. You are responsible for maintaining the security of your account and all activities under it.' },
  { title: '3. Listing Rules', content: 'All listings must be for legal items that you own. Prohibited items include: weapons, counterfeit goods, illegal substances, and items that violate Ethiopian law. TENA reserves the right to remove any listing that violates these rules.' },
  { title: '4. Escrow Payment System', content: 'All transactions through TENA are processed via our escrow system. Buyers send payment to TENA, which holds funds until delivery is confirmed. TENA charges a 5% platform fee (min 10 ETB, max 500 ETB) on completed transactions.' },
  { title: '5. Buyer Protection', content: 'Buyers may file a dispute within 48 hours of confirming delivery if the item is significantly different from the description. TENA will mediate disputes and release funds based on evidence provided by both parties.' },
  { title: '6. Seller Obligations', content: 'Sellers must accurately describe their items, respond to buyer inquiries within 24 hours, ship or arrange delivery within the agreed timeframe, and cooperate in dispute resolution.' },
  { title: '7. Privacy Policy', content: 'We collect and use your personal data as described in our Privacy Policy. We never sell your personal information to third parties. Your phone number is used only for verification and order notifications.' },
  { title: '8. Limitation of Liability', content: 'TENA facilitates transactions but is not responsible for the quality, safety, or legality of items listed. We are not liable for disputes between buyers and sellers beyond our escrow protection system.' },
  { title: '9. Governing Law', content: 'These Terms are governed by the laws of the Federal Democratic Republic of Ethiopia. Any disputes shall be resolved under Ethiopian jurisdiction.' },
];

const TermsPage = () => (
  <>
    <Helmet><title>Terms of Service | ተና SecondLoop</title></Helmet>
    <div className="container-custom py-16 max-w-3xl">
      <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
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
export default TermsPage;

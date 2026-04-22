import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

const FAQS = [
  { q: 'How does the escrow payment system work?', a: 'When you make a purchase, your payment is held securely by TENA. We only release the funds to the seller after you confirm that you have received the item in the condition described. This protects both buyers and sellers.' },
  { q: 'How do I verify my phone number?', a: 'After registering, you will receive a 6-digit OTP (One-Time Password) via SMS to your Ethiopian phone number (+251XXXXXXXXX). Enter this code to verify your account.' },
  { q: 'What payment methods are accepted?', a: 'We currently accept Telebirr and bank transfers. You send payment to TENA\'s account, upload the proof, and we hold it in escrow until delivery is confirmed.' },
  { q: 'What is the platform fee?', a: 'TENA charges a 5% platform fee on completed transactions (minimum 10 ETB, maximum 500 ETB). This fee is deducted from the seller\'s payout and covers escrow protection and platform maintenance.' },
  { q: 'How long does escrow take to release?', a: 'Once you confirm delivery, the seller\'s payment is released. If you don\'t file a dispute within 48 hours of confirming delivery, the payment is automatically released.' },
  { q: 'What if I have a problem with my order?', a: 'You can file a dispute within 48 hours of confirming delivery. Our admin team will review the evidence from both parties and resolve the dispute within 24-48 hours.' },
  { q: 'Can I sell items from anywhere in Ethiopia?', a: 'Yes! Sellers from all Ethiopian cities can list items. We support Addis Ababa, Dire Dawa, Hawassa, Bahir Dar, Mekelle, Gondar, and many more cities.' },
  { q: 'How many photos can I add to a listing?', a: 'You can upload between 1 and 8 photos per listing. All images are automatically converted to WebP format for fast loading.' },
];

const FAQItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button onClick={() => setOpen(!open)} className="w-full text-left py-5 flex items-center justify-between gap-4 hover:text-primary-orange transition-colors">
        <span className="font-semibold">{q}</span>
        {open ? <FiChevronUp size={20} className="text-primary-orange flex-shrink-0" /> : <FiChevronDown size={20} className="text-gray-400 flex-shrink-0" />}
      </button>
      {open && <p className="text-gray-600 text-sm leading-relaxed pb-5">{a}</p>}
    </div>
  );
};

const FAQPage = () => (
  <>
    <Helmet><title>FAQ | ተና SecondLoop</title></Helmet>
    <div className="container-custom py-16 max-w-3xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
        <p className="text-gray-500">Everything you need to know about buying and selling on ተና</p>
      </div>
      <div className="bg-white rounded-2xl shadow-md p-8">
        {FAQS.map((faq) => <FAQItem key={faq.q} {...faq} />)}
      </div>
      <div className="mt-10 text-center bg-orange-50 rounded-2xl p-8">
        <h3 className="text-xl font-bold mb-2">Still have questions?</h3>
        <p className="text-gray-500 mb-4">Our support team is here to help</p>
        <a href="mailto:support@tena.et" className="btn-primary inline-block">Contact Support</a>
      </div>
    </div>
  </>
);
export default FAQPage;

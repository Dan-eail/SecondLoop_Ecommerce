import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="bg-primary-brown text-white mt-16">
    <div className="container-custom py-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <h3 className="font-bold text-xl mb-2"><span className="font-amharic">ተና</span> SecondLoop</h3>
          <p className="text-sm opacity-75 mb-4">Ethiopia's trusted marketplace for used goods. Buy and sell with confidence.</p>
          <div className="flex gap-2">
            <span className="w-6 h-3 bg-ethiopian-green rounded-sm" />
            <span className="w-6 h-3 bg-ethiopian-yellow rounded-sm" />
            <span className="w-6 h-3 bg-ethiopian-red rounded-sm" />
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Quick Links</h4>
          <ul className="space-y-2 text-sm opacity-80">
            {[['/', 'Home'], ['/products', 'Browse Products'], ['/create-listing', 'Sell an Item'], ['/about', 'About Us']].map(([to, label]) => (
              <li key={to}><Link to={to} className="hover:opacity-100 hover:underline">{label}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Support</h4>
          <ul className="space-y-2 text-sm opacity-80">
            {[['/faq', 'FAQ'], ['/terms', 'Terms of Service'], ['/privacy', 'Privacy Policy']].map(([to, label]) => (
              <li key={to}><Link to={to} className="hover:opacity-100 hover:underline">{label}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Contact</h4>
          <ul className="space-y-2 text-sm opacity-80">
            <li>📞 +251 911 111 111</li>
            <li>✉️ support@tena.et</li>
            <li>📍 Bole, Addis Ababa</li>
          </ul>
          <div className="mt-4 p-3 bg-white/10 rounded-lg text-xs">
            <div className="font-semibold mb-1">🔒 Secure Payments</div>
            <div className="opacity-80">All payments protected by escrow</div>
          </div>
        </div>
      </div>
    </div>
    <div className="border-t border-white/20 py-4">
      <div className="container-custom text-center text-sm opacity-60">
        © {new Date().getFullYear()} SecondLoop Ecommerce (ተና). All rights reserved.
      </div>
    </div>
  </footer>
);
export default Footer;

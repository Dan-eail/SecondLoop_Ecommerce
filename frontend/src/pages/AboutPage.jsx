import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const AboutPage = () => (
  <>
    <Helmet><title>About Us | ተና SecondLoop</title></Helmet>
    <div className="container-custom py-16 max-w-4xl">
      <div className="text-center mb-12">
        <span className="text-5xl font-bold text-primary-orange font-amharic">ተና</span>
        <h1 className="text-4xl font-bold mt-3 mb-4">About SecondLoop</h1>
        <p className="text-xl text-gray-500">Ethiopia's Trusted Marketplace for Used Goods</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white rounded-2xl shadow-md p-8">
          <h2 className="text-2xl font-bold mb-4 text-primary-orange">Our Mission</h2>
          <p className="text-gray-600 leading-relaxed">ተና (TENA) was built to create a safe, transparent, and trustworthy marketplace for Ethiopians to buy and sell used goods. We believe in giving products a second life while protecting both buyers and sellers with our escrow payment system.</p>
        </div>
        <div className="bg-white rounded-2xl shadow-md p-8">
          <h2 className="text-2xl font-bold mb-4 text-primary-green">Our Story</h2>
          <p className="text-gray-600 leading-relaxed">Founded in Addis Ababa, ተና was created to solve the trust problem in online C2C transactions in Ethiopia. By integrating Telebirr escrow payments, phone verification, and a seller rating system, we've made it safe to buy and sell used items nationwide.</p>
        </div>
      </div>
      <div className="bg-primary-brown text-white rounded-2xl p-10 text-center mb-12">
        <h2 className="text-2xl font-bold mb-8">Why Choose ተና?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[
            { icon: '🔒', title: 'Escrow Protection', desc: 'Payments held safely until you confirm receipt of your item' },
            { icon: '✅', title: 'Verified Sellers', desc: 'All users verified with Ethiopian phone numbers and ratings' },
            { icon: '🇪🇹', title: 'Local & Trusted', desc: 'Built specifically for the Ethiopian market with Telebirr integration' },
          ].map(({ icon, title, desc }) => (
            <div key={title}>
              <div className="text-4xl mb-3">{icon}</div>
              <h3 className="font-bold text-lg mb-2">{title}</h3>
              <p className="text-sm opacity-80">{desc}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Ready to Start?</h2>
        <p className="text-gray-500 mb-6">Join thousands of Ethiopians buying and selling safely on ተና</p>
        <div className="flex gap-4 justify-center">
          <Link to="/register" className="btn-primary">Create Account</Link>
          <Link to="/products" className="btn-outline">Browse Products</Link>
        </div>
      </div>
    </div>
  </>
);
export default AboutPage;

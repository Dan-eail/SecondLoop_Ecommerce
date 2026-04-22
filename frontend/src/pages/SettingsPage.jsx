import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../hooks/useAuth';
import { FiBell, FiLock, FiGlobe, FiShield } from 'react-icons/fi';

const SettingsPage = () => {
  const { user } = useAuth();
  return (
    <>
      <Helmet><title>Settings | ተና SecondLoop</title></Helmet>
      <div className="max-w-xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        {[
          { icon: FiBell, title: 'Notifications', desc: 'Manage email and SMS notifications', items: ['Order updates', 'New messages', 'Price alerts', 'Promotions'] },
          { icon: FiLock, title: 'Security', desc: 'Password and account security', items: ['Change password', 'Two-factor authentication', 'Login history'] },
          { icon: FiGlobe, title: 'Language & Region', desc: 'Language and display preferences', items: ['Display language (EN / አማርኛ)', 'Currency display', 'Date format'] },
          { icon: FiShield, title: 'Privacy', desc: 'Control your privacy settings', items: ['Show phone number to buyers', 'Show email address', 'Profile visibility'] },
        ].map(({ icon: Icon, title, desc, items }) => (
          <div key={title} className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                <Icon size={20} className="text-primary-orange" />
              </div>
              <div>
                <h3 className="font-bold">{title}</h3>
                <p className="text-xs text-gray-400">{desc}</p>
              </div>
            </div>
            <div className="space-y-2">
              {items.map(item => (
                <div key={item} className="flex items-center justify-between py-2 border-b last:border-0">
                  <span className="text-sm text-gray-600">{item}</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-orange"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};
export default SettingsPage;

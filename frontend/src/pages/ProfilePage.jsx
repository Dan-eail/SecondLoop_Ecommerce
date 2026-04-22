import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { useAuth } from '../hooks/useAuth';
import RatingStars from '../components/common/RatingStars';
import { FiUser, FiPhone, FiMail, FiMapPin, FiSave } from 'react-icons/fi';

const CITIES = ['Addis Ababa', 'Dire Dawa', 'Hawassa', 'Bahir Dar', 'Mekelle', 'Gondar', 'Adama', 'Jimma'];

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { name: user?.name, email: user?.email, city: user?.location?.city, subcity: user?.location?.subcity },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    await updateProfile({ name: data.name, email: data.email, location: { city: data.city, subcity: data.subcity, ...user?.location } });
    setLoading(false);
  };

  return (
    <>
      <Helmet><title>My Profile | ተና SecondLoop</title></Helmet>
      <div className="max-w-xl mx-auto">
        <div className="bg-gradient-to-r from-primary-orange to-orange-600 text-white rounded-2xl p-8 mb-6 text-center">
          <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold mx-auto mb-3">{user?.name?.[0]}</div>
          <h2 className="text-xl font-bold">{user?.name}</h2>
          <p className="text-sm opacity-80 mt-1">{user?.phone}</p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <RatingStars rating={user?.rating || 0} size={16} />
            <span className="text-sm opacity-90">({user?.totalReviews || 0} reviews)</span>
          </div>
          <div className="flex justify-center gap-6 mt-4 text-center">
            <div><p className="text-xl font-bold">{user?.totalListings || 0}</p><p className="text-xs opacity-70">Listings</p></div>
            <div><p className="text-xl font-bold">{user?.totalSales || 0}</p><p className="text-xs opacity-70">Sales</p></div>
            <div><p className="text-xl font-bold">{user?.totalPurchases || 0}</p><p className="text-xs opacity-70">Purchases</p></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="font-bold text-lg mb-5 flex items-center gap-2"><FiUser size={20} className="text-primary-orange" /> Edit Profile</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {[
              { name: 'name', label: 'Full Name', icon: FiUser, type: 'text', placeholder: 'Your name', rules: { required: 'Required', minLength: { value: 2, message: 'Min 2 chars' } } },
              { name: 'email', label: 'Email (optional)', icon: FiMail, type: 'email', placeholder: 'your@email.com', rules: {} },
            ].map(({ name, label, icon: Icon, type, placeholder, rules }) => (
              <div key={name}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
                <div className="relative">
                  <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type={type} placeholder={placeholder} className={`input-field pl-10 ${errors[name] ? 'border-red-400' : ''}`} {...register(name, rules)} />
                </div>
                {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name].message}</p>}
              </div>
            ))}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
                <select className="input-field" {...register('city')}>
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Subcity / Area</label>
                <input type="text" placeholder="e.g. Bole" className="input-field" {...register('subcity')} />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2 mt-2">
              <FiSave size={18} /> {loading ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6 mt-4">
          <h3 className="font-bold mb-3">Account Status</h3>
          <div className="space-y-2 text-sm">
            {[
              ['Phone', user?.isPhoneVerified ? '✅ Verified' : '❌ Not Verified'],
              ['Email', user?.isEmailVerified ? '✅ Verified' : '❌ Not Verified'],
              ['Identity', user?.isIdentityVerified ? '✅ Verified' : '⏳ Not Verified'],
              ['Account Role', user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between py-1.5 border-b last:border-0">
                <span className="text-gray-500">{label}</span>
                <span className="font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
export default ProfilePage;

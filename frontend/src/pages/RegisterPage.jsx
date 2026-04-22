import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useAuth } from '../hooks/useAuth';
import { FiUser, FiPhone, FiLock, FiMapPin, FiEye, FiEyeOff } from 'react-icons/fi';

const CITIES = ['Addis Ababa', 'Dire Dawa', 'Hawassa', 'Bahir Dar', 'Mekelle', 'Gondar', 'Adama', 'Jimma'];

const RegisterPage = () => {
  const { register: authRegister } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [phone, setPhoneState] = useState('');
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch('password');

  const onSubmit = async (data) => {
    setLoading(true);
    const result = await authRegister({ phone: data.phone, name: data.name, password: data.password, city: data.city });
    setLoading(false);
    if (result.success) {
      setPhoneState(data.phone);
      navigate('/verify-phone', { state: { phone: data.phone } });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center py-12 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <span className="text-4xl font-bold text-primary-orange font-amharic">ተና</span>
          <h2 className="text-2xl font-bold text-gray-900 mt-2">Create Account</h2>
          <p className="text-sm text-gray-500 mt-1">Join Ethiopia's trusted marketplace</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
            <div className="relative">
              <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="text" placeholder="Your full name" className={`input-field pl-10 ${errors.name ? 'border-red-400' : ''}`}
                {...register('name', { required: 'Name required', minLength: { value: 2, message: 'Min 2 characters' } })} />
            </div>
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
            <div className="relative">
              <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="tel" placeholder="+251912345678" className={`input-field pl-10 ${errors.phone ? 'border-red-400' : ''}`}
                {...register('phone', { required: 'Phone required', pattern: { value: /^\+251[0-9]{9}$/, message: 'Use format: +251XXXXXXXXX' } })} />
            </div>
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
            <div className="relative">
              <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <select className="input-field pl-10 appearance-none" {...register('city', { required: 'City required' })}>
                <option value="">Select city</option>
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type={showPwd ? 'text' : 'password'} placeholder="Min 6 characters" className={`input-field pl-10 pr-10 ${errors.password ? 'border-red-400' : ''}`}
                {...register('password', { required: 'Password required', minLength: { value: 6, message: 'Min 6 characters' } })} />
              <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPwd ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type={showPwd ? 'text' : 'password'} placeholder="Repeat password" className={`input-field pl-10 ${errors.confirmPassword ? 'border-red-400' : ''}`}
                {...register('confirmPassword', { required: 'Please confirm password', validate: val => val === password || 'Passwords do not match' })} />
            </div>
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base mt-2">
            {loading ? <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-orange font-semibold hover:underline">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
};
export default RegisterPage;

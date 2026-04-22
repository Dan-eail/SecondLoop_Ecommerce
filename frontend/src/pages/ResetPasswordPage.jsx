import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

const ResetPasswordPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch('newPassword');

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await authService.resetPassword(data.phone, data.otp, data.newPassword);
      toast.success('Password reset! Please login.');
      navigate('/login');
    } catch (e) { toast.error(e.response?.data?.error?.message || 'Reset failed'); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center py-12 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🔒</div>
          <h2 className="text-2xl font-bold">Reset Password</h2>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {[
            { name: 'phone', label: 'Phone Number', type: 'tel', placeholder: '+251912345678', rules: { required: 'Phone required' } },
            { name: 'otp', label: 'OTP Code', type: 'text', placeholder: '6-digit code', rules: { required: 'OTP required', minLength: { value: 6, message: '6 digits required' } } },
            { name: 'newPassword', label: 'New Password', type: 'password', placeholder: 'Min 6 chars', rules: { required: 'Password required', minLength: { value: 6, message: 'Min 6 characters' } } },
            { name: 'confirmPassword', label: 'Confirm Password', type: 'password', placeholder: 'Repeat password', rules: { required: 'Confirm password', validate: v => v === password || 'Passwords do not match' } },
          ].map(({ name, label, type, placeholder, rules }) => (
            <div key={name}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
              <input type={type} placeholder={placeholder} className={`input-field ${errors[name] ? 'border-red-400' : ''}`} {...register(name, rules)} />
              {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name].message}</p>}
            </div>
          ))}
          <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 mt-2">
            {loading ? 'Resetting…' : 'Reset Password'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">
          <Link to="/login" className="text-primary-orange hover:underline">Back to Login</Link>
        </p>
      </motion.div>
    </div>
  );
};
export default ResetPasswordPage;

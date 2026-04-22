import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';
import { FiPhone } from 'react-icons/fi';

const ForgotPasswordPage = () => {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try { await authService.forgotPassword(data.phone); setSent(true); toast.success('OTP sent!'); }
    catch (e) { toast.error(e.response?.data?.error?.message || 'Error sending OTP'); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center py-12 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🔑</div>
          <h2 className="text-2xl font-bold">Forgot Password?</h2>
          <p className="text-sm text-gray-500 mt-2">Enter your phone number to reset your password</p>
        </div>
        {sent ? (
          <div className="text-center">
            <div className="text-5xl mb-4">📨</div>
            <p className="text-green-600 font-medium mb-4">OTP sent! Check your phone.</p>
            <Link to="/reset-password" className="btn-primary block text-center">Enter OTP & Reset Password</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
              <div className="relative">
                <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type="tel" placeholder="+251912345678" className={`input-field pl-10 ${errors.phone ? 'border-red-400' : ''}`}
                  {...register('phone', { required: 'Phone required', pattern: { value: /^\+251[0-9]{9}$/, message: 'Use +251XXXXXXXXX format' } })} />
              </div>
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
              {loading ? 'Sending…' : 'Send Reset Code'}
            </button>
          </form>
        )}
        <p className="text-center text-sm text-gray-500 mt-6">
          Remember your password? <Link to="/login" className="text-primary-orange font-semibold hover:underline">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
};
export default ForgotPasswordPage;

import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const VerifyPhonePage = () => {
  const { verifyOTP } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const phone = location.state?.phone || '';
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const inputs = useRef([]);

  const handleChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[i] = val;
    setOtp(next);
    if (val && i < 5) inputs.current[i + 1]?.focus();
    if (next.every(d => d) && next.join('').length === 6) handleSubmit(next.join(''));
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) inputs.current[i - 1]?.focus();
  };

  const handleSubmit = async (code) => {
    const pin = code || otp.join('');
    if (pin.length !== 6) { toast.error('Enter 6-digit OTP'); return; }
    setLoading(true);
    const result = await verifyOTP(phone, pin);
    setLoading(false);
    if (result.success) navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center py-12 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="text-5xl mb-4">📱</div>
        <h2 className="text-2xl font-bold mb-2">Verify Your Phone</h2>
        <p className="text-gray-500 mb-2 text-sm">We sent a 6-digit code to</p>
        <p className="font-semibold text-primary-orange mb-8">{phone}</p>

        <div className="flex justify-center gap-3 mb-8">
          {otp.map((digit, i) => (
            <input key={i} ref={el => inputs.current[i] = el} type="text" maxLength={1} value={digit}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-orange focus:ring-2 focus:ring-orange-100 transition"
            />
          ))}
        </div>

        <button onClick={() => handleSubmit()} disabled={loading || otp.join('').length !== 6}
          className="btn-primary w-full py-3.5 text-base mb-4">
          {loading ? <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Verify OTP'}
        </button>

        <p className="text-sm text-gray-500">
          Didn't receive the code?{' '}
          <button className="text-primary-orange hover:underline font-medium">Resend OTP</button>
        </p>
        <p className="text-xs text-gray-400 mt-2">Code expires in 10 minutes</p>
      </motion.div>
    </div>
  );
};
export default VerifyPhonePage;

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { z } from 'zod';
import { Input, Button } from '../../components/UI';
import { AlertCircle, UserPlus, User, Mail, Lock, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});

type RegisterFormFields = z.infer<typeof schema>;

const PasswordStrengthBar: React.FC<{ password: string }> = ({ password }) => {
  const getStrength = () => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const strength = getStrength();
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['', 'bg-red-500', 'bg-amber-500', 'bg-blue-500', 'bg-emerald-500'];

  if (!password) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-1.5 mt-1"
    >
      <div className="flex gap-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i < strength ? colors[strength] : 'bg-white/10'
            }`}
          />
        ))}
      </div>
      <span className={`text-[10px] font-bold ${colors[strength].replace('bg-', 'text-')}`}>
        {labels[strength]} Password
      </span>
    </motion.div>
  );
};

export const RegisterPage: React.FC = () => {
  const { register: registerUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [watchedPassword, setWatchedPassword] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormFields>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: RegisterFormFields) => {
    try {
      setErrorMsg(null);
      await registerUser({ email: data.email, passwordHash: data.password, name: data.name });
      toast.success('Account created successfully! Please sign in.');
      navigate('/login');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error occurred during registration.';
      setErrorMsg(msg);
      toast.error(msg);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="w-full"
    >
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="text-center flex flex-col gap-2">
          <h2 className="font-display font-black text-2xl text-white tracking-wider uppercase">
            Create Account
          </h2>
          <p className="text-silver-500 text-xs font-medium">
            Register a new client or dealership user account
          </p>
        </div>

        <div className="divider-gold" />

        {/* Perks row */}
        <div className="flex justify-center gap-5">
          {['Instant Access', 'Secure JWT', 'Free Forever'].map((perk) => (
            <div key={perk} className="flex items-center gap-1.5 text-[10px] font-bold text-silver-600 uppercase tracking-widest">
              <Check className="w-3 h-3 text-gold-500" /> {perk}
            </div>
          ))}
        </div>

        {/* Error message */}
        <AnimatePresence>
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              className="flex items-center gap-2.5 p-3.5 bg-red-500/10 border border-red-500/25 rounded-xl text-red-400 text-xs font-medium"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              {errorMsg}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="Full Name"
            type="text"
            placeholder="John Doe"
            error={errors.name?.message}
            icon={<User className="w-4 h-4" />}
            {...register('name')}
          />
          <Input
            label="Email Address"
            type="email"
            placeholder="john@dealership.com"
            error={errors.email?.message}
            icon={<Mail className="w-4 h-4" />}
            {...register('email')}
          />
          <div>
            <Input
              label="Password"
              type="password"
              placeholder="Min. 8 characters"
              error={errors.password?.message}
              icon={<Lock className="w-4 h-4" />}
              {...register('password', {
                onChange: (e) => setWatchedPassword(e.target.value),
              })}
            />
            <PasswordStrengthBar password={watchedPassword} />
          </div>

          <Button
            type="submit"
            variant="gold"
            isLoading={isSubmitting}
            className="w-full mt-2 font-black uppercase tracking-widest py-3.5 text-xs gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Create Account
          </Button>
        </form>

        <div className="divider-gold" />

        <div className="text-center text-xs text-silver-400">
          Already have a dealership account?{' '}
          <Link to="/login" className="font-bold text-gold-400 hover:text-gold-300 transition-colors">
            Sign In Here →
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default RegisterPage;

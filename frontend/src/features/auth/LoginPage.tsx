import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { z } from 'zod';
import { Input, Button } from '../../components/UI';
import { AlertCircle, LogIn, Mail, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormFields = z.infer<typeof schema>;

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormFields>({
    resolver: zodResolver(schema),
    mode: 'onChange',
  });

  const from = (location.state as any)?.from?.pathname || '/';

  const onSubmit = async (data: LoginFormFields) => {
    try {
      setErrorMsg(null);
      await login(data.email, data.password);
      toast.success('Welcome back to DriveElite!');
      navigate(from, { replace: true });
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Invalid credentials or connection offline.';
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
            Access Account
          </h2>
          <p className="text-silver-500 text-xs font-medium">
            Enter your credentials to access the dealership portal
          </p>
        </div>

        <div className="divider-gold" />

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
            label="Email Address"
            type="email"
            placeholder="name@dealership.com"
            error={errors.email?.message}
            icon={<Mail className="w-4 h-4" />}
            {...register('email')}
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            icon={<Lock className="w-4 h-4" />}
            {...register('password')}
          />

          <Button
            type="submit"
            variant="gold"
            isLoading={isSubmitting}
            className="w-full mt-2 font-black uppercase tracking-widest py-3.5 text-xs gap-2"
          >
            <LogIn className="w-4 h-4" />
            Sign In to Portal
          </Button>
        </form>

        <div className="divider-gold" />

        <div className="text-center text-xs text-silver-400">
          Need a dealership account?{' '}
          <Link to="/register" className="font-bold text-gold-400 hover:text-gold-300 transition-colors">
            Register Here →
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default LoginPage;

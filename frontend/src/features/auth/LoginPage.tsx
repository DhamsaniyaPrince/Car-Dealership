import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { z } from 'zod';
import { Input, Button } from '../../components/UI';
import { AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

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
      toast.success('Welcome back!');
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
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="text-center flex flex-col gap-1.5">
          <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
            Sign In
          </h2>
          <p className="text-slate-400 text-xs">
            Enter your credentials to access your dealership dashboard
          </p>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 p-3 bg-red-955/35 border border-red-500/50 rounded-lg text-red-200 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="name@dealership.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />

          <Button
            type="submit"
            variant="accent"
            isLoading={isSubmitting}
            className="w-full mt-2 font-bold uppercase tracking-wider py-3"
          >
            Access Account
          </Button>
        </form>

        <div className="text-center text-xs text-slate-400 border-t border-slate-100 dark:border-brand-850 pt-4">
          Need a dealership account?{' '}
          <Link
            to="/register"
            className="font-bold text-brand-600 hover:text-brand-500 dark:text-accent-400 dark:hover:text-accent-300 transition-colors"
          >
            Register Here
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default LoginPage;

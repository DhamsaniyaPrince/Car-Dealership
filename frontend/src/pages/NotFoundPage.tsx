import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Compass, ArrowLeft } from 'lucide-react';
import { Button } from '../components/UI';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', duration: 0.5 }}
        className="flex flex-col items-center gap-6 max-w-md"
      >
        <div className="w-20 h-20 bg-accent-500/10 rounded-full flex items-center justify-center text-accent-500 animate-bounce">
          <Compass className="w-10 h-10" />
        </div>
        <div>
          <h1 className="text-6xl font-black text-slate-800 dark:text-white tracking-wider">404</h1>
          <h2 className="text-xl font-bold text-slate-700 dark:text-slate-250 mt-2">
            Lost in Transit
          </h2>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
        </div>
        <Link to="/" className="mt-2">
          <Button variant="accent" className="gap-2 font-bold uppercase tracking-wider text-xs px-6">
            <ArrowLeft className="w-4 h-4" /> Back to Safety
          </Button>
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;

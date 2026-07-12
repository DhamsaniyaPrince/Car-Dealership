import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Car, Shield, Zap } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-obsidian-950 relative overflow-hidden">
      {/* Animated gradient orbs */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold-500/20 rounded-full filter blur-[100px] pointer-events-none"
      />
      <motion.div
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-brand-600/15 rounded-full filter blur-[120px] pointer-events-none"
      />
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.08, 0.15, 0.08] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold-600/8 rounded-full filter blur-[150px] pointer-events-none"
      />

      {/* Light streak decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear', delay: 1 }}
          className="absolute top-1/3 left-0 w-96 h-px bg-gradient-to-r from-transparent via-gold-500/40 to-transparent"
        />
        <motion.div
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear', delay: 4 }}
          className="absolute top-2/3 left-0 w-64 h-px bg-gradient-to-r from-transparent via-brand-500/30 to-transparent"
        />
      </div>

      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -20, 0],
            opacity: [0.3, 0.7, 0.3],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 4 + i * 0.7,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.8,
          }}
          className="absolute rounded-full bg-gold-500/40"
          style={{
            width: 3 + (i % 3),
            height: 3 + (i % 3),
            left: `${10 + i * 15}%`,
            top: `${15 + (i % 4) * 20}%`,
          }}
        />
      ))}

      {/* Grid lines decoration */}
      <div
        className="absolute inset-0 pointer-events-none opacity-3"
        style={{
          backgroundImage: 'linear-gradient(rgba(201,168,76,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.07) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10"
      >
        {/* Brand header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col items-center mb-8"
        >
          <Link to="/" className="flex items-center gap-3 mb-3 group">
            <motion.div
              whileHover={{ rotate: 10, scale: 1.1 }}
              transition={{ duration: 0.3 }}
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gold-500 to-gold-700 flex items-center justify-center shadow-gold-md"
            >
              <Car className="w-6 h-6 text-obsidian-900" />
            </motion.div>
            <span className="font-display font-black text-2xl text-white tracking-widest">
              DRIVE<span className="text-gradient-gold">ELITE</span>
            </span>
          </Link>
          <div className="divider-gold w-32 my-2" />
          <p className="text-xs text-silver-500 font-semibold uppercase tracking-[0.2em]">
            Premium Automotive Platform
          </p>
        </motion.div>

        {/* Auth form card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="glass-gold rounded-2xl shadow-premium p-8 border border-gold-500/10"
          style={{ boxShadow: '0 25px 80px -15px rgba(0,0,0,0.7), 0 0 0 1px rgba(201,168,76,0.08)' }}
        >
          {/* Top accent line */}
          <div className="h-px bg-gradient-to-r from-transparent via-gold-500/50 to-transparent mb-8 -mx-8 mt-0" />
          <Outlet />
        </motion.div>

        {/* Trust signals */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex items-center justify-center gap-6 mt-6"
        >
          {[
            { icon: Shield, label: 'JWT Secured' },
            { icon: Zap, label: 'Instant Access' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-1.5 text-silver-600 text-xs font-medium">
              <Icon className="w-3.5 h-3.5 text-gold-600" />
              {label}
            </div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

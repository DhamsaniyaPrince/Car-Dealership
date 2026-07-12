import React, { useState } from 'react';
import { useToast } from '../context/ToastContext';
import { Button, Card } from '../components/UI';
import { Mail, Phone, MapPin, Clock, MessageSquare, Send } from 'lucide-react';
import { motion } from 'framer-motion';

export const ContactPage: React.FC = () => {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      toast.error('Please fill out all contact fields.');
      return;
    }

    setSending(true);
    setTimeout(() => {
      setSending(false);
      toast.success('Your message has been dispatched to our sales representatives!');
      setName('');
      setEmail('');
      setMessage('');
    }, 1200);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-10">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-brand-900 pb-5">
        <h1 className="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tight">
          Contact DriveElite
        </h1>
        <p className="text-slate-400 text-xs mt-1 font-semibold">
          Get in touch with our sales representatives or schedule a customized fleet demonstration.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Left Column: Form */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col gap-6"
        >
          <Card hoverEffect={false} className="bg-white dark:bg-brand-900 border border-slate-200/50 p-6 shadow-sm">
            <h2 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-brand-600 dark:text-accent-500" /> Send Message
            </h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xxs font-bold uppercase tracking-wider text-slate-500">Your Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-brand-950 border border-slate-200 dark:border-brand-800 rounded-lg text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none focus:ring-offset-0 placeholder-slate-400 focus:border-brand-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xxs font-bold uppercase tracking-wider text-slate-500">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@dealership.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-brand-950 border border-slate-200 dark:border-brand-800 rounded-lg text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none focus:ring-offset-0 placeholder-slate-400 focus:border-brand-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xxs font-bold uppercase tracking-wider text-slate-500">Message Description</label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can we assist you? Include details of specific vehicle models..."
                  className="w-full p-3.5 bg-slate-50 dark:bg-brand-950 border border-slate-200 dark:border-brand-800 rounded-lg text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none focus:ring-offset-0 placeholder-slate-400 focus:border-brand-500"
                />
              </div>

              <Button
                type="submit"
                disabled={sending}
                isLoading={sending}
                variant="accent"
                className="font-bold uppercase text-xs tracking-wider py-3 mt-2 gap-1.5 w-fit px-8"
              >
                <Send className="w-4 h-4" /> Send Message
              </Button>
            </form>
          </Card>

          {/* Operating hours */}
          <Card hoverEffect={false} className="bg-white dark:bg-brand-900 border border-slate-200/50 p-6 shadow-sm">
            <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" /> Business Operating Hours
            </h3>
            <div className="flex flex-col gap-2.5 text-xs font-semibold text-slate-655 dark:text-slate-350">
              <div className="flex justify-between border-b border-slate-50 dark:border-brand-950 pb-2">
                <span>Monday - Friday</span>
                <span>9:00 AM - 7:00 PM EST</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 dark:border-brand-950 pb-2">
                <span>Saturday</span>
                <span>10:00 AM - 5:00 PM EST</span>
              </div>
              <div className="flex justify-between">
                <span>Sunday</span>
                <span className="text-red-500 font-bold uppercase">Closed</span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Right Column: Address and Map Info */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col gap-6"
        >
          {/* Quick contact tags */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card hoverEffect={false} className="p-4 flex flex-col gap-2 items-center text-center bg-white dark:bg-brand-900 border border-slate-200/50">
              <Phone className="w-5 h-5 text-brand-600 dark:text-accent-500" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phone Support</span>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">+1 (800) 555-0192</span>
            </Card>
            <Card hoverEffect={false} className="p-4 flex flex-col gap-2 items-center text-center bg-white dark:bg-brand-900 border border-slate-200/50">
              <Mail className="w-5 h-5 text-brand-600 dark:text-accent-500" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Enquiries</span>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">sales@driveelite.com</span>
            </Card>
            <Card hoverEffect={false} className="p-4 flex flex-col gap-2 items-center text-center bg-white dark:bg-brand-900 border border-slate-200/50">
              <MapPin className="w-5 h-5 text-brand-600 dark:text-accent-500" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Headquarters</span>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">New York City, NY</span>
            </Card>
          </div>

          {/* Map box */}
          <Card hoverEffect={false} className="bg-brand-950 border border-brand-850 p-0 overflow-hidden relative shadow-md">
            {/* Custom Glowing SVG Map */}
            <div className="h-96 w-full bg-slate-950 relative flex items-center justify-center overflow-hidden">
              <svg viewBox="0 0 1000 600" className="w-full h-full opacity-30 absolute inset-0">
                {/* Simulated World/US grid */}
                <path d="M 100,50 L 900,50 M 100,150 L 900,150 M 100,250 L 900,250 M 100,350 L 900,350 M 100,450 L 900,450 M 100,550 L 900,550" stroke="#1e293b" strokeWidth="1" strokeDasharray="5,5" />
                <path d="M 150,50 L 150,550 M 300,50 L 300,550 M 450,50 L 450,550 M 600,50 L 600,550 M 750,50 L 750,550 M 900,50 L 900,550" stroke="#1e293b" strokeWidth="1" strokeDasharray="5,5" />
                
                {/* Glowing paths connecting showrooms */}
                <path d="M 250,380 Q 500,200 800,220" fill="none" stroke="url(#glowingGradient)" strokeWidth="2" strokeDasharray="10,10" className="animate-[dash_10s_linear_infinite]" />
                <path d="M 500,200 Q 650,400 800,220" fill="none" stroke="url(#glowingGradient)" strokeWidth="2" strokeDasharray="8,8" />

                <defs>
                  <linearGradient id="glowingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4f46e5" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Showroom markers */}
              {/* NYC Showroom */}
              <div className="absolute top-[220px] left-[800px] flex flex-col items-center">
                <span className="w-3.5 h-3.5 bg-accent-500 rounded-full animate-ping absolute" />
                <span className="w-3 h-3 bg-accent-500 rounded-full border border-white relative z-10" />
                <span className="text-[10px] font-black uppercase text-white tracking-widest mt-1.5 px-2 py-0.5 bg-slate-900/90 rounded border border-slate-800">
                  New York Showroom
                </span>
              </div>

              {/* Chicago Center */}
              <div className="absolute top-[200px] left-[500px] flex flex-col items-center">
                <span className="w-3 h-3 bg-brand-500 rounded-full border border-white relative z-10" />
                <span className="text-[10px] font-black uppercase text-white tracking-widest mt-1.5 px-2 py-0.5 bg-slate-900/90 rounded border border-slate-800">
                  Chicago Center
                </span>
              </div>

              {/* LA Hub */}
              <div className="absolute top-[380px] left-[250px] flex flex-col items-center">
                <span className="w-3 h-3 bg-indigo-500 rounded-full border border-white relative z-10" />
                <span className="text-[10px] font-black uppercase text-white tracking-widest mt-1.5 px-2 py-0.5 bg-slate-900/90 rounded border border-slate-800">
                  Los Angeles Hub
                </span>
              </div>
            </div>
            
            <div className="p-5 border-t border-brand-850 bg-brand-900/40 text-center">
              <span className="text-xxs font-extrabold uppercase text-slate-400 tracking-wider">
                DriveElite Dealership Coordinates
              </span>
              <p className="text-slate-500 text-xxs mt-0.5">NYC Showroom: 100 Elite Drive, Suite 500, New York, NY 10001</p>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Card, Button, Badge } from '../components/UI';
import {
  ArrowRight,
  Gauge,
  ShieldCheck,
  BadgePercent,
  Zap,
  Sparkles,
  ChevronDown,
  Mail,
  DollarSign,
  Calendar,
  Percent,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const HomePage: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'all' | 'electric' | 'suv' | 'luxury' | 'sports'>('all');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [faqOpen, setFaqOpen] = useState<Record<number, boolean>>({});

  // Finance Calculator States
  const [vehiclePrice, setVehiclePrice] = useState(50000);
  const [downPayment, setDownPayment] = useState(10000);
  const [interestRate, setInterestRate] = useState(4.9);
  const [loanTerm, setLoanTerm] = useState(60);

  // Query database listings
  const { data: vehicles, isLoading } = useQuery({
    queryKey: ['homepageVehiclesList'],
    queryFn: async () => {
      const res = await api.get('/vehicles', { params: { limit: 100 } });
      return res.data.data.vehicles;
    },
  });

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }
    toast.success('Thank you for subscribing to DriveElite updates!');
    setNewsletterEmail('');
  };

  const toggleFaq = (index: number) => {
    setFaqOpen((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  // Filter logic based on database content
  const getFilteredVehicles = () => {
    if (!vehicles) return [];
    switch (activeTab) {
      case 'electric':
        return vehicles.filter((v: any) => v.category.toLowerCase().includes('electric')).slice(0, 4);
      case 'suv':
        return vehicles.filter((v: any) => v.category.toLowerCase().includes('suv')).slice(0, 4);
      case 'luxury':
        return vehicles.filter((v: any) => Number(v.price) > 50000).slice(0, 4);
      case 'sports':
        return vehicles.filter((v: any) => v.category.toLowerCase().includes('sport')).slice(0, 4);
      default:
        return vehicles.slice(0, 4);
    }
  };

  // Finance Calculation Logic
  const calculateMonthlyPayment = () => {
    const principal = vehiclePrice - downPayment;
    if (principal <= 0) return 0;
    const monthlyRate = interestRate / 100 / 12;
    const numberOfPayments = loanTerm;
    if (monthlyRate === 0) return principal / numberOfPayments;
    const payment =
      (principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    return isNaN(payment) ? 0 : payment;
  };

  const filteredList = getFilteredVehicles();

  const brandLogos = [
    { name: 'Porsche', icon: 'porsche' },
    { name: 'Tesla', icon: 'tesla' },
    { name: 'BMW', icon: 'bmw' },
    { name: 'Mercedes', icon: 'mercedes' },
    { name: 'Audi', icon: 'audi' },
  ];

  const offers = [
    {
      title: 'Summer Performance Event',
      badge: 'Limited Time',
      desc: 'Exclusive 2.9% APR financing available on certified pre-owned electric models.',
      cta: 'Explore Offer',
    },
    {
      title: 'Luxury Lease Program',
      badge: 'Lease Special',
      desc: 'Drive the Taycan series starting from $999/month with low down-payment options.',
      cta: 'Calculate Lease',
    },
  ];

  const stats = [
    { label: 'Active Fleet Listings', value: '1,200+' },
    { label: 'Annual Client Sales', value: '4,800+' },
    { label: 'Escrow Transactions', value: '$120M+' },
    { label: 'Customer Satisfaction', value: '99.4%' },
  ];

  const testimonials = [
    {
      quote: "The purchasing process was completely seamless. DriveElite's dynamic finance widget was accurate to the dollar, and pickup took under 15 minutes.",
      name: "Marcus Vance",
      title: "Tesla Model S Owner",
    },
    {
      quote: "Administrative control of our dealership inventory has never been cleaner. Decoupled catalog updates and restocks keep our showrooms fully synchronized.",
      name: "Helena Rostova",
      title: "General Manager, DriveElite NY",
    },
  ];

  const faqItems = [
    {
      q: 'How does DriveElite verify vehicle histories?',
      a: 'Every vehicle undergoes an extensive 150-point mechanical check alongside CARFAX verification before being listed in our database.',
    },
    {
      q: 'What financing options are available?',
      a: 'We partner with top-tier corporate lenders to provide competitive loan structures ranging from 36 to 72 months, with APR rates starting at 2.9% for qualified buyers.',
    },
    {
      q: 'Can I trade in my current vehicle?',
      a: 'Yes, we offer instant trade-in appraisals. A sales consultant will review your specifications and apply the value directly as a down payment.',
    },
  ];

  return (
    <div className="flex flex-col gap-24 pb-24 overflow-hidden">
      {/* 1. Full-Screen Parallax Hero Section */}
      <section className="relative h-[90vh] min-h-[600px] flex items-center bg-slate-950 overflow-hidden">
        {/* Parallax Image Background */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center opacity-30 mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/60 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, type: 'spring' }}
            className="flex flex-col gap-6"
          >
            <span className="inline-flex items-center gap-1.5 self-start text-xxs font-extrabold px-3 py-1 bg-brand-500/20 text-brand-300 border border-brand-500/30 rounded-full uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-accent-500 animate-pulse" /> Precision Automotive Platform
            </span>
            <h1 className="text-5xl sm:text-7xl font-black text-white leading-none tracking-tight">
              THE ELITE <br />
              <span className="bg-gradient-to-r from-brand-300 via-accent-400 to-amber-500 bg-clip-text text-transparent">
                STANDARD
              </span>
            </h1>
            <p className="text-slate-350 text-sm sm:text-base max-w-md leading-relaxed">
              Explore our curated selection of electric crossovers, hybrid SUVs, and high-performance sports cars. Built for speed, and refined for luxury.
            </p>
            <div className="flex flex-wrap gap-4 mt-2">
              <Link to="/vehicles">
                <Button variant="accent" size="lg" className="font-bold uppercase tracking-wider gap-2 px-8">
                  Explore Inventory <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <a href="#calculator">
                <Button variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/10 font-bold uppercase tracking-wider px-8">
                  Calculate Payments
                </Button>
              </a>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden sm:flex flex-col items-center gap-2 text-slate-450 z-10 select-none">
          <span className="text-xxs font-bold uppercase tracking-widest">Scroll Down</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1.5 h-6 bg-slate-500 rounded-full"
          />
        </div>
      </section>

      {/* 2. Premium Brands Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col gap-6 text-center">
        <span className="text-xxs font-bold text-slate-450 uppercase tracking-widest">
          Partnering Manufacturers
        </span>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center justify-items-center opacity-60 dark:opacity-40">
          {brandLogos.map((brand, i) => (
            <div key={i} className="text-base font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest hover:opacity-100 transition-opacity cursor-pointer duration-300">
              {brand.name}
            </div>
          ))}
        </div>
      </section>

      {/* 3. Featured Vehicles & Tab Categorized Grids */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="text-xxs font-bold text-slate-400 uppercase tracking-widest">
              Curated Showcase
            </span>
            <h2 className="text-3xl font-black text-slate-800 dark:text-white mt-1">
              Explore Luxury Fleet
            </h2>
          </div>

          {/* Navigation Tab list */}
          <div className="flex flex-wrap gap-2 bg-slate-100 dark:bg-brand-900/60 p-1.5 rounded-xl border border-slate-200/50 dark:border-brand-850 w-fit">
            {(['all', 'electric', 'suv', 'luxury', 'sports'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-xxs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === tab
                    ? 'bg-white dark:bg-brand-800 text-brand-700 dark:text-accent-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white dark:bg-brand-900 border border-slate-200 dark:border-brand-850 rounded-xl h-96 animate-pulse" />
            ))}
          </div>
        ) : filteredList.length === 0 ? (
          <div className="text-center py-20 text-slate-400 text-xs font-semibold">
            No matching models registered in this category.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredList.map((vehicle: any) => (
                <motion.div
                  key={vehicle.id}
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.25 }}
                >
                  <Card className="overflow-hidden border border-slate-250/40 p-0 flex flex-col h-full bg-white dark:bg-brand-900 relative">
                    <div className="h-48 overflow-hidden relative bg-slate-100 dark:bg-brand-950">
                      <img
                        src="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80"
                        alt={`${vehicle.make} ${vehicle.model}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                      <Badge variant="primary" className="absolute top-3 left-3">
                        {vehicle.category}
                      </Badge>
                    </div>
                    <div className="p-5 flex flex-col gap-4 flex-grow">
                      <div>
                        <h3 className="text-base font-bold text-slate-800 dark:text-white leading-snug">
                          {vehicle.make} {vehicle.model}
                        </h3>
                        <p className="text-lg font-black text-brand-600 dark:text-accent-500 mt-1">
                          ${Number(vehicle.price).toLocaleString()}
                        </p>
                      </div>
                      <div className="grid grid-cols-1 gap-1.5 border-t border-slate-100 dark:border-brand-850 pt-3 text-xxs font-semibold uppercase tracking-wider text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Gauge className="w-3.5 h-3.5 text-slate-400" />
                          <span>Stock: {vehicle.quantity} units</span>
                        </div>
                      </div>
                      <Link to={`/vehicles/${vehicle.id}`} className="mt-2 w-full">
                        <Button variant="secondary" className="w-full text-xs font-bold uppercase tracking-wider py-2.5">
                          View details
                        </Button>
                      </Link>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>

      {/* 4. Latest Offers Promotion Section */}
      <section className="bg-slate-900 dark:bg-brand-950 border-y border-slate-850 py-20 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-12">
          <div className="text-center">
            <span className="text-xxs font-bold text-accent-500 uppercase tracking-widest">
              Limited Opportunities
            </span>
            <h2 className="text-3xl font-black text-white mt-1">
              Active Dealership Offers
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {offers.map((offer, idx) => (
              <div key={idx} className="p-8 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col gap-4 hover:border-brand-500/50 transition-all duration-300">
                <Badge variant="warning" className="self-start">{offer.badge}</Badge>
                <h3 className="text-lg font-bold text-white leading-snug">{offer.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{offer.desc}</p>
                <Link to="/vehicles" className="self-start mt-2">
                  <Button variant="outline" size="sm" className="border-slate-700 text-white hover:bg-slate-800">
                    {offer.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Statistics Count Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full grid grid-cols-2 md:grid-cols-4 gap-8 justify-items-center">
        {stats.map((stat, i) => (
          <div key={i} className="text-center flex flex-col gap-1">
            <span className="text-3xl sm:text-4xl font-black text-brand-600 dark:text-accent-500 tracking-tight">
              {stat.value}
            </span>
            <span className="text-xxs font-bold text-slate-500 uppercase tracking-widest">
              {stat.label}
            </span>
          </div>
        ))}
      </section>

      {/* 6. Why Choose Us Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col gap-12 text-center">
        <div>
          <span className="text-xxs font-bold text-slate-400 uppercase tracking-widest">
            DriveElite Standards
          </span>
          <h2 className="text-3xl font-black text-slate-800 dark:text-white mt-1">
            Engineered For Perfection
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card hoverEffect className="bg-white border border-slate-200/50 p-8 flex flex-col items-center gap-4 text-center">
            <div className="w-12 h-12 bg-accent-500/10 rounded-xl flex items-center justify-center text-accent-500 mb-2">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white">Certified Protection</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs">
              Every listing undergoes our rigorous 150-point mechanical evaluation before publishing to the showroom.
            </p>
          </Card>

          <Card hoverEffect className="bg-white border border-slate-200/50 p-8 flex flex-col items-center gap-4 text-center">
            <div className="w-12 h-12 bg-brand-500/10 rounded-xl flex items-center justify-center text-brand-600 dark:text-brand-400 mb-2">
              <BadgePercent className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white">Structured Financing</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs">
              We coordinate with leading financial institutions to outline APR lending options customized to your targets.
            </p>
          </Card>

          <Card hoverEffect className="bg-white border border-slate-200/50 p-8 flex flex-col items-center gap-4 text-center">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-2">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white">Decoupled Processing</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs">
              Secure in-memory authentication states confirm sales transactions and log records within milliseconds.
            </p>
          </Card>
        </div>
      </section>

      {/* 7. Interactive Finance Calculator Section */}
      <section id="calculator" className="bg-slate-100 dark:bg-brand-900/30 py-20 w-full border-y border-slate-200/50 dark:border-brand-850">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-12">
          <div className="text-center">
            <span className="text-xxs font-bold text-slate-450 uppercase tracking-widest">
              Financial Estimations
            </span>
            <h2 className="text-3xl font-black text-slate-800 dark:text-white mt-1">
              Loan Calculator
            </h2>
          </div>

          <Card hoverEffect={false} className="bg-white dark:bg-brand-900 border border-slate-250/50 p-8 grid grid-cols-1 md:grid-cols-2 gap-8 shadow-md">
            {/* Slide inputs */}
            <div className="flex flex-col gap-6">
              {/* Price Slide */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-xs font-bold text-slate-655 dark:text-slate-300">
                  <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" /> Vehicle Price</span>
                  <span>${vehiclePrice.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="15000"
                  max="150000"
                  step="1000"
                  value={vehiclePrice}
                  onChange={(e) => setVehiclePrice(Number(e.target.value))}
                  className="w-full accent-brand-600 dark:accent-accent-500"
                />
              </div>

              {/* Down Payment Slide */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-xs font-bold text-slate-655 dark:text-slate-300">
                  <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" /> Down Payment</span>
                  <span>${downPayment.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={Math.min(vehiclePrice - 5000, 50000)}
                  step="500"
                  value={downPayment}
                  onChange={(e) => setDownPayment(Number(e.target.value))}
                  className="w-full accent-brand-600 dark:accent-accent-500"
                />
              </div>

              {/* Interest Rate */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-xs font-bold text-slate-655 dark:text-slate-300">
                  <span className="flex items-center gap-1"><Percent className="w-3.5 h-3.5" /> Interest Rate</span>
                  <span>{interestRate}% APR</span>
                </div>
                <input
                  type="range"
                  min="1.9"
                  max="12.9"
                  step="0.1"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="w-full accent-brand-600 dark:accent-accent-500"
                />
              </div>

              {/* Term Duration */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-xs font-bold text-slate-655 dark:text-slate-300">
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Loan Term</span>
                  <span>{loanTerm} Months</span>
                </div>
                <input
                  type="range"
                  min="24"
                  max="84"
                  step="12"
                  value={loanTerm}
                  onChange={(e) => setLoanTerm(Number(e.target.value))}
                  className="w-full accent-brand-600 dark:accent-accent-500"
                />
              </div>
            </div>

            {/* Calculations Result Output */}
            <div className="p-6 bg-slate-50 dark:bg-brand-950 rounded-xl flex flex-col justify-center items-center text-center gap-4 border border-slate-100 dark:border-brand-850">
              <span className="text-xxs font-bold text-slate-450 uppercase tracking-widest">
                Estimated Payment
              </span>
              <div className="flex flex-col">
                <span className="text-4xl sm:text-5xl font-black text-brand-655 dark:text-accent-500">
                  ${Math.round(calculateMonthlyPayment())}
                </span>
                <span className="text-slate-400 text-xxs font-semibold">per month</span>
              </div>
              <p className="text-slate-500 text-xxs max-w-[200px] leading-normal">
                Estimated rates exclude municipal taxes, licensing, registration, and documentation fees.
              </p>
              <Link to="/vehicles" className="w-full">
                <Button variant="accent" className="w-full text-xs font-bold uppercase tracking-wider py-2.5">
                  Explore Listings
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>

      {/* 8. Testimonials Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div>
          <span className="text-xxs font-bold text-slate-405 uppercase tracking-widest">
            Client Review Logs
          </span>
          <h2 className="text-3xl font-black text-slate-800 dark:text-white mt-1 leading-tight">
            Loved By Drivers <br />
            Around the Globe
          </h2>
          <p className="text-slate-500 text-xs mt-4 leading-relaxed max-w-sm">
            Read certified experiences from individuals and companies who discovered their next luxury vehicle via DriveElite.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          {testimonials.map((t, i) => (
            <Card key={i} hoverEffect className="bg-white border border-slate-200/50 p-6 flex flex-col gap-4">
              <p className="text-xs text-slate-655 dark:text-slate-300 italic leading-relaxed">
                "{t.quote}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-brand-850 flex items-center justify-center font-bold text-xs">
                  {t.name.charAt(0)}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-800 dark:text-white">{t.name}</span>
                  <span className="text-xxs text-slate-400 font-semibold">{t.title}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* 9. Interactive FAQ Accordion Section */}
      <section className="max-w-3xl mx-auto px-4 w-full flex flex-col gap-12">
        <div className="text-center">
          <span className="text-xxs font-bold text-slate-450 uppercase tracking-widest">
            Common Inquiries
          </span>
          <h2 className="text-3xl font-black text-slate-800 dark:text-white mt-1">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="flex flex-col gap-4">
          {faqItems.map((item, idx) => {
            const isOpen = !!faqOpen[idx];
            return (
              <div key={idx} className="border border-slate-200/50 dark:border-brand-850 rounded-xl overflow-hidden bg-white dark:bg-brand-900">
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex items-center justify-between p-5 text-left text-xs font-bold text-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-brand-850/20 transition-colors cursor-pointer"
                >
                  <span>{item.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-slate-100 dark:border-brand-850"
                    >
                      <p className="p-5 text-xs text-slate-550 dark:text-slate-400 leading-relaxed bg-slate-50/50 dark:bg-brand-950/20">
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* 10. Newsletter Form Section */}
      <section className="max-w-5xl mx-auto px-4 w-full">
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-900 text-white flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-brand-600/10 to-accent-600/10 pointer-events-none" />
          <div className="flex flex-col gap-3 max-w-md relative z-10">
            <span className="text-xxs font-bold text-accent-500 uppercase tracking-widest">
              Stay Connected
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white leading-snug">
              Subscribe to Fleet Releases
            </h3>
            <p className="text-slate-400 text-xs leading-normal">
              Register your email to receive announcements of high-performance vehicle arrivals and exclusive APR offers.
            </p>
          </div>

          <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2 w-full max-w-md relative z-10">
            <div className="relative flex-grow">
              <input
                type="email"
                placeholder="name@dealership.com"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-lg text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 text-white"
              />
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
            </div>
            <Button type="submit" variant="accent" className="font-bold uppercase tracking-wider text-xs px-6 py-3 shrink-0">
              Subscribe
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
};

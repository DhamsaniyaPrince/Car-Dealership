import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Button, Badge, SectionLabel } from '../components/UI';
import { getVehicleExtendedSpecs } from '../utils/specs';
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
  Star,
  Play,
  ChevronRight,
  Award,
  TrendingUp,
} from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring, useInView } from 'framer-motion';

// Animated stat counter
const StatCounter: React.FC<{ value: string; label: string; delay?: number }> = ({ value, label, delay = 0 }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  const numericValue = parseInt(value.replace(/\D/g, ''), 10);
  const suffix = value.replace(/[\d,]/g, '');

  useEffect(() => {
    if (!isInView || isNaN(numericValue)) return;
    let start = 0;
    const duration = 1800;
    const step = numericValue / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= numericValue) { setCount(numericValue); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, numericValue]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      className="flex flex-col items-center gap-2"
    >
      <span className="font-display font-black text-4xl sm:text-5xl text-gradient-gold tabular-nums">
        {isNaN(numericValue) ? value : `${count.toLocaleString()}${suffix}`}
      </span>
      <span className="text-xs font-bold text-silver-500 uppercase tracking-[0.2em]">{label}</span>
    </motion.div>
  );
};

// Particle background component
const ParticleField: React.FC = () => {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 1 + Math.random() * 2,
    duration: 4 + Math.random() * 6,
    delay: Math.random() * 4,
    opacity: 0.2 + Math.random() * 0.5,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-gold-400"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, opacity: p.opacity }}
          animate={{ y: [0, -25, 0], opacity: [p.opacity, p.opacity * 1.5, p.opacity], scale: [1, 1.3, 1] }}
          transition={{ duration: p.duration, repeat: Infinity, ease: 'easeInOut', delay: p.delay }}
        />
      ))}
    </div>
  );
};

// Premium vehicle card
const VehicleCard: React.FC<{ vehicle: any; index: number }> = ({ vehicle, index }) => {
  const [hovered, setHovered] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  
  const specs = getVehicleExtendedSpecs(vehicle.make, vehicle.model, Number(vehicle.price), vehicle.id);
  const imageUrl = specs.images[0];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="group relative rounded-2xl overflow-hidden border border-white/8 bg-obsidian-800/80 cursor-pointer"
      style={{
        boxShadow: hovered ? '0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(201,168,76,0.1)' : '0 4px 24px rgba(0,0,0,0.3)',
        transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
        transition: 'all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      }}
    >
      {/* Image */}
      <div className="relative h-52 overflow-hidden bg-obsidian-900">
        <motion.img
          src={imageUrl}
          alt={`${vehicle.make} ${vehicle.model}`}
          className="w-full h-full object-cover"
          animate={{ scale: hovered ? 1.08 : 1 }}
          transition={{ duration: 0.5 }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950/80 via-transparent to-transparent" />

        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <Badge variant="gold" className="text-[10px] font-black uppercase tracking-widest shadow-gold-sm">
            {vehicle.category}
          </Badge>
        </div>

        {/* Hover overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: hovered ? 1 : 0 }}
          className="absolute inset-0 bg-obsidian-950/40 flex items-center justify-center"
        >
          <Link to={`/vehicles/${vehicle.id}`}>
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: hovered ? 1 : 0.8 }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gold-500 text-obsidian-900 font-black text-xs uppercase tracking-widest shadow-gold-lg"
            >
              View Details <ArrowRight className="w-3.5 h-3.5" />
            </motion.div>
          </Link>
        </motion.div>
      </div>

      {/* Info */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-display font-bold text-white text-base leading-tight">
            {vehicle.make} <span className="text-silver-400">{vehicle.model}</span>
          </h3>
          <div className="flex items-center gap-0.5 text-amber-400">
            <Star className="w-3 h-3 fill-amber-400" />
            <span className="text-xs font-bold">4.9</span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/6">
          <div>
            <p className="text-2xl font-display font-black text-gradient-gold">
              ${Number(vehicle.price).toLocaleString()}
            </p>
            <p className="text-[10px] text-silver-600 font-semibold uppercase tracking-widest">Starting Price</p>
          </div>
          <div className="flex items-center gap-1 text-silver-600 text-xs">
            <Gauge className="w-3.5 h-3.5" />
            <span>{vehicle.quantity} in stock</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const HomePage: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'all' | 'electric' | 'suv' | 'luxury' | 'sports'>('all');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [faqOpen, setFaqOpen] = useState<Record<number, boolean>>({});

  const [vehiclePrice, setVehiclePrice] = useState(50000);
  const [downPayment, setDownPayment] = useState(10000);
  const [interestRate, setInterestRate] = useState(4.9);
  const [loanTerm, setLoanTerm] = useState(60);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const heroRef = useRef<HTMLElement>(null);

  const springX = useSpring(mouseX, { stiffness: 30, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 30, damping: 20 });

  const bgX = useTransform(springX, [-1, 1], ['-2%', '2%']);
  const bgY = useTransform(springY, [-1, 1], ['-2%', '2%']);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = heroRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const { data: vehicles, isLoading } = useQuery({
    queryKey: ['homepageVehiclesList'],
    queryFn: async () => {
      const res = await api.get('/vehicles', { params: { limit: 100 } });
      return res.data.data.vehicles;
    },
  });

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) { toast.error('Please enter a valid email address.'); return; }
    toast.success('Thank you for subscribing to DriveElite updates!');
    setNewsletterEmail('');
  };

  const toggleFaq = (index: number) => setFaqOpen((prev) => ({ ...prev, [index]: !prev[index] }));

  const getFilteredVehicles = () => {
    if (!vehicles) return [];
    switch (activeTab) {
      case 'electric': return vehicles.filter((v: any) => v.category.toLowerCase().includes('electric')).slice(0, 4);
      case 'suv': return vehicles.filter((v: any) => v.category.toLowerCase().includes('suv')).slice(0, 4);
      case 'luxury': return vehicles.filter((v: any) => Number(v.price) > 50000).slice(0, 4);
      case 'sports': return vehicles.filter((v: any) => v.category.toLowerCase().includes('sport')).slice(0, 4);
      default: return vehicles.slice(0, 4);
    }
  };

  const calculateMonthlyPayment = () => {
    const principal = vehiclePrice - downPayment;
    if (principal <= 0) return 0;
    const monthlyRate = interestRate / 100 / 12;
    const n = loanTerm;
    if (monthlyRate === 0) return principal / n;
    const payment = (principal * (monthlyRate * Math.pow(1 + monthlyRate, n))) / (Math.pow(1 + monthlyRate, n) - 1);
    return isNaN(payment) ? 0 : payment;
  };

  const filteredList = getFilteredVehicles();

  const stats = [
    { label: 'Active Fleet Listings', value: '1200+' },
    { label: 'Annual Client Sales', value: '4800+' },
    { label: 'Escrow Transactions', value: '$120M+' },
    { label: 'Customer Satisfaction', value: '99.4%' },
  ];

  const features = [
    { icon: ShieldCheck, title: 'Certified Protection', desc: 'Every listing undergoes rigorous 150-point mechanical evaluation before publishing.', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { icon: BadgePercent, title: 'Structured Financing', desc: 'Partner with leading financial institutions for APR lending options customized to your needs.', color: 'text-brand-400', bg: 'bg-brand-500/10 border-brand-500/20' },
    { icon: Zap, title: 'Instant Processing', desc: 'Secure in-memory authentication confirms sales transactions and records within milliseconds.', color: 'text-gold-400', bg: 'bg-gold-500/10 border-gold-500/20' },
  ];

  const testimonials = [
    { quote: "The purchasing process was completely seamless. DriveElite's dynamic finance widget was accurate to the dollar, and pickup took under 15 minutes.", name: 'Marcus Vance', title: 'Tesla Model S Owner', rating: 5 },
    { quote: 'Administrative control of our dealership inventory has never been cleaner. Decoupled catalog updates keep our showrooms fully synchronized.', name: 'Helena Rostova', title: 'General Manager, DriveElite NY', rating: 5 },
    { quote: "Securing my Corvette C8 through DriveElite was an absolute pleasure. Their attention to detail, premium service, and transparent pricing are unmatched.", name: 'Robert Chen', title: 'Corvette C8 Owner', rating: 5 },
    { quote: "The 360-degree virtual studio helped me evaluate the Taycan in high definition before visiting the showroom. Absolutely phenomenal digital experience.", name: 'Serena Williams', title: 'Porsche Taycan Owner', rating: 5 }
  ];

  const faqItems = [
    { q: 'How does DriveElite verify vehicle histories?', a: 'Every vehicle undergoes an extensive 150-point mechanical check alongside CARFAX verification before being listed in our database.' },
    { q: 'What financing options are available?', a: 'We partner with top-tier corporate lenders to provide competitive loan structures ranging from 36 to 72 months, with APR rates starting at 2.9% for qualified buyers.' },
    { q: 'Can I trade in my current vehicle?', a: 'Yes, we offer instant trade-in appraisals. A sales consultant will review your specifications and apply the value directly as a down payment.' },
  ];

  const brands = ['Porsche', 'Tesla', 'BMW', 'Mercedes', 'Audi', 'Lamborghini', 'Ferrari', 'Bentley'];

  return (
    <div className="flex flex-col overflow-hidden">
      {/* ================================================================
          1. HERO SECTION — Cinematic full-screen
         ================================================================ */}
      <section
        ref={heroRef}
        onMouseMove={handleMouseMove}
        className="relative min-h-screen flex items-center bg-obsidian-950 overflow-hidden"
      >
        {/* Parallax background */}
        <motion.div
          style={{ x: bgX, y: bgY }}
          className="absolute inset-0 scale-110"
        >
          <div
            className="absolute inset-0 bg-cover bg-center opacity-25"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1920&q=80')" }}
          />
        </motion.div>

        {/* Gradient overlays */}
        <div className="absolute inset-0 hero-gradient-overlay" />
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950 via-transparent to-obsidian-950/30" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-5"
          style={{
            backgroundImage: 'linear-gradient(rgba(201,168,76,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.15) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
          }}
        />

        {/* Floating particles */}
        <ParticleField />

        {/* Animated light streaks */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute pointer-events-none"
            style={{ top: `${25 + i * 25}%`, left: 0, right: 0, height: 1 }}
            initial={{ x: '-100%', opacity: 0 }}
            animate={{ x: '200%', opacity: [0, 0.5, 0.3, 0] }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              delay: i * 2,
              ease: 'linear',
              repeatDelay: 4 + i * 2,
            }}
          >
            <div className="w-64 h-px bg-gradient-to-r from-transparent via-gold-400/60 to-transparent" />
          </motion.div>
        ))}

        {/* Ambient glow orbs */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-1/3 right-1/4 w-96 h-96 bg-gold-500/15 rounded-full filter blur-[120px] pointer-events-none"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 10, repeat: Infinity, delay: 3 }}
          className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-brand-500/10 rounded-full filter blur-[100px] pointer-events-none"
        />

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="max-w-3xl">
            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-3 mb-6"
            >
              <div className="w-8 h-px bg-gold-500" />
              <span className="inline-flex items-center gap-2 text-xs font-bold text-gold-400 uppercase tracking-[0.25em]">
                <Sparkles className="w-3.5 h-3.5" /> Precision Automotive Platform
              </span>
            </motion.div>

            {/* Headline — word by word reveal */}
            <div className="mb-6">
              {['THE', 'ELITE'].map((word, wi) => (
                <motion.div
                  key={wi}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.2 + wi * 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="overflow-hidden"
                >
                  <span className={`font-display font-black block leading-none ${wi === 0 ? 'text-6xl sm:text-8xl text-white tracking-tight' : 'text-6xl sm:text-8xl text-gradient-gold tracking-tight'}`}>
                    {word}
                  </span>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.55 }}
                className="overflow-hidden"
              >
                <span className="font-display font-black text-6xl sm:text-8xl text-white tracking-tight block leading-none">STANDARD</span>
              </motion.div>
            </div>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.75 }}
              className="text-silver-400 text-base sm:text-lg max-w-md leading-relaxed mb-8"
            >
              Explore our curated selection of electric crossovers, hybrid SUVs, and high-performance sports cars. Built for speed, refined for luxury.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="flex flex-wrap gap-4"
            >
              <Link to="/vehicles">
                <Button variant="gold" size="lg" className="font-black uppercase tracking-widest gap-2.5 shadow-gold-lg">
                  Explore Inventory <ArrowRight className="w-4.5 h-4.5" />
                </Button>
              </Link>
              <a href="#calculator">
                <Button variant="outline" size="lg" className="font-bold uppercase tracking-widest gap-2">
                  <Play className="w-4 h-4 fill-current" /> Calculate Payments
                </Button>
              </a>
            </motion.div>
          </div>

          {/* Floating stat cards */}
          <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-4">
            {[
              { label: 'Premium Models', value: '1,200+' },
              { label: 'Satisfaction Rate', value: '99.4%' },
              { label: 'Years of Trust', value: '15+' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.1 + i * 0.15 }}
                whileHover={{ y: -4, scale: 1.03 }}
                className="glass-gold rounded-2xl px-5 py-4 border border-gold-500/15 shadow-gold-sm min-w-[160px]"
              >
                <p className="font-display font-black text-2xl text-gradient-gold">{stat.value}</p>
                <p className="text-[10px] text-silver-500 font-bold uppercase tracking-widest mt-0.5">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-silver-600">Scroll</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-px h-8 bg-gradient-to-b from-gold-500 to-transparent"
          />
        </div>
      </section>

      {/* ================================================================
          2. BRAND MARQUEE
         ================================================================ */}
      <section className="py-10 border-y border-white/5 bg-obsidian-950/60 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 mb-5 text-center">
          <SectionLabel>Partnering Manufacturers</SectionLabel>
        </div>
        <div className="marquee-wrapper">
          <div className="marquee-track">
            {[...brands, ...brands].map((brand, i) => (
              <div
                key={i}
                className="flex items-center justify-center px-10 mx-4 h-12 rounded-xl border border-white/6 bg-white/2 hover:border-gold-500/25 hover:bg-gold-500/5 transition-all duration-300 cursor-pointer group"
                style={{ minWidth: 140 }}
              >
                <span className="text-sm font-display font-black text-silver-600 group-hover:text-gold-400 uppercase tracking-widest transition-colors duration-300">
                  {brand}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          3. FEATURED VEHICLES
         ================================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div>
            <SectionLabel className="mb-4">Curated Showcase</SectionLabel>
            <h2 className="font-display font-black text-4xl sm:text-5xl text-white mt-3">
              Explore <span className="text-gradient-gold">Luxury</span> Fleet
            </h2>
          </div>

          {/* Tab switcher */}
          <div className="flex gap-1 p-1.5 rounded-2xl bg-obsidian-850/80 border border-white/6 w-fit flex-wrap">
            {(['all', 'electric', 'suv', 'luxury', 'sports'] as const).map((tab) => (
              <motion.button
                key={tab}
                onClick={() => setActiveTab(tab)}
                whileTap={{ scale: 0.97 }}
                className={`relative px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all cursor-pointer ${
                  activeTab === tab ? 'text-obsidian-900' : 'text-silver-500 hover:text-white'
                }`}
              >
                {activeTab === tab && (
                  <motion.div
                    layoutId="tab-bg"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 shadow-gold-sm"
                  />
                )}
                <span className="relative z-10">{tab}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="rounded-2xl overflow-hidden border border-white/6" style={{ height: 340 }}>
                <div className="skeleton h-52 w-full" />
                <div className="p-5 flex flex-col gap-3">
                  <div className="skeleton h-4 w-3/4 rounded-lg" />
                  <div className="skeleton h-6 w-1/2 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredList.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 flex flex-col items-center gap-4"
          >
            <div className="w-20 h-20 rounded-3xl border border-white/8 bg-white/2 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-silver-600" />
            </div>
            <p className="text-silver-500 text-sm font-semibold">No matching models in this category.</p>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredList.map((vehicle: any, i: number) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} index={i} />
              ))}
            </div>
          </AnimatePresence>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center mt-12"
        >
          <Link to="/vehicles">
            <Button variant="outline" size="lg" className="font-bold uppercase tracking-widest gap-2 group">
              View Full Catalog
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* ================================================================
          4. STATS SECTION
         ================================================================ */}
      <section className="bg-obsidian-950/80 border-y border-white/5 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <StatCounter key={i} value={stat.value} label={stat.label} delay={i * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          5. OFFERS SECTION
         ================================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
        <div className="text-center mb-12">
          <SectionLabel className="mb-4">Limited Opportunities</SectionLabel>
          <h2 className="font-display font-black text-4xl text-white mt-3">
            Active <span className="text-gradient-gold">Dealership</span> Offers
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            { title: 'Summer Performance Event', badge: 'Limited Time', desc: 'Exclusive 2.9% APR financing available on certified pre-owned electric models.', cta: 'Explore Offer', icon: TrendingUp },
            { title: 'Luxury Lease Program', badge: 'Lease Special', desc: 'Drive the Taycan series starting from $999/month with low down-payment options.', cta: 'Calculate Lease', icon: Award },
          ].map((offer, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15 }}
              whileHover={{ y: -4 }}
              className="p-8 rounded-2xl border border-white/8 bg-obsidian-800/60 relative overflow-hidden group"
              style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}
            >
              {/* Gold corner accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-gold-500/10 to-transparent rounded-bl-[5rem]" />
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
                transition={{ duration: 4, repeat: Infinity, delay: idx }}
                className="absolute bottom-0 left-0 w-48 h-48 bg-gold-500/5 rounded-tr-[8rem] pointer-events-none"
              />

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <Badge variant="gold">{offer.badge}</Badge>
                  <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center">
                    <offer.icon className="w-5 h-5 text-gold-500" />
                  </div>
                </div>
                <h3 className="font-display font-bold text-xl text-white leading-snug mb-3">{offer.title}</h3>
                <p className="text-sm text-silver-500 leading-relaxed mb-6">{offer.desc}</p>
                <Link to="/vehicles">
                  <Button variant="outline" size="sm" className="gap-1.5 group font-bold uppercase tracking-widest">
                    {offer.cta} <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ================================================================
          6. FEATURES SECTION
         ================================================================ */}
      <section className="bg-obsidian-950/80 border-y border-white/5 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <SectionLabel className="mb-4">DriveElite Standards</SectionLabel>
            <h2 className="font-display font-black text-4xl text-white mt-3">
              Engineered For <span className="text-gradient-gold">Perfection</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                whileHover={{ y: -6 }}
                className="group p-8 rounded-2xl border border-white/6 bg-obsidian-800/60 text-center flex flex-col items-center gap-5 transition-all duration-300"
                style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className={`w-16 h-16 rounded-2xl border flex items-center justify-center ${feature.bg}`}
                >
                  <feature.icon className={`w-7 h-7 ${feature.color}`} />
                </motion.div>
                <h3 className="font-display font-bold text-lg text-white">{feature.title}</h3>
                <p className="text-sm text-silver-500 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          7. FINANCE CALCULATOR
         ================================================================ */}
      <section id="calculator" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
        <div className="text-center mb-14">
          <SectionLabel className="mb-4">Financial Estimations</SectionLabel>
          <h2 className="font-display font-black text-4xl text-white mt-3">
            Loan <span className="text-gradient-gold">Calculator</span>
          </h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-gold rounded-3xl p-8 border border-gold-500/10 grid grid-cols-1 md:grid-cols-2 gap-10"
          style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(201,168,76,0.08)' }}
        >
          {/* Sliders */}
          <div className="flex flex-col gap-8">
            {[
              { label: 'Vehicle Price', icon: DollarSign, value: vehiclePrice, set: setVehiclePrice, min: 15000, max: 150000, step: 1000, format: (v: number) => `$${v.toLocaleString()}` },
              { label: 'Down Payment', icon: DollarSign, value: downPayment, set: setDownPayment, min: 0, max: Math.min(vehiclePrice - 5000, 50000), step: 500, format: (v: number) => `$${v.toLocaleString()}` },
              { label: 'Interest Rate', icon: Percent, value: interestRate, set: setInterestRate, min: 1.9, max: 12.9, step: 0.1, format: (v: number) => `${v}% APR` },
              { label: 'Loan Term', icon: Calendar, value: loanTerm, set: setLoanTerm, min: 24, max: 84, step: 12, format: (v: number) => `${v} Months` },
            ].map((field) => (
              <div key={field.label} className="flex flex-col gap-3">
                <div className="flex justify-between items-center text-xs font-bold text-silver-300">
                  <span className="flex items-center gap-1.5 uppercase tracking-widest">
                    <field.icon className="w-3.5 h-3.5 text-gold-500" />{field.label}
                  </span>
                  <span className="text-gold-400 font-mono">{field.format(field.value)}</span>
                </div>
                <input
                  type="range"
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  value={field.value}
                  onChange={(e) => field.set(Number(e.target.value))}
                  className="w-full cursor-pointer"
                />
              </div>
            ))}
          </div>

          {/* Result */}
          <div className="flex flex-col items-center justify-center gap-6 p-8 rounded-2xl border border-white/6 bg-obsidian-900/60 text-center">
            <SectionLabel>Estimated Payment</SectionLabel>
            <div className="flex flex-col gap-1">
              <motion.span
                key={Math.round(calculateMonthlyPayment())}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="font-display font-black text-6xl text-gradient-gold"
              >
                ${Math.round(calculateMonthlyPayment()).toLocaleString()}
              </motion.span>
              <span className="text-silver-500 text-xs font-semibold uppercase tracking-widest">per month</span>
            </div>
            <p className="text-silver-600 text-xs max-w-[200px] leading-relaxed">
              Estimated rates exclude municipal taxes, licensing, registration, and documentation fees.
            </p>
            <Link to="/vehicles" className="w-full">
              <Button variant="gold" className="w-full font-black uppercase tracking-widest text-xs py-3 gap-2">
                Explore Listings <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ================================================================
          8. TESTIMONIALS
         ================================================================ */}
      <section className="bg-obsidian-950/80 border-y border-white/5 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <SectionLabel className="mb-4">Client Review Logs</SectionLabel>
            <h2 className="font-display font-black text-4xl text-white mt-3 leading-tight">
              Loved By <span className="text-gradient-gold">Drivers</span><br />Around the Globe
            </h2>
            <p className="text-silver-500 text-sm mt-5 leading-relaxed max-w-sm">
              Read certified experiences from individuals who discovered their next luxury vehicle via DriveElite.
            </p>
          </motion.div>

          <div className="flex flex-col gap-5">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                whileHover={{ y: -4 }}
                className="p-6 rounded-2xl border border-white/8 bg-obsidian-800/60 flex flex-col gap-4 transition-all duration-300"
              >
                <div className="flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, si) => (
                    <Star key={si} className="w-3.5 h-3.5 text-gold-500 fill-gold-500" />
                  ))}
                </div>
                <p className="text-sm text-silver-300 italic leading-relaxed">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold-500 to-gold-700 flex items-center justify-center font-black text-obsidian-900 text-sm">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{t.name}</p>
                    <p className="text-xs text-silver-500 font-medium">{t.title}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          9. FAQ SECTION
         ================================================================ */}
      <section className="max-w-3xl mx-auto px-4 py-24 w-full">
        <div className="text-center mb-12">
          <SectionLabel className="mb-4">Common Inquiries</SectionLabel>
          <h2 className="font-display font-black text-4xl text-white mt-3">
            Frequently Asked <span className="text-gradient-gold">Questions</span>
          </h2>
        </div>

        <div className="flex flex-col gap-3">
          {faqItems.map((item, idx) => {
            const isOpen = !!faqOpen[idx];
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="rounded-2xl border border-white/8 bg-obsidian-800/60 overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-white/3 transition-colors cursor-pointer"
                >
                  <span className="text-sm font-bold text-white">{item.q}</span>
                  <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.25 }}>
                    <ChevronDown className="w-4.5 h-4.5 text-gold-500 shrink-0" />
                  </motion.div>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className="border-t border-white/5">
                        <p className="px-6 py-5 text-sm text-silver-400 leading-relaxed">{item.a}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ================================================================
          10. NEWSLETTER SECTION
         ================================================================ */}
      <section className="max-w-5xl mx-auto px-4 pb-24 w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative p-10 sm:p-16 rounded-3xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(13,15,20,0.95) 0%, rgba(19,21,28,0.95) 100%)',
            border: '1px solid rgba(201,168,76,0.15)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(201,168,76,0.05)',
          }}
        >
          {/* Background glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-gold-500/8 rounded-full filter blur-[60px] pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-64 h-32 bg-brand-500/8 rounded-full filter blur-[60px] pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="flex flex-col gap-3 max-w-md">
              <SectionLabel>Stay Connected</SectionLabel>
              <h3 className="font-display font-black text-3xl text-white mt-2 leading-snug">
                Subscribe to <span className="text-gradient-gold">Fleet Releases</span>
              </h3>
              <p className="text-silver-500 text-sm leading-relaxed">
                Register your email to receive announcements of high-performance vehicle arrivals and exclusive APR offers.
              </p>
            </div>

            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
              <div className="relative flex-grow">
                <input
                  type="email"
                  placeholder="your@email.com"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="input-premium w-full pl-11 pr-4 py-3 rounded-xl text-sm"
                />
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-600" />
              </div>
              <Button type="submit" variant="gold" className="font-black uppercase tracking-widest text-xs px-6 py-3 shrink-0 whitespace-nowrap">
                Subscribe
              </Button>
            </form>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

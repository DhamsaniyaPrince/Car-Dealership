import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button, Badge, Modal, SectionLabel, Skeleton, Select } from '../components/UI';
import { getVehicleExtendedSpecs } from '../utils/specs';
import {
  ArrowLeft,
  Gauge,
  ShoppingBag,
  Heart,
  GitCompare,
  Share2,
  Calendar,
  DollarSign,
  Percent,
  Star,
  ThumbsUp,
  Fuel,
  Zap,
  Shield,
  ChevronRight,
  Clock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ReviewItem {
  id: string;
  name: string;
  email: string;
  rating: number;
  comment: string;
  likes: number;
  likedBy: string[];
  date: string;
}

export const CarDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [show360, setShow360] = useState(false);
  const [dragRotation, setDragRotation] = useState(0);

  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isComparing, setIsComparing] = useState(false);

  const [testDriveOpen, setTestDriveOpen] = useState(false);
  const [tdDate, setTdDate] = useState('');
  const [tdTime, setTdTime] = useState('10:00 AM');
  const [tdHub, setTdHub] = useState('New York Showroom');
  const [tdName, setTdName] = useState('');
  const [tdEmail, setTdEmail] = useState('');

  const [downPaymentPct, setDownPaymentPct] = useState(20);
  const [interestRate, setInterestRate] = useState(4.9);
  const [loanTerm, setLoanTerm] = useState(60);

  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [reviewsSort, setReviewsSort] = useState('newest');

  const { data: vehicle, isLoading, error } = useQuery({
    queryKey: ['vehicle', id],
    queryFn: async () => {
      const res = await api.get(`/vehicles/${id}`);
      return res.data.data.vehicle;
    },
  });

  const { data: similarVehicles } = useQuery({
    queryKey: ['similarVehiclesList', vehicle?.category],
    enabled: !!vehicle,
    queryFn: async () => {
      const res = await api.get('/vehicles', { params: { limit: 100 } });
      const list = res.data.data.vehicles;
      return list
        .filter((v: any) => v.id !== id && v.category.split(' ')[0] === vehicle.category.split(' ')[0])
        .slice(0, 3);
    },
  });

  const extendedSpecs = vehicle
    ? getVehicleExtendedSpecs(vehicle.make, vehicle.model, Number(vehicle.price), vehicle.id)
    : null;

  useEffect(() => {
    if (!id) return;
    const savedWishlist = localStorage.getItem('dealership_wishlist') || '[]';
    setIsWishlisted(JSON.parse(savedWishlist).includes(id));

    const savedReviews = localStorage.getItem(`dealership_reviews_${id}`);
    if (savedReviews) {
      setReviews(JSON.parse(savedReviews));
    } else {
      const defaults: ReviewItem[] = [
        {
          id: 'rev-1',
          name: 'David K.',
          email: 'client1@gmail.com',
          rating: 5,
          comment: 'Amazing performance. The specifications matched exactly what was described in the catalog showroom.',
          likes: 2,
          likedBy: [],
          date: '2026-07-10',
        },
        {
          id: 'rev-2',
          name: 'Sofia L.',
          email: 'buyer@yahoo.com',
          rating: 4,
          comment: 'The pickup routing was fast and transparent. Down-payment calculator details were accurate to the dollar.',
          likes: 5,
          likedBy: [],
          date: '2026-07-09',
        },
      ];
      setReviews(defaults);
      localStorage.setItem(`dealership_reviews_${id}`, JSON.stringify(defaults));
    }
  }, [id]);

  const handleWishlistToggle = () => {
    if (!id) return;
    const savedWishlist = localStorage.getItem('dealership_wishlist') || '[]';
    let wishlistList = JSON.parse(savedWishlist);
    if (wishlistList.includes(id)) {
      wishlistList = wishlistList.filter((item: string) => item !== id);
      setIsWishlisted(false);
      toast.success('Removed from favorites.');
    } else {
      wishlistList.push(id);
      setIsWishlisted(true);
      toast.success('Added to favorites.');
    }
    localStorage.setItem('dealership_wishlist', JSON.stringify(wishlistList));
  };

  const handleCompareToggle = () => {
    setIsComparing(!isComparing);
    if (!isComparing) {
      toast.success('Added to compare checklist. Check the catalog showroom directory.');
    } else {
      toast.success('Removed from compare checklist.');
    }
  };

  const handlePurchaseVehicle = () => {
    if (!vehicle || !extendedSpecs) return;
    const savedCart = localStorage.getItem('dealership_cart') || '[]';
    const cartItems = JSON.parse(savedCart);
    if (cartItems.some((item: any) => item.id === vehicle.id)) {
      toast.info('This vehicle model is already in your shopping cart.');
      return;
    }
    const newItem = {
      id: vehicle.id,
      make: vehicle.make,
      model: vehicle.model,
      category: vehicle.category,
      price: Number(vehicle.price),
      image: extendedSpecs.images[0],
    };
    localStorage.setItem('dealership_cart', JSON.stringify([...cartItems, newItem]));
    window.dispatchEvent(new Event('cart-updated'));
    toast.success('Added to checkout cart.');
  };

  const handleBookTestDrive = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tdDate || !tdName || !tdEmail || !vehicle) {
      toast.error('Please input all registration fields.');
      return;
    }
    const savedBookings = localStorage.getItem('dealership_bookings') || '[]';
    const bookingsList = JSON.parse(savedBookings);
    const newBooking = {
      id: `td-${Math.floor(Math.random() * 90000) + 10000}`,
      model: `${vehicle.make} ${vehicle.model}`,
      date: tdDate,
      time: tdTime,
      hub: tdHub,
      status: 'Scheduled',
    };
    localStorage.setItem('dealership_bookings', JSON.stringify([newBooking, ...bookingsList]));
    const savedNotifs = localStorage.getItem('dealership_notifications') || '[]';
    const notifItem = {
      id: `notif-${Date.now()}`,
      title: 'Appointment Scheduled',
      desc: `Test drive for ${vehicle.make} ${vehicle.model} booked for ${tdDate} at ${tdTime}.`,
      time: 'Just now',
      read: false,
    };
    localStorage.setItem('dealership_notifications', JSON.stringify([notifItem, ...JSON.parse(savedNotifs)]));
    window.dispatchEvent(new Event('notifications-updated'));
    toast.success(`Test drive confirmed for ${tdDate} at ${tdTime}!`);
    setTestDriveOpen(false);
    setTdDate('');
    setTdName('');
    setTdEmail('');
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.info('Please sign in to submit a review.');
      navigate('/login');
      return;
    }
    if (!newComment) {
      toast.error('Please type a comment.');
      return;
    }
    const newRev: ReviewItem = {
      id: `rev-${Date.now()}`,
      name: user.name,
      email: user.email,
      rating: newRating,
      comment: newComment,
      likes: 0,
      likedBy: [],
      date: new Date().toISOString().slice(0, 10),
    };
    const updated = [newRev, ...reviews];
    setReviews(updated);
    localStorage.setItem(`dealership_reviews_${id}`, JSON.stringify(updated));
    toast.success('Review submitted successfully.');
    setNewComment('');
    setNewRating(5);
  };

  const handleLikeReview = (reviewId: string) => {
    if (!user) {
      toast.info('Please sign in to like reviews.');
      return;
    }
    const updated = reviews.map((r) => {
      if (r.id === reviewId) {
        const hasLiked = r.likedBy.includes(user.email);
        const likedBy = hasLiked
          ? r.likedBy.filter((email) => email !== user.email)
          : [...r.likedBy, user.email];
        return { ...r, likes: hasLiked ? r.likes - 1 : r.likes + 1, likedBy };
      }
      return r;
    });
    setReviews(updated);
    localStorage.setItem(`dealership_reviews_${id}`, JSON.stringify(updated));
  };

  const isVerifiedBuyer = useMemo(() => {
    if (!user) return false;
    const savedOrders = localStorage.getItem('dealership_orders') || '[]';
    const orders = JSON.parse(savedOrders);
    return orders.some((o: any) => o.model === `${vehicle?.make} ${vehicle?.model}`);
  }, [user, vehicle]);

  const sortedReviews = useMemo(() => {
    return [...reviews].sort((a, b) => {
      if (reviewsSort === 'highest') return b.rating - a.rating;
      if (reviewsSort === 'popular') return b.likes - a.likes;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [reviews, reviewsSort]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard.');
  };

  const calculateEMI = () => {
    if (!vehicle) return 0;
    const price = Number(vehicle.price);
    const downPayment = (price * downPaymentPct) / 100;
    const principal = price - downPayment;
    if (principal <= 0) return 0;
    const monthlyRate = interestRate / 100 / 12;
    const numberOfPayments = loanTerm;
    if (monthlyRate === 0) return principal / numberOfPayments;
    const payment =
      (principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    return isNaN(payment) ? 0 : payment;
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col gap-8">
        <Skeleton className="h-10 w-48 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <Skeleton className="h-[400px] rounded-2xl" />
          <div className="flex flex-col gap-4">
            <Skeleton className="h-10 w-3/4 rounded-xl" />
            <Skeleton className="h-6 w-1/3 rounded-xl" />
            <Skeleton className="h-36 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !vehicle || !extendedSpecs) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <Shield className="w-7 h-7 text-red-400" />
        </div>
        <h2 className="font-display font-black text-xl text-white uppercase tracking-wider">Vehicle Not Found</h2>
        <p className="text-silver-500 text-sm">The specifications you requested might have been sold or removed.</p>
        <Link to="/vehicles" className="mt-2">
          <Button variant="outline" className="font-bold uppercase tracking-widest text-xs">Back to Catalog</Button>
        </Link>
      </div>
    );
  }

  const isOutOfStock = vehicle.quantity <= 0;
  const emiValue = Math.round(calculateEMI());

  const detailSpecsList = [
    { label: 'Power Output', value: `${extendedSpecs.horsepower} hp`, icon: Zap },
    { label: 'Torque Force', value: `${extendedSpecs.torque} lb-ft`, icon: Gauge },
    { label: 'Fuel Efficiency', value: extendedSpecs.fuelEconomy, icon: Fuel },
    { label: 'Year Built', value: String(extendedSpecs.year), icon: Calendar },
    { label: 'Mileage Logged', value: `${extendedSpecs.mileage.toLocaleString()} mi`, icon: Gauge },
    { label: 'Warranty Coverage', value: extendedSpecs.warranty, icon: Shield },
    { label: 'Authorized Dealer', value: 'DriveElite Corporate, NY', icon: ChevronRight },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-10">

      {/* Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/6">
        <Link
          to="/vehicles"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-silver-500 hover:text-gold-400 transition-colors uppercase tracking-widest"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Directory
        </Link>
        <span className="text-[10px] font-bold text-silver-700 uppercase tracking-widest flex items-center gap-1">
          Catalog <ChevronRight className="w-3 h-3" /> {vehicle.make} <ChevronRight className="w-3 h-3" /> {vehicle.model}
        </span>
      </div>

      {/* Media + Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

        {/* Gallery */}
        <div className="flex flex-col gap-4">
          <div className="relative h-[420px] bg-obsidian-900 border border-white/8 rounded-2xl overflow-hidden shadow-2xl">
            <AnimatePresence mode="wait">
              {show360 ? (
                <motion.div
                  key="turntable"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full h-full flex flex-col items-center justify-center p-6 bg-obsidian-950 relative cursor-grab active:cursor-grabbing select-none"
                >
                  <motion.div
                    drag="x"
                    dragConstraints={{ left: -180, right: 180 }}
                    dragElastic={0.1}
                    onDrag={(_, info) => setDragRotation(info.offset.x % 360)}
                    animate={{ rotateY: dragRotation }}
                    className="w-72 h-44 bg-cover bg-center rounded-xl shadow-2xl border border-white/10"
                    style={{ backgroundImage: `url('https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80')` }}
                  />
                  <div className="absolute bottom-6 text-center">
                    <span className="text-[10px] font-black text-gold-400 uppercase tracking-widest">Drag left/right to rotate</span>
                    <p className="text-silver-600 text-[10px] mt-0.5 font-mono">{Math.round(dragRotation)}° rotation</p>
                  </div>
                </motion.div>
              ) : (
                <motion.img
                  key={activeImageIdx}
                  initial={{ opacity: 0, scale: 1.03 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  src={extendedSpecs.images[activeImageIdx]}
                  alt={vehicle.model}
                  className="w-full h-full object-cover"
                />
              )}
            </AnimatePresence>

            {/* Gradient overlay bottom */}
            <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950/60 via-transparent to-transparent pointer-events-none" />

            {/* Stock badge */}
            <span className={`absolute top-4 left-4 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white border ${
              isOutOfStock ? 'bg-red-500/20 border-red-500/30 text-red-400' : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
            }`}>
              {isOutOfStock ? 'Sold Out' : '✦ Ready for Pickup'}
            </span>

            {/* 360 button */}
            <button
              onClick={() => setShow360(!show360)}
              className="absolute bottom-4 right-4 px-4 py-2 bg-obsidian-950/80 backdrop-blur-md border border-white/15 hover:border-gold-500/30 hover:bg-gold-500/10 text-white hover:text-gold-400 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer"
            >
              {show360 ? '← Gallery View' : '⟳ 360° Studio'}
            </button>
          </div>

          {/* Thumbnail strip */}
          {!show360 && (
            <div className="grid grid-cols-3 gap-3">
              {extendedSpecs.images.map((img, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setActiveImageIdx(i)}
                  className={`h-24 rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                    activeImageIdx === i
                      ? 'border-gold-500 shadow-gold-sm'
                      : 'border-white/8 opacity-60 hover:opacity-100 hover:border-white/20'
                  }`}
                >
                  <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                </motion.button>
              ))}
            </div>
          )}
        </div>

        {/* Spec pane */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-start gap-4">
              <div>
                <SectionLabel className="mb-2">{vehicle.category}</SectionLabel>
                <h1 className="font-display font-black text-3xl sm:text-4xl text-white uppercase tracking-tight leading-tight">
                  {vehicle.make} <span className="text-gradient-gold">{vehicle.model}</span>
                </h1>
              </div>

              {/* Action icon buttons */}
              <div className="flex items-center gap-2 shrink-0 mt-1">
                <motion.button
                  whileHover={{ scale: 1.12 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleWishlistToggle}
                  className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                    isWishlisted
                      ? 'bg-red-500/15 border-red-500/30 text-red-400'
                      : 'bg-white/4 border-white/10 text-silver-500 hover:text-red-400 hover:border-red-500/20'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-400' : ''}`} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.12 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleCompareToggle}
                  className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                    isComparing
                      ? 'bg-gold-500/15 border-gold-500/30 text-gold-400'
                      : 'bg-white/4 border-white/10 text-silver-500 hover:text-gold-400 hover:border-gold-500/20'
                  }`}
                >
                  <GitCompare className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.12 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleShare}
                  className="p-2.5 rounded-xl border border-white/10 bg-white/4 cursor-pointer text-silver-500 hover:text-white hover:border-white/20 transition-all"
                >
                  <Share2 className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 mt-1">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, si) => (
                  <Star key={si} className={`w-3.5 h-3.5 ${si < Math.floor(extendedSpecs.rating) ? 'text-amber-400 fill-amber-400' : 'text-silver-700'}`} />
                ))}
              </div>
              <span className="text-xs text-silver-500 font-medium">({extendedSpecs.reviewsCount} reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-4 mt-2 pb-5 border-b border-white/6">
              <span className="text-3xl font-display font-black text-gradient-gold">
                ${Number(vehicle.price).toLocaleString()}
              </span>
              <div className="h-5 w-px bg-white/10" />
              <span className="text-xs font-bold text-silver-500 flex items-center gap-1">
                <Gauge className="w-3.5 h-3.5 text-silver-600" /> Stock: {vehicle.quantity} units
              </span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-3">
            {!isOutOfStock ? (
              <Button
                onClick={handlePurchaseVehicle}
                variant="gold"
                className="flex-grow sm:flex-grow-0 px-8 py-3.5 uppercase font-black tracking-widest text-xs gap-2"
              >
                <ShoppingBag className="w-4 h-4" /> Add to Cart
              </Button>
            ) : (
              <div className="flex-grow sm:flex-grow-0 px-8 py-3.5 flex items-center justify-center rounded-xl border border-red-500/20 bg-red-500/8 text-red-400 text-xs font-bold uppercase tracking-widest">
                Sold Out
              </div>
            )}
            <Button
              onClick={() => setTestDriveOpen(true)}
              variant="outline"
              className="flex-grow sm:flex-grow-0 px-8 py-3.5 uppercase font-bold tracking-widest text-xs gap-2"
            >
              <Calendar className="w-4 h-4" /> Test Drive
            </Button>
          </div>

          {/* Tech Specs grid */}
          <div className="flex flex-col gap-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-silver-600">Technical Specifications</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {detailSpecsList.map((spec, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-white/6 hover:bg-white/5 transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-gold-500/10 border border-gold-500/15 flex items-center justify-center shrink-0">
                    <spec.icon className="w-3.5 h-3.5 text-gold-500" />
                  </div>
                  <div className="flex flex-col gap-0.5 overflow-hidden">
                    <span className="text-[10px] font-bold text-silver-600 uppercase tracking-wider truncate">{spec.label}</span>
                    <span className="text-xs font-bold text-white truncate">{spec.value}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* EMI Calculator */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="rounded-2xl p-8 border border-white/8 bg-obsidian-800/80 grid grid-cols-1 md:grid-cols-3 gap-8"
        style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.3)' }}
      >
        <div className="md:col-span-2 flex flex-col gap-6">
          <div>
            <SectionLabel className="mb-2">Financing Estimation</SectionLabel>
            <h2 className="font-display font-black text-2xl text-white mt-1">Monthly Payment Simulator</h2>
          </div>

          <div className="flex flex-col gap-6">
            {[
              {
                icon: DollarSign,
                label: `Down Payment (${downPaymentPct}%)`,
                value: `$${((Number(vehicle.price) * downPaymentPct) / 100).toLocaleString()}`,
                min: 10, max: 50, step: 5,
                state: downPaymentPct, setState: setDownPaymentPct,
              },
              {
                icon: Percent,
                label: 'Interest Rate',
                value: `${interestRate}% APR`,
                min: 1.9, max: 10.9, step: 0.1,
                state: interestRate, setState: setInterestRate,
              },
              {
                icon: Calendar,
                label: 'Term Duration',
                value: `${loanTerm} Months`,
                min: 36, max: 72, step: 12,
                state: loanTerm, setState: setLoanTerm,
              },
            ].map((slider) => (
              <div key={slider.label} className="flex flex-col gap-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-silver-400 flex items-center gap-1.5">
                    <slider.icon className="w-3.5 h-3.5 text-silver-600" /> {slider.label}
                  </span>
                  <span className="text-gold-400 font-mono">{slider.value}</span>
                </div>
                <input
                  type="range"
                  min={slider.min}
                  max={slider.max}
                  step={slider.step}
                  value={slider.state}
                  onChange={(e) => slider.setState(Number(e.target.value) as any)}
                  className="w-full cursor-pointer"
                />
              </div>
            ))}
          </div>
        </div>

        {/* EMI result card */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-obsidian-900 to-obsidian-950 border border-gold-500/20 flex flex-col justify-center items-center text-center gap-3 shadow-gold-sm">
          <span className="text-[10px] font-black text-gold-500/70 uppercase tracking-widest">Estimated EMI</span>
          <motion.span
            key={emiValue}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-5xl font-display font-black text-gradient-gold"
          >
            ${emiValue}
          </motion.span>
          <span className="text-[10px] text-silver-500 font-bold uppercase tracking-widest">/ month for {loanTerm} mos</span>
          <p className="text-silver-600 text-[10px] leading-relaxed max-w-[200px] mt-1 border-t border-white/6 pt-3">
            Simulated estimates only. Subject to credit verification by partner institutions.
          </p>
        </div>
      </motion.section>

      {/* Reviews Section */}
      <section className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/6">
          <h3 className="text-sm font-display font-bold uppercase tracking-widest text-white flex items-center gap-2">
            <Star className="w-4 h-4 text-gold-500 fill-gold-500" /> Client Review Logs ({reviews.length})
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase text-silver-600 tracking-widest">Sort:</span>
            <Select
              value={reviewsSort}
              onChange={(val) => setReviewsSort(val)}
              options={[
                { value: 'newest', label: 'Newest First' },
                { value: 'highest', label: 'Highest Rating' },
                { value: 'popular', label: 'Most Liked' },
              ]}
              className="border border-white/8 bg-obsidian-850"
            />
          </div>
        </div>

        {/* Submit Review Form */}
        {user ? (
          <form
            onSubmit={handleSubmitReview}
            className="rounded-2xl p-6 border border-white/8 bg-obsidian-800/80 flex flex-col gap-5"
          >
            <h4 className="text-xs font-bold uppercase tracking-widest text-silver-400">Submit Your Experience</h4>
            <div className="flex gap-4 items-center">
              <span className="text-xs font-semibold text-silver-500">Your Rating:</span>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.button
                    key={star}
                    type="button"
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setNewRating(star)}
                    className="cursor-pointer"
                  >
                    <Star className={`w-5 h-5 transition-all ${star <= newRating ? 'text-amber-400 fill-amber-400' : 'text-silver-700'}`} />
                  </motion.button>
                ))}
              </div>
            </div>
            <textarea
              required
              rows={3}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share details of your showroom and performance test drive experience..."
              className="input-premium w-full p-3.5 rounded-xl text-xs resize-y"
            />
            <Button type="submit" variant="gold" className="font-black uppercase text-xs tracking-widest py-2.5 px-6 self-end gap-2">
              <Star className="w-3.5 h-3.5" /> Submit Review
            </Button>
          </form>
        ) : (
          <div className="text-center py-6 rounded-2xl border border-dashed border-white/10 bg-obsidian-850/40">
            <p className="text-sm text-silver-500 font-medium">
              Please{' '}
              <Link to="/login" className="font-bold text-gold-400 hover:text-gold-300 transition-colors underline underline-offset-2">
                Sign In
              </Link>{' '}
              to share your review log.
            </p>
          </div>
        )}

        {/* Reviews grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-2">
          <AnimatePresence>
            {sortedReviews.map((rev, i) => {
              const hasLiked = user && rev.likedBy.includes(user.email);
              const isVerified = isVerifiedBuyer && rev.email === user?.email;
              return (
                <motion.div
                  key={rev.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="p-5 rounded-2xl border border-white/8 bg-obsidian-800/80 flex flex-col gap-4 justify-between"
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-500/30 to-gold-700/30 border border-gold-500/20 flex items-center justify-center text-[10px] font-black text-gold-400">
                          {rev.name[0]}
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-bold text-white">{rev.name}</span>
                          {isVerified && (
                            <Badge variant="success" className="text-[9px] px-1.5 py-0.5 w-fit">✓ Verified Buyer</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className={`w-3 h-3 ${s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-silver-700'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-silver-400 leading-relaxed italic border-l-2 border-gold-500/30 pl-3">
                      "{rev.comment}"
                    </p>
                  </div>

                  <div className="flex justify-between items-center border-t border-white/6 pt-3">
                    <span className="text-[10px] text-silver-600 font-semibold flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {rev.date}
                    </span>
                    <motion.button
                      whileTap={{ scale: 0.92 }}
                      onClick={() => handleLikeReview(rev.id)}
                      className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-colors ${
                        hasLiked ? 'text-gold-400' : 'text-silver-600 hover:text-white'
                      }`}
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${hasLiked ? 'fill-gold-400' : ''}`} /> Helpful ({rev.likes})
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </section>

      {/* Similar Vehicles */}
      {similarVehicles && similarVehicles.length > 0 && (
        <section className="flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-silver-600">Similar Vehicle Recommendations</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {similarVehicles.map((s: any, i: number) => {
              const specs = getVehicleExtendedSpecs(s.make, s.model, Number(s.price), s.id);
              return (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="rounded-2xl overflow-hidden border border-white/8 bg-obsidian-800/80 flex flex-col"
                  style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}
                >
                  <div className="h-36 overflow-hidden relative">
                    <img src={specs.images[0]} alt={s.model} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950/60 to-transparent" />
                  </div>
                  <div className="p-4 flex flex-col gap-2 flex-grow">
                    <h4 className="text-xs font-bold text-white truncate">{s.make} {s.model}</h4>
                    <p className="text-sm font-display font-black text-gradient-gold">
                      ${Number(s.price).toLocaleString()}
                    </p>
                    <Link to={`/vehicles/${s.id}`} className="mt-auto pt-2">
                      <Button variant="secondary" size="sm" className="w-full text-[10px] uppercase tracking-widest py-2 font-bold">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>
      )}

      {/* Test Drive Booking Modal */}
      <Modal isOpen={testDriveOpen} onClose={() => setTestDriveOpen(false)} title="Book Showroom Test Drive">
        <form onSubmit={handleBookTestDrive} className="flex flex-col gap-4">
          {[
            { label: 'Full Name', type: 'text', value: tdName, onChange: setTdName, placeholder: 'e.g. John Doe' },
            { label: 'Email Address', type: 'email', value: tdEmail, onChange: setTdEmail, placeholder: 'e.g. john@dealership.com' },
          ].map((field) => (
            <div key={field.label} className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-silver-500">{field.label}</label>
              <input
                type={field.type}
                required
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                placeholder={field.placeholder}
                className="input-premium w-full px-3.5 py-2.5 rounded-xl text-xs"
              />
            </div>
          ))}

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-silver-500">Showroom Hub Location</label>
            <Select
              value={tdHub}
              onChange={(val) => setTdHub(val)}
              options={[
                { value: 'New York Showroom', label: 'New York Showroom Hub' },
                { value: 'Los Angeles Center', label: 'Los Angeles Center' },
                { value: 'Chicago Headquarters', label: 'Chicago Headquarters' },
              ]}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-silver-500">Preferred Date</label>
              <input
                type="date"
                required
                value={tdDate}
                onChange={(e) => setTdDate(e.target.value)}
                className="input-premium w-full px-3.5 py-2.5 rounded-xl text-xs cursor-pointer"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-silver-500">Time Slot</label>
              <Select
                value={tdTime}
                onChange={(val) => setTdTime(val)}
                options={[
                  { value: '10:00 AM', label: '10:00 AM' },
                  { value: '12:00 PM', label: '12:00 PM' },
                  { value: '02:00 PM', label: '02:00 PM' },
                  { value: '04:00 PM', label: '04:00 PM' },
                ]}
                className="w-full"
              />
            </div>
          </div>

          <div className="flex gap-2.5 mt-2">
            <Button type="button" variant="secondary" onClick={() => setTestDriveOpen(false)} className="flex-grow py-3 font-bold uppercase text-xs tracking-widest">
              Cancel
            </Button>
            <Button type="submit" variant="gold" className="flex-grow py-3 font-black uppercase text-xs tracking-widest gap-2">
              <Calendar className="w-4 h-4" /> Confirm Appointment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

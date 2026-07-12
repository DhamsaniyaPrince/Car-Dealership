import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button, Card, Modal, Badge } from '../components/UI';
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

  // Local UX States
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [show360, setShow360] = useState(false);
  const [dragRotation, setDragRotation] = useState(0); 

  // Wishlist Compare States
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isComparing, setIsComparing] = useState(false);

  // Test Drive Modal States
  const [testDriveOpen, setTestDriveOpen] = useState(false);
  const [tdDate, setTdDate] = useState('');
  const [tdTime, setTdTime] = useState('10:00 AM');
  const [tdHub, setTdHub] = useState('New York Showroom');
  const [tdName, setTdName] = useState('');
  const [tdEmail, setTdEmail] = useState('');

  // EMI Calculator States
  const [downPaymentPct, setDownPaymentPct] = useState(20);
  const [interestRate, setInterestRate] = useState(4.9);
  const [loanTerm, setLoanTerm] = useState(60);

  // Review states
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [reviewsSort, setReviewsSort] = useState('newest');

  // 1. Query vehicle database record
  const { data: vehicle, isLoading, error } = useQuery({
    queryKey: ['vehicle', id],
    queryFn: async () => {
      const res = await api.get(`/vehicles/${id}`);
      return res.data.data.vehicle;
    },
  });

  // Query database catalog for Similar Vehicles recommendation
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

  // Mapped specifications
  const extendedSpecs = vehicle
    ? getVehicleExtendedSpecs(vehicle.make, vehicle.model, Number(vehicle.price), vehicle.id)
    : null;

  // Initialize wishlist, compare, and reviews states on mount
  useEffect(() => {
    if (!id) return;
    const savedWishlist = localStorage.getItem('dealership_wishlist') || '[]';
    setIsWishlisted(JSON.parse(savedWishlist).includes(id));

    // Load reviews from local storage or set defaults
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

  // Wishlist Toggle handler
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

  // Compare Toggle handler
  const handleCompareToggle = () => {
    setIsComparing(!isComparing);
    if (!isComparing) {
      toast.success('Added to compare checklist. Check the catalog showroom directory.');
    } else {
      toast.success('Removed from compare checklist.');
    }
  };

  // Add Item to Checkout Cart Drawer
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

  // Book Showroom Test Drive appointment
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
    
    // Add Notification
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

  // Add User Review
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

  // Like Review
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
        return {
          ...r,
          likes: hasLiked ? r.likes - 1 : r.likes + 1,
          likedBy,
        };
      }
      return r;
    });

    setReviews(updated);
    localStorage.setItem(`dealership_reviews_${id}`, JSON.stringify(updated));
  };

  // Verify if active user email has purchased this vehicle model
  const isVerifiedBuyer = useMemo(() => {
    if (!user) return false;
    const savedOrders = localStorage.getItem('dealership_orders') || '[]';
    const orders = JSON.parse(savedOrders);
    return orders.some((o: any) => o.model === `${vehicle?.make} ${vehicle?.model}`);
  }, [user, vehicle]);

  // Sorted reviews list
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (error || !vehicle || !extendedSpecs) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-xl font-bold text-red-500">Vehicle Not Found</h2>
        <p className="text-slate-400 mt-2">The specifications you requested might have been sold or removed.</p>
        <Link to="/vehicles" className="mt-6 inline-block">
          <Button variant="outline">Back to Catalog</Button>
        </Link>
      </div>
    );
  }

  const isOutOfStock = vehicle.quantity <= 0;
  const emiValue = Math.round(calculateEMI());

  const detailSpecsList = [
    { label: 'Power Output', value: `${extendedSpecs.horsepower} horsepower` },
    { label: 'Torque Force', value: `${extendedSpecs.torque} lb-ft` },
    { label: 'Fuel Efficiency', value: extendedSpecs.fuelEconomy },
    { label: 'Year Built', value: String(extendedSpecs.year) },
    { label: 'Mileage Logged', value: `${extendedSpecs.mileage.toLocaleString()} miles` },
    { label: 'Warranty Coverage', value: extendedSpecs.warranty },
    { label: 'Authorized Dealer', value: 'DriveElite Corporate, NY' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-10">
      {/* Page Header Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-brand-900 pb-5">
        <Link
          to="/vehicles"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-brand-600 dark:hover:text-accent-400 transition-colors uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Directory
        </Link>
        <span className="text-xxs font-bold text-slate-400 uppercase tracking-widest">
          Catalog &gt; {vehicle.make} &gt; {vehicle.model}
        </span>
      </div>

      {/* Media and Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Media Block (Gallery + 360 TurnTable) */}
        <div className="flex flex-col gap-4">
          <div className="relative h-[400px] bg-slate-900 border border-slate-200 dark:border-brand-850 rounded-2xl overflow-hidden shadow-md">
            <AnimatePresence mode="wait">
              {show360 ? (
                <motion.div
                  key="turntable"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full h-full flex flex-col items-center justify-center p-6 bg-slate-955 relative cursor-grab active:cursor-grabbing select-none"
                >
                  <motion.div
                    drag="x"
                    dragConstraints={{ left: -180, right: 180 }}
                    dragElastic={0.1}
                    onDrag={(_, info) => setDragRotation(info.offset.x % 360)}
                    animate={{ rotateY: dragRotation }}
                    className="w-72 h-44 bg-[url('https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80')] bg-cover bg-center rounded-xl shadow-2xl border border-slate-800"
                  />
                  <div className="absolute bottom-6 text-center">
                    <span className="text-xxs font-black text-accent-500 uppercase tracking-widest">
                      Drag left/right to rotate turntable
                    </span>
                    <p className="text-slate-550 text-xxs mt-0.5">Turntable degrees: {Math.round(dragRotation)}°</p>
                  </div>
                </motion.div>
              ) : (
                <motion.img
                  key="gallery"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  src={extendedSpecs.images[activeImageIdx]}
                  alt={vehicle.model}
                  className="w-full h-full object-cover"
                />
              )}
            </AnimatePresence>

            <span
              className={`absolute top-4 left-4 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider text-white ${
                isOutOfStock ? 'bg-red-655' : 'bg-emerald-600'
              }`}
            >
              {isOutOfStock ? 'Sold Out' : 'Ready for pickup'}
            </span>

            <button
              onClick={() => setShow360(!show360)}
              className="absolute bottom-4 right-4 px-4 py-2 bg-slate-950/80 backdrop-blur-md border border-slate-800 hover:bg-slate-900 text-white rounded-lg text-xxs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              {show360 ? 'View Gallery' : 'Interactive 360° Studio'}
            </button>
          </div>

          {!show360 && (
            <div className="grid grid-cols-3 gap-3">
              {extendedSpecs.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImageIdx(i)}
                  className={`h-24 rounded-xl overflow-hidden border-2 cursor-pointer transition-all bg-slate-55 ${
                    activeImageIdx === i ? 'border-brand-600 dark:border-accent-500' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Specifications Detail Description Pane */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-start gap-4">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 dark:text-white uppercase tracking-tight">
                {vehicle.make} {vehicle.model}
              </h1>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleWishlistToggle}
                  className={`p-2 rounded-lg border border-slate-200 dark:border-brand-850 cursor-pointer text-slate-500 hover:text-accent-500 hover:bg-slate-50 dark:hover:bg-brand-900 transition-colors ${
                    isWishlisted ? 'bg-amber-50 text-accent-500 dark:bg-brand-900 border-accent-500/30' : ''
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-accent-500' : ''}`} />
                </button>
                <button
                  onClick={handleCompareToggle}
                  className={`p-2 rounded-lg border border-slate-200 dark:border-brand-850 cursor-pointer text-slate-500 hover:text-brand-600 hover:bg-slate-50 dark:hover:bg-brand-900 transition-colors ${
                    isComparing ? 'bg-brand-50 text-brand-600 dark:bg-brand-900 border-brand-500/30' : ''
                  }`}
                >
                  <GitCompare className="w-4 h-4" />
                </button>
                <button
                  onClick={handleShare}
                  className="p-2 rounded-lg border border-slate-200 dark:border-brand-850 cursor-pointer text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-brand-900 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-2">
              <span className="text-2xl font-black text-brand-655 dark:text-accent-500">
                ${Number(vehicle.price).toLocaleString()}
              </span>
              <div className="h-4 w-[1px] bg-slate-300 dark:bg-brand-800" />
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                <Gauge className="w-4 h-4 text-slate-400" /> Category: {vehicle.category}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 border-y border-slate-100 dark:border-brand-850 py-5">
            {!isOutOfStock ? (
              <Button
                onClick={handlePurchaseVehicle}
                variant="accent"
                className="px-8 py-3.5 uppercase font-bold tracking-wider text-xs gap-2 flex-grow sm:flex-grow-0"
              >
                Add to Cart <ShoppingBag className="w-4.5 h-4.5" />
              </Button>
            ) : (
              <Badge variant="danger" className="px-8 py-3.5 flex items-center justify-center font-bold text-xs uppercase">
                Sold Out
              </Badge>
            )}
            <Button
              onClick={() => setTestDriveOpen(true)}
              variant="outline"
              className="px-8 py-3.5 uppercase font-bold tracking-wider text-xs gap-2 flex-grow sm:flex-grow-0"
            >
              Schedule Test Drive <Calendar className="w-4.5 h-4.5" />
            </Button>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-xxs font-extrabold uppercase tracking-widest text-slate-400">
              Technical Specifications
            </h3>
            <Card hoverEffect={false} className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-slate-250/50 bg-white dark:bg-brand-900/50">
              {detailSpecsList.map((spec, i) => (
                <div key={i} className="flex justify-between sm:flex-col sm:justify-start gap-0.5 border-b sm:border-b-0 border-slate-50 dark:border-brand-850 pb-2 sm:pb-0 text-xs">
                  <span className="font-semibold text-slate-400 dark:text-slate-500">{spec.label}</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">{spec.value}</span>
                </div>
              ))}
            </Card>
          </div>
        </div>
      </div>

      {/* 3. EMI Calculator Widget */}
      <section className="bg-slate-100 dark:bg-brand-900/20 rounded-2xl p-8 border border-slate-200/50 dark:border-brand-850 mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 flex flex-col gap-6">
          <div>
            <span className="text-xxs font-bold text-slate-400 uppercase tracking-widest">
              Financing Estimation
            </span>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white mt-0.5">
              Monthly Payment Simulator
            </h2>
          </div>

          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-xs font-bold text-slate-655 dark:text-slate-300">
                <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5 text-slate-400" /> Down Payment ({downPaymentPct}%)</span>
                <span>${((Number(vehicle.price) * downPaymentPct) / 100).toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="10"
                max="50"
                step="5"
                value={downPaymentPct}
                onChange={(e) => setDownPaymentPct(Number(e.target.value))}
                className="w-full accent-brand-600 dark:accent-accent-500"
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-xs font-bold text-slate-655 dark:text-slate-300">
                <span className="flex items-center gap-1"><Percent className="w-3.5 h-3.5 text-slate-400" /> Interest rate</span>
                <span>{interestRate}% APR</span>
              </div>
              <input
                type="range"
                min="1.9"
                max="10.9"
                step="0.1"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full accent-brand-600 dark:accent-accent-500"
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-xs font-bold text-slate-655 dark:text-slate-300">
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-slate-400" /> Term duration</span>
                <span>{loanTerm} Months</span>
              </div>
              <input
                type="range"
                min="36"
                max="72"
                step="12"
                value={loanTerm}
                onChange={(e) => setLoanTerm(Number(e.target.value))}
                className="w-full accent-brand-600 dark:accent-accent-500"
              />
            </div>
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-brand-900 rounded-xl flex flex-col justify-center items-center text-center gap-3 border border-slate-200/50 dark:border-brand-850 shadow-sm">
          <span className="text-xxs font-bold text-slate-400 uppercase tracking-widest">
            Estimated EMI
          </span>
          <span className="text-4xl font-black text-brand-655 dark:text-accent-500">
            ${emiValue}
          </span>
          <span className="text-xxs text-slate-400 font-semibold uppercase tracking-wider">
            / month for {loanTerm} mos
          </span>
          <p className="text-slate-500 text-xxs leading-normal max-w-[200px] mt-2">
            Simulated calculations are estimates. Subject to credit verification logs by partner institutions.
          </p>
        </div>
      </section>

      {/* 4. Interactive Customer Reviews Section */}
      <section className="flex flex-col gap-6 mt-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-brand-850 pb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-white">
            Client Review Logs ({reviews.length})
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-xxs font-extrabold uppercase text-slate-455 tracking-wider">Sort:</span>
            <select
              value={reviewsSort}
              onChange={(e) => setReviewsSort(e.target.value)}
              className="bg-transparent border-none py-1 text-xs font-bold text-slate-700 dark:text-slate-200 focus:ring-0 focus:outline-none cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="highest">Highest Rating</option>
              <option value="popular">Most Liked</option>
            </select>
          </div>
        </div>

        {/* Submit Review Form */}
        {user ? (
          <form onSubmit={handleSubmitReview} className="bg-white dark:bg-brand-900 border border-slate-200/60 dark:border-brand-850 rounded-xl p-5 flex flex-col gap-4">
            <h4 className="text-xs font-bold uppercase text-slate-700 dark:text-slate-350">Submit Your Experience</h4>
            <div className="flex gap-4 items-center">
              <span className="text-xs font-semibold text-slate-500">Your Rating:</span>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNewRating(star)}
                    className="cursor-pointer"
                  >
                    <Star className={`w-5 h-5 ${star <= newRating ? 'text-amber-500 fill-amber-500' : 'text-slate-300'}`} />
                  </button>
                ))}
              </div>
            </div>
            <textarea
              required
              rows={3}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share details of your showroom and performance test drive experience..."
              className="w-full p-3 bg-slate-50 dark:bg-brand-950 border border-slate-200 dark:border-brand-800 rounded-lg text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
            <Button type="submit" variant="accent" className="font-bold uppercase text-xxs tracking-wider py-2.5 px-6 self-end">
              Submit Review
            </Button>
          </form>
        ) : (
          <p className="text-xxs font-bold text-slate-450 uppercase tracking-widest text-center py-4 bg-slate-100 dark:bg-brand-900/40 border rounded-xl">
            Please <Link to="/login" className="underline text-brand-600">Sign In</Link> to share your review log.
          </p>
        )}

        {/* Reviews List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
          {sortedReviews.map((rev) => {
            const hasLiked = user && rev.likedBy.includes(user.email);
            const isVerified = isVerifiedBuyer && rev.email === user?.email;
            
            return (
              <Card key={rev.id} hoverEffect={false} className="bg-white border border-slate-250/50 p-6 flex flex-col gap-4 justify-between">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{rev.name}</span>
                      {isVerified && (
                        <Badge variant="success" className="text-[9px] px-1 py-0.5">Verified Buyer</Badge>
                      )}
                    </div>
                    <div className="flex gap-0.5 text-amber-500">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={`w-3.5 h-3.5 ${s <= rev.rating ? 'fill-amber-500' : 'text-slate-200'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed italic">
                    "{rev.comment}"
                  </p>
                </div>

                <div className="flex justify-between items-center border-t border-slate-50 dark:border-brand-850 pt-3">
                  <span className="text-xxs text-slate-400 font-semibold">{rev.date}</span>
                  <button
                    onClick={() => handleLikeReview(rev.id)}
                    className={`flex items-center gap-1.5 text-xxs font-bold uppercase tracking-wider cursor-pointer ${
                      hasLiked ? 'text-brand-600 dark:text-accent-500' : 'text-slate-455 hover:text-slate-700'
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" /> Like ({rev.likes})
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* 5. Similar Vehicles recommendations */}
      {similarVehicles && similarVehicles.length > 0 && (
        <section className="flex flex-col gap-6 mt-8">
          <h3 className="text-xxs font-extrabold uppercase tracking-widest text-slate-400">
            Similar Vehicle Recommendations
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {similarVehicles.map((s: any) => {
              const specs = getVehicleExtendedSpecs(s.make, s.model, Number(s.price), s.id);
              return (
                <Card key={s.id} hoverEffect className="overflow-hidden border border-slate-250/40 p-0 flex flex-col h-full bg-white dark:bg-brand-900">
                  <div className="h-36 bg-slate-100 overflow-hidden relative">
                    <img src={specs.images[0]} alt={s.model} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-4 flex flex-col gap-2">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white truncate">
                      {s.make} {s.model}
                    </h4>
                    <p className="text-sm font-black text-brand-655 dark:text-accent-500">
                      ${Number(s.price).toLocaleString()}
                    </p>
                    <Link to={`/vehicles/${s.id}`} className="mt-2">
                      <Button variant="secondary" size="sm" className="w-full text-xxs uppercase tracking-wider py-1.5">
                        Details Specs
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* Test Drive Booking Modal */}
      <Modal isOpen={testDriveOpen} onClose={() => setTestDriveOpen(false)} title="Book Showroom Test Drive">
        <form onSubmit={handleBookTestDrive} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xxs font-bold uppercase tracking-wider text-slate-500">Full Name</label>
            <input
              type="text"
              required
              value={tdName}
              onChange={(e) => setTdName(e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-brand-950 border border-slate-200 dark:border-brand-800 rounded-lg text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xxs font-bold uppercase tracking-wider text-slate-500">Email Address</label>
            <input
              type="email"
              required
              value={tdEmail}
              onChange={(e) => setTdEmail(e.target.value)}
              placeholder="e.g. john@dealership.com"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-brand-950 border border-slate-200 dark:border-brand-800 rounded-lg text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xxs font-bold uppercase tracking-wider text-slate-500">Showroom Hub Location</label>
            <select
              value={tdHub}
              onChange={(e) => setTdHub(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-brand-950 border border-slate-200 dark:border-brand-800 rounded-lg text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none text-slate-700 dark:text-slate-200"
            >
              <option value="New York Showroom">New York Showroom Hub</option>
              <option value="Los Angeles Center">Los Angeles Center</option>
              <option value="Chicago Headquarters">Chicago Headquarters</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xxs font-bold uppercase tracking-wider text-slate-500">Preferred Date</label>
              <input
                type="date"
                required
                value={tdDate}
                onChange={(e) => setTdDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-brand-950 border border-slate-200 dark:border-brand-800 rounded-lg text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none text-slate-700 dark:text-slate-200"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xxs font-bold uppercase tracking-wider text-slate-500">Time Slot</label>
              <select
                value={tdTime}
                onChange={(e) => setTdTime(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-brand-950 border border-slate-200 dark:border-brand-800 rounded-lg text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none text-slate-700 dark:text-slate-200"
              >
                <option value="10:00 AM">10:00 AM</option>
                <option value="12:00 PM">12:00 PM</option>
                <option value="02:00 PM">02:00 PM</option>
                <option value="04:00 PM">04:00 PM</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2.5 mt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setTestDriveOpen(false)}
              className="flex-grow font-bold uppercase text-xs tracking-wider py-3"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="accent"
              className="flex-grow font-bold uppercase text-xs tracking-wider py-3"
            >
              Confirm Appointment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

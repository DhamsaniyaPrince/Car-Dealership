import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Menu,
  X,
  Car,
  LogOut,
  LayoutDashboard,
  ChevronDown,
  Instagram,
  Twitter,
  Facebook,
  Linkedin,
  User,
  ShoppingCart,
  Bell,
  Trash2,
  CreditCard,
  Check,
  Printer,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dropdown, Button, Modal } from '../components/UI';
import { api } from '../services/api';

interface CartItem {
  id: string;
  make: string;
  model: string;
  category: string;
  price: number;
  image: string;
}

interface NotificationItem {
  id: string;
  title: string;
  desc: string;
  time: string;
  read: boolean;
}

export const RootLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // E-commerce states
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'billing'>('cart');
  
  // Billing form states
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [purchasePending, setPurchasePending] = useState(false);
  const [purchaseInvoice, setPurchaseInvoice] = useState<any | null>(null);

  // Notification states
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const handlePrintInvoice = () => {
    window.print();
  };

  // Scroll listener for sticky header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Sync Cart and Notifications on mount
  useEffect(() => {
    const loadState = () => {
      const savedCart = localStorage.getItem('dealership_cart');
      if (savedCart) setCart(JSON.parse(savedCart));

      const savedNotifs = localStorage.getItem('dealership_notifications');
      if (savedNotifs) {
        setNotifications(JSON.parse(savedNotifs));
      } else {
        // Seed default system notification
        const initial = [
          {
            id: 'notif-1',
            title: 'Welcome to DriveElite',
            desc: 'Secure JWT session authorization keys initialized.',
            time: 'Just now',
            read: false,
          },
        ];
        setNotifications(initial);
        localStorage.setItem('dealership_notifications', JSON.stringify(initial));
      }
    };
    
    loadState();

    // Listen to custom window events for active synchronization
    const handleCartSync = () => {
      const savedCart = localStorage.getItem('dealership_cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
        setCartOpen(true); // Auto slide open cart on adding item!
        setCheckoutStep('cart');
      }
    };

    const handleNotifSync = () => {
      const savedNotifs = localStorage.getItem('dealership_notifications');
      if (savedNotifs) setNotifications(JSON.parse(savedNotifs));
    };

    window.addEventListener('cart-updated', handleCartSync);
    window.addEventListener('notifications-updated', handleNotifSync);

    return () => {
      window.removeEventListener('cart-updated', handleCartSync);
      window.removeEventListener('notifications-updated', handleNotifSync);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully.');
      navigate('/');
    } catch (err) {
      toast.error('Logout error occurred.');
    }
  };

  const removeFromCart = (id: string) => {
    const updated = cart.filter((item) => item.id !== id);
    setCart(updated);
    localStorage.setItem('dealership_cart', JSON.stringify(updated));
    toast.success('Item removed from cart.');
  };

  const markAllNotifsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem('dealership_notifications', JSON.stringify(updated));
  };

  // Submit checkout purchase flow
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.info('Please sign in to complete purchase.');
      setCartOpen(false);
      navigate('/login');
      return;
    }

    if (!cardNumber || cardNumber.length < 16 || !cardCvv || !billingAddress) {
      toast.error('Please fill out valid payment details.');
      return;
    }

    setPurchasePending(true);
    try {
      // Loop over items and trigger backend purchase endpoints
      for (const item of cart) {
        await api.post(`/vehicles/${item.id}/purchase`);
      }

      // Record Order in LocalStorage
      const savedOrders = localStorage.getItem('dealership_orders') || '[]';
      const ordersList = JSON.parse(savedOrders);
      
      const newOrders = cart.map((item) => ({
        id: `txn-${Math.floor(Math.random() * 90000) + 10000}`,
        make: item.make,
        model: item.model,
        category: item.category,
        price: item.price,
        date: new Date().toISOString().slice(0, 10),
        image: item.image,
        invoiceToken: `ELITE-TX-${Math.floor(Math.random() * 9000000) + 1000000}-NY`,
      }));

      localStorage.setItem('dealership_orders', JSON.stringify([...newOrders, ...ordersList]));

      // Add Purchase Success Notification
      const notifItem = {
        id: `notif-${Date.now()}`,
        title: 'Order Confirmed',
        desc: `Successfully purchased ${cart.map((i) => i.model).join(', ')}.`,
        time: 'Just now',
        read: false,
      };
      const updatedNotifs = [notifItem, ...notifications];
      setNotifications(updatedNotifs);
      localStorage.setItem('dealership_notifications', JSON.stringify(updatedNotifs));

      // Open Invoice Details
      setPurchaseInvoice(newOrders[0]);
      
      // Clear Cart
      setCart([]);
      localStorage.removeItem('dealership_cart');
      
      toast.success('Purchase complete! Receipt generated.');
      setCartOpen(false);
      setCheckoutStep('cart');
      setCardName('');
      setCardNumber('');
      setCardExpiry('');
      setCardCvv('');
      setBillingAddress('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Transaction failed. Stock allocation unavailable.');
    } finally {
      setPurchasePending(false);
    }
  };

  const cartSubtotal = cart.reduce((acc, item) => acc + item.price, 0);
  const taxAmount = Math.round(cartSubtotal * 0.08875);
  const docFee = cart.length > 0 ? 450 : 0;
  const cartTotal = cartSubtotal + taxAmount + docFee;

  const unreadNotifsCount = notifications.filter((n) => !n.read).length;
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-brand-950 text-slate-900 dark:text-slate-100 font-sans antialiased">
      {/* 1. Header Navigation */}
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          scrolled
            ? 'bg-white/80 dark:bg-brand-950/80 backdrop-blur-md shadow-lg border-b border-slate-200/60 dark:border-brand-900/60'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-accent-600 dark:from-brand-500 dark:to-accent-500 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
                <Car className="w-5.5 h-5.5 text-white" />
              </div>
              <span className="font-black text-xl tracking-wider bg-gradient-to-r from-brand-800 via-brand-700 to-accent-600 dark:from-white dark:via-slate-200 dark:to-accent-400 bg-clip-text text-transparent">
                DRIVEELITE
              </span>
            </Link>

            {/* Navigation links & controls */}
            <div className="hidden md:flex items-center gap-6">
              <nav className="flex items-center gap-6 mr-4">
                <Link
                  to="/"
                  className={`text-xs font-bold uppercase tracking-widest transition-colors ${
                    isActive('/') ? 'text-brand-600 dark:text-accent-500' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                  }`}
                >
                  Home
                </Link>
                <Link
                  to="/vehicles"
                  className={`text-xs font-bold uppercase tracking-widest transition-colors ${
                    isActive('/vehicles') ? 'text-brand-600 dark:text-accent-500' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                  }`}
                >
                  Catalog
                </Link>
              </nav>

              {/* Cart trigger */}
              <button
                onClick={() => setCartOpen(true)}
                className="relative p-2 rounded-lg text-slate-550 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-brand-900 transition-colors cursor-pointer"
              >
                <ShoppingCart className="w-5.5 h-5.5" />
                {cart.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-brand-600 text-white rounded-full flex items-center justify-center text-xxs font-bold animate-pulse">
                    {cart.length}
                  </span>
                )}
              </button>

              {/* Notifications bell */}
              <Dropdown
                align="right"
                trigger={
                  <button className="relative p-2 rounded-lg text-slate-550 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-brand-900 transition-colors cursor-pointer">
                    <Bell className="w-5.5 h-5.5" />
                    {unreadNotifsCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
                    )}
                  </button>
                }
              >
                <div className="w-64 max-h-80 flex flex-col">
                  <div className="flex justify-between items-center px-4 py-2 border-b border-slate-100 dark:border-brand-850 bg-slate-50 dark:bg-brand-950">
                    <span className="text-xxs font-bold text-slate-500 uppercase tracking-wider">Alert Logs</span>
                    {unreadNotifsCount > 0 && (
                      <button
                        onClick={markAllNotifsRead}
                        className="text-xxs text-brand-600 dark:text-accent-500 hover:underline font-bold"
                      >
                        Read All
                      </button>
                    )}
                  </div>
                  <div className="overflow-y-auto max-h-60 divide-y divide-slate-100 dark:divide-brand-850">
                    {notifications.length === 0 ? (
                      <p className="text-xxs text-slate-400 text-center py-6 font-semibold">No active warnings.</p>
                    ) : (
                      notifications.map((n) => (
                        <div key={n.id} className={`p-3 flex flex-col gap-0.5 text-xs hover:bg-slate-50/50 ${!n.read ? 'bg-brand-50/20' : ''}`}>
                          <span className="font-bold text-slate-700 dark:text-slate-200">{n.title}</span>
                          <p className="text-slate-450 text-xxs leading-normal">{n.desc}</p>
                          <span className="text-slate-400 text-[10px] mt-1">{n.time}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </Dropdown>

              {/* Profile dropdown */}
              {user ? (
                <Dropdown
                  trigger={
                    <div className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-brand-900 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-brand-50 dark:bg-brand-900 border border-brand-200/50 dark:border-brand-800 flex items-center justify-center font-bold text-brand-700 dark:text-brand-300 text-xs">
                        {(user.name ?? user.email ?? '?').charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {user.name ?? user.email}
                      </span>
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    </div>
                  }
                >
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-brand-850 bg-slate-50 dark:bg-brand-950">
                    <p className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Role</p>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{user.role}</p>
                  </div>
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-655 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-brand-850"
                  >
                    <User className="w-4 h-4" /> My Dashboard
                  </Link>
                  {user.role === 'ADMIN' && (
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-655 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-brand-850"
                    >
                      <LayoutDashboard className="w-4 h-4" /> Control Panel
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-2 text-xs font-bold text-red-655 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </Dropdown>
              ) : (
                <div className="flex items-center gap-4">
                  <Link
                    to="/login"
                    className="text-xs font-bold uppercase tracking-widest text-slate-655 hover:text-brand-600 dark:text-slate-350 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest bg-brand-655 text-white hover:bg-brand-700 dark:bg-accent-600 dark:hover:bg-accent-700 shadow-md transition-colors"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu trigger */}
            <div className="flex md:hidden items-center gap-4">
              <button
                onClick={() => setCartOpen(true)}
                className="relative p-2 text-slate-550"
              >
                <ShoppingCart className="w-5.5 h-5.5" />
                {cart.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-brand-600 text-white rounded-full flex items-center justify-center text-xxs font-bold">
                    {cart.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setMobileDrawerOpen(true)}
                className="p-2 rounded-lg text-slate-655 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-brand-900 cursor-pointer"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Slide-out Drawer */}
        <AnimatePresence>
          {mobileDrawerOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileDrawerOpen(false)}
                className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm md:hidden"
              />

              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'tween', duration: 0.3 }}
                className="fixed inset-y-0 right-0 z-50 w-72 max-w-sm bg-white dark:bg-brand-900 border-l border-slate-200 dark:border-brand-850 flex flex-col p-6 shadow-2xl md:hidden"
              >
                <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-brand-850">
                  <span className="font-extrabold text-sm text-slate-800 dark:text-white uppercase tracking-wider">
                    Navigation
                  </span>
                  <button
                    onClick={() => setMobileDrawerOpen(false)}
                    className="p-1 rounded-lg text-slate-450 hover:bg-slate-100 dark:hover:bg-brand-850 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="flex-grow py-6 flex flex-col gap-4">
                  <Link
                    to="/"
                    onClick={() => setMobileDrawerOpen(false)}
                    className={`px-4 py-3 rounded-lg text-sm font-bold uppercase tracking-wider transition-all ${
                      isActive('/') ? 'bg-brand-50 text-brand-700 dark:bg-brand-850' : 'text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    Home
                  </Link>
                  <Link
                    to="/vehicles"
                    onClick={() => setMobileDrawerOpen(false)}
                    className={`px-4 py-3 rounded-lg text-sm font-bold uppercase tracking-wider transition-all ${
                      isActive('/vehicles') ? 'bg-brand-50 text-brand-700 dark:bg-brand-850' : 'text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    Catalog
                  </Link>
                </nav>

                <div className="pt-6 border-t border-slate-100 dark:border-brand-850 flex flex-col gap-4">
                  {user ? (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-3 px-2 py-1 bg-slate-50 dark:bg-brand-950 rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-xs uppercase">
                          {(user.name ?? user.email ?? '?').charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{user.name ?? user.email}</span>
                          <span className="text-xxs text-slate-400 font-bold uppercase">{user.role}</span>
                        </div>
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setMobileDrawerOpen(false)}
                        className="flex items-center justify-center gap-2 w-full px-4 py-3 border border-slate-300 dark:border-brand-800 rounded-lg text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 hover:bg-slate-50"
                      >
                        <User className="w-4 h-4" /> My Dashboard
                      </Link>
                      {user.role === 'ADMIN' && (
                        <Link
                          to="/dashboard"
                          onClick={() => setMobileDrawerOpen(false)}
                          className="flex items-center justify-center gap-2 w-full px-4 py-3 border border-slate-300 dark:border-brand-800 rounded-lg text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 hover:bg-slate-50"
                        >
                          <LayoutDashboard className="w-4 h-4" /> Control Panel
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          setMobileDrawerOpen(false);
                          handleLogout();
                        }}
                        className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-red-50 text-red-655 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-red-100 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        to="/login"
                        onClick={() => setMobileDrawerOpen(false)}
                        className="text-center px-4 py-3 border border-slate-300 dark:border-brand-800 rounded-lg text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300"
                      >
                        Sign In
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setMobileDrawerOpen(false)}
                        className="text-center px-4 py-3 bg-brand-600 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-brand-700 shadow-md"
                      >
                        Register
                      </Link>
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </header>

      {/* Shopping Cart Drawer slide-out */}
      <AnimatePresence>
        {cartOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCartOpen(false)}
              className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm"
            />

            {/* Slider Container */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-white dark:bg-brand-900 border-l border-slate-200 dark:border-brand-850 flex flex-col shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-brand-850 bg-slate-50 dark:bg-brand-950">
                <span className="font-extrabold text-sm text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <ShoppingCart className="w-5 h-5 text-brand-600 dark:text-accent-500" />
                  {checkoutStep === 'cart' ? 'Shopping Cart' : 'Checkout & Payment'}
                </span>
                <button
                  onClick={() => setCartOpen(false)}
                  className="p-1 rounded-lg text-slate-450 hover:bg-slate-100 dark:hover:bg-brand-850 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Dynamic steps */}
              {checkoutStep === 'cart' ? (
                // Step 1: Cart Summary
                <div className="flex-grow flex flex-col p-6 justify-between overflow-y-auto">
                  <div className="flex flex-col gap-4 overflow-y-auto no-scrollbar flex-grow pr-1">
                    {cart.length === 0 ? (
                      <div className="text-center py-20 text-slate-400 text-xs font-semibold flex flex-col items-center gap-2">
                        <ShoppingCart className="w-8 h-8 text-slate-300" />
                        <span>Your shopping cart is empty.</span>
                      </div>
                    ) : (
                      cart.map((item) => (
                        <div key={item.id} className="flex gap-4 border-b border-slate-50 dark:border-brand-850 pb-4 last:border-b-0">
                          <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                            <img src={item.image} alt={item.model} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-grow flex flex-col justify-between">
                            <div className="flex justify-between items-start gap-2">
                              <span className="text-xs font-bold text-slate-800 dark:text-white leading-tight truncate max-w-[150px]">
                                {item.make} {item.model}
                              </span>
                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="text-slate-350 hover:text-red-500 cursor-pointer p-0.5"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <div className="flex justify-between items-baseline">
                              <span className="text-xxs text-slate-400 font-bold uppercase">{item.category}</span>
                              <span className="text-xs font-black text-brand-655 dark:text-accent-500">${item.price.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Calculations & CTA */}
                  {cart.length > 0 && (
                    <div className="border-t border-slate-100 dark:border-brand-850 pt-5 mt-4 flex flex-col gap-3">
                      <div className="flex flex-col gap-2 text-xxs font-bold uppercase text-slate-500">
                        <div className="flex justify-between">
                          <span>Base Subtotal</span>
                          <span>${cartSubtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Sales Tax (8.875%)</span>
                          <span>${taxAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Registration / Doc Fee</span>
                          <span>${docFee}</span>
                        </div>
                        <div className="flex justify-between text-slate-900 dark:text-white text-sm font-black border-t border-slate-100 dark:border-brand-850 pt-3">
                          <span>Total Amount</span>
                          <span>${cartTotal.toLocaleString()}</span>
                        </div>
                      </div>

                      <Button
                        onClick={() => {
                          if (!user) {
                            toast.info('Please sign in to continue.');
                            setCartOpen(false);
                            navigate('/login');
                          } else {
                            setCheckoutStep('billing');
                          }
                        }}
                        variant="accent"
                        className="w-full font-bold uppercase text-xs tracking-wider py-3.5 mt-2 gap-1.5"
                      >
                        <CreditCard className="w-4 h-4" /> Proceed to Checkout
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                // Step 2: Billing & Credit Card Details Form
                <form onSubmit={handlePlaceOrder} className="flex-grow flex flex-col p-6 justify-between overflow-y-auto">
                  <div className="flex flex-col gap-4 overflow-y-auto no-scrollbar flex-grow pr-1">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xxs font-bold uppercase tracking-wider text-slate-500">Cardholder Name</label>
                      <input
                        type="text"
                        required
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full px-3 py-2.5 bg-slate-50 dark:bg-brand-950 border border-slate-200 dark:border-brand-800 rounded-lg text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xxs font-bold uppercase tracking-wider text-slate-500">Credit Card Number</label>
                      <input
                        type="text"
                        required
                        maxLength={16}
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ''))}
                        placeholder="4000123456789010"
                        className="w-full px-3 py-2.5 bg-slate-50 dark:bg-brand-950 border border-slate-200 dark:border-brand-800 rounded-lg text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xxs font-bold uppercase tracking-wider text-slate-500">Expiry Date</label>
                        <input
                          type="text"
                          required
                          maxLength={5}
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="MM/YY"
                          className="w-full px-3 py-2.5 bg-slate-50 dark:bg-brand-950 border border-slate-200 dark:border-brand-800 rounded-lg text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none font-mono"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xxs font-bold uppercase tracking-wider text-slate-500">CVV Security</label>
                        <input
                          type="password"
                          required
                          maxLength={3}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                          placeholder="•••"
                          className="w-full px-3 py-2.5 bg-slate-50 dark:bg-brand-950 border border-slate-200 dark:border-brand-800 rounded-lg text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none font-mono"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xxs font-bold uppercase tracking-wider text-slate-500">Billing Address</label>
                      <input
                        type="text"
                        required
                        value={billingAddress}
                        onChange={(e) => setBillingAddress(e.target.value)}
                        placeholder="100 Elite Drive, New York, NY"
                        className="w-full px-3 py-2.5 bg-slate-50 dark:bg-brand-950 border border-slate-200 dark:border-brand-800 rounded-lg text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Pricing and Submit */}
                  <div className="border-t border-slate-100 dark:border-brand-850 pt-5 mt-4 flex flex-col gap-3">
                    <div className="flex justify-between items-baseline text-xxs font-bold uppercase text-slate-500">
                      <span>Total Amount due</span>
                      <span className="text-sm font-black text-slate-900 dark:text-white">${cartTotal.toLocaleString()}</span>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setCheckoutStep('cart')}
                        className="flex-grow py-3 font-bold uppercase text-xs tracking-wider"
                      >
                        Back
                      </Button>
                      <Button
                        type="submit"
                        disabled={purchasePending}
                        isLoading={purchasePending}
                        variant="accent"
                        className="flex-grow py-3 font-bold uppercase text-xs tracking-wider"
                      >
                        Place Order
                      </Button>
                    </div>
                  </div>
                </form>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Invoice Success printable Modal */}
      <Modal isOpen={!!purchaseInvoice} onClose={() => setPurchaseInvoice(null)} title="Purchase Confirmed">
        {purchaseInvoice && (
          <div className="flex flex-col gap-6 text-slate-800 dark:text-slate-250">
            <div className="text-center flex flex-col items-center gap-3">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-600 mb-2">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Transaction Approved</h3>
              <p className="text-xs text-slate-500 max-w-xs leading-normal">
                Your purchase was recorded. Your receipt has been generated under invoice token **{purchaseInvoice.invoiceToken}**.
              </p>
            </div>

            {/* Calculations specs */}
            <div className="border-t border-b border-slate-100 dark:border-brand-850 py-4 flex flex-col gap-2 font-semibold text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Manufacturer Model</span>
                <span>{purchaseInvoice.make} {purchaseInvoice.model}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Price</span>
                <span>${purchaseInvoice.price.toLocaleString()}</span>
              </div>
            </div>

            {/* Printer Action */}
            <div className="flex gap-2">
              <Button onClick={() => setPurchaseInvoice(null)} variant="secondary" className="flex-grow py-3 font-bold uppercase text-xs tracking-wider">
                Dismiss
              </Button>
              <Button onClick={handlePrintInvoice} variant="accent" className="flex-grow py-3 font-bold uppercase text-xs tracking-wider gap-2">
                <Printer className="w-4 h-4" /> Print Receipt
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Main Page Workspace */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Exhaustive Multi-Column Footer */}
      <footer className="bg-slate-950 text-slate-400 border-t border-slate-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Column 1: Brand Bio */}
          <div className="flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-accent-500 flex items-center justify-center shadow-lg">
                <Car className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="font-black text-base text-white tracking-widest">DRIVEELITE</span>
            </Link>
            <p className="text-xs leading-relaxed text-slate-500">
              The premier dealership management platform. Discover curated vehicles, manage
              real-time sales operations, and optimize vehicle listings.
            </p>
            {/* Social Icons */}
            <div className="flex gap-4 mt-2">
              <a href="#" className="p-2 rounded-lg bg-slate-900 hover:bg-brand-600 hover:text-white transition-all text-slate-500">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-slate-900 hover:bg-brand-600 hover:text-white transition-all text-slate-500">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-slate-900 hover:bg-brand-600 hover:text-white transition-all text-slate-500">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-slate-900 hover:bg-brand-600 hover:text-white transition-all text-slate-500">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Company */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4">
              Company
            </h4>
            <ul className="space-y-3 text-xs">
              <li>
                <a href="#" className="hover:text-white transition-colors">About DriveElite</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Dealership Fleet</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Careers</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Press & Media</a>
              </li>
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4">
              Resources
            </h4>
            <ul className="space-y-3 text-xs">
              <li>
                <Link to="/vehicles" className="hover:text-white transition-colors">Fleet Catalog</Link>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Special Offers</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Financing Models</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Help Center & FAQ</a>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Legal */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4">
              Contact & Hours
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed mb-2">
              Corporate Office: <br />
              100 Elite Drive, Suite 500 <br />
              New York, NY 10001
            </p>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Mon - Sat: 9:00 AM - 7:00 PM <br />
              Sun: Closed
            </p>
            <Link
              to="/login"
              className="text-xs font-bold text-accent-500 hover:text-accent-400 transition-colors inline-flex items-center gap-1"
            >
              Portal Login &rarr;
            </Link>
          </div>
        </div>

        {/* Legal bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-650">
            &copy; {new Date().getFullYear()} DriveElite Dealerships. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-slate-650">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-400 cursor-pointer">Cookie Settings</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

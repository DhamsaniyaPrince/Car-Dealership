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
  ArrowUp,
  MapPin,
  Phone,
  Clock,
  Shield,
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
  const [showScrollTop, setShowScrollTop] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'billing'>('cart');

  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [purchasePending, setPurchasePending] = useState(false);
  const [purchaseInvoice, setPurchaseInvoice] = useState<any | null>(null);

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const handlePrintInvoice = () => window.print();

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 30);
      setShowScrollTop(y > 500);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const loadState = () => {
      const savedCart = localStorage.getItem('dealership_cart');
      if (savedCart) setCart(JSON.parse(savedCart));

      const savedNotifs = localStorage.getItem('dealership_notifications');
      if (savedNotifs) {
        setNotifications(JSON.parse(savedNotifs));
      } else {
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

    const handleCartSync = () => {
      const savedCart = localStorage.getItem('dealership_cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
        setCartOpen(true);
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
    } catch {
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
      for (const item of cart) {
        await api.post(`/vehicles/${item.id}/purchase`);
      }
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

      setPurchaseInvoice(newOrders[0]);
      setCart([]);
      localStorage.removeItem('dealership_cart');
      toast.success('Purchase complete! Receipt generated.');
      setCartOpen(false);
      setCheckoutStep('cart');
      setCardName(''); setCardNumber(''); setCardExpiry(''); setCardCvv(''); setBillingAddress('');
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

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/vehicles', label: 'Catalog' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-obsidian-900 text-silver-200 font-sans antialiased">

      {/* ======================================================
          HEADER — Premium frosted glass navbar
         ====================================================== */}
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`fixed top-0 z-40 w-full transition-all duration-500 ${
          scrolled
            ? 'glass border-b border-white/6 shadow-[0_8px_32px_rgba(0,0,0,0.4)]'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <motion.div
                whileHover={{ rotate: 8, scale: 1.1 }}
                transition={{ duration: 0.3 }}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-500 to-gold-700 flex items-center justify-center shadow-gold-sm"
              >
                <Car className="w-5 h-5 text-obsidian-900" />
              </motion.div>
              <span className="font-display font-black text-xl tracking-widest text-white">
                DRIVE<span className="text-gradient-gold">ELITE</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-5">
              <nav className="flex items-center gap-1">
                {navLinks.map(({ to, label }) => (
                  <Link
                    key={to}
                    to={to}
                    className={`relative px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all duration-200 rounded-lg ${
                      isActive(to)
                        ? 'text-gold-400'
                        : 'text-silver-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {label}
                    {isActive(to) && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-gold-500 rounded-full"
                      />
                    )}
                  </Link>
                ))}
              </nav>

              {/* Divider */}
              <div className="w-px h-5 bg-white/10" />

              {/* Cart button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCartOpen(true)}
                className="relative p-2 rounded-xl text-silver-400 hover:text-white hover:bg-white/8 transition-all duration-200 cursor-pointer"
              >
                <ShoppingCart className="w-5 h-5" />
                <AnimatePresence>
                  {cart.length > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-gold-500 text-obsidian-900 rounded-full flex items-center justify-center text-[9px] font-black"
                    >
                      {cart.length}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Notifications */}
              <Dropdown
                align="right"
                trigger={
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    className="relative p-2 rounded-xl text-silver-400 hover:text-white hover:bg-white/8 transition-all duration-200 cursor-pointer"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadNotifsCount > 0 && (
                      <motion.span
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full"
                      />
                    )}
                  </motion.button>
                }
              >
                <div className="w-72 max-h-80 flex flex-col">
                  <div className="flex justify-between items-center px-4 py-3 border-b border-white/6">
                    <span className="text-xs font-bold text-silver-400 uppercase tracking-widest">Alerts</span>
                    {unreadNotifsCount > 0 && (
                      <button
                        onClick={markAllNotifsRead}
                        className="text-xs text-gold-400 hover:text-gold-300 font-bold cursor-pointer"
                      >
                        Read All
                      </button>
                    )}
                  </div>
                  <div className="overflow-y-auto max-h-60 divide-y divide-white/4">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-silver-500 text-center py-6 font-medium">No active alerts.</p>
                    ) : (
                      notifications.map((n) => (
                        <div key={n.id} className={`p-3.5 flex flex-col gap-1 hover:bg-white/3 transition-colors ${!n.read ? 'border-l-2 border-gold-500/50' : ''}`}>
                          <span className="text-xs font-bold text-white">{n.title}</span>
                          <p className="text-xs text-silver-500 leading-normal">{n.desc}</p>
                          <span className="text-[10px] text-silver-600 font-medium">{n.time}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </Dropdown>

              {/* Profile */}
              {user ? (
                <Dropdown
                  trigger={
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-white/8 transition-all cursor-pointer border border-white/8"
                    >
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gold-500 to-gold-700 flex items-center justify-center font-black text-obsidian-900 text-xs shadow-gold-sm">
                        {(user.name ?? user.email ?? '?').charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs font-bold text-silver-200">{user.name ?? user.email}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-silver-500" />
                    </motion.div>
                  }
                >
                  <div className="px-4 py-3 border-b border-white/6">
                    <p className="text-[10px] font-bold text-silver-600 uppercase tracking-widest">Role</p>
                    <p className="text-xs font-bold text-gold-400 mt-0.5">{user.role}</p>
                  </div>
                  <Link to="/profile" className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-silver-300 hover:text-white hover:bg-white/5 transition-colors">
                    <User className="w-4 h-4 text-silver-500" /> My Dashboard
                  </Link>
                  {user.role === 'ADMIN' && (
                    <Link to="/dashboard" className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-silver-300 hover:text-white hover:bg-white/5 transition-colors">
                      <LayoutDashboard className="w-4 h-4 text-silver-500" /> Control Panel
                    </Link>
                  )}
                  <div className="border-t border-white/6 mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/8 transition-colors cursor-pointer rounded-b-xl"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </Dropdown>
              ) : (
                <div className="flex items-center gap-3">
                  <Link to="/login" className="text-xs font-bold uppercase tracking-widest text-silver-400 hover:text-white transition-colors">
                    Sign In
                  </Link>
                  <Link to="/register">
                    <Button variant="gold" size="sm" className="uppercase tracking-widest font-black text-xs px-5">
                      Register
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu trigger */}
            <div className="flex md:hidden items-center gap-3">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setCartOpen(true)}
                className="relative p-2 text-silver-400"
              >
                <ShoppingCart className="w-5 h-5" />
                {cart.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-gold-500 text-obsidian-900 rounded-full flex items-center justify-center text-[9px] font-black">
                    {cart.length}
                  </span>
                )}
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setMobileDrawerOpen(true)}
                className="p-2 rounded-xl text-silver-300 hover:bg-white/8 border border-white/10 cursor-pointer"
              >
                <Menu className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile Drawer */}
        <AnimatePresence>
          {mobileDrawerOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileDrawerOpen(false)}
                className="fixed inset-0 z-40 bg-obsidian-950/80 backdrop-blur-sm md:hidden"
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="fixed inset-y-0 right-0 z-50 w-72 glass border-l border-white/6 flex flex-col p-6 shadow-premium md:hidden"
              >
                <div className="flex items-center justify-between pb-6 border-b border-white/6">
                  <span className="font-display font-black text-sm text-white uppercase tracking-wider">Menu</span>
                  <motion.button
                    whileTap={{ scale: 0.9, rotate: 90 }}
                    onClick={() => setMobileDrawerOpen(false)}
                    className="p-1.5 rounded-lg text-silver-400 hover:bg-white/8 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>

                <nav className="flex-grow py-6 flex flex-col gap-1">
                  {navLinks.map(({ to, label }, i) => (
                    <motion.div
                      key={to}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07 }}
                    >
                      <Link
                        to={to}
                        onClick={() => setMobileDrawerOpen(false)}
                        className={`flex items-center px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all ${
                          isActive(to)
                            ? 'bg-gold-500/10 text-gold-400 border border-gold-500/20'
                            : 'text-silver-400 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        {label}
                      </Link>
                    </motion.div>
                  ))}
                </nav>

                <div className="pt-6 border-t border-white/6 flex flex-col gap-3">
                  {user ? (
                    <>
                      <div className="flex items-center gap-3 p-3 bg-white/4 rounded-xl border border-white/6">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold-500 to-gold-700 flex items-center justify-center font-black text-obsidian-900 text-sm">
                          {(user.name ?? user.email ?? '?').charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{user.name ?? user.email}</p>
                          <p className="text-[10px] text-gold-500 font-bold uppercase tracking-widest">{user.role}</p>
                        </div>
                      </div>
                      <Link to="/profile" onClick={() => setMobileDrawerOpen(false)} className="flex items-center justify-center gap-2 w-full px-4 py-2.5 border border-white/12 rounded-xl text-xs font-bold uppercase tracking-wider text-silver-300 hover:bg-white/5 transition-colors">
                        <User className="w-4 h-4" /> My Dashboard
                      </Link>
                      {user.role === 'ADMIN' && (
                        <Link to="/dashboard" onClick={() => setMobileDrawerOpen(false)} className="flex items-center justify-center gap-2 w-full px-4 py-2.5 border border-white/12 rounded-xl text-xs font-bold uppercase tracking-wider text-silver-300 hover:bg-white/5 transition-colors">
                          <LayoutDashboard className="w-4 h-4" /> Control Panel
                        </Link>
                      )}
                      <button onClick={() => { setMobileDrawerOpen(false); handleLogout(); }} className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-red-500/15 transition-colors">
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <Link to="/login" onClick={() => setMobileDrawerOpen(false)} className="text-center px-4 py-2.5 border border-white/12 rounded-xl text-xs font-bold uppercase tracking-wider text-silver-300 hover:bg-white/5">
                        Sign In
                      </Link>
                      <Link to="/register" onClick={() => setMobileDrawerOpen(false)} className="text-center px-4 py-2.5 bg-gradient-to-r from-gold-600 to-gold-500 text-obsidian-900 rounded-xl text-xs font-black uppercase tracking-wider shadow-gold-sm">
                        Register
                      </Link>
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </motion.header>

      {/* ======================================================
          CART DRAWER
         ====================================================== */}
      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCartOpen(false)}
              className="fixed inset-0 z-50 bg-obsidian-950/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 glass border-l border-white/8 flex flex-col shadow-premium overflow-hidden"
            >
              {/* Accent line */}
              <div className="h-0.5 bg-gradient-to-r from-transparent via-gold-500 to-transparent" />

              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/6">
                <span className="font-display font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
                  <ShoppingCart className="w-4.5 h-4.5 text-gold-500" />
                  {checkoutStep === 'cart' ? 'Shopping Cart' : 'Checkout & Payment'}
                </span>
                <motion.button
                  whileHover={{ rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setCartOpen(false)}
                  className="p-1.5 rounded-lg text-silver-500 hover:text-white hover:bg-white/8 cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              {checkoutStep === 'cart' ? (
                <div className="flex-grow flex flex-col p-6 justify-between overflow-y-auto">
                  <div className="flex flex-col gap-4 overflow-y-auto no-scrollbar flex-grow pr-1">
                    {cart.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-20 flex flex-col items-center gap-4"
                      >
                        <div className="w-16 h-16 rounded-2xl bg-white/4 border border-white/8 flex items-center justify-center">
                          <ShoppingCart className="w-7 h-7 text-silver-600" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-silver-400">Cart is empty</p>
                          <p className="text-xs text-silver-600 mt-1">Browse our catalog to add vehicles</p>
                        </div>
                        <Button onClick={() => { setCartOpen(false); navigate('/vehicles'); }} variant="gold" size="sm" className="mt-2 uppercase tracking-widest font-black">
                          Browse Catalog
                        </Button>
                      </motion.div>
                    ) : (
                      cart.map((item, i) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.06 }}
                          className="flex gap-4 pb-4 border-b border-white/6 last:border-0"
                        >
                          <div className="w-16 h-16 rounded-xl overflow-hidden bg-obsidian-800 shrink-0 border border-white/6">
                            <img src={item.image} alt={item.model} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-grow flex flex-col justify-between">
                            <div className="flex justify-between items-start gap-2">
                              <span className="text-xs font-bold text-white leading-tight truncate max-w-[150px]">
                                {item.make} {item.model}
                              </span>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => removeFromCart(item.id)}
                                className="text-silver-600 hover:text-red-400 cursor-pointer p-0.5 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </motion.button>
                            </div>
                            <div className="flex justify-between items-baseline">
                              <span className="text-[10px] text-silver-500 font-bold uppercase tracking-widest">{item.category}</span>
                              <span className="text-xs font-black text-gold-400">${item.price.toLocaleString()}</span>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>

                  {cart.length > 0 && (
                    <div className="border-t border-white/6 pt-5 mt-4 flex flex-col gap-3">
                      <div className="flex flex-col gap-2 text-xs font-semibold text-silver-500">
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
                        <div className="flex justify-between text-white text-sm font-black border-t border-white/6 pt-3 mt-1">
                          <span>Total Amount</span>
                          <span className="text-gradient-gold">${cartTotal.toLocaleString()}</span>
                        </div>
                      </div>
                      <Button
                        onClick={() => {
                          if (!user) { toast.info('Please sign in to continue.'); setCartOpen(false); navigate('/login'); }
                          else setCheckoutStep('billing');
                        }}
                        variant="gold"
                        className="w-full font-black uppercase tracking-widest text-xs py-3.5 mt-1 gap-2"
                      >
                        <CreditCard className="w-4 h-4" /> Proceed to Checkout
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handlePlaceOrder} className="flex-grow flex flex-col p-6 justify-between overflow-y-auto">
                  <div className="flex flex-col gap-4">
                    {[
                      { label: 'Cardholder Name', value: cardName, onChange: (v: string) => setCardName(v), placeholder: 'John Doe', type: 'text' },
                      { label: 'Credit Card Number', value: cardNumber, onChange: (v: string) => setCardNumber(v.replace(/\D/g, '')), placeholder: '4000123456789010', type: 'text', maxLength: 16 },
                    ].map((field) => (
                      <div key={field.label} className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-silver-500">{field.label}</label>
                        <input
                          type={field.type}
                          required
                          maxLength={field.maxLength}
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                          placeholder={field.placeholder}
                          className="input-premium w-full px-3 py-2.5 rounded-xl text-xs"
                        />
                      </div>
                    ))}

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-silver-500">Expiry Date</label>
                        <input type="text" required maxLength={5} value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} placeholder="MM/YY" className="input-premium w-full px-3 py-2.5 rounded-xl text-xs font-mono" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-silver-500">CVV Security</label>
                        <input type="password" required maxLength={3} value={cardCvv} onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))} placeholder="•••" className="input-premium w-full px-3 py-2.5 rounded-xl text-xs font-mono" />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-silver-500">Billing Address</label>
                      <input type="text" required value={billingAddress} onChange={(e) => setBillingAddress(e.target.value)} placeholder="100 Elite Drive, New York, NY" className="input-premium w-full px-3 py-2.5 rounded-xl text-xs" />
                    </div>
                  </div>

                  <div className="border-t border-white/6 pt-5 mt-4 flex flex-col gap-3">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs font-semibold text-silver-500 uppercase tracking-widest">Total Due</span>
                      <span className="text-lg font-black text-gradient-gold">${cartTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" variant="secondary" onClick={() => setCheckoutStep('cart')} className="flex-grow py-3 text-xs uppercase tracking-widest font-bold">Back</Button>
                      <Button type="submit" disabled={purchasePending} isLoading={purchasePending} variant="gold" className="flex-grow py-3 text-xs uppercase tracking-widest font-black">
                        Place Order
                      </Button>
                    </div>
                    <div className="flex items-center justify-center gap-1.5 text-[10px] text-silver-600">
                      <Shield className="w-3 h-3" />
                      <span>256-bit SSL encrypted checkout</span>
                    </div>
                  </div>
                </form>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Invoice Modal */}
      <Modal isOpen={!!purchaseInvoice} onClose={() => setPurchaseInvoice(null)} title="Purchase Confirmed">
        {purchaseInvoice && (
          <div className="flex flex-col gap-6">
            <div className="text-center flex flex-col items-center gap-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', bounce: 0.5 }}
                className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center"
              >
                <Check className="w-8 h-8 text-emerald-400" />
              </motion.div>
              <div>
                <h3 className="text-lg font-display font-bold text-white">Transaction Approved</h3>
                <p className="text-xs text-silver-500 max-w-xs leading-relaxed mt-2">
                  Purchase recorded. Invoice token:{' '}
                  <span className="text-gold-400 font-mono font-bold">{purchaseInvoice.invoiceToken}</span>
                </p>
              </div>
            </div>

            <div className="border-y border-white/6 py-4 flex flex-col gap-2.5 text-xs font-semibold">
              <div className="flex justify-between">
                <span className="text-silver-500">Model</span>
                <span className="text-white">{purchaseInvoice.make} {purchaseInvoice.model}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-silver-500">Total Price</span>
                <span className="text-gold-400 font-black">${purchaseInvoice.price.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={() => setPurchaseInvoice(null)} variant="secondary" className="flex-grow py-3 text-xs uppercase tracking-widest font-bold">Dismiss</Button>
              <Button onClick={handlePrintInvoice} variant="gold" className="flex-grow py-3 text-xs uppercase tracking-widest font-black gap-2">
                <Printer className="w-4 h-4" /> Print Receipt
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Main content */}
      <main className="flex-grow pt-[72px]">
        <Outlet />
      </main>

      {/* ======================================================
          FOOTER — Cinematic premium footer
         ====================================================== */}
      <footer className="bg-obsidian-950 border-t border-white/5 pt-20 pb-8 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-gold-500/40 to-transparent" />
        <div
          className="absolute inset-0 pointer-events-none opacity-2"
          style={{
            backgroundImage: 'linear-gradient(rgba(201,168,76,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.05) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            {/* Brand column */}
            <div className="flex flex-col gap-5 md:col-span-1">
              <Link to="/" className="flex items-center gap-3 w-fit group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-500 to-gold-700 flex items-center justify-center shadow-gold-sm">
                  <Car className="w-5 h-5 text-obsidian-900" />
                </div>
                <span className="font-display font-black text-xl text-white tracking-widest">
                  DRIVE<span className="text-gradient-gold">ELITE</span>
                </span>
              </Link>
              <p className="text-xs text-silver-600 leading-relaxed max-w-xs">
                The premier dealership management platform. Discover curated vehicles, manage real-time sales operations, and optimize your automotive experience.
              </p>
              <div className="flex gap-2 mt-1">
                {[
                  { icon: Twitter, href: '#' },
                  { icon: Instagram, href: '#' },
                  { icon: Facebook, href: '#' },
                  { icon: Linkedin, href: '#' },
                ].map(({ icon: Icon, href }, i) => (
                  <motion.a
                    key={i}
                    href={href}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-9 h-9 rounded-xl bg-white/4 border border-white/8 flex items-center justify-center text-silver-500 hover:text-gold-400 hover:bg-gold-500/10 hover:border-gold-500/20 transition-all duration-200 cursor-pointer"
                  >
                    <Icon className="w-4 h-4" />
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-[0.2em] mb-5">Company</h4>
              <ul className="space-y-3">
                {['About DriveElite', 'Dealership Fleet', 'Careers', 'Press & Media'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-xs text-silver-600 hover:text-gold-400 transition-colors duration-200">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-[0.2em] mb-5">Resources</h4>
              <ul className="space-y-3">
                <li><Link to="/vehicles" className="text-xs text-silver-600 hover:text-gold-400 transition-colors">Fleet Catalog</Link></li>
                {['Special Offers', 'Financing Models', 'Help Center & FAQ'].map((item) => (
                  <li key={item}><a href="#" className="text-xs text-silver-600 hover:text-gold-400 transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-[0.2em] mb-5">Contact & Hours</h4>
              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-3.5 h-3.5 text-gold-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-silver-600 leading-relaxed">100 Elite Drive, Suite 500<br />New York, NY 10001</p>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="w-3.5 h-3.5 text-gold-500 shrink-0" />
                  <p className="text-xs text-silver-600">+1 (212) 555-0199</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <Clock className="w-3.5 h-3.5 text-gold-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-silver-600 leading-relaxed">Mon – Sat: 9:00 AM – 7:00 PM<br />Sun: Closed</p>
                </div>
                <Link to="/login" className="inline-flex items-center gap-1 text-xs font-bold text-gold-500 hover:text-gold-400 transition-colors mt-1">
                  Portal Login →
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="divider-gold mb-6" />
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-silver-700">
              © {new Date().getFullYear()} DriveElite Dealerships. All rights reserved.
            </p>
            <div className="flex gap-5 text-xs text-silver-700">
              {['Privacy Policy', 'Terms of Service', 'Cookie Settings'].map((item) => (
                <span key={item} className="hover:text-gold-500 cursor-pointer transition-colors">{item}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* Scroll to top button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-6 right-6 z-30 w-11 h-11 rounded-xl bg-gold-500 text-obsidian-900 flex items-center justify-center shadow-gold-md cursor-pointer"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

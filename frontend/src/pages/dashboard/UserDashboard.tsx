import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Card, Button, Badge, Modal, TableContainer, TableHead, TableRow } from '../../components/UI';
import { getVehicleExtendedSpecs } from '../../utils/specs';
import {
  User,
  ShoppingBag,
  Heart,
  Calendar,
  Bell,
  Settings,
  Printer,
  FileText,
  Trash2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BookingItem {
  id: string;
  model: string;
  date: string;
  time: string;
  hub: string;
  status: string;
}

interface OrderItem {
  id: string;
  make: string;
  model: string;
  category: string;
  price: number;
  date: string;
  image: string;
  invoiceToken: string;
}

export const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'profile' | 'purchases' | 'wishlist' | 'testdrives' | 'settings'>('profile');
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);

  // Settings form states
  const [displayName, setDisplayName] = useState(user?.name || '');
  const [displayEmail, setDisplayEmail] = useState(user?.email || '');

  // Persistent local states
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  // 1. Query catalog data to display details for wishlist items
  const { data: vehicles, isLoading } = useQuery({
    queryKey: ['userDashboardCatalogList'],
    queryFn: async () => {
      const res = await api.get('/vehicles', { params: { limit: 100 } });
      return res.data.data.vehicles;
    },
  });

  // Sync state from LocalStorage on mount and handle updates
  useEffect(() => {
    const loadLocalStorage = () => {
      const savedWishlist = localStorage.getItem('dealership_wishlist');
      if (savedWishlist) setWishlistIds(JSON.parse(savedWishlist));

      const savedOrders = localStorage.getItem('dealership_orders');
      if (savedOrders) setOrders(JSON.parse(savedOrders));

      const savedBookings = localStorage.getItem('dealership_bookings');
      if (savedBookings) setBookings(JSON.parse(savedBookings));

      const savedNotifs = localStorage.getItem('dealership_notifications');
      if (savedNotifs) setNotifications(JSON.parse(savedNotifs));
    };

    loadLocalStorage();

    // Listen to custom sync events
    const handleNotifSync = () => {
      const savedNotifs = localStorage.getItem('dealership_notifications');
      if (savedNotifs) setNotifications(JSON.parse(savedNotifs));
    };

    window.addEventListener('notifications-updated', handleNotifSync);
    return () => window.removeEventListener('notifications-updated', handleNotifSync);
  }, []);

  // Filter full vehicle details for saved favorites
  const wishlistVehicles = useMemo(() => {
    if (!vehicles) return [];
    return vehicles
      .filter((v: any) => wishlistIds.includes(v.id))
      .map((v: any) => ({
        ...v,
        specs: getVehicleExtendedSpecs(v.make, v.model, Number(v.price), v.id),
      }));
  }, [vehicles, wishlistIds]);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Profile configurations updated successfully.');
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  // Remove item from Wishlist
  const handleRemoveWishlist = (id: string) => {
    const updated = wishlistIds.filter((item) => item !== id);
    setWishlistIds(updated);
    localStorage.setItem('dealership_wishlist', JSON.stringify(updated));
    toast.success('Removed from favorites.');
  };

  // Move wishlist item directly to Checkout Cart drawer
  const handleMoveToPurchase = (vehicle: any) => {
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
      image: vehicle.specs.images[0],
    };

    localStorage.setItem('dealership_cart', JSON.stringify([...cartItems, newItem]));
    
    // Prune from wishlist
    handleRemoveWishlist(vehicle.id);
    
    // Dispatch cart update to slide open drawer
    window.dispatchEvent(new Event('cart-updated'));
    toast.success('Moved to checkout cart.');
  };

  // Cancel scheduled showroom appointment
  const handleCancelBooking = (bookingId: string) => {
    const updated = bookings.filter((b) => b.id !== bookingId);
    setBookings(updated);
    localStorage.setItem('dealership_bookings', JSON.stringify(updated));

    // Add notification alert
    const notifItem = {
      id: `notif-${Date.now()}`,
      title: 'Appointment Cancelled',
      desc: 'Showroom test drive appointment successfully cancelled.',
      time: 'Just now',
      read: false,
    };
    const savedNotifs = localStorage.getItem('dealership_notifications') || '[]';
    localStorage.setItem('dealership_notifications', JSON.stringify([notifItem, ...JSON.parse(savedNotifs)]));
    window.dispatchEvent(new Event('notifications-updated'));

    toast.success('Appointment cancelled successfully.');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-8">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-brand-900 pb-5">
        <h1 className="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tight">
          Client Dashboard
        </h1>
        <p className="text-slate-400 text-xs mt-1 font-semibold">
          Review your purchase history, invoices, book showroom test drives, and modify security settings.
        </p>
      </div>

      {/* Main Split */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Navigation Sidebar */}
        <aside className="lg:col-span-1 bg-white dark:bg-brand-900 border border-slate-200/60 dark:border-brand-850 rounded-2xl p-4 shadow-sm flex flex-col gap-1.5">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider text-left transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-brand-50 text-brand-700 dark:bg-brand-850 dark:text-accent-400'
                : 'text-slate-500 hover:bg-slate-50 dark:text-slate-350 dark:hover:bg-brand-855'
            }`}
          >
            <User className="w-4.5 h-4.5" /> My Profile
          </button>
          <button
            onClick={() => setActiveTab('purchases')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider text-left transition-all cursor-pointer ${
              activeTab === 'purchases'
                ? 'bg-brand-50 text-brand-700 dark:bg-brand-850 dark:text-accent-400'
                : 'text-slate-500 hover:bg-slate-50 dark:text-slate-350 dark:hover:bg-brand-855'
            }`}
          >
            <ShoppingBag className="w-4.5 h-4.5" /> Orders & Invoices ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('wishlist')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider text-left transition-all cursor-pointer ${
              activeTab === 'wishlist'
                ? 'bg-brand-50 text-brand-700 dark:bg-brand-850 dark:text-accent-400'
                : 'text-slate-500 hover:bg-slate-50 dark:text-slate-350 dark:hover:bg-brand-855'
            }`}
          >
            <Heart className="w-4.5 h-4.5" /> Saved Vehicles ({wishlistIds.length})
          </button>
          <button
            onClick={() => setActiveTab('testdrives')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider text-left transition-all cursor-pointer ${
              activeTab === 'testdrives'
                ? 'bg-brand-50 text-brand-700 dark:bg-brand-850 dark:text-accent-400'
                : 'text-slate-500 hover:bg-slate-50 dark:text-slate-350 dark:hover:bg-brand-855'
            }`}
          >
            <Calendar className="w-4.5 h-4.5" /> Test Drives ({bookings.length})
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider text-left transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-brand-50 text-brand-700 dark:bg-brand-850 dark:text-accent-400'
                : 'text-slate-500 hover:bg-slate-50 dark:text-slate-350 dark:hover:bg-brand-855'
            }`}
          >
            <Settings className="w-4.5 h-4.5" /> Settings
          </button>
        </aside>

        {/* Dynamic Display Panels */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {/* Tab: Profile */}
            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex flex-col gap-6"
              >
                <Card hoverEffect={false} className="bg-white dark:bg-brand-900 border border-slate-200/50 p-6 flex flex-col sm:flex-row items-center gap-6">
                  <div className="w-16 h-16 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-xl uppercase">
                    {(user?.name ?? user?.email ?? '?').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-grow flex flex-col gap-1 text-center sm:text-left">
                    <span className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight">{user?.name}</span>
                    <span className="text-xs text-slate-500">{user?.email}</span>
                    <Badge variant="primary" className="w-fit self-center sm:self-start mt-2">
                      Gold Elite Member
                    </Badge>
                  </div>
                </Card>

                {/* Notifications list */}
                <div className="flex flex-col gap-3">
                  <h3 className="text-xxs font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1">
                    <Bell className="w-4 h-4" /> Message Logs
                  </h3>
                  <div className="flex flex-col gap-3">
                    {notifications.length === 0 ? (
                      <Card hoverEffect={false} className="text-center py-8 text-slate-400 text-xs font-semibold">
                        No notification alerts logged.
                      </Card>
                    ) : (
                      notifications.map((n) => (
                        <Card key={n.id} hoverEffect={false} className="bg-white dark:bg-brand-900 border border-slate-200/50 p-5 flex justify-between items-center text-xs">
                          <div className="flex flex-col gap-1">
                            <span className="font-bold text-slate-800 dark:text-slate-200">{n.title}</span>
                            <span className="text-slate-505 dark:text-slate-400 leading-relaxed">{n.desc}</span>
                          </div>
                          <span className="text-xxs text-slate-400 font-bold shrink-0">{n.time}</span>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Tab: Orders & Invoices */}
            {activeTab === 'purchases' && (
              <motion.div
                key="purchases"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex flex-col gap-6"
              >
                {orders.length === 0 ? (
                  <Card hoverEffect={false} className="text-center py-16 text-slate-400 text-xs font-semibold">
                    No orders registered yet. Discover catalog models to make a purchase.
                  </Card>
                ) : (
                  <div className="flex flex-col gap-4">
                    {orders.map((p) => (
                      <Card key={p.id} hoverEffect={false} className="bg-white dark:bg-brand-900 border border-slate-200/50 p-5 flex flex-col sm:flex-row items-center gap-4 justify-between">
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                          <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 dark:bg-brand-950 shrink-0 border border-slate-200 dark:border-brand-850">
                            <img src={imgSource(p.image)} alt="vehicle" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-800 dark:text-white">{p.make} {p.model}</span>
                            <span className="text-xxs text-slate-450 uppercase font-semibold">{p.category}</span>
                            <span className="text-xs font-black text-brand-655 dark:text-accent-500 mt-1">${Number(p.price).toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="flex gap-2 w-full sm:w-auto mt-4 sm:mt-0">
                          <Button
                            onClick={() => setSelectedInvoice(p)}
                            variant="secondary"
                            size="sm"
                            className="gap-1 px-4 py-2 w-full sm:w-auto"
                          >
                            <FileText className="w-4 h-4" /> View Invoice
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Tab: Saved Vehicles (Wishlist) */}
            {activeTab === 'wishlist' && (
              <motion.div
                key="wishlist"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex flex-col gap-6"
              >
                {isLoading ? (
                  <p className="text-xs text-slate-400">Loading saved fleet...</p>
                ) : wishlistVehicles.length === 0 ? (
                  <Card hoverEffect={false} className="text-center py-16 text-slate-400 text-xs font-semibold">
                    Your wishlist is empty. Save models from the catalog directory.
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {wishlistVehicles.map((v: any) => (
                      <Card key={v.id} hoverEffect={false} className="overflow-hidden border border-slate-200 p-0 flex flex-col justify-between bg-white dark:bg-brand-900">
                        <div className="h-36 bg-slate-100 relative shrink-0">
                          <img src={v.specs.images[0]} alt="car" className="w-full h-full object-cover" />
                          <button
                            onClick={() => handleRemoveWishlist(v.id)}
                            className="absolute top-2 right-2 p-1.5 bg-white hover:bg-slate-100 text-slate-400 hover:text-red-500 rounded-lg cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="p-4 flex flex-col gap-3">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-800 dark:text-white truncate">{v.make} {v.model}</span>
                            <span className="text-xxs text-slate-450 uppercase font-semibold">{v.category}</span>
                            <span className="text-xs font-black text-brand-655 mt-1">${Number(v.price).toLocaleString()}</span>
                          </div>

                          {/* Availability Alerts */}
                          <div className="flex justify-between items-center text-xxs font-bold uppercase tracking-wider pt-2 border-t border-slate-100">
                            {v.quantity > 0 ? (
                              <span className="text-emerald-600">Available</span>
                            ) : (
                              <span className="text-red-500">Backordered</span>
                            )}
                            <button
                              onClick={() => {
                                if (v.quantity > 0) {
                                  toast.info(`Availability alerts are already active. Email notifications will trigger.`);
                                } else {
                                  toast.success(`We will notify you at ${user?.email} as soon as this model is restocked!`);
                                }
                              }}
                              className="text-brand-600 hover:underline"
                            >
                              Alert me
                            </button>
                          </div>

                          <div className="flex gap-2 mt-2">
                            <Link to={`/vehicles/${v.id}`} className="flex-grow">
                              <Button variant="secondary" size="sm" className="w-full text-xxs py-1.5 uppercase font-bold tracking-wider">
                                Specs
                              </Button>
                            </Link>
                            {v.quantity > 0 && (
                              <Button
                                onClick={() => handleMoveToPurchase(v)}
                                variant="accent"
                                size="sm"
                                className="w-full text-xxs py-1.5 uppercase font-bold tracking-wider"
                              >
                                Buy Now
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Tab: Test Drives */}
            {activeTab === 'testdrives' && (
              <motion.div
                key="testdrives"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex flex-col gap-4"
              >
                <h3 className="text-xxs font-extrabold uppercase tracking-widest text-slate-400">
                  Scheduled Showroom Appointments
                </h3>
                {bookings.length === 0 ? (
                  <Card hoverEffect={false} className="text-center py-16 text-slate-400 text-xs font-semibold">
                    No appointments booked yet. Schedule a test drive from a vehicle specs detail page.
                  </Card>
                ) : (
                  <TableContainer>
                    <TableHead>
                      <TableRow>
                        <th className="px-4 py-2.5 text-xxs font-bold uppercase tracking-wider text-slate-455">Vehicle</th>
                        <th className="px-4 py-2.5 text-xxs font-bold uppercase tracking-wider text-slate-455">Showroom</th>
                        <th className="px-4 py-2.5 text-xxs font-bold uppercase tracking-wider text-slate-455">Date</th>
                        <th className="px-4 py-2.5 text-xxs font-bold uppercase tracking-wider text-slate-455">Time</th>
                        <th className="px-4 py-2.5 text-xxs font-bold uppercase tracking-wider text-slate-455">Action</th>
                      </TableRow>
                    </TableHead>
                    <tbody>
                      {bookings.map((td) => (
                        <TableRow key={td.id}>
                          <td className="px-4 py-3 text-xs font-bold text-slate-800 dark:text-slate-200">{td.model}</td>
                          <td className="px-4 py-3 text-xs text-slate-550 font-semibold">{td.hub}</td>
                          <td className="px-4 py-3 text-xs text-slate-500">{td.date}</td>
                          <td className="px-4 py-3 text-xs text-slate-500">{td.time}</td>
                          <td className="px-4 py-3 text-xs font-bold">
                            <button
                              onClick={() => handleCancelBooking(td.id)}
                              className="text-red-500 hover:text-red-705 cursor-pointer hover:underline"
                            >
                              Cancel
                            </button>
                          </td>
                        </TableRow>
                      ))}
                    </tbody>
                  </TableContainer>
                )}
              </motion.div>
            )}

            {/* Tab: Settings */}
            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
                <Card hoverEffect={false} className="bg-white dark:bg-brand-900 border border-slate-200/50 p-6">
                  <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4 max-w-md">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xxs font-bold uppercase tracking-wider text-slate-500">Display Name</label>
                      <input
                        type="text"
                        required
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-brand-950 border border-slate-200 dark:border-brand-800 rounded-lg text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xxs font-bold uppercase tracking-wider text-slate-500">Email Address</label>
                      <input
                        type="email"
                        required
                        value={displayEmail}
                        onChange={(e) => setDisplayEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-brand-950 border border-slate-200 dark:border-brand-800 rounded-lg text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                      />
                    </div>
                    <Button type="submit" variant="accent" className="font-bold uppercase text-xs tracking-wider py-3 mt-2 w-fit px-6">
                      Save Changes
                    </Button>
                  </form>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Invoice Details printable Modal */}
      <Modal isOpen={!!selectedInvoice} onClose={() => setSelectedInvoice(null)} title="Purchase Receipt & Invoice">
        {selectedInvoice && (
          <div className="flex flex-col gap-6 text-slate-800 dark:text-slate-250">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-brand-850 pb-4">
              <div className="flex flex-col">
                <span className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">DRIVEELITE</span>
                <span className="text-xxs text-slate-400 font-semibold uppercase tracking-wider">{selectedInvoice.invoiceToken}</span>
              </div>
              <Badge variant="success">PAID</Badge>
            </div>

            <div className="flex flex-col gap-2.5 text-xs font-semibold">
              <div className="flex justify-between">
                <span className="text-slate-400">Date Issued</span>
                <span>{selectedInvoice.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Purchaser Name</span>
                <span>{user?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Model Description</span>
                <span>{selectedInvoice.make} {selectedInvoice.model}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Vehicle Class</span>
                <span>{selectedInvoice.category}</span>
              </div>
            </div>

            <div className="border-t border-slate-150 dark:border-brand-850 pt-4 flex flex-col gap-2 font-bold text-xs">
              <div className="flex justify-between text-slate-550">
                <span>Vehicle Base Price</span>
                <span>${Number(selectedInvoice.price).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-555">
                <span>Sales Tax (8.875%)</span>
                <span>${Math.round(Number(selectedInvoice.price) * 0.08875).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-555">
                <span>Registration & Doc Fee</span>
                <span>$450</span>
              </div>
              <div className="flex justify-between text-slate-900 dark:text-white text-sm font-black border-t border-slate-100 dark:border-brand-850 pt-3">
                <span>Total Paid</span>
                <span>${Math.round(Number(selectedInvoice.price) * 1.08875 + 450).toLocaleString()}</span>
              </div>
            </div>

            <div className="flex gap-2 border-t border-slate-100 dark:border-brand-850 pt-5">
              <Button onClick={() => setSelectedInvoice(null)} variant="secondary" className="flex-grow py-3 font-bold uppercase text-xs tracking-wider">
                Close
              </Button>
              <Button onClick={handlePrintInvoice} variant="accent" className="flex-grow py-3 font-bold uppercase text-xs tracking-wider gap-2">
                <Printer className="w-4 h-4" /> Print Invoice
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

// Image fallback helper
const imgSource = (src: string) => {
  return src || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80';
};

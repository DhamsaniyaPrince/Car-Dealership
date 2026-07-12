import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Button, Badge, Modal, Pagination, SectionLabel, Skeleton, Select } from '../components/UI';
import { getVehicleExtendedSpecs } from '../utils/specs';
import {
  Search,
  SlidersHorizontal,
  Fuel,
  Sliders,
  Grid,
  List,
  Heart,
  GitCompare,
  Eye,
  Calendar,
  X,
  Star,
  Gauge,
  Sparkles,
  ShoppingBag,
  ArrowUpDown,
} from 'lucide-react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';

// Premium vehicle card for inventory
const InventoryCard: React.FC<{
  vehicle: any;
  viewMode: 'grid' | 'list';
  isFav: boolean;
  isComp: boolean;
  onWishlist: () => void;
  onCompare: () => void;
  onQuickView: () => void;
  onBuy: () => void;
  index: number;
}> = ({ vehicle, viewMode, isFav, isComp, onWishlist, onCompare, onQuickView, onBuy, index }) => {
  const [hovered, setHovered] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const inStock = vehicle.quantity > 0;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay: Math.min(index * 0.07, 0.35) }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className={`group relative rounded-2xl overflow-hidden border border-white/8 bg-obsidian-800/80 ${
        viewMode === 'list' ? 'flex flex-row' : 'flex flex-col'
      }`}
      style={{
        boxShadow: hovered ? '0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(201,168,76,0.12)' : '0 4px 24px rgba(0,0,0,0.3)',
        transform: hovered ? 'translateY(-5px)' : 'translateY(0)',
        transition: 'all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      }}
    >
      {/* Image section */}
      <div className={`relative overflow-hidden bg-obsidian-900 shrink-0 ${
        viewMode === 'list' ? 'w-full sm:w-56 h-44 sm:h-auto' : 'h-52'
      }`}>
        <motion.img
          src={vehicle.specs.images[0]}
          alt={`${vehicle.make} ${vehicle.model}`}
          className="w-full h-full object-cover"
          animate={{ scale: hovered ? 1.07 : 1 }}
          transition={{ duration: 0.5 }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950/70 via-transparent to-transparent" />

        {/* Top badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          <Badge variant="gold" className="text-[9px] font-black uppercase tracking-widest shadow-gold-sm">
            {vehicle.category}
          </Badge>
          {vehicle.specs.isFeatured && (
            <Badge variant="warning" className="flex items-center gap-1 text-[9px]">
              <Sparkles className="w-2.5 h-2.5" /> Featured
            </Badge>
          )}
          {vehicle.specs.discountPrice && (
            <Badge variant="danger" className="text-[9px]">OFFER</Badge>
          )}
        </div>

        {/* Stock indicator */}
        {!inStock && (
          <div className="absolute bottom-3 left-3">
            <Badge variant="danger" className="text-[9px] font-black">Sold Out</Badge>
          </div>
        )}

        {/* Hover action buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: hovered ? 1 : 0 }}
          className="absolute inset-0 bg-obsidian-950/50 backdrop-blur-[2px] flex items-center justify-center gap-2"
        >
          {[
            { icon: Eye, label: 'Quick View', action: onQuickView },
            { icon: GitCompare, label: 'Compare', action: onCompare, active: isComp },
          ].map(({ icon: Icon, label, action, active }) => (
            <motion.button
              key={label}
              initial={{ scale: 0.8, y: 10 }}
              animate={{ scale: hovered ? 1 : 0.8, y: hovered ? 0 : 10 }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={action}
              title={label}
              className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                active
                  ? 'bg-gold-500 text-obsidian-900 border-gold-500/30'
                  : 'bg-obsidian-900/80 text-white border-white/20 hover:bg-gold-500/15 hover:border-gold-500/30'
              }`}
            >
              <Icon className="w-4 h-4" />
            </motion.button>
          ))}
        </motion.div>
      </div>

      {/* Details section */}
      <div className={`p-5 flex flex-col gap-4 flex-grow justify-between ${viewMode === 'list' ? 'flex-grow' : ''}`}>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-start gap-3">
            <h3 className="font-display font-bold text-white text-base leading-tight">
              {vehicle.make} <span className="text-silver-400">{vehicle.model}</span>
            </h3>
            <motion.button
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={onWishlist}
              className="p-0.5 transition-colors cursor-pointer shrink-0"
            >
              <Heart
                className={`w-4.5 h-4.5 transition-all duration-300 ${
                  isFav ? 'text-red-400 fill-red-400 drop-shadow-[0_0_6px_rgba(248,113,113,0.6)]' : 'text-silver-600 hover:text-red-400'
                }`}
              />
            </motion.button>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1.5 text-xs">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, si) => (
                <Star key={si} className={`w-3 h-3 ${si < Math.floor(vehicle.specs.rating) ? 'text-amber-400 fill-amber-400' : 'text-silver-700'}`} />
              ))}
            </div>
            <span className="text-silver-500 font-medium">({vehicle.specs.reviewsCount})</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2 mt-0.5">
            {vehicle.specs.discountPrice ? (
              <>
                <span className="text-xl font-display font-black text-red-400">${vehicle.specs.discountPrice.toLocaleString()}</span>
                <span className="text-sm text-silver-600 line-through">${Number(vehicle.price).toLocaleString()}</span>
              </>
            ) : (
              <span className="text-xl font-display font-black text-gradient-gold">
                ${Number(vehicle.price).toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Tech specs */}
        <div className="grid grid-cols-3 gap-2 border-t border-white/6 pt-3">
          {[
            { icon: Calendar, value: vehicle.specs.year },
            { icon: Gauge, value: `${vehicle.specs.mileage.toLocaleString()} mi` },
            { icon: Fuel, value: vehicle.specs.fuelType === 'Plug-in Hybrid' ? 'Hybrid' : vehicle.specs.fuelType },
          ].map(({ icon: Icon, value }) => (
            <div key={value} className="flex items-center gap-1 text-[10px] font-bold text-silver-500 uppercase tracking-wider">
              <Icon className="w-3 h-3 text-silver-600 shrink-0" />
              <span className="truncate">{value}</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link to={`/vehicles/${vehicle.id}`} className="flex-1">
            <Button variant="secondary" size="sm" className="w-full text-xs font-bold uppercase tracking-widest py-2.5">
              Details
            </Button>
          </Link>
          {inStock ? (
            <Button
              onClick={onBuy}
              variant="gold"
              size="sm"
              className="flex-1 text-xs font-black uppercase tracking-widest py-2.5"
            >
              Buy Now
            </Button>
          ) : (
            <div className="flex-1 flex items-center justify-center px-3 py-2 rounded-xl border border-red-500/20 bg-red-500/8 text-red-400 text-xs font-bold uppercase tracking-widest">
              Sold Out
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export const InventoryPage: React.FC = () => {
  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [make, setMake] = useState('');
  const [category, setCategory] = useState('');
  const [fuelType, setFuelType] = useState('');
  const [transmission, setTransmission] = useState('');
  const [maxPrice, setMaxPrice] = useState(150000);
  const [maxMileage, setMaxMileage] = useState(30000);
  const [minHorsepower, setMinHorsepower] = useState(200);
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [wishlist, setWishlist] = useState<string[]>([]);
  const [compareList, setCompareList] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<any | null>(null);

  const [page, setPage] = useState(1);
  const itemsPerPage = 6;

  const { data: rawData, isLoading } = useQuery({
    queryKey: ['allCatalogVehicles'],
    queryFn: async () => {
      const res = await api.get('/vehicles', { params: { limit: 100 } });
      return res.data.data.vehicles;
    },
  });

  useEffect(() => {
    const savedWishlist = localStorage.getItem('dealership_wishlist');
    if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
  }, []);

  const processedVehicles = useMemo(() => {
    if (!rawData) return [];
    return rawData
      .map((vehicle: any) => {
        const specs = getVehicleExtendedSpecs(vehicle.make, vehicle.model, Number(vehicle.price), vehicle.id);
        return { ...vehicle, specs };
      })
      .filter((vehicle: any) => {
        const matchSearch = !search || vehicle.make.toLowerCase().includes(search.toLowerCase()) || vehicle.model.toLowerCase().includes(search.toLowerCase());
        const matchMake = !make || vehicle.make.toLowerCase() === make.toLowerCase();
        const matchCategory = !category || vehicle.category.toLowerCase().includes(category.toLowerCase());
        const matchFuel = !fuelType || vehicle.specs.fuelType === fuelType;
        const matchTransmission = !transmission || vehicle.specs.transmission === transmission;
        const matchPrice = Number(vehicle.price) <= maxPrice;
        const matchMileage = vehicle.specs.mileage <= maxMileage;
        const matchHP = vehicle.specs.horsepower >= minHorsepower;
        const matchStock = !onlyInStock || vehicle.quantity > 0;
        return matchSearch && matchMake && matchCategory && matchFuel && matchTransmission && matchPrice && matchMileage && matchHP && matchStock;
      })
      .sort((a: any, b: any) => {
        if (sortBy === 'price-asc') return Number(a.price) - Number(b.price);
        if (sortBy === 'price-desc') return Number(b.price) - Number(a.price);
        if (sortBy === 'mileage') return a.specs.mileage - b.specs.mileage;
        if (sortBy === 'rating') return b.specs.rating - a.specs.rating;
        return b.specs.year - a.specs.year;
      });
  }, [rawData, search, make, category, fuelType, transmission, maxPrice, maxMileage, minHorsepower, onlyInStock, sortBy]);

  const uniqueMakes = useMemo(() => !rawData ? [] : Array.from(new Set(rawData.map((v: any) => v.make))) as string[], [rawData]);
  const uniqueCategories = useMemo(() => !rawData ? [] : Array.from(new Set(rawData.map((v: any) => v.category.split(' ')[0]))) as string[], [rawData]);

  const handleResetFilters = () => {
    setSearch(''); setMake(''); setCategory(''); setFuelType(''); setTransmission('');
    setMaxPrice(150000); setMaxMileage(30000); setMinHorsepower(200); setOnlyInStock(false); setSortBy('newest'); setPage(1);
  };

  const paginatedVehicles = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return processedVehicles.slice(start, start + itemsPerPage);
  }, [processedVehicles, page]);

  const totalPages = Math.ceil(processedVehicles.length / itemsPerPage);

  const toggleWishlist = (id: string) => {
    let updated;
    if (wishlist.includes(id)) {
      updated = wishlist.filter((i) => i !== id);
      toast.success('Removed from favorites.');
    } else {
      updated = [...wishlist, id];
      const savedNotifs = localStorage.getItem('dealership_notifications') || '[]';
      const notifsList = JSON.parse(savedNotifs);
      const vehicleName = rawData?.find((v: any) => v.id === id);
      const notifItem = { id: `notif-${Date.now()}`, title: 'Saved to Wishlist', desc: `You saved ${vehicleName?.make || ''} ${vehicleName?.model || ''} to your profile favorites.`, time: 'Just now', read: false };
      localStorage.setItem('dealership_notifications', JSON.stringify([notifItem, ...notifsList]));
      window.dispatchEvent(new Event('notifications-updated'));
      toast.success('Added to favorites.');
    }
    setWishlist(updated);
    localStorage.setItem('dealership_wishlist', JSON.stringify(updated));
  };

  const toggleCompare = (id: string) => {
    if (compareList.includes(id)) {
      setCompareList((prev) => prev.filter((i) => i !== id));
      toast.success('Removed from compare list.');
    } else {
      if (compareList.length >= 4) { toast.info('You can compare a maximum of 4 vehicles.'); return; }
      setCompareList((prev) => [...prev, id]);
      toast.success('Added to compare list.');
    }
  };

  const handlePurchaseVehicle = (vehicle: any) => {
    const savedCart = localStorage.getItem('dealership_cart') || '[]';
    const cartItems = JSON.parse(savedCart);
    if (cartItems.some((item: any) => item.id === vehicle.id)) { toast.info('This vehicle model is already in your shopping cart.'); return; }
    const specs = vehicle.specs || getVehicleExtendedSpecs(vehicle.make, vehicle.model, Number(vehicle.price), vehicle.id);
    const newItem = { id: vehicle.id, make: vehicle.make, model: vehicle.model, category: vehicle.category, price: Number(vehicle.price), image: specs.images[0] };
    localStorage.setItem('dealership_cart', JSON.stringify([...cartItems, newItem]));
    window.dispatchEvent(new Event('cart-updated'));
    toast.success('Added to checkout cart.');
    setSelectedVehicle(null);
  };

  const activeChips = useMemo(() => {
    const chips = [];
    if (search) chips.push({ id: 'search', label: `Search: ${search}`, reset: () => setSearch('') });
    if (make) chips.push({ id: 'make', label: `Make: ${make}`, reset: () => setMake('') });
    if (category) chips.push({ id: 'category', label: `Category: ${category}`, reset: () => setCategory('') });
    if (fuelType) chips.push({ id: 'fuelType', label: `Fuel: ${fuelType}`, reset: () => setFuelType('') });
    if (transmission) chips.push({ id: 'transmission', label: `Transmission: ${transmission}`, reset: () => setTransmission('') });
    if (maxPrice < 150000) chips.push({ id: 'price', label: `Max Price: $${maxPrice.toLocaleString()}`, reset: () => setMaxPrice(150000) });
    if (maxMileage < 30000) chips.push({ id: 'mileage', label: `Max Mileage: ${maxMileage.toLocaleString()} mi`, reset: () => setMaxMileage(30000) });
    if (minHorsepower > 200) chips.push({ id: 'hp', label: `Min Power: ${minHorsepower} hp`, reset: () => setMinHorsepower(200) });
    if (onlyInStock) chips.push({ id: 'stock', label: 'In Stock Only', reset: () => setOnlyInStock(false) });
    return chips;
  }, [search, make, category, fuelType, transmission, maxPrice, maxMileage, minHorsepower, onlyInStock]);

  const comparedVehiclesData = useMemo(() => {
    if (!rawData) return [];
    return rawData.filter((v: any) => compareList.includes(v.id)).map((v: any) => ({ ...v, specs: getVehicleExtendedSpecs(v.make, v.model, Number(v.price), v.id) }));
  }, [rawData, compareList]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <SectionLabel className="mb-3">Premium Collection</SectionLabel>
          <h1 className="font-display font-black text-4xl sm:text-5xl text-white uppercase tracking-tight mt-2">
            Vehicle <span className="text-gradient-gold">Showroom</span>
          </h1>
          <p className="text-silver-500 text-sm mt-2 font-medium">
            Explore and filter premium performance cars, electric crossovers, and luxury sedans.
          </p>
        </div>

        {compareList.length > 0 && (
          <motion.button
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.03 }}
            onClick={() => setCompareOpen(true)}
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-obsidian-900 bg-gradient-to-r from-gold-500 to-gold-400 px-5 py-3 rounded-xl shadow-gold-md cursor-pointer"
          >
            <GitCompare className="w-4 h-4 animate-pulse" /> Compare Matrix ({compareList.length}/4)
          </motion.button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Filter Sidebar */}
        <aside className="lg:col-span-1 glass rounded-2xl p-6 flex flex-col gap-6 sticky top-24 border border-white/6">
          <div className="flex items-center justify-between pb-4 border-b border-white/6">
            <span className="flex items-center gap-2 font-bold text-white uppercase tracking-wider text-xs">
              <SlidersHorizontal className="w-4 h-4 text-gold-500" /> Search Filters
            </span>
            <button onClick={handleResetFilters} className="text-[10px] font-bold text-gold-500 hover:text-gold-400 transition-colors uppercase tracking-widest cursor-pointer">
              Reset All
            </button>
          </div>

          {/* Search */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-silver-500">Keyword</label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. Model Y, Taycan..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="input-premium w-full pl-9 pr-4 py-2.5 rounded-xl text-xs"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-silver-600" />
            </div>
          </div>

          {/* Manufacturer */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-silver-500">Manufacturer</label>
            <Select
              value={make}
              onChange={(val) => { setMake(val); setPage(1); }}
              options={[
                { value: '', label: 'All Brands' },
                ...uniqueMakes.map((m) => ({ value: m, label: m })),
              ]}
              className="w-full"
            />
          </div>

          {/* Category */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-silver-500">Vehicle Class</label>
            <Select
              value={category}
              onChange={(val) => { setCategory(val); setPage(1); }}
              options={[
                { value: '', label: 'All Categories' },
                ...uniqueCategories.map((c) => ({ value: c, label: c })),
              ]}
              className="w-full"
            />
          </div>

          {/* Fuel Type */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-silver-500">Fuel Engine</label>
            <div className="grid grid-cols-3 gap-1.5">
              {['Electric', 'Plug-in Hybrid', 'Gasoline'].map((type) => {
                const selected = fuelType === type;
                return (
                  <motion.button
                    key={type}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { setFuelType(selected ? '' : type); setPage(1); }}
                    className={`px-2 py-2 rounded-xl text-[9px] font-bold uppercase tracking-wider text-center cursor-pointer transition-all duration-200 border ${
                      selected
                        ? 'border-gold-500/40 bg-gold-500/15 text-gold-400'
                        : 'border-white/8 text-silver-600 hover:border-white/15 hover:text-white'
                    }`}
                  >
                    {type === 'Plug-in Hybrid' ? 'Hybrid' : type}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Sliders */}
          <div className="flex flex-col gap-5 border-t border-white/6 pt-4">
            {[
              { label: 'MAX BUDGET', value: maxPrice, set: setMaxPrice, min: 20000, max: 150000, step: 5000, format: (v: number) => `$${v.toLocaleString()}` },
              { label: 'MAX MILEAGE', value: maxMileage, set: setMaxMileage, min: 0, max: 30000, step: 2000, format: (v: number) => `${v.toLocaleString()} mi` },
              { label: 'MIN HORSEPOWER', value: minHorsepower, set: setMinHorsepower, min: 200, max: 600, step: 25, format: (v: number) => `${v} hp` },
            ].map((slider) => (
              <div key={slider.label} className="flex flex-col gap-2">
                <div className="flex justify-between text-[10px] font-bold text-silver-500 uppercase tracking-widest">
                  <span>{slider.label}</span>
                  <span className="text-gold-400 font-mono">{slider.format(slider.value)}</span>
                </div>
                <input
                  type="range"
                  min={slider.min}
                  max={slider.max}
                  step={slider.step}
                  value={slider.value}
                  onChange={(e) => { slider.set(Number(e.target.value)); setPage(1); }}
                  className="w-full cursor-pointer"
                />
              </div>
            ))}
          </div>

          {/* In stock toggle */}
          <div className="flex justify-between items-center border-t border-white/6 pt-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-silver-500">In-Stock Only</span>
            <div
              className={`toggle-premium ${onlyInStock ? 'active' : ''}`}
              onClick={() => { setOnlyInStock(!onlyInStock); setPage(1); }}
            >
              <div className="toggle-thumb" />
            </div>
          </div>
        </aside>

        {/* Listings pane */}
        <div className="lg:col-span-3 flex flex-col gap-5">
          {/* Top bar */}
          <div className="glass rounded-xl px-5 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 border border-white/6">
            <span className="text-xs font-semibold text-silver-500">
              {isLoading ? 'Searching catalog...' : `${processedVehicles.length} Models found`}
            </span>

            <div className="flex items-center gap-3">
              {/* Sort */}
              <div className="flex items-center gap-2">
                <Select
                  value={sortBy}
                  onChange={(val) => setSortBy(val)}
                  options={[
                    { value: 'newest', label: 'Year (Newest)' },
                    { value: 'price-asc', label: 'Price (Low–High)' },
                    { value: 'price-desc', label: 'Price (High–Low)' },
                    { value: 'mileage', label: 'Lowest Mileage' },
                    { value: 'rating', label: 'Top Rated' },
                  ]}
                  icon={<ArrowUpDown className="w-3.5 h-3.5 text-silver-650" />}
                  className="border-none bg-transparent hover:bg-white/5 py-1.5 px-2.5 rounded-lg text-silver-300"
                />
              </div>

              {/* Grid/List toggle */}
              <div className="flex border border-white/10 rounded-lg p-0.5 bg-obsidian-900/50">
                {([['grid', Grid], ['list', List]] as const).map(([mode, Icon]) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`p-1.5 rounded-md cursor-pointer transition-all ${
                      viewMode === mode
                        ? 'bg-gold-500/20 text-gold-400'
                        : 'text-silver-600 hover:text-silver-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Active filter chips */}
          <AnimatePresence>
            {activeChips.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-wrap gap-2 items-center"
              >
                <span className="text-[10px] font-bold uppercase text-silver-600 tracking-widest">Active:</span>
                {activeChips.map((chip) => (
                  <motion.button
                    key={chip.id}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    onClick={chip.reset}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-gold-500/12 text-gold-400 border border-gold-500/20 hover:bg-gold-500/20 transition-colors uppercase tracking-wider cursor-pointer"
                  >
                    {chip.label} <X className="w-3 h-3" />
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Cards */}
          {isLoading ? (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-5' : 'flex flex-col gap-4'}>
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="rounded-2xl overflow-hidden border border-white/6" style={{ height: viewMode === 'grid' ? 360 : 180 }}>
                  <Skeleton className="h-full w-full" />
                </div>
              ))}
            </div>
          ) : processedVehicles.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center text-center p-16 rounded-2xl border border-dashed border-white/10 bg-obsidian-850/40"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="w-20 h-20 rounded-3xl border border-white/8 bg-white/2 flex items-center justify-center mb-5"
              >
                <Sliders className="w-8 h-8 text-silver-600" />
              </motion.div>
              <h3 className="font-display font-bold text-lg text-white uppercase tracking-wider">No Vehicles Match</h3>
              <p className="text-sm text-silver-500 mt-2 max-w-sm">
                Try widening your price ranges, clearing active filter chips, or adjusting mileage sliders.
              </p>
              <Button onClick={handleResetFilters} variant="outline" className="mt-6 font-bold uppercase tracking-widest text-xs">
                Clear All Filters
              </Button>
            </motion.div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-5' : 'flex flex-col gap-4'}>
              <AnimatePresence mode="popLayout">
                {paginatedVehicles.map((vehicle: any, index: number) => (
                  <InventoryCard
                    key={vehicle.id}
                    vehicle={vehicle}
                    viewMode={viewMode}
                    isFav={wishlist.includes(vehicle.id)}
                    isComp={compareList.includes(vehicle.id)}
                    onWishlist={() => toggleWishlist(vehicle.id)}
                    onCompare={() => toggleCompare(vehicle.id)}
                    onQuickView={() => setSelectedVehicle(vehicle)}
                    onBuy={() => handlePurchaseVehicle(vehicle)}
                    index={index}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-4">
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
            </div>
          )}
        </div>
      </div>

      {/* Quick View Modal */}
      <Modal isOpen={!!selectedVehicle} onClose={() => setSelectedVehicle(null)} title="Quick Vehicle Specs">
        {selectedVehicle && (
          <div className="flex flex-col gap-5">
            <div className="h-52 rounded-xl overflow-hidden relative border border-white/8">
              <img src={selectedVehicle.specs.images[0]} alt={selectedVehicle.model} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950/60 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <Badge variant="gold" className="text-[9px] font-black uppercase">{selectedVehicle.category}</Badge>
              </div>
            </div>

            <div>
              <h2 className="font-display font-black text-2xl text-white">{selectedVehicle.make} {selectedVehicle.model}</h2>
              <p className="text-2xl font-display font-black text-gradient-gold mt-1">
                ${Number(selectedVehicle.price).toLocaleString()}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 border-y border-white/6 py-4 text-xs">
              {[
                ['Year', selectedVehicle.specs.year],
                ['Mileage', `${selectedVehicle.specs.mileage.toLocaleString()} mi`],
                ['Engine Power', `${selectedVehicle.specs.horsepower} hp`],
                ['Engine Type', selectedVehicle.specs.fuelType],
                ['Transmission', selectedVehicle.specs.transmission],
                ['Available Stock', `${selectedVehicle.quantity} units`],
              ].map(([k, v]) => (
                <div key={k as string} className="flex justify-between border-b border-white/4 pb-2">
                  <span className="text-silver-500">{k}</span>
                  <span className="text-white font-semibold">{v}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-2.5">
              <Link to={`/vehicles/${selectedVehicle.id}`} onClick={() => setSelectedVehicle(null)} className="flex-1">
                <Button variant="outline" className="w-full font-bold uppercase tracking-widest py-3">
                  Full Details
                </Button>
              </Link>
              {selectedVehicle.quantity > 0 ? (
                <Button
                  onClick={() => handlePurchaseVehicle(selectedVehicle)}
                  variant="gold"
                  className="flex-1 font-black uppercase tracking-widest py-3 gap-2"
                >
                  Add To Cart <ShoppingBag className="w-4 h-4" />
                </Button>
              ) : (
                <div className="flex-1 flex items-center justify-center px-4 py-3 rounded-xl border border-red-500/20 bg-red-500/8 text-red-400 text-xs font-bold uppercase tracking-widest">
                  Sold Out
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Compare Matrix Modal */}
      <Modal isOpen={compareOpen} onClose={() => setCompareOpen(false)} title="Vehicle Compare Matrix" size="xl">
        <div className="flex flex-col gap-5 overflow-x-auto w-full">
          {comparedVehiclesData.length === 0 ? (
            <p className="text-center py-8 text-sm text-silver-500">No vehicles added to comparison.</p>
          ) : (
            <div className="grid grid-flow-col gap-4 divide-x divide-white/6 justify-start w-max">
              {/* Labels column */}
              <div className="w-28 flex flex-col gap-4 text-[10px] font-black uppercase text-silver-600 tracking-widest pt-36">
                {['Price', 'Year', 'Mileage', 'Engine', 'Power', 'Torque', 'Warranty', 'Safety'].map((l) => (
                  <div key={l} className="h-6 flex items-center">{l}</div>
                ))}
              </div>
              {comparedVehiclesData.map((v: any) => (
                <div key={v.id} className="w-52 pl-4 flex flex-col gap-4 text-xs">
                  <div className="h-36 flex flex-col gap-2 relative">
                    <button onClick={() => toggleCompare(v.id)} className="absolute -top-1 -right-1 p-1 bg-obsidian-800 text-silver-500 hover:text-red-400 rounded-full cursor-pointer border border-white/8">
                      <X className="w-3 h-3" />
                    </button>
                    <div className="h-20 rounded-xl overflow-hidden border border-white/8">
                      <img src={v.specs.images[0]} alt="car" className="w-full h-full object-cover" />
                    </div>
                    <span className="font-bold text-white text-sm truncate">{v.make} {v.model}</span>
                  </div>
                  <div className="h-6 flex items-center font-black text-gold-400">${Number(v.price).toLocaleString()}</div>
                  <div className="h-6 flex items-center font-semibold text-silver-300">{v.specs.year}</div>
                  <div className="h-6 flex items-center font-semibold text-silver-300">{v.specs.mileage.toLocaleString()} mi</div>
                  <div className="h-6 flex items-center font-semibold text-silver-300 text-[10px] uppercase tracking-wider">{v.specs.fuelType === 'Plug-in Hybrid' ? 'Hybrid' : v.specs.fuelType}</div>
                  <div className="h-6 flex items-center font-semibold text-silver-300">{v.specs.horsepower} hp</div>
                  <div className="h-6 flex items-center font-semibold text-silver-300">{v.specs.torque} lb-ft</div>
                  <div className="h-6 flex items-center font-semibold text-silver-500 text-[10px]">{v.specs.warranty}</div>
                  <div className="h-6 flex items-center font-bold text-emerald-400 text-[10px]">5-Star NHTSA</div>
                  {v.quantity > 0 ? (
                    <Button onClick={() => { handlePurchaseVehicle(v); setCompareOpen(false); }} variant="gold" size="sm" className="text-[10px] font-black uppercase tracking-widest py-2">
                      Buy Now
                    </Button>
                  ) : (
                    <div className="py-2 text-center text-red-400 text-[10px] font-bold uppercase tracking-widest border border-red-500/20 rounded-xl">Sold Out</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

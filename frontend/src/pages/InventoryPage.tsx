import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Card, Button, Badge, Modal, Pagination } from '../components/UI';
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
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

export const InventoryPage: React.FC = () => {
  const { toast } = useToast();

  // 1. Filter and View States
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
  
  // Interactive States (Wishlist/Compare)
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [compareList, setCompareList] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<any | null>(null);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const itemsPerPage = 6;

  // 2. Fetch database listings
  const { data: rawData, isLoading } = useQuery({
    queryKey: ['allCatalogVehicles'],
    queryFn: async () => {
      const res = await api.get('/vehicles', { params: { limit: 100 } });
      return res.data.data.vehicles;
    },
  });

  // Sync Wishlist and Compare on mount
  useEffect(() => {
    const savedWishlist = localStorage.getItem('dealership_wishlist');
    if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
  }, []);

  // 3. Process & Filter Listings on the client-side
  const processedVehicles = useMemo(() => {
    if (!rawData) return [];

    return rawData
      .map((vehicle: any) => {
        const specs = getVehicleExtendedSpecs(vehicle.make, vehicle.model, Number(vehicle.price), vehicle.id);
        return {
          ...vehicle,
          specs,
        };
      })
      .filter((vehicle: any) => {
        const matchSearch =
          !search ||
          vehicle.make.toLowerCase().includes(search.toLowerCase()) ||
          vehicle.model.toLowerCase().includes(search.toLowerCase());

        const matchMake = !make || vehicle.make.toLowerCase() === make.toLowerCase();
        const matchCategory = !category || vehicle.category.toLowerCase().includes(category.toLowerCase());
        const matchFuel = !fuelType || vehicle.specs.fuelType === fuelType;
        const matchTransmission = !transmission || vehicle.specs.transmission === transmission;
        const matchPrice = Number(vehicle.price) <= maxPrice;
        const matchMileage = vehicle.specs.mileage <= maxMileage;
        const matchHP = vehicle.specs.horsepower >= minHorsepower;
        const matchStock = !onlyInStock || vehicle.quantity > 0;

        return (
          matchSearch &&
          matchMake &&
          matchCategory &&
          matchFuel &&
          matchTransmission &&
          matchPrice &&
          matchMileage &&
          matchHP &&
          matchStock
        );
      })
      .sort((a: any, b: any) => {
        if (sortBy === 'price-asc') return Number(a.price) - Number(b.price);
        if (sortBy === 'price-desc') return Number(b.price) - Number(a.price);
        if (sortBy === 'mileage') return a.specs.mileage - b.specs.mileage;
        if (sortBy === 'rating') return b.specs.rating - a.specs.rating;
        return b.specs.year - a.specs.year;
      });
  }, [rawData, search, make, category, fuelType, transmission, maxPrice, maxMileage, minHorsepower, onlyInStock, sortBy]);

  // Compute unique filter entries
  const uniqueMakes = useMemo(() => {
    if (!rawData) return [];
    return Array.from(new Set(rawData.map((v: any) => v.make))) as string[];
  }, [rawData]);

  const uniqueCategories = useMemo(() => {
    if (!rawData) return [];
    return Array.from(new Set(rawData.map((v: any) => v.category.split(' ')[0]))) as string[];
  }, [rawData]);

  const handleResetFilters = () => {
    setSearch('');
    setMake('');
    setCategory('');
    setFuelType('');
    setTransmission('');
    setMaxPrice(150000);
    setMaxMileage(30000);
    setMinHorsepower(200);
    setOnlyInStock(false);
    setSortBy('newest');
    setPage(1);
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
      // Trigger Notification on Wishlist Alert
      const savedNotifs = localStorage.getItem('dealership_notifications') || '[]';
      const notifsList = JSON.parse(savedNotifs);
      const vehicleName = rawData?.find((v: any) => v.id === id);
      const notifItem = {
        id: `notif-${Date.now()}`,
        title: 'Saved to Wishlist',
        desc: `You saved ${vehicleName?.make || ''} ${vehicleName?.model || ''} to your profile favorites.`,
        time: 'Just now',
        read: false,
      };
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
      if (compareList.length >= 4) {
        toast.info('You can compare a maximum of 4 vehicles.');
        return;
      }
      setCompareList((prev) => [...prev, id]);
      toast.success('Added to compare list.');
    }
  };

  // Add Item to Checkout Cart Drawer
  const handlePurchaseVehicle = (vehicle: any) => {
    const savedCart = localStorage.getItem('dealership_cart') || '[]';
    const cartItems = JSON.parse(savedCart);
    
    if (cartItems.some((item: any) => item.id === vehicle.id)) {
      toast.info('This vehicle model is already in your shopping cart.');
      return;
    }

    const specs = vehicle.specs || getVehicleExtendedSpecs(vehicle.make, vehicle.model, Number(vehicle.price), vehicle.id);

    const newItem = {
      id: vehicle.id,
      make: vehicle.make,
      model: vehicle.model,
      category: vehicle.category,
      price: Number(vehicle.price),
      image: specs.images[0],
    };

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
    if (onlyInStock) chips.push({ id: 'stock', label: `In Stock Only`, reset: () => setOnlyInStock(false) });
    return chips;
  }, [search, make, category, fuelType, transmission, maxPrice, maxMileage, minHorsepower, onlyInStock]);

  // Filtered compare list details
  const comparedVehiclesData = useMemo(() => {
    if (!rawData) return [];
    return rawData
      .filter((v: any) => compareList.includes(v.id))
      .map((v: any) => ({
        ...v,
        specs: getVehicleExtendedSpecs(v.make, v.model, Number(v.price), v.id),
      }));
  }, [rawData, compareList]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-8">
      {/* Directory Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 dark:border-brand-900 pb-6">
        <div>
          <h1 className="text-4xl font-black text-slate-800 dark:text-white uppercase tracking-tight">
            Vehicle Showroom
          </h1>
          <p className="text-slate-400 text-xs mt-1 font-semibold">
            Explore and filter premium performance cars, electric crossovers, and luxury sedans.
          </p>
        </div>

        {/* Wishlist Compare Tags */}
        <div className="flex items-center gap-4">
          {compareList.length > 0 && (
            <button
              onClick={() => setCompareOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white bg-brand-655 hover:bg-brand-700 px-4 py-2.5 rounded-lg shadow-lg cursor-pointer transition-all"
            >
              <GitCompare className="w-4 h-4 animate-pulse" /> Compare Matrix ({compareList.length}/4)
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Advanced Filters Sidebar */}
        <aside className="lg:col-span-1 bg-white dark:bg-brand-900 border border-slate-200/60 dark:border-brand-850 rounded-2xl p-6 shadow-sm flex flex-col gap-6 sticky top-24">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-brand-850 pb-4">
            <span className="flex items-center gap-2 font-black text-slate-800 dark:text-white uppercase tracking-wider text-xs">
              <SlidersHorizontal className="w-4 h-4 text-brand-600 dark:text-accent-500" /> Search Filters
            </span>
            <button
              onClick={handleResetFilters}
              className="text-xxs font-extrabold text-slate-455 hover:text-brand-600 dark:hover:text-accent-400 transition-colors uppercase tracking-wider cursor-pointer"
            >
              Reset All
            </button>
          </div>

          {/* Model Search */}
          <div className="flex flex-col gap-2">
            <label className="text-xxs font-bold uppercase tracking-wider text-slate-455">Model Keyword</label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. Model Y, Taycan..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-brand-950 border border-slate-200 dark:border-brand-800 rounded-lg text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none placeholder-slate-400"
              />
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            </div>
          </div>

          {/* Manufacturer Selector */}
          <div className="flex flex-col gap-2">
            <label className="text-xxs font-bold uppercase tracking-wider text-slate-455">Manufacturer</label>
            <select
              value={make}
              onChange={(e) => {
                setMake(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-brand-950 border border-slate-200 dark:border-brand-800 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-700 dark:text-slate-200"
            >
              <option value="">All Brands</option>
              {uniqueMakes.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Category Select */}
          <div className="flex flex-col gap-2">
            <label className="text-xxs font-bold uppercase tracking-wider text-slate-455">Vehicle Class</label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-brand-950 border border-slate-200 dark:border-brand-800 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-700 dark:text-slate-200"
            >
              <option value="">All Categories</option>
              {uniqueCategories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Fuel Type Radios */}
          <div className="flex flex-col gap-2">
            <label className="text-xxs font-bold uppercase tracking-wider text-slate-455">Fuel Engine</label>
            <div className="grid grid-cols-2 gap-1.5">
              {['Electric', 'Plug-in Hybrid', 'Gasoline'].map((type) => {
                const isSelected = fuelType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setFuelType(isSelected ? '' : type);
                      setPage(1);
                    }}
                    className={`px-3 py-2 border rounded-lg text-xxs font-bold uppercase tracking-wider text-center cursor-pointer transition-all ${
                      isSelected
                        ? 'border-brand-600 bg-brand-50 text-brand-700 dark:border-accent-500 dark:bg-brand-850 dark:text-accent-400'
                        : 'border-slate-200 dark:border-brand-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-brand-850/30'
                    }`}
                  >
                    {type === 'Plug-in Hybrid' ? 'Hybrid' : type}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="flex flex-col gap-2 border-t border-slate-100 dark:border-brand-850 pt-4">
            <div className="flex justify-between text-xxs font-bold text-slate-455">
              <span>MAX BUDGET</span>
              <span className="text-slate-800 dark:text-slate-250">${maxPrice.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="20000"
              max="150000"
              step="5000"
              value={maxPrice}
              onChange={(e) => {
                setMaxPrice(Number(e.target.value));
                setPage(1);
              }}
              className="w-full accent-brand-600 dark:accent-accent-500"
            />
          </div>

          {/* Mileage Slider */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-xxs font-bold text-slate-455">
              <span>MAX MILEAGE</span>
              <span className="text-slate-800 dark:text-slate-250">{maxMileage.toLocaleString()} mi</span>
            </div>
            <input
              type="range"
              min="0"
              max="30000"
              step="2000"
              value={maxMileage}
              onChange={(e) => {
                setMaxMileage(Number(e.target.value));
                setPage(1);
              }}
              className="w-full accent-brand-600 dark:accent-accent-500"
            />
          </div>

          {/* HP Slider */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-xxs font-bold text-slate-455">
              <span>MIN HORSEPOWER</span>
              <span className="text-slate-800 dark:text-slate-250">{minHorsepower} hp</span>
            </div>
            <input
              type="range"
              min="200"
              max="600"
              step="25"
              value={minHorsepower}
              onChange={(e) => {
                setMinHorsepower(Number(e.target.value));
                setPage(1);
              }}
              className="w-full accent-brand-600 dark:accent-accent-500"
            />
          </div>

          {/* Availability switch */}
          <div className="flex justify-between items-center border-t border-slate-100 dark:border-brand-850 pt-4">
            <span className="text-xxs font-bold uppercase tracking-wider text-slate-455">Show In-Stock Only</span>
            <div className="relative cursor-pointer" onClick={() => {
              setOnlyInStock(!onlyInStock);
              setPage(1);
            }}>
              <div className="w-9 h-5 bg-slate-200 dark:bg-brand-850 rounded-full peer transition-colors duration-250" />
              <div className={`absolute top-0.5 left-0.5 bg-white rounded-full h-4 w-4 transition-transform duration-200 ${
                onlyInStock ? 'translate-x-4 bg-brand-600 dark:bg-accent-500' : ''
              }`} />
            </div>
          </div>
        </aside>

        {/* Directory Listings Pane */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {/* Top Actions Bar */}
          <div className="bg-white dark:bg-brand-900 border border-slate-200/60 dark:border-brand-850 rounded-xl px-5 py-3 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {isLoading ? 'Searching catalog...' : `${processedVehicles.length} Models matches`}
            </span>

            {/* Sorting and Layout Toggles */}
            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
              <div className="flex items-center gap-2">
                <span className="text-xxs font-extrabold uppercase text-slate-400 tracking-wider">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent border-none py-1 pl-1 pr-6 text-xs font-bold text-slate-700 dark:text-slate-200 focus:ring-0 focus:outline-none cursor-pointer"
                >
                  <option value="newest">Year (Newest)</option>
                  <option value="price-asc">Price (Low-High)</option>
                  <option value="price-desc">Price (High-Low)</option>
                  <option value="mileage">Lowest Mileage</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>

              <div className="flex border border-slate-200 dark:border-brand-800 rounded-lg p-0.5 bg-slate-50 dark:bg-brand-950">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-md cursor-pointer transition-all ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-brand-800 text-brand-600 dark:text-accent-500 shadow-sm'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-md cursor-pointer transition-all ${
                    viewMode === 'list'
                      ? 'bg-white dark:bg-brand-800 text-brand-600 dark:text-accent-500 shadow-sm'
                      : 'text-slate-400 hover:text-slate-655'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Active Chips Row */}
          {activeChips.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xxs font-extrabold uppercase text-slate-400 tracking-wider mr-1">Active:</span>
              {activeChips.map((chip) => (
                <button
                  key={chip.id}
                  onClick={chip.reset}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xxs font-bold bg-brand-50 text-brand-700 border border-brand-200/50 dark:bg-brand-900 dark:text-accent-400 dark:border-brand-850 hover:bg-brand-100 transition-colors uppercase tracking-wider cursor-pointer"
                >
                  {chip.label} <X className="w-3 h-3" />
                </button>
              ))}
            </div>
          )}

          {/* Cards Grid / List Rendering */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="bg-white dark:bg-brand-900 border border-slate-200 dark:border-brand-850 rounded-xl h-96 animate-pulse" />
              ))}
            </div>
          ) : processedVehicles.length === 0 ? (
            <Card className="flex flex-col items-center justify-center text-center p-16 border-dashed border-2 border-slate-200 dark:border-brand-850">
              <Sliders className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
              <h3 className="text-base font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">No Vehicles Match Your Search</h3>
              <p className="text-xs text-slate-450 mt-1 max-w-sm">
                Try widening your price ranges, clearing active keyword chips, or adjusting mileage sliders.
              </p>
              <Button onClick={handleResetFilters} variant="secondary" className="mt-5 text-xs font-bold uppercase tracking-wider py-2.5 px-6">
                Clear all filters
              </Button>
            </Card>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'flex flex-col gap-4'}>
              <AnimatePresence mode="popLayout">
                {paginatedVehicles.map((vehicle: any) => {
                  const isFav = wishlist.includes(vehicle.id);
                  const isComp = compareList.includes(vehicle.id);
                  const inStock = vehicle.quantity > 0;

                  return (
                    <motion.div
                      key={vehicle.id}
                      layout
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card className={`overflow-hidden border border-slate-250/40 p-0 flex flex-col h-full bg-white dark:bg-brand-900 group ${
                        viewMode === 'list' ? 'sm:flex-row' : ''
                      }`}>
                        {/* Media Section */}
                        <div className={`overflow-hidden relative bg-slate-100 dark:bg-brand-950 shrink-0 ${
                          viewMode === 'list' ? 'w-full sm:w-60 h-48 sm:h-auto' : 'h-52'
                        }`}>
                          <img
                            src={vehicle.specs.images[0]}
                            alt={`${vehicle.make} ${vehicle.model}`}
                            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                          />
                          <Badge variant="primary" className="absolute top-3 left-3 bg-brand-600/90 text-white border border-brand-500/20">
                            {vehicle.category}
                          </Badge>
                          {vehicle.specs.isFeatured && (
                            <Badge variant="warning" className="absolute top-3 right-3 flex items-center gap-1 border border-amber-500/25">
                              <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500" /> Featured
                            </Badge>
                          )}
                          {vehicle.specs.discountPrice && (
                            <Badge variant="danger" className="absolute bottom-3 left-3 border border-red-500/25 bg-red-655 text-white">
                              OFFER
                            </Badge>
                          )}

                          {/* Hover Overlay Menu */}
                          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xxs flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <button
                              onClick={() => setSelectedVehicle(vehicle)}
                              className="p-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 transition-all cursor-pointer"
                              title="Quick Specs View"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => toggleCompare(vehicle.id)}
                              className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                                isComp ? 'bg-brand-600 text-white' : 'bg-white hover:bg-slate-100 text-slate-800'
                              }`}
                              title="Compare Model"
                            >
                              <GitCompare className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="p-5 flex flex-col gap-4 flex-grow justify-between">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex justify-between items-start gap-4">
                              <h3 className="text-base font-bold text-slate-800 dark:text-white leading-tight">
                                {vehicle.make} {vehicle.model}
                              </h3>
                              <button
                                onClick={() => toggleWishlist(vehicle.id)}
                                className="text-slate-350 hover:text-accent-500 transition-colors p-0.5 cursor-pointer"
                              >
                                <Heart className={`w-4 h-4 ${isFav ? 'text-accent-500 fill-accent-500' : ''}`} />
                              </button>
                            </div>

                            {/* Ratings */}
                            <div className="flex items-center gap-1 text-xxs font-bold text-amber-500">
                              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                              <span>{vehicle.specs.rating} ({vehicle.specs.reviewsCount} reviews)</span>
                            </div>

                            {/* Price */}
                            <div className="flex items-baseline gap-2 mt-1">
                              {vehicle.specs.discountPrice ? (
                                <>
                                  <span className="text-lg font-black text-red-655">${vehicle.specs.discountPrice.toLocaleString()}</span>
                                  <span className="text-xs text-slate-400 line-through">${Number(vehicle.price).toLocaleString()}</span>
                                </>
                              ) : (
                                <span className="text-lg font-black text-brand-655 dark:text-accent-500">
                                  ${Number(vehicle.price).toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Technical attributes */}
                          <div className="grid grid-cols-3 gap-2 border-t border-slate-100 dark:border-brand-850 pt-3 text-xxs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              <span>{vehicle.specs.year}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Gauge className="w-3.5 h-3.5 text-slate-400" />
                              <span>{vehicle.specs.mileage.toLocaleString()} mi</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Fuel className="w-3.5 h-3.5 text-slate-400" />
                              <span>{vehicle.specs.fuelType === 'Plug-in Hybrid' ? 'Hybrid' : vehicle.specs.fuelType}</span>
                            </div>
                          </div>

                          {/* Action links */}
                          <div className="flex gap-2 mt-2">
                            <Link to={`/vehicles/${vehicle.id}`} className="flex-grow">
                              <Button variant="secondary" size="sm" className="w-full text-xxs font-bold uppercase tracking-widest py-2">
                                Details Specs
                              </Button>
                            </Link>
                            {inStock ? (
                              <Button
                                onClick={() => handlePurchaseVehicle(vehicle)}
                                variant="accent"
                                size="sm"
                                className="text-xxs font-bold uppercase tracking-widest py-2 flex-grow"
                              >
                                Buy Now
                              </Button>
                            ) : (
                              <Badge variant="danger" className="py-2 flex items-center justify-center flex-grow text-center text-xxs">
                                Sold Out
                              </Badge>
                            )}
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p: number) => setPage(p)} />
            </div>
          )}
        </div>
      </div>

      {/* Quick View Specifications Modal */}
      <Modal isOpen={!!selectedVehicle} onClose={() => setSelectedVehicle(null)} title="Quick Vehicle Specs">
        {selectedVehicle && (
          <div className="flex flex-col gap-6">
            <div className="h-56 bg-slate-900 border border-slate-200 dark:border-brand-850 rounded-xl overflow-hidden relative">
              <img
                src={selectedVehicle.specs.images[0]}
                alt={selectedVehicle.model}
                className="w-full h-full object-cover"
              />
              <span className="absolute top-4 left-4 px-3 py-1 bg-brand-600/90 text-white rounded text-xxs font-extrabold uppercase tracking-wide">
                {selectedVehicle.category}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="text-xl font-black text-slate-800 dark:text-white leading-tight">
                {selectedVehicle.make} {selectedVehicle.model}
              </h2>
              <p className="text-lg font-black text-brand-655 dark:text-accent-500">
                ${Number(selectedVehicle.price).toLocaleString()}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs border-y border-slate-100 dark:border-brand-850 py-4 font-semibold">
              <div className="flex justify-between border-b border-slate-50 dark:border-brand-950 pb-2">
                <span className="text-slate-400">Year</span>
                <span className="text-slate-800 dark:text-slate-200">{selectedVehicle.specs.year}</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 dark:border-brand-950 pb-2">
                <span className="text-slate-400">Mileage</span>
                <span className="text-slate-800 dark:text-slate-200">{selectedVehicle.specs.mileage.toLocaleString()} mi</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 dark:border-brand-950 pb-2">
                <span className="text-slate-400">Engine Power</span>
                <span className="text-slate-800 dark:text-slate-200">{selectedVehicle.specs.horsepower} hp</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 dark:border-brand-950 pb-2">
                <span className="text-slate-400">Engine Type</span>
                <span className="text-slate-800 dark:text-slate-200">{selectedVehicle.specs.fuelType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Transmission</span>
                <span className="text-slate-800 dark:text-slate-200">{selectedVehicle.specs.transmission}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Available Stock</span>
                <span className="text-slate-800 dark:text-slate-200">{selectedVehicle.quantity} units</span>
              </div>
            </div>

            <div className="flex gap-2.5">
              <Link to={`/vehicles/${selectedVehicle.id}`} onClick={() => setSelectedVehicle(null)} className="flex-grow">
                <Button variant="outline" className="w-full font-bold uppercase tracking-wider py-3">
                  Full Details Page
                </Button>
              </Link>
              {selectedVehicle.quantity > 0 ? (
                <Button
                  onClick={() => handlePurchaseVehicle(selectedVehicle)}
                  variant="accent"
                  className="flex-grow font-bold uppercase tracking-wider py-3 gap-2"
                >
                  Add To Cart <ShoppingBag className="w-4 h-4" />
                </Button>
              ) : (
                <Badge variant="danger" className="flex-grow py-3 flex items-center justify-center font-bold text-xs">
                  Sold Out
                </Badge>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Compare Matrix Modal Overlay */}
      <Modal isOpen={compareOpen} onClose={() => setCompareOpen(false)} title="Vehicle Compare Matrix">
        <div className="flex flex-col gap-6 overflow-x-auto w-full">
          {comparedVehiclesData.length === 0 ? (
            <p className="text-center py-6 text-xs text-slate-400">No vehicles added to comparison.</p>
          ) : (
            <div className="grid grid-flow-col gap-4 divide-x divide-slate-100 dark:divide-brand-850 justify-start w-max">
              {/* Row Names labels column */}
              <div className="w-28 flex flex-col gap-4 text-xxs font-black uppercase text-slate-400 pt-36">
                <div className="h-6 flex items-center">Price</div>
                <div className="h-6 flex items-center">Year</div>
                <div className="h-6 flex items-center">Mileage</div>
                <div className="h-6 flex items-center">Engine type</div>
                <div className="h-6 flex items-center">Power</div>
                <div className="h-6 flex items-center">Torque</div>
                <div className="h-6 flex items-center">Warranty</div>
                <div className="h-6 flex items-center">Safety Rating</div>
              </div>

              {/* Compared Vehicles columns */}
              {comparedVehiclesData.map((v: any) => (
                <div key={v.id} className="w-56 pl-4 flex flex-col gap-4 text-xs">
                  {/* Card Header Info */}
                  <div className="h-36 flex flex-col gap-2 relative">
                    <button
                      onClick={() => toggleCompare(v.id)}
                      className="absolute -top-1 -right-1 p-1 bg-slate-100 dark:bg-brand-950 text-slate-400 hover:text-red-500 rounded-full cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <div className="h-20 rounded-lg overflow-hidden bg-slate-100">
                      <img src={v.specs.images[0]} alt="car" className="w-full h-full object-cover" />
                    </div>
                    <span className="font-bold text-slate-800 dark:text-white truncate">{v.make} {v.model}</span>
                  </div>

                  {/* Spec Row Entries */}
                  <div className="h-6 flex items-center font-bold text-brand-655 dark:text-accent-500">${Number(v.price).toLocaleString()}</div>
                  <div className="h-6 flex items-center font-semibold">{v.specs.year}</div>
                  <div className="h-6 flex items-center font-semibold">{v.specs.mileage.toLocaleString()} mi</div>
                  <div className="h-6 flex items-center font-semibold text-xxs uppercase tracking-wider">{v.specs.fuelType === 'Plug-in Hybrid' ? 'Hybrid' : v.specs.fuelType}</div>
                  <div className="h-6 flex items-center font-semibold">{v.specs.horsepower} hp</div>
                  <div className="h-6 flex items-center font-semibold">{v.specs.torque} lb-ft</div>
                  <div className="h-6 flex items-center font-semibold text-xxs text-slate-500">{v.specs.warranty}</div>
                  <div className="h-6 flex items-center font-bold text-xxs text-accent-600">5-Star NHTSA</div>
                  
                  {/* Buy CTA */}
                  {v.quantity > 0 ? (
                    <Button
                      onClick={() => handlePurchaseVehicle(v)}
                      variant="accent"
                      size="sm"
                      className="mt-2 py-2 font-bold uppercase tracking-wider text-xxs"
                    >
                      Add to Cart
                    </Button>
                  ) : (
                    <Badge variant="danger" className="mt-2 py-2 text-center text-xxs">Sold Out</Badge>
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

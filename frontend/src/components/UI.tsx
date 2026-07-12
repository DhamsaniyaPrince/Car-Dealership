import React, { useState, forwardRef, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Eye, EyeOff } from 'lucide-react';

// ============================================================
// 1. BUTTON — Premium with ripple + glow + magnetic
// ============================================================
interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'size'> {
  variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'ghost' | 'outline' | 'link' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  onClick,
  ...props
}) => {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || isLoading) return;
      const btn = btnRef.current;
      if (btn) {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const id = Date.now();
        setRipples((prev) => [...prev, { id, x, y }]);
        setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 700);
      }
      onClick?.(e);
    },
    [disabled, isLoading, onClick]
  );

  const baseStyle =
    'relative inline-flex items-center justify-center overflow-hidden font-semibold tracking-wide transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-obsidian-900 disabled:opacity-40 disabled:pointer-events-none cursor-pointer select-none rounded-xl';

  const sizes = {
    sm: 'px-4 py-2 text-xs gap-1.5',
    md: 'px-5 py-2.5 text-sm gap-2',
    lg: 'px-8 py-3.5 text-base gap-2.5',
  };

  const variants = {
    primary: 'bg-brand-600 hover:bg-brand-500 text-white shadow-md hover:shadow-electric',
    secondary:
      'bg-white/5 hover:bg-white/10 text-silver-200 border border-white/10 hover:border-white/20 backdrop-blur-sm',
    accent: 'bg-gold-500 hover:bg-gold-400 text-obsidian-900 shadow-gold-md hover:shadow-gold-lg font-bold',
    gold: 'bg-gradient-to-r from-gold-600 via-gold-500 to-gold-400 hover:from-gold-500 hover:via-gold-400 hover:to-gold-300 text-obsidian-900 shadow-gold-md hover:shadow-gold-xl font-bold',
    danger: 'bg-red-600 hover:bg-red-500 text-white shadow-md',
    ghost: 'bg-transparent hover:bg-white/5 text-silver-300 hover:text-white',
    outline:
      'bg-transparent border border-white/15 hover:border-gold-500/50 text-silver-200 hover:text-gold-400 hover:bg-gold-500/5 backdrop-blur-sm',
    link: 'bg-transparent text-gold-500 hover:text-gold-400 underline-offset-4 hover:underline p-0 focus-visible:ring-0 rounded-none',
  };

  return (
    <motion.button
      ref={btnRef as any}
      whileHover={disabled || isLoading ? {} : { scale: 1.02, y: -1 }}
      whileTap={disabled || isLoading ? {} : { scale: 0.97 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className={`${baseStyle} ${sizes[size]} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      onClick={handleClick}
      {...(props as any)}
    >
      {/* Ripple effects */}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute rounded-full bg-white/25 pointer-events-none"
          style={{
            width: 120,
            height: 120,
            left: ripple.x - 60,
            top: ripple.y - 60,
            animation: 'ripple 0.7s linear forwards',
          }}
        />
      ))}

      {isLoading ? (
        <>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
          />
          <span>Loading...</span>
        </>
      ) : (
        children
      )}
    </motion.button>
  );
};

// ============================================================
// 2. INPUT — Premium floating label + focus glow
// ============================================================
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  wrapperClass?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, wrapperClass = '', className = '', id, type, icon, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    const [showPassword, setShowPassword] = useState(false);
    const [focused, setFocused] = useState(false);

    const isPassword = type === 'password';
    const currentType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className={`flex flex-col gap-1.5 w-full ${wrapperClass}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold uppercase tracking-widest text-silver-400"
          >
            {label}
          </label>
        )}
        <div className="relative w-full">
          {icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-silver-500 pointer-events-none z-10">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            type={currentType}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className={`input-premium w-full px-4 py-3 text-sm rounded-xl transition-all duration-300 ${
              icon ? 'pl-10' : ''
            } ${isPassword ? 'pr-10' : ''} ${
              error
                ? 'border-red-500/60 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]'
                : ''
            } ${className}`}
            {...(props as any)}
          />
          {/* Animated focus border */}
          <motion.div
            initial={false}
            animate={{ scaleX: focused && !error ? 1 : 0, opacity: focused && !error ? 1 : 0 }}
            transition={{ duration: 0.25 }}
            className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-gold-600 via-gold-400 to-gold-600 rounded-full"
          />
          {isPassword && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-silver-500 hover:text-gold-500 transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}
        </div>
        <AnimatePresence>
          {error && (
            <motion.span
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-xs text-red-400 font-medium"
            >
              {error}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    );
  }
);
Input.displayName = 'Input';

// ============================================================
// 3. TEXTAREA — Premium styling
// ============================================================
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  wrapperClass?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, wrapperClass = '', className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className={`flex flex-col gap-1.5 w-full ${wrapperClass}`}>
        {label && (
          <label htmlFor={inputId} className="text-xs font-semibold uppercase tracking-widest text-silver-400">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={`input-premium w-full px-4 py-3 text-sm rounded-xl transition-all duration-300 min-h-[100px] resize-y ${
            error ? 'border-red-500/60' : ''
          } ${className}`}
          {...(props as any)}
        />
        {error && <span className="text-xs text-red-400 font-medium">{error}</span>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

// ============================================================
// 4. CHECKBOX & SWITCH
// ============================================================
interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className = '', id, ...props }, ref) => {
    const inputId = id || label.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex items-center gap-2.5 select-none cursor-pointer group">
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          className={`h-4 w-4 rounded border border-white/20 bg-obsidian-800 text-gold-500 focus:ring-gold-500/50 focus:ring-offset-obsidian-900 cursor-pointer ${className}`}
          {...props}
        />
        <label htmlFor={inputId} className="text-sm font-medium text-silver-300 cursor-pointer group-hover:text-white transition-colors">
          {label}
        </label>
      </div>
    );
  }
);
Checkbox.displayName = 'Checkbox';

export const Switch = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className = '', id, checked, onChange, ...props }, ref) => {
    const inputId = id || label.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex items-center gap-3 select-none">
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type="checkbox"
            className="sr-only peer"
            checked={checked}
            onChange={onChange}
            {...props}
          />
          <div
            className={`toggle-premium ${checked ? 'active' : ''}`}
            onClick={() => {
              const event = { target: { checked: !checked } } as React.ChangeEvent<HTMLInputElement>;
              onChange?.(event);
            }}
          >
            <div className="toggle-thumb" />
          </div>
        </div>
        <label htmlFor={inputId} className="text-xs font-semibold uppercase tracking-widest text-silver-400 cursor-pointer">
          {label}
        </label>
      </div>
    );
  }
);
Switch.displayName = 'Switch';

// ============================================================
// 5. CARD — Premium glassmorphism + tilt
// ============================================================
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
  glow?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverEffect = true,
  glow = false,
  className = '',
  ...props
}) => {
  return (
    <motion.div
      whileHover={
        hoverEffect
          ? {
              y: -5,
              boxShadow: glow
                ? '0 20px 60px rgba(0,0,0,0.5), 0 0 30px rgba(201,168,76,0.15)'
                : '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08)',
            }
          : {}
      }
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`card-premium rounded-2xl ${glow ? 'hover:border-gold-500/20' : ''} ${className}`}
      {...(props as any)}
    >
      {children}
    </motion.div>
  );
};

// ============================================================
// 6. BADGE — Premium neon-glow style
// ============================================================
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'gold';
  outline?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  outline = false,
  className = '',
}) => {
  const base =
    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider select-none';

  const solidStyles: Record<string, string> = {
    primary: 'bg-brand-500/20 text-brand-300 border border-brand-500/30',
    success: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    warning: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
    danger: 'bg-red-500/15 text-red-400 border border-red-500/30',
    info: 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30',
    neutral: 'bg-white/5 text-silver-400 border border-white/10',
    gold: 'bg-gold-500/15 text-gold-400 border border-gold-500/30',
  };

  const outlineStyles: Record<string, string> = {
    primary: 'border border-brand-500/40 text-brand-300 bg-transparent',
    success: 'border border-emerald-500/40 text-emerald-400 bg-transparent',
    warning: 'border border-amber-500/40 text-amber-400 bg-transparent',
    danger: 'border border-red-500/40 text-red-400 bg-transparent',
    info: 'border border-cyan-500/40 text-cyan-400 bg-transparent',
    neutral: 'border border-white/20 text-silver-400 bg-transparent',
    gold: 'border border-gold-500/40 text-gold-400 bg-transparent',
  };

  const currentStyle = outline ? outlineStyles[variant] : solidStyles[variant];

  return <span className={`${base} ${currentStyle} ${className}`}>{children}</span>;
};

// ============================================================
// 7. MODAL — Cinematic with spring animation
// ============================================================
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const sizeClass = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }[size];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-obsidian-950/80 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', duration: 0.4, bounce: 0.2 }}
            className={`w-full ${sizeClass} glass rounded-2xl shadow-premium overflow-hidden z-10 flex flex-col max-h-[90vh] border border-white/8`}
          >
            {/* Gold top accent line */}
            <div className="h-px bg-gradient-to-r from-transparent via-gold-500/60 to-transparent" />

            <div className="flex items-center justify-between px-6 py-4 border-b border-white/6">
              {title && (
                <h3 className="font-display font-bold text-white uppercase tracking-wider text-sm">
                  {title}
                </h3>
              )}
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.2 }}
                onClick={onClose}
                className="p-1.5 rounded-lg text-silver-500 hover:text-white hover:bg-white/8 transition-colors cursor-pointer ml-auto"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>
            <div className="p-6 overflow-y-auto">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// ============================================================
// 8. DROPDOWN — Premium animated
// ============================================================
interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'left' | 'right';
}

export const Dropdown: React.FC<DropdownProps> = ({ trigger, children, align = 'right' }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      <div onClick={() => setOpen(!open)} className="cursor-pointer">
        {trigger}
      </div>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.94 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className={`absolute z-20 mt-2 min-w-[200px] rounded-xl glass border border-white/8 shadow-premium overflow-hidden ${
                align === 'right' ? 'right-0' : 'left-0'
              }`}
            >
              {/* Gold top line */}
              <div className="h-px bg-gradient-to-r from-transparent via-gold-500/40 to-transparent" />
              <div className="py-1" onClick={() => setOpen(false)}>
                {children}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================================
// 9. TABLE HELPERS
// ============================================================
export const TableContainer: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return (
    <div
      className={`w-full overflow-x-auto rounded-xl border border-white/6 bg-obsidian-800/60 backdrop-blur-sm ${className}`}
    >
      <table className="w-full text-left border-collapse">{children}</table>
    </div>
  );
};

export const TableHead: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <thead className="border-b border-white/6">
      {children}
    </thead>
  );
};

export const TableRow: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return (
    <tr
      className={`hover:bg-white/3 transition-colors border-b border-white/4 last:border-b-0 ${className}`}
    >
      {children}
    </tr>
  );
};

// ============================================================
// 10. PAGINATION — Premium pill style
// ============================================================
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
    if (totalPages <= 5) return i + 1;
    if (currentPage <= 3) return i + 1;
    if (currentPage >= totalPages - 2) return totalPages - 4 + i;
    return currentPage - 2 + i;
  });

  return (
    <div className="flex items-center gap-1.5 justify-center select-none">
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="rounded-xl px-3 py-2"
      >
        ←
      </Button>

      {pages.map((page) => (
        <motion.button
          key={page}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onPageChange(page)}
          className={`w-9 h-9 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
            currentPage === page
              ? 'bg-gold-500 text-obsidian-900 shadow-gold-sm'
              : 'text-silver-400 hover:text-white hover:bg-white/8 border border-transparent hover:border-white/10'
          }`}
        >
          {page}
        </motion.button>
      ))}

      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="rounded-xl px-3 py-2"
      >
        →
      </Button>
    </div>
  );
};

// ============================================================
// 11. BREADCRUMBS
// ============================================================
interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <nav className="flex items-center gap-2 text-xs font-medium text-silver-500">
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <React.Fragment key={idx}>
            {item.path && !isLast ? (
              <a
                href={item.path}
                className="hover:text-gold-400 transition-colors uppercase tracking-wider text-xxs font-bold"
              >
                {item.label}
              </a>
            ) : (
              <span
                className={
                  isLast
                    ? 'text-white uppercase tracking-wider text-xxs font-bold'
                    : 'uppercase tracking-wider text-xxs font-bold'
                }
              >
                {item.label}
              </span>
            )}
            {!isLast && (
              <ChevronRight className="w-3 h-3 text-silver-600 shrink-0" />
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

// ============================================================
// 12. SKELETON LOADER — Premium shimmer
// ============================================================
interface SkeletonProps {
  className?: string;
  count?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`skeleton rounded-xl ${className}`}
          style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.07) 40%, rgba(255,255,255,0.03) 80%)', backgroundSize: '200% 100%', animation: 'shimmer 1.8s ease-in-out infinite' }}
        />
      ))}
    </>
  );
};

// ============================================================
// 13. SECTION LABEL — Gold eyebrow text
// ============================================================
export const SectionLabel: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <span className={`section-label ${className}`}>
    <span className="w-6 h-px bg-gold-500 rounded-full inline-block" />
    {children}
    <span className="w-6 h-px bg-gold-500 rounded-full inline-block" />
  </span>
);

// ============================================================
// 14. ANIMATED COUNTER
// ============================================================
interface CounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}

export const AnimatedCounter: React.FC<CounterProps> = ({
  value,
  prefix = '',
  suffix = '',
  className = '',
}) => {
  const [displayed, setDisplayed] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
          let start = 0;
          const end = value;
          const duration = 1800;
          const step = end / (duration / 16);
          const timer = setInterval(() => {
            start += step;
            if (start >= end) {
              setDisplayed(end);
              clearInterval(timer);
            } else {
              setDisplayed(Math.floor(start));
            }
          }, 16);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, hasStarted]);

  return (
    <span ref={ref} className={`stat-number ${className}`}>
      {prefix}{displayed.toLocaleString()}{suffix}
    </span>
  );
};

// ============================================================
// 12. SELECT — Premium Custom Dropdown Select Component
// ============================================================
import { ChevronDown } from 'lucide-react';

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  className?: string;
  icon?: React.ReactNode;
}

export const Select: React.FC<SelectProps> = ({ value, onChange, options, className = '', icon }) => {
  const [open, setOpen] = useState(false);
  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  return (
    <div className="relative inline-block text-left">
      <div
        onClick={() => setOpen(!open)}
        className={`input-premium px-4 py-2 rounded-xl text-xs cursor-pointer flex items-center justify-between gap-3 select-none ${className}`}
      >
        <span className="flex items-center gap-2 font-bold text-silver-300">
          {icon}
          {selectedOption?.label}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-silver-500 transition-transform duration-200" style={{ transform: open ? 'rotate(180deg)' : 'none' }} />
      </div>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute z-30 mt-2 min-w-full rounded-xl glass border border-white/8 shadow-premium overflow-hidden left-0"
            >
              <div className="h-px bg-gradient-to-r from-transparent via-gold-500/30 to-transparent" />
              <div className="py-1 max-h-60 overflow-y-auto no-scrollbar">
                {options.map((opt) => {
                  const active = opt.value === value;
                  return (
                    <div
                      key={opt.value}
                      onClick={() => {
                        onChange(opt.value);
                        setOpen(false);
                      }}
                      className={`px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
                        active
                          ? 'bg-gold-500/20 text-gold-400 font-extrabold'
                          : 'text-silver-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {opt.label}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};


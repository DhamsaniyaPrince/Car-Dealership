import React, { useState, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight } from 'lucide-react';

// ==========================================
// 1. BUTTON COMPONENT
// ==========================================
interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'size'> {
  variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'ghost' | 'outline' | 'link';
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
  ...props
}) => {
  const baseStyle =
    'inline-flex items-center justify-center rounded-lg font-semibold tracking-wide transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3.5 text-base',
  };

  const variants = {
    primary: 'bg-brand-600 hover:bg-brand-700 text-white shadow-md focus:ring-brand-500',
    secondary: 'bg-slate-200 hover:bg-slate-300 text-slate-800 focus:ring-slate-400 dark:bg-brand-800 dark:hover:bg-brand-700 dark:text-slate-200',
    accent: 'bg-accent-600 hover:bg-accent-700 text-white shadow-md focus:ring-accent-500',
    danger: 'bg-red-655 hover:bg-red-700 text-white shadow-md focus:ring-red-500',
    ghost: 'bg-transparent hover:bg-slate-100 text-slate-700 dark:text-slate-300 dark:hover:bg-brand-850',
    outline: 'bg-transparent border border-slate-300 hover:bg-slate-50 text-slate-700 dark:border-brand-805 dark:text-slate-300 dark:hover:bg-brand-900',
    link: 'bg-transparent text-brand-600 hover:underline p-0 focus:ring-0',
  };

  return (
    <motion.button
      whileHover={{ scale: disabled || isLoading ? 1 : 1.01 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.99 }}
      className={`${baseStyle} ${sizes[size]} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...(props as any)}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading...
        </>
      ) : (
        children
      )}
    </motion.button>
  );
};

// ==========================================
// 2. INPUT COMPONENT
// ==========================================
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  wrapperClass?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, wrapperClass = '', className = '', id, type, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    const [showPassword, setShowPassword] = useState(false);

    const isPassword = type === 'password';
    const currentType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className={`flex flex-col gap-1.5 w-full ${wrapperClass}`}>
        {label && (
          <label htmlFor={inputId} className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {label}
          </label>
        )}
        <div className="relative w-full">
          <input
            ref={ref}
            id={inputId}
            type={currentType}
            className={`w-full px-4 py-2.5 text-sm bg-white dark:bg-brand-900 border border-slate-300 dark:border-brand-800 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all ${
              isPassword ? 'pr-10' : ''
            } ${
              error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
            } ${className}`}
            {...(props as any)}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 p-0.5 rounded hover:bg-slate-100 dark:hover:bg-brand-800 text-slate-400 hover:text-slate-655 dark:hover:text-white transition-colors cursor-pointer"
            >
              {showPassword ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          )}
        </div>
        {error && <span className="text-xs text-red-500 font-medium mt-0.5">{error}</span>}
      </div>
    );
  }
);
Input.displayName = 'Input';

// ==========================================
// 3. TEXTAREA COMPONENT
// ==========================================
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
          <label htmlFor={inputId} className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={`w-full px-4 py-2.5 text-sm bg-white dark:bg-brand-900 border border-slate-300 dark:border-brand-800 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all min-h-[100px] ${
            error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
          } ${className}`}
          {...(props as any)}
        />
        {error && <span className="text-xs text-red-500 font-medium mt-0.5">{error}</span>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

// ==========================================
// 4. CHECKBOX & SWITCH COMPONENTS
// ==========================================
interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className = '', id, ...props }, ref) => {
    const inputId = id || label.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex items-center gap-2 select-none">
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          className={`h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 dark:border-brand-850 dark:bg-brand-950 dark:focus:ring-brand-500 cursor-pointer ${className}`}
          {...props}
        />
        <label htmlFor={inputId} className="text-xs font-semibold text-slate-655 dark:text-slate-300 cursor-pointer">
          {label}
        </label>
      </div>
    );
  }
);
Checkbox.displayName = 'Checkbox';

export const Switch = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className = '', id, ...props }, ref) => {
    const inputId = id || label.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex items-center gap-3 select-none cursor-pointer">
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type="checkbox"
            className="sr-only peer"
            {...props}
          />
          <div className="w-9 h-5 bg-slate-200 dark:bg-brand-850 rounded-full peer peer-focus:ring-2 peer-focus:ring-brand-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-600" />
        </div>
        <label htmlFor={inputId} className="text-xs font-semibold text-slate-655 dark:text-slate-350 cursor-pointer">
          {label}
        </label>
      </div>
    );
  }
);
Switch.displayName = 'Switch';

// ==========================================
// 5. CARD COMPONENT
// ==========================================
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverEffect = true,
  className = '',
  ...props
}) => {
  return (
    <motion.div
      whileHover={hoverEffect ? { y: -4, boxShadow: '0 12px 30px -5px rgba(0, 0, 0, 0.08), 0 8px 15px -6px rgba(0, 0, 0, 0.08)' } : {}}
      transition={{ duration: 0.25 }}
      className={`bg-white dark:bg-brand-900 border border-slate-200/50 dark:border-brand-850 rounded-xl p-5 shadow-sm ${className}`}
      {...(props as any)}
    >
      {children}
    </motion.div>
  );
};

// ==========================================
// 6. BADGE COMPONENT
// ==========================================
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  outline?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  outline = false,
  className = '',
}) => {
  const base = 'inline-flex items-center px-2 py-0.5 rounded text-xxs font-bold uppercase tracking-wider select-none';
  
  const solidStyles = {
    primary: 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300',
    success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400',
    warning: 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400',
    danger: 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400',
    info: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/20 dark:text-cyan-400',
    neutral: 'bg-slate-100 text-slate-700 dark:bg-brand-800 dark:text-slate-350',
  };

  const outlineStyles = {
    primary: 'border border-brand-500/30 text-brand-655 bg-transparent',
    success: 'border border-emerald-500/30 text-emerald-600 bg-transparent',
    warning: 'border border-amber-500/30 text-amber-600 bg-transparent',
    danger: 'border border-red-500/30 text-red-655 bg-transparent',
    info: 'border border-cyan-500/30 text-cyan-600 bg-transparent',
    neutral: 'border border-slate-300 text-slate-500 dark:border-brand-800 bg-transparent',
  };

  const currentStyle = outline ? outlineStyles[variant] : solidStyles[variant];

  return <span className={`${base} ${currentStyle} ${className}`}>{children}</span>;
};

// ==========================================
// 7. MODAL COMPONENT
// ==========================================
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="w-full max-w-lg bg-white dark:bg-brand-900 border border-slate-200 dark:border-brand-800 rounded-xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-brand-800 bg-slate-50 dark:bg-brand-950">
              {title && <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">{title}</h3>}
              <button
                onClick={onClose}
                className="text-slate-450 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// ==========================================
// 8. DROPDOWN COMPONENT
// ==========================================
interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'left' | 'right';
}

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  children,
  align = 'right',
}) => {
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
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className={`absolute z-20 mt-2 w-48 rounded-lg bg-white dark:bg-brand-900 border border-slate-200 dark:border-brand-850 shadow-xl overflow-hidden ${
                align === 'right' ? 'right-0' : 'left-0'
              }`}
            >
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

// ==========================================
// 9. TABLE COMPONENT HELPERS
// ==========================================
export const TableContainer: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`w-full overflow-x-auto border border-slate-200 dark:border-brand-850 rounded-xl bg-white dark:bg-brand-900 ${className}`}>
      <table className="w-full text-left border-collapse">{children}</table>
    </div>
  );
};

export const TableHead: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <thead className="bg-slate-50 dark:bg-brand-950 border-b border-slate-200 dark:border-brand-850">{children}</thead>;
};

export const TableRow: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return <tr className={`hover:bg-slate-50/50 dark:hover:bg-brand-850/20 transition-colors border-b border-slate-100 dark:border-brand-850 last:border-b-0 ${className}`}>{children}</tr>;
};

// ==========================================
// 10. PAGINATION COMPONENT
// ==========================================
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center gap-2 justify-center select-none">
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Previous
      </Button>
      <span className="text-xs text-slate-550 dark:text-slate-400">
        Page <strong className="text-slate-800 dark:text-slate-200">{currentPage}</strong> of {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next
      </Button>
    </div>
  );
};

// ==========================================
// 11. BREADCRUMBS COMPONENT
// ==========================================
interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <nav className="flex items-center gap-2 text-xxs font-bold uppercase tracking-wider text-slate-455">
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <React.Fragment key={idx}>
            {item.path && !isLast ? (
              <a href={item.path} className="hover:text-brand-600 dark:hover:text-accent-500 transition-colors">
                {item.label}
              </a>
            ) : (
              <span className={isLast ? 'text-slate-655 dark:text-slate-350' : ''}>{item.label}</span>
            )}
            {!isLast && <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

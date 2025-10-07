import React, { useState, useEffect } from 'react';
import Icon from '../AppIcon';

const Toast = ({ 
  message, 
  type = 'success', 
  duration = 4000, 
  onClose,
  show = false 
}) => {
  const [isVisible, setIsVisible] = useState(show);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      setIsAnimating(true);
      
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, duration]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300);
  };

  if (!isVisible) return null;

  const getToastStyles = () => {
    const baseStyles = "fixed top-4 right-4 z-50 max-w-sm w-full bg-white border rounded-lg shadow-lg transition-all duration-300 transform";
    
    const typeStyles = {
      success: "border-green-200 bg-green-50",
      error: "border-red-200 bg-red-50",
      warning: "border-yellow-200 bg-yellow-50",
      info: "border-blue-200 bg-blue-50"
    };

    const animationStyles = isAnimating 
      ? "translate-x-0 opacity-100" 
      : "translate-x-full opacity-0";

    return `${baseStyles} ${typeStyles[type]} ${animationStyles}`;
  };

  const getIconConfig = () => {
    const configs = {
      success: { name: 'CheckCircle', color: 'text-green-500' },
      error: { name: 'AlertCircle', color: 'text-red-500' },
      warning: { name: 'AlertTriangle', color: 'text-yellow-500' },
      info: { name: 'Info', color: 'text-blue-500' }
    };
    return configs[type];
  };

  const iconConfig = getIconConfig();

  return (
    <div className={getToastStyles()}>
      <div className="p-4">
        <div className="flex items-start space-x-3">
          <Icon 
            name={iconConfig.name} 
            size={20} 
            className={`${iconConfig.color} mt-0.5 flex-shrink-0`} 
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">
              {message}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Icon name="X" size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

// Toast Provider Context
const ToastContext = React.createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'success', duration = 4000) => {
    const id = Date.now();
    const newToast = { id, message, type, duration };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto remove after duration
    setTimeout(() => {
      removeToast(id);
    }, duration + 300); // Add extra time for animation
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            show={true}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export default Toast;
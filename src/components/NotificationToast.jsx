import React, { useState, useEffect } from 'react';
import Icon from './AppIcon';

const NotificationToast = () => {
  const [notifications, setNotifications] = useState([]);

  // Mocking real-time event listener for demo / Phase 2
  // In Phase 3, this would be tied to Socket.io or FCM
  useEffect(() => {
    const handleAlert = (event) => {
      const { detail } = event;
      const id = Date.now();
      setNotifications(prev => [...prev, { id, ...detail }]);
      
      // Auto-remove after 5 seconds
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, 5000);
    };

    window.addEventListener('civic_alert', handleAlert);
    return () => window.removeEventListener('civic_alert', handleAlert);
  }, []);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-24 right-6 z-[100] space-y-3 pointer-events-none">
      {notifications.map((notif) => (
        <div 
          key={notif.id}
          className="w-80 bg-white border border-gray-100 shadow-2xl rounded-3xl p-4 pointer-events-auto animate-in slide-in-from-right-full duration-500 overflow-hidden relative group"
        >
          {/* Progress bar timer */}
          <div className="absolute bottom-0 left-0 h-1 bg-blue-600 animate-progress-shrink transition-all duration-5000" />
          
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
              notif.type === 'proximity' ? 'bg-orange-600 shadow-orange-100 text-white' : 
              notif.type === 'reward' ? 'bg-amber-500 shadow-amber-100 text-white' : 
              'bg-blue-600 shadow-blue-100 text-white'
            }`}>
              <Icon name={notif.icon || 'Bell'} size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{notif.category || 'Notification'}</p>
                <button 
                  onClick={() => setNotifications(prev => prev.filter(n => n.id !== notif.id))}
                  className="p-1 hover:bg-gray-50 rounded-lg text-gray-300 hover:text-gray-900 transition-colors"
                >
                  <Icon name="X" size={12} />
                </button>
              </div>
              <p className="text-sm font-black text-gray-900 leading-tight mb-1 truncate">{notif.title}</p>
              <p className="text-xs text-gray-500 font-medium leading-snug line-clamp-2">{notif.message}</p>
            </div>
          </div>
          
          {notif.action && (
            <div className="mt-3 pt-3 border-t border-gray-50">
              <button 
                onClick={notif.onAction}
                className="w-full py-2 bg-gray-900 text-white rounded-xl text-[10px] font-black tracking-widest hover:bg-black transition-all"
              >
                {notif.actionLabel || 'VIEW DETAILS'}
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default NotificationToast;

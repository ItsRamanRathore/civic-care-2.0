import React, { useState, useRef, useEffect } from 'react';
import Icon from '../AppIcon';
import Button from './Button';

const NotificationBadge = ({ 
  count = 0, 
  notifications = [], 
  onNotificationClick, 
  onMarkAsRead, 
  onMarkAllAsRead,
  maxDisplayCount = 99,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const displayCount = count > maxDisplayCount ? `${maxDisplayCount}+` : count;

  const mockNotifications = notifications?.length > 0 ? notifications : [
    {
      id: 1,
      title: 'New Issue Reported',
      message: 'Pothole reported on Main Street requires immediate attention',
      timestamp: '2 minutes ago',
      type: 'urgent',
      isRead: false,
      actionUrl: '/admin-dashboard'
    },
    {
      id: 2,
      title: 'Issue Resolved',
      message: 'Streetlight repair on Park Avenue has been completed',
      timestamp: '1 hour ago',
      type: 'success',
      isRead: false,
      actionUrl: '/admin-dashboard'
    },
    {
      id: 3,
      title: 'Assignment Update',
      message: 'You have been assigned 3 new issues in Downtown area',
      timestamp: '3 hours ago',
      type: 'info',
      isRead: true,
      actionUrl: '/admin-dashboard'
    },
    {
      id: 4,
      title: 'Weekly Report',
      message: 'Your weekly performance report is now available',
      timestamp: '1 day ago',
      type: 'info',
      isRead: true,
      actionUrl: '/analytics-dashboard'
    }
  ];

  const unreadCount = mockNotifications?.filter(n => !n?.isRead)?.length;

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'urgent':
        return { name: 'AlertTriangle', color: 'text-accent' };
      case 'success':
        return { name: 'CheckCircle', color: 'text-success' };
      case 'warning':
        return { name: 'AlertCircle', color: 'text-warning' };
      default:
        return { name: 'Info', color: 'text-primary' };
    }
  };

  const handleNotificationClick = (notification) => {
    onNotificationClick?.(notification);
    if (!notification?.isRead) {
      onMarkAsRead?.(notification?.id);
    }
    setIsOpen(false);
  };

  const handleMarkAllAsRead = () => {
    onMarkAllAsRead?.();
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef?.current && !dropdownRef?.current?.contains(event?.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (count === 0 && mockNotifications?.length === 0) {
    return null;
  }

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Notification Bell Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleDropdown}
        className="relative"
        aria-label={`${unreadCount} unread notifications`}
      >
        <Icon name="Bell" size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-medium">
            {displayCount}
          </span>
        )}
      </Button>
      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-popover border border-border rounded-md shadow-modal z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="font-medium text-popover-foreground">Notifications</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="text-xs"
              >
                Mark all read
              </Button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {mockNotifications?.length === 0 ? (
              <div className="p-8 text-center">
                <Icon name="Bell" size={32} className="mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {mockNotifications?.map((notification) => {
                  const iconInfo = getNotificationIcon(notification?.type);
                  
                  return (
                    <button
                      key={notification?.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`w-full p-4 text-left hover:bg-muted transition-smooth ${
                        !notification?.isRead ? 'bg-primary/5' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`mt-0.5 ${iconInfo?.color}`}>
                          <Icon name={iconInfo?.name} size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className={`text-sm font-medium truncate ${
                              !notification?.isRead ? 'text-popover-foreground' : 'text-muted-foreground'
                            }`}>
                              {notification?.title}
                            </h4>
                            {!notification?.isRead && (
                              <div className="w-2 h-2 bg-accent rounded-full ml-2 shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
                            {notification?.message}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {notification?.timestamp}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {mockNotifications?.length > 0 && (
            <div className="p-3 border-t border-border bg-muted/50">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-center text-xs"
                onClick={() => {
                  setIsOpen(false);
                  // Navigate to full notifications page
                }}
              >
                View all notifications
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBadge;
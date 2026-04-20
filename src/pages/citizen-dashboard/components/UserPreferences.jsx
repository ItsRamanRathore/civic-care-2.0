import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import apiClient from '../../../lib/apiClient';

const UserPreferences = () => {
  const [preferences, setPreferences] = useState({
    email: true,
    push: true,
    sms: false,
    quiet_hours: {
      enabled: false,
      start: "22:00",
      end: "07:00"
    }
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await apiClient.get('/auth/profile');
      if (response.data?.data?.user?.notification_preferences) {
        setPreferences(response.data.data.user.notification_preferences);
      }
    } catch (err) {
      console.error('Failed to fetch preferences:', err);
    }
  };

  const handleToggle = (field) => {
    setPreferences(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleQuietHoursToggle = () => {
    setPreferences(prev => ({
      ...prev,
      quiet_hours: {
        ...prev.quiet_hours,
        enabled: !prev.quiet_hours.enabled
      }
    }));
  };

  const handleTimeChange = (field, value) => {
    setPreferences(prev => ({
      ...prev,
      quiet_hours: {
        ...prev.quiet_hours,
        [field]: value
      }
    }));
  };

  const savePreferences = async () => {
    setIsSaving(true);
    setMessage({ text: '', type: '' });
    try {
      await apiClient.patch('/auth/preferences', { notification_preferences: preferences });
      setMessage({ text: 'Preferences saved successfully!', type: 'success' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (err) {
      setMessage({ text: 'Failed to save preferences.', type: 'error' });
    }
    setIsSaving(false);
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-xl shadow-blue-50/50 border border-gray-100 flex flex-col h-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-black text-gray-900 tracking-tight">Notification Center</h3>
          <p className="text-sm font-medium text-gray-400">Manage how we reach you for civic updates</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-blue-600 shadow-lg shadow-blue-100 flex items-center justify-center">
          <Icon name="Bell" size={24} className="text-white" />
        </div>
      </div>

      <div className="space-y-6 flex-1">
        {/* Channel Toggles */}
        <div className="space-y-4">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Channels</p>
          
          <div className="flex items-center justify-between p-5 rounded-3xl bg-gray-50 border border-gray-100 transition-all hover:bg-white hover:shadow-md group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white shadow-sm ring-1 ring-gray-100 flex items-center justify-center">
                <Icon name="Mail" size={18} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Email Alerts</p>
                <p className="text-xs text-gray-500 font-medium">Status changes and official updates</p>
              </div>
            </div>
            <button 
              onClick={() => handleToggle('email')}
              className={`w-12 h-6 rounded-full transition-all relative ${preferences.email ? 'bg-blue-600' : 'bg-gray-200'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${preferences.email ? 'left-7' : 'left-1'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-5 rounded-3xl bg-gray-50 border border-gray-100 transition-all hover:bg-white hover:shadow-md group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white shadow-sm ring-1 ring-gray-100 flex items-center justify-center">
                <Icon name="Smartphone" size={18} className="text-orange-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Push Notifications</p>
                <p className="text-xs text-gray-500 font-medium">Real-time proximity and safety alerts</p>
              </div>
            </div>
            <button 
              onClick={() => handleToggle('push')}
              className={`w-12 h-6 rounded-full transition-all relative ${preferences.push ? 'bg-orange-500' : 'bg-gray-200'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${preferences.push ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        </div>

        {/* Quiet Hours */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">DO NOT DISTURB</p>
            <button 
              onClick={handleQuietHoursToggle}
              className={`w-10 h-5 rounded-full transition-all relative ${preferences.quiet_hours.enabled ? 'bg-purple-600' : 'bg-gray-200'}`}
            >
              <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${preferences.quiet_hours.enabled ? 'left-6' : 'left-1'}`} />
            </button>
          </div>

          <div className={`p-6 rounded-3xl border transition-all duration-300 ${preferences.quiet_hours.enabled ? 'bg-purple-50/30 border-purple-100 opacity-100' : 'bg-gray-50 border-gray-100 opacity-50 grayscale pointer-events-none'}`}>
            <div className="flex items-center gap-4 mb-4">
              <Icon name="Moon" size={20} className="text-purple-600" />
              <p className="text-sm font-bold text-gray-900">Quiet Hours</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Start Time</label>
                <input 
                  type="time" 
                  value={preferences.quiet_hours.start}
                  onChange={(e) => handleTimeChange('start', e.target.value)}
                  className="w-full bg-white border border-purple-100 rounded-xl px-3 py-2 text-sm font-bold text-purple-900 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">End Time</label>
                <input 
                  type="time" 
                  value={preferences.quiet_hours.end}
                  onChange={(e) => handleTimeChange('end', e.target.value)}
                  className="w-full bg-white border border-purple-100 rounded-xl px-3 py-2 text-sm font-bold text-purple-900 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        {message.text && (
          <div className={`p-4 rounded-2xl text-xs font-bold text-center animate-in fade-in slide-in-from-top-2 ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message.text}
          </div>
        )}
        <Button 
          fullWidth 
          size="lg" 
          onClick={savePreferences}
          disabled={isSaving}
          className="h-14 rounded-2xl font-black tracking-widest text-[10px] bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-100 disabled:opacity-50"
        >
          {isSaving ? 'SYNCING PREFERENCES...' : 'SAVE CONFIGURATION'}
        </Button>
      </div>
    </div>
  );
};

export default UserPreferences;

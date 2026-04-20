import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import { cn } from '../../utils/cn';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../contexts/LanguageContext';
import MetricsCard from '../admin-dashboard/components/MetricsCard';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { civicIssueService } from '../../services/civicIssueService';

import UserPreferences from './components/UserPreferences';

const CitizenDashboard = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(
    location.pathname.includes('community') ? 'community' : 
    location.pathname.includes('settings') ? 'settings' : 'personal'
  );
  // ... stats state omitted for brevity

  const tabs = [
    { id: 'personal', label: t('myComplaints'), path: '/citizen-dashboard/my-complaints', icon: 'User' },
    { id: 'community', label: t('communityComplaints'), path: '/citizen-dashboard/community', icon: 'Users' },
    { id: 'settings', label: 'Preferences', path: '/citizen-dashboard/settings', icon: 'Settings' }
  ];

  // ... useEffect omitted for brevity

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-10 bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-3xl bg-blue-600 shadow-xl shadow-blue-100 flex items-center justify-center text-white font-black text-2xl">
              {user?.full_name?.charAt(0) || 'C'}
            </div>
            <div>
              <h1 className="text-4xl font-black text-gray-900 tracking-tight">{t('welcomeBack')}, {user?.full_name?.split(' ')[0] || 'Citizen'}!</h1>
              <p className="text-gray-500 font-medium mt-1">Status: <span className="text-blue-600 font-bold">Verified Reporter</span> • {stats.total} Issues Filed</p>
            </div>
          </div>
          <Link
            to="/issue-reporting-form"
            className="h-14 px-8 bg-blue-600 text-white rounded-2xl font-black tracking-widest text-[10px] hover:bg-blue-700 transition-all flex items-center justify-center shadow-xl shadow-blue-100 transform active:scale-95"
          >
            REPORT NEW INCIDENT
          </Link>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {dashboardMetrics.map((metric, index) => (
            <div key={index} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm transition-all hover:shadow-md">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-2xl bg-gray-50 ring-1 ring-gray-100">
                  <Icon name={metric.icon} size={20} className="text-blue-600" />
                </div>
                <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-widest ${
                  metric.changeType === 'positive' ? 'bg-green-100 text-green-700' : 
                  metric.changeType === 'warning' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {metric.change}
                </span>
              </div>
              <p className="text-sm font-bold text-gray-400 capitalize">{metric.title}</p>
              <p className="text-3xl font-black text-gray-900 mt-1">{metric.value}</p>
            </div>
          ))}
        </div>

        {/* Dynamic Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
              {/* Specialized Navigation */}
              <div className="bg-gray-50/50 p-2 flex gap-1 border-b border-gray-100">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-[28px] text-[10px] font-black tracking-widest transition-all',
                      activeTab === tab.id
                        ? 'bg-white text-blue-600 shadow-sm ring-1 ring-gray-100'
                        : 'text-gray-400 hover:text-gray-600 hover:bg-white/50'
                    )}
                  >
                    <Icon name={tab.icon} size={14} />
                    {tab.label.toUpperCase()}
                  </button>
                ))}
              </div>

              <div className="p-8">
                {activeTab === 'settings' ? (
                  <UserPreferences />
                ) : (
                  <Outlet />
                )}
              </div>
            </div>
          </div>

          {/* New Sidebar Experience */}
          <div className="space-y-6">
            <div className="bg-gray-900 text-white p-8 rounded-[40px] shadow-2xl relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl"></div>
              <h3 className="text-xl font-black mb-4 relative z-10">Civic Reputation</h3>
              <div className="flex items-center gap-4 mb-6 relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center">
                  <Icon name="Award" size={32} className="text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-black">740</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Points earned</p>
                </div>
              </div>
              <div className="space-y-2 relative z-10">
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 w-3/4"></div>
                </div>
                <p className="text-[10px] font-bold text-gray-400">260 PTS TO GOLD STATUS</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-[40px] border border-gray-100 shadow-sm">
              <h3 className="text-sm font-black text-gray-900 mb-4 tracking-widest uppercase">Quick Explorer</h3>
              <div className="space-y-2">
                <Link to="/interactive-issue-map" className="flex items-center gap-3 p-4 rounded-2xl hover:bg-gray-50 transition-all font-bold text-gray-600">
                  <Icon name="Map" size={18} className="text-blue-600" /> Interaction Map
                </Link>
                <Link to="/public-reports-listing" className="flex items-center gap-3 p-4 rounded-2xl hover:bg-gray-50 transition-all font-bold text-gray-600">
                  <Icon name="List" size={18} className="text-blue-600" /> Public Feed
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CitizenDashboard;

import React, { useEffect, useState, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import { civicIssueService } from '../../../services/civicIssueService';

const ModernStatsSection = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [animatedValues, setAnimatedValues] = useState({});
  const sectionRef = useRef(null);

  // Load real stats data
  useEffect(() => {
    const loadStats = async () => {
      try {
        const { data, error } = await civicIssueService?.getIssuesStats();
        
        if (!error && data) {
          setStats(data);
        }
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  // Intersection Observer for scroll-based animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Animate counters when visible
  useEffect(() => {
    if (isVisible && stats && !loading) {
      const targetValues = {
        total: stats.total || 0,
        resolved: stats.byStatus?.resolved || 0,
        inProgress: stats.byStatus?.in_progress || 0,
        recent: stats.recentCount || 0
      };

      // Animate each counter
      Object.keys(targetValues).forEach(key => {
        const target = targetValues[key];
        const duration = 2000; // 2 seconds
        const steps = 60;
        const increment = target / steps;
        let current = 0;

        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            current = target;
            clearInterval(timer);
          }
          
          setAnimatedValues(prev => ({
            ...prev,
            [key]: Math.floor(current)
          }));
        }, duration / steps);
      });
    }
  }, [isVisible, stats, loading]);

  const displayStats = [
    {
      icon: 'MessageSquare',
      value: animatedValues.total || 0,
      label: 'Issues Reported',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      icon: 'CheckCircle',
      value: animatedValues.resolved || 0,
      label: 'Issues Resolved',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      icon: 'Clock',
      value: animatedValues.inProgress || 0,
      label: 'In Progress',
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-600'
    },
    {
      icon: 'TrendingUp',
      value: animatedValues.recent || 0,
      label: 'This Week',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600'
    }
  ];

  return (
    <section ref={sectionRef} className="py-20 bg-white relative overflow-hidden" id="impact">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-red-500 to-blue-600"></div>
      
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className={`text-center mb-16 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Community Impact
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            See how our community is working together to address civic issues and improve our neighborhoods through collective action.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {displayStats.map((stat, index) => (
            <div
              key={index}
              className={`group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 200}ms` }}
            >
              <div className={`${stat.bgColor} rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-all duration-300`}>
                <Icon name={stat.icon} size={32} className={`${stat.iconColor} group-hover:scale-110 transition-transform duration-300`} />
              </div>
              
              <div className="text-center">
                <div className={`text-4xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300`}>
                  {loading ? (
                    <div className="animate-pulse bg-gray-200 h-10 w-16 mx-auto rounded"></div>
                  ) : (
                    stat.value.toLocaleString()
                  )}
                </div>
                <div className="text-gray-600 font-medium group-hover:text-gray-800 transition-colors duration-300">
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Insights */}
        {stats && !loading && (
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 transition-all duration-1000 delay-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            {/* By Category */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Icon name="Grid3X3" size={20} className="text-blue-600 mr-2" />
                By Category
              </h3>
              <div className="space-y-3">
                {Object.entries(stats?.byCategory || {})?.slice(0, 3)?.map(([category, count]) => (
                  <div key={category} className="flex justify-between items-center">
                    <span className="text-gray-700 capitalize font-medium">
                      {category?.replace('_', ' ')}
                    </span>
                    <span className="font-bold text-blue-600">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* By Priority */}
            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Icon name="AlertTriangle" size={20} className="text-red-600 mr-2" />
                By Priority
              </h3>
              <div className="space-y-3">
                {Object.entries(stats?.byPriority || {})?.map(([priority, count]) => (
                  <div key={priority} className="flex justify-between items-center">
                    <span className="text-gray-700 capitalize font-medium flex items-center">
                      <span className={`w-3 h-3 rounded-full mr-2 ${
                        priority === 'high' ? 'bg-red-500' : 
                        priority === 'medium' ? 'bg-yellow-500' : 'bg-gray-400'
                      }`}></span>
                      {priority}
                    </span>
                    <span className="font-bold text-red-600">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Icon name="BarChart3" size={20} className="text-green-600 mr-2" />
                Performance
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">Resolution Rate</span>
                  <span className="font-bold text-green-600">
                    {stats?.total > 0 
                      ? Math.round(((stats?.byStatus?.resolved || 0) / stats?.total) * 100) 
                      : 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">Avg Response</span>
                  <span className="font-bold text-green-600">2-3 days</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">Satisfaction</span>
                  <span className="font-bold text-green-600">4.8/5</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ModernStatsSection;
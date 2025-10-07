import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const ModernHeroSection = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animations after component mounts
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background with gradient and abstract shapes */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
        {/* Abstract geometric shapes */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-white/5 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-48 h-48 bg-red-500/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-white/5 rounded-full blur-lg animate-pulse delay-500"></div>
        
        {/* Animated wave pattern */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-24 text-white/5" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" fill="currentColor">
              <animateTransform
                attributeName="transform"
                attributeType="XML"
                type="translate"
                values="0 0;-200 0;0 0"
                dur="20s"
                repeatCount="indefinite"
              />
            </path>
          </svg>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center text-white">
        {/* Trust Badge */}
        <div className={`inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 mb-8 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <Icon name="Shield" size={20} className="text-green-400" />
          <span className="text-sm font-medium">Trusted by 50,000+ Citizens</span>
        </div>

        {/* Main Headline */}
        <h1 className={`text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight transition-all duration-1000 delay-200 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          Your Voice for a
          <span className="block bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent animate-pulse">
            Better Community
          </span>
        </h1>

        {/* Subheadline */}
        <p className={`text-xl md:text-2xl text-white/90 mb-12 max-w-4xl mx-auto leading-relaxed transition-all duration-1000 delay-400 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          Report civic issues instantly with photo evidence and GPS tracking. Track progress in real-time to help build safer neighborhoods.
        </p>

        {/* CTA Buttons */}
        <div className={`flex flex-col sm:flex-row items-center justify-center gap-6 mb-16 transition-all duration-1000 delay-600 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <Link to="/issue-reporting-form">
            <Button 
              size="lg" 
              className="bg-red-600 hover:bg-red-700 text-white px-10 py-4 text-lg font-semibold shadow-2xl hover:shadow-red-500/25 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
              iconName="Plus"
              iconPosition="left"
              iconSize={20}
            >
              Report an Issue
            </Button>
          </Link>
          <Link to="/public-reports-listing">
            <Button 
              variant="outline" 
              size="lg"
              className="border-2 border-white/30 text-white hover:bg-white hover:text-blue-900 px-10 py-4 text-lg font-semibold backdrop-blur-sm transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
              iconName="Search"
              iconPosition="left"
              iconSize={20}
            >
              Browse Issues
            </Button>
          </Link>
        </div>

        {/* Feature Cards */}
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto transition-all duration-1000 delay-800 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          {[
            {
              icon: 'Camera',
              title: 'Photo Evidence',
              description: 'Capture and upload images for faster resolution and better documentation'
            },
            {
              icon: 'MapPin',
              title: 'GPS Location',
              description: 'Precise location tracking ensures authorities can find and fix issues quickly'
            },
            {
              icon: 'Zap',
              title: 'Real-Time Updates',
              description: 'Get instant notifications when your issue status changes or gets resolved'
            }
          ].map((feature, index) => (
            <div 
              key={index}
              className="group bg-white/10 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/20 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2"
              style={{ animationDelay: `${index * 200}ms` }}
            >
              <div className="bg-white/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:bg-white/30 transition-all duration-300 transform group-hover:scale-110">
                <Icon name={feature.icon} size={32} className="text-white group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="font-bold text-xl mb-4 group-hover:text-red-200 transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-white/80 leading-relaxed group-hover:text-white transition-colors duration-300">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default ModernHeroSection;
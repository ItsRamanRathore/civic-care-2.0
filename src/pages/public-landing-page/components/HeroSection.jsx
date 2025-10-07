import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../../../components/ui/Button.jsx';
import Icon from '../../../components/AppIcon';

const HeroSection = () => {
  return (
    <section className="relative bg-gradient-to-br from-primary via-primary/95 to-secondary text-white py-20 lg:py-32">
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Icon name="Shield" size={20} />
              <span className="text-sm font-medium">Trusted by 50,000+ Citizens</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading mb-6 leading-tight">
              Your Voice for a
              <span className="block text-accent"> Better Community</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
              Report civic issues instantly with photo evidence and GPS location. 
              Track progress in real-time and help build a cleaner, safer neighborhood for everyone.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link to="/issue-reporting-form">
              <Button 
                size="lg" 
                className="bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
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
                className="border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold backdrop-blur-sm"
                iconName="Search"
                iconPosition="left"
                iconSize={20}
              >
                Browse Issues
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Icon name="Camera" size={24} />
              </div>
              <h3 className="font-semibold mb-2">Photo Evidence</h3>
              <p className="text-white/80 text-sm">Capture and upload images for faster resolution</p>
            </div>
            <div className="text-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Icon name="MapPin" size={24} />
              </div>
              <h3 className="font-semibold mb-2">GPS Location</h3>
              <p className="text-white/80 text-sm">Precise location tracking for accurate reporting</p>
            </div>
            <div className="text-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Icon name="Bell" size={24} />
              </div>
              <h3 className="font-semibold mb-2">Real-time Updates</h3>
              <p className="text-white/80 text-sm">Get notified when your issue is resolved</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
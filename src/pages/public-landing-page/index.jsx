import React from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import LanguageToggle from '../../components/ui/LanguageToggle';
import HeroSection from './components/HeroSection';
import RecentReportsSection from './components/RecentReportsSection';
import StatsSection from './components/StatsSection';
import TrustSignalsSection from './components/TrustSignalsSection';
import ComplaintTrackingSection from './components/ComplaintTrackingSection';

const PublicLandingPage = () => {
  // Mock current user data - in real app this would come from auth context
  const currentUser = null; // Set to null for public landing page
  const notificationCount = 0;

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Civicare - Your Voice for a Better Community | Civic Reporting Platform</title>
        <meta name="description" content="Report civic issues instantly with photo evidence and GPS location. Track progress in real-time and help build a cleaner, safer neighborhood for everyone." />
        <meta name="keywords" content="civic reporting, community issues, pothole reporting, streetlight repair, garbage collection, municipal services, citizen engagement" />
        <meta property="og:title" content="Civicare - Your Voice for a Better Community" />
        <meta property="og:description" content="Report civic issues instantly with photo evidence and GPS location. Track progress in real-time and help build a cleaner, safer neighborhood." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Civicare - Civic Reporting Platform" />
        <meta name="twitter:description" content="Report civic issues instantly with photo evidence and GPS location. Track progress in real-time." />
      </Helmet>
      <Header
        currentUser={currentUser}
        notificationCount={notificationCount}
      />
      <main className="w-full">
        <HeroSection />
        <ComplaintTrackingSection />
        <RecentReportsSection />
        <StatsSection />
        <TrustSignalsSection />
      </main>
      <footer className="bg-primary text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-xl">Civicare</h3>
                  <p className="text-primary-foreground/80 text-sm">Civic Reporting Platform</p>
                </div>
              </div>
              <p className="text-primary-foreground/80 mb-4 max-w-md">
                Empowering citizens to report civic issues and track their resolution in real-time.
                Building stronger communities through transparency and accountability.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                  </svg>
                </a>
                <a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/issue-reporting-form" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Report Issue</a></li>
                <li><a href="/public-reports-listing" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Browse Reports</a></li>
                <li><a href="/interactive-issue-map" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Issue Map</a></li>
                <li><a href="/admin-dashboard" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Dashboard</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Help Center</a></li>
                <li><a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Contact Us</a></li>
                <li><a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center">
            <p className="text-primary-foreground/80 text-sm">
              © {new Date()?.getFullYear()} Civicare. All rights reserved. | Made with ❤️ for Indian Citizens
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLandingPage;
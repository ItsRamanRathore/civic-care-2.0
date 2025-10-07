import React from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import HeroSection from './components/HeroSection';
import RecentReportsSection from './components/RecentReportsSection';
import StatsSection from './components/StatsSection';
import TrustSignalsSection from './components/TrustSignalsSection';
import ComplaintTrackingSection from './components/ComplaintTrackingSection';

const EnhancedLandingPage = () => {
  // Mock current user data - in real app this would come from auth context
  const currentUser = null; // Set to null for public landing page
  const notificationCount = 0;

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Civic Care - Your Voice for a Better Community | Modern Civic Reporting Platform</title>
        <meta name="description" content="Report civic issues instantly with photo evidence and GPS tracking. Track progress in real-time and help build safer neighborhoods with our modern, professional platform." />
        <meta name="keywords" content="civic reporting, community issues, pothole reporting, streetlight repair, garbage collection, municipal services, citizen engagement, smart cities, digital india" />
        <meta property="og:title" content="Civic Care - Your Voice for a Better Community" />
        <meta property="og:description" content="Modern civic reporting platform with real-time tracking, photo evidence, and GPS location. Join 50,000+ citizens building better communities." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Civic Care - Modern Civic Reporting Platform" />
        <meta name="twitter:description" content="Report civic issues instantly with photo evidence and GPS tracking. Track progress in real-time." />
        
        {/* Additional modern styling */}
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
          
          body {
            font-family: 'Inter', sans-serif;
          }
          
          .animate-fade-in {
            animation: fadeIn 1s ease-out forwards;
          }
          
          .animate-slide-up {
            animation: slideUp 0.8s ease-out forwards;
          }
          
          .animate-scale-hover:hover {
            transform: scale(1.05);
            transition: transform 0.3s ease;
          }
          
          .animate-lift-hover:hover {
            transform: translateY(-4px);
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            transition: all 0.3s ease;
          }
          
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(40px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          .gradient-text {
            background: linear-gradient(135deg, #dc2626, #ef4444);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          
          .glass-effect {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
          
          .modern-shadow {
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          }
          
          .modern-shadow-hover:hover {
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
          }
        `}</style>
      </Helmet>

      {/* Enhanced Header with modern styling */}
      <div className="relative">
        <Header
          currentUser={currentUser}
          notificationCount={notificationCount}
        />
      </div>

      {/* Main Content with enhanced styling */}
      <main className="w-full">
        {/* Enhanced Hero Section */}
        <div className="animate-fade-in">
          <HeroSection />
        </div>

        {/* How It Works Section - New Addition */}
        <section className="py-20 bg-gray-50 relative overflow-hidden animate-slide-up">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-red-600"></div>
          
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                How It Works
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Simple, fast, and effective. Report issues in just a few clicks and track their resolution.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
              <div className="text-center group animate-lift-hover">
                <div className="relative mb-8">
                  <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto modern-shadow modern-shadow-hover">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg font-bold text-gray-900 text-sm">
                    01
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Report Issue</h3>
                <p className="text-gray-600 leading-relaxed">
                  Take a photo, add location, and describe the civic issue you want to report.
                </p>
              </div>

              <div className="text-center group animate-lift-hover">
                <div className="relative mb-8">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto modern-shadow modern-shadow-hover">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg font-bold text-gray-900 text-sm">
                    02
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Submit & Track</h3>
                <p className="text-gray-600 leading-relaxed">
                  Submit your report and receive a unique tracking ID for real-time updates.
                </p>
              </div>

              <div className="text-center group animate-lift-hover">
                <div className="relative mb-8">
                  <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto modern-shadow modern-shadow-hover">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg font-bold text-gray-900 text-sm">
                    03
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Get Resolution</h3>
                <p className="text-gray-600 leading-relaxed">
                  Authorities review and resolve your issue. Get notified at every step.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Complaint Tracking Section */}
        <div className="animate-slide-up">
          <ComplaintTrackingSection />
        </div>

        {/* Enhanced Recent Reports Section */}
        <div className="animate-slide-up">
          <RecentReportsSection />
        </div>

        {/* Enhanced Stats Section */}
        <div className="animate-slide-up">
          <StatsSection />
        </div>

        {/* Enhanced Trust Signals Section */}
        <div className="animate-slide-up">
          <TrustSignalsSection />
        </div>

        {/* Data Security Section */}
        <section className="py-20 bg-gradient-to-br from-blue-900 to-blue-800 text-white relative overflow-hidden">
          <div className="absolute top-20 left-20 w-32 h-32 bg-white/5 rounded-full blur-xl"></div>
          <div className="absolute bottom-20 right-20 w-48 h-48 bg-red-500/10 rounded-full blur-2xl"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  Your Data is Safe & Secure
                </h2>
                <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                  We follow strict data protection protocols and comply with all Indian data privacy regulations. 
                  Your personal information is encrypted and never shared with unauthorized parties.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {[
                    { text: 'End-to-end encryption' },
                    { text: 'GDPR & IT Act compliant' },
                    { text: 'Complete transparency' },
                    { text: 'User data control' }
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3 group">
                      <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center group-hover:bg-green-500/30 transition-colors duration-300">
                        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-blue-100 group-hover:text-white transition-colors duration-300">
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="text-center">
                <div className="glass-effect rounded-3xl p-12 animate-scale-hover">
                  <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 modern-shadow">
                    <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Verified Secure</h3>
                  <p className="text-blue-100 leading-relaxed">
                    Regular security audits and penetration testing ensure your data remains protected at all times.
                  </p>
                  
                  <div className="mt-6 flex justify-center space-x-4">
                    <div className="bg-white/10 rounded-lg px-4 py-2">
                      <div className="text-sm font-medium">256-bit</div>
                      <div className="text-xs text-blue-200">Encryption</div>
                    </div>
                    <div className="bg-white/10 rounded-lg px-4 py-2">
                      <div className="text-sm font-medium">ISO 27001</div>
                      <div className="text-xs text-blue-200">Certified</div>
                    </div>
                    <div className="bg-white/10 rounded-lg px-4 py-2">
                      <div className="text-sm font-medium">99.9%</div>
                      <div className="text-xs text-blue-200">Uptime</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Enhanced Footer */}
      <footer className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-blue-500 to-red-500"></div>
        <div className="absolute top-10 right-10 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-48 h-48 bg-red-500/10 rounded-full blur-2xl"></div>

        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            {/* Brand Section */}
            <div className="lg:col-span-1">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-2xl">Civic Care</h3>
                  <p className="text-blue-200 text-sm">Civic Reporting Platform</p>
                </div>
              </div>
              <p className="text-blue-100 mb-6 leading-relaxed">
                Empowering citizens to report civic issues and track their resolution in real-time. 
                Building stronger communities through transparency and accountability.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold text-lg mb-6">Quick Links</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="/issue-reporting-form" className="text-blue-100 hover:text-white transition-colors animate-scale-hover">Report Issue</a></li>
                <li><a href="/public-reports-listing" className="text-blue-100 hover:text-white transition-colors animate-scale-hover">Browse Reports</a></li>
                <li><a href="/interactive-issue-map" className="text-blue-100 hover:text-white transition-colors animate-scale-hover">Issue Map</a></li>
                <li><a href="/analytics-dashboard" className="text-blue-100 hover:text-white transition-colors animate-scale-hover">Analytics</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-bold text-lg mb-6">Support</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="/faq" className="text-blue-100 hover:text-white transition-colors animate-scale-hover">Help Center</a></li>
                <li><a href="#" className="text-blue-100 hover:text-white transition-colors animate-scale-hover">Contact Us</a></li>
                <li><a href="#" className="text-blue-100 hover:text-white transition-colors animate-scale-hover">Privacy Policy</a></li>
                <li><a href="#" className="text-blue-100 hover:text-white transition-colors animate-scale-hover">Terms of Service</a></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="font-bold text-lg mb-6">Stay Connected</h4>
              <div className="space-y-4">
                <div className="glass-effect rounded-lg p-4">
                  <h5 className="font-medium mb-3">24/7 Support</h5>
                  <div className="space-y-2 text-sm text-blue-200">
                    <div>📞 1800-XXX-XXXX</div>
                    <div>✉️ support@civiccare.gov.in</div>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <a href="#" className="w-10 h-10 glass-effect rounded-lg flex items-center justify-center animate-scale-hover">
                    📱
                  </a>
                  <a href="#" className="w-10 h-10 glass-effect rounded-lg flex items-center justify-center animate-scale-hover">
                    📧
                  </a>
                  <a href="#" className="w-10 h-10 glass-effect rounded-lg flex items-center justify-center animate-scale-hover">
                    🌐
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/20 pt-8 text-center">
            <p className="text-blue-200 text-sm">
              © {new Date().getFullYear()} Civic Care. All rights reserved. | Made with ❤️ for Indian Citizens
            </p>
            <div className="mt-4 flex justify-center space-x-6 text-sm text-blue-200">
              <span>🔒 SSL Secured</span>
              <span>✅ ISO 27001 Certified</span>
              <span>🌍 Available in 22 Languages</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default EnhancedLandingPage;
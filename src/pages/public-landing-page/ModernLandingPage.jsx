import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import ModernHeader from '../../components/ui/ModernHeader';
import RecentReportsSection from './components/RecentReportsSection';
import ComplaintTrackingSection from './components/ComplaintTrackingSection';
import ModernFooter from '../../components/ui/ModernFooter';
import { useTranslation } from '../../contexts/LanguageContext';

const ModernLandingPage = () => {
  const { t } = useTranslation();
  
  // Mock current user data - in real app this would come from auth context
  const currentUser = null; // Set to null for public landing page
  const notificationCount = 0;

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>{t('civicare')} - {t('yourVoice')} | {t('civicReportingPlatform')}</title>
        <meta name="description" content={t('heroSubtitle')} />
        <meta name="keywords" content="civic reporting, community issues, pothole reporting, streetlight repair, garbage collection, municipal services, citizen engagement, smart cities, digital india" />
        <meta property="og:title" content={`${t('civicare')} - ${t('yourVoice')}`} />
        <meta property="og:description" content={t('heroSubtitle')} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/assets/images/civic-care-og.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${t('civicare')} - ${t('civicReportingPlatform')}`} />
        <meta name="twitter:description" content={t('heroSubtitle')} />
        
        {/* Additional SEO and performance meta tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#1e40af" />
        <link rel="canonical" href="https://civiccare.gov.in" />
        
        {/* Preload critical fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </Helmet>

      {/* Modern Header */}
      <ModernHeader
        currentUser={currentUser}
        notificationCount={notificationCount}
      />

      {/* Main Content */}
      <main className="w-full">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden pt-20">
          {/* Enhanced Background decorative elements */}
          <div className="absolute top-10 left-10 w-64 h-64 bg-gradient-to-br from-blue-200 to-blue-300 rounded-full opacity-30 blur-3xl animate-pulse"></div>
          <div className="absolute top-32 right-16 w-80 h-80 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full opacity-25 blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-20 left-16 w-72 h-72 bg-gradient-to-br from-green-200 to-blue-200 rounded-full opacity-20 blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-32 right-20 w-56 h-56 bg-gradient-to-br from-red-200 to-orange-200 rounded-full opacity-25 blur-2xl animate-pulse" style={{animationDelay: '0.5s'}}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full opacity-10 blur-3xl"></div>
          
          <div className="container mx-auto px-4 text-center relative z-10">
            {/* Trust Badge */}
            <div className="inline-flex items-center space-x-2 bg-green-50 border border-green-200 rounded-full px-6 py-3 mb-8 shadow-lg backdrop-blur-sm">
              <Icon name="CheckCircle" size={18} className="text-green-600" />
              <span className="text-sm font-semibold text-green-800">{t('trustedBy')}</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-8 leading-tight">
              {t('yourVoice')} <br />
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-red-500 bg-clip-text text-transparent drop-shadow-sm">
                {t('betterCommunity', 'Better Community')}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-700 max-w-4xl mx-auto mb-16 leading-relaxed font-medium">
              {t('heroSubtitle')}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20">
              <Link to="/issue-reporting-form" className="bg-red-600 hover:bg-red-700 text-white px-10 py-5 rounded-xl font-bold text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 flex items-center space-x-3">
                <Icon name="Plus" size={22} />
                <span>{t('reportIssue')}</span>
              </Link>
              <Link to="/public-reports-listing" className="bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-10 py-5 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center space-x-3">
                <Icon name="Search" size={22} />
                <span>{t('browseIssues')}</span>
              </Link>
            </div>

            {/* Feature Icons */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
              {[
                {
                  icon: 'Shield',
                  title: t('secureEncrypted', 'Secure & Encrypted'),
                  color: 'text-green-600 bg-green-50 border-green-200'
                },
                {
                  icon: 'Clock',
                  title: t('realTimeUpdates'),
                  color: 'text-blue-600 bg-blue-50 border-blue-200'
                },
                {
                  icon: 'Users',
                  title: t('communityDriven', 'Community Driven'),
                  color: 'text-purple-600 bg-purple-50 border-purple-200'
                },
                {
                  icon: 'Award',
                  title: t('governmentCertified', 'Government Certified'),
                  color: 'text-orange-600 bg-orange-50 border-orange-200'
                }
              ].map((feature, index) => (
                <div key={index} className="flex flex-col items-center text-center group">
                  <div className={`w-16 h-16 rounded-2xl ${feature.color} border flex items-center justify-center mb-4 group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:shadow-xl`}>
                    <Icon name={feature.icon} size={28} />
                  </div>
                  <span className="text-sm font-semibold text-gray-800">{feature.title}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Powerful Features Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                {t('powerfulFeatures', 'Powerful Features for')} <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{t('civicEngagement', 'Civic Engagement')}</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {t('platformDescription', 'Our platform combines cutting-edge technology with user-friendly design to make civic reporting simple, effective, and transparent.')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
              {[
                {
                  icon: 'Camera',
                  title: t('photoEvidence'),
                  description: t('photoEvidenceDesc'),
                  color: 'from-blue-500 to-blue-600',
                  bgColor: 'bg-blue-50'
                },
                {
                  icon: 'MapPin',
                  title: t('gpsLocation'),
                  description: t('gpsLocationDesc'),
                  color: 'from-red-500 to-red-600',
                  bgColor: 'bg-red-50'
                },
                {
                  icon: 'Zap',
                  title: t('realTimeUpdates'),
                  description: t('realTimeUpdatesDesc'),
                  color: 'from-green-500 to-green-600',
                  bgColor: 'bg-green-50'
                }
              ].map((feature, index) => (
                <div key={index} className="text-center group">
                  <div className={`w-20 h-20 ${feature.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-all duration-300`}>
                    <Icon name={feature.icon} size={32} className={`bg-gradient-to-br ${feature.color} bg-clip-text text-transparent`} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {t('readyToMakeDifference', 'Ready to Make a Difference?')}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
              {t('joinThousands', 'Join thousands of citizens who are actively improving their communities through civic engagement.')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/faq" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center space-x-2">
                <Icon name="Play" size={20} />
                <span>{t('watchDemo', 'Watch Demo')}</span>
              </Link>
              <Link to="/faq" className="bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 flex items-center space-x-2">
                <Icon name="BookOpen" size={20} />
                <span>{t('learnMore', 'Learn More')}</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Recent Reports Section - Preserve existing functionality */}
        <RecentReportsSection />

        {/* Complaint Tracking Section - Preserve existing functionality */}
        <ComplaintTrackingSection />
      </main>

      {/* Modern Footer */}
      <ModernFooter />
    </div>
  );
};

export default ModernLandingPage;
import React, { Suspense, lazy } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from '../../contexts/LanguageContext';

// Above the fold - keep static for LCP
import PremiumHeader from '../../components/ui/PremiumHeader';
import PremiumHero from './premium-components/PremiumHero';

// Below the fold - Aggressive JS chunking via lazy load
const PremiumStats = lazy(() => import('./premium-components/PremiumStats'));
const PremiumFeatures = lazy(() => import('./premium-components/PremiumFeatures'));
const PremiumHowItWorks = lazy(() => import('./premium-components/PremiumHowItWorks'));
const PremiumTransparency = lazy(() => import('./premium-components/PremiumTransparency'));
const PremiumCTA = lazy(() => import('./premium-components/PremiumCTA'));
const PremiumTestimonials = lazy(() => import('./premium-components/PremiumTestimonials'));
const PremiumFooter = lazy(() => import('../../components/ui/PremiumFooter'));

// Preserve Functional Sections (Deferred)
const RecentReportsSection = lazy(() => import('./components/RecentReportsSection'));
const ComplaintTrackingSection = lazy(() => import('./components/ComplaintTrackingSection'));
const PremiumMapPreview = lazy(() => import('./premium-components/PremiumMapPreview'));

const ModernLandingPage = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-white selection:bg-blue-100 selection:text-blue-900">
      <Helmet>
        {/* Primary Meta Tags */}
        <title>Civic Care - AI-Powered Civic Intelligence & Governance</title>
        <meta name="title" content="Civic Care - AI-Powered Civic Intelligence & Governance" />
        <meta name="description" content="Report civic issues with AI-powered categorization, track resolution in real-time, and help build transparent, responsive communities." />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#1e3a8a" />
        <link rel="canonical" href="https://civiccare.gov.in" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://civiccare.gov.in/" />
        <meta property="og:title" content="Civic Care - AI-Powered Civic Intelligence" />
        <meta property="og:description" content="Report civic issues with AI-powered categorization and track resolution in real-time." />
        <meta property="og:image" content="https://civiccare.gov.in/og-image.jpg" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:title" content="Civic Care - AI-Powered Civic Intelligence" />
        <meta property="twitter:description" content="Report civic issues with AI-powered categorization and track resolution in real-time." />

        {/* JSON-LD Structured Data */}
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "GovernmentService",
              "name": "Civic Care Public Portal",
              "url": "https://civiccare.gov.in",
              "serviceType": "Civic Issue Reporting & Resolution Tracking",
              "provider": {
                "@type": "GovernmentOrganization",
                "name": "Municipal Corporation"
              },
              "areaServed": "Citywide"
            }
          `}
        </script>
        {/* Preload critical fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </Helmet>

      {/* 1. Header (Sticky & Glass) */}
      <PremiumHeader />

      {/* Main Content Area */}
      <main className="w-full">
        {/* 2. Hero Section (Animated & 3D) */}
        <PremiumHero />

        {/* Suspense Boundary for aggressive deferral */}
        <Suspense fallback={<div className="h-screen flex items-center justify-center bg-white"><div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full" /></div>}>
          {/* 3. Stats Section (Hybrid Data) */}
          <div id="stats-section">
            <PremiumStats />
          </div>

          {/* 4. Features Section (Intelligence Value Prop) */}
          <PremiumFeatures />

          {/* 5. Process Section (User Journey) */}
          <div id="how-it-works">
            <PremiumHowItWorks />
          </div>

          {/* 6. Recent Reports (Core Functionality) */}
          <div className="py-20 bg-white">
             <RecentReportsSection />
          </div>

          {/* 7. Transparency Portal (KPIs) */}
          <div id="transparency-section">
            <PremiumTransparency />
          </div>

          {/* 7.5 Map Preview Feature */}
          <div id="map-section">
             <PremiumMapPreview />
          </div>

          {/* 8. Complaint Tracking (Core Functionality) */}
          <div id="tracking-section" className="py-20 bg-stone-50/50">
             <ComplaintTrackingSection />
          </div>

          {/* 9. Community Testimonials (Social Proof) */}
          <PremiumTestimonials />

          {/* 10. Call To Action (Conversion) */}
          <PremiumCTA />
        </Suspense>
      </main>

      {/* 11. Comprehensive Footer */}
      <Suspense fallback={<div className="h-32 bg-[#111827]" />}>
        <PremiumFooter />
      </Suspense>
    </div>
  );
};

export default ModernLandingPage;
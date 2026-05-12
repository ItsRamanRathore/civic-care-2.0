import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Icon from '../../components/AppIcon';
import CategorySelector from './components/CategorySelector';
import VoiceInput from './components/VoiceInput';
import ImageUpload from './components/ImageUpload';
import LocationSelector from './components/LocationSelector';
import FormProgress from './components/FormProgress';
import ReportingTips from './components/ReportingTips';
import { useAuth } from '../../contexts/AuthContext';
import { useCivicIssues } from '../../hooks/useCivicIssues';
import { useToast } from '../../components/ui/Toast';
import { useTranslation } from '../../contexts/LanguageContext';

const IssueReportingForm = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { createIssue, analyzeIssue } = useCivicIssues();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraftSaving, setIsDraftSaving] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    category: '',
    title: '',
    description: '',
    images: [],
    location: {
      address: '',
      coordinates: null
    },
    priority: 'medium',
    contactInfo: {
      name: '',
      email: '',
      phone: ''
    }
  });

  // Form validation errors
  const [errors, setErrors] = useState({});

  // Voice input state
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  
  // GPS location state
  const [isCapturingLocation, setIsCapturingLocation] = useState(false);
  const [locationCaptured, setLocationCaptured] = useState(false);

  // Initialize contact info with current user data
  useEffect(() => {
    if (user && isAuthenticated) {
      setFormData(prev => ({
        ...prev,
        contactInfo: {
          name: user?.full_name || user?.email?.split('@')?.[0] || '',
          email: user?.email || '',
          phone: user?.phone || ''
        }
      }));
    }
  }, [user, isAuthenticated]);

  // Auto-capture GPS location when form loads
  useEffect(() => {
    let retryCount = 0;
    const MAX_RETRIES = 2;

    const captureCurrentLocation = () => {
      if (!navigator.geolocation) {
        console.warn('Geolocation is not supported by this browser');
        return;
      }

      if (formData?.location?.coordinates) return;

      console.log('🌍 Requesting GPS location...');
      setIsCapturingLocation(true);
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log('✅ GPS location captured:', { latitude, longitude });
          
          setFormData(prev => ({
            ...prev,
            location: {
              ...prev.location,
              coordinates: { lat: latitude, lng: longitude },
              address: prev.location.address || `GPS Captured: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
            }
          }));
          
          setIsCapturingLocation(false);
          setLocationCaptured(true);
          setTimeout(() => setLocationCaptured(false), 5000);
        },
        (error) => {
          console.warn(`❌ GPS location capture failed (Attempt ${retryCount + 1}):`, error.message);
          setIsCapturingLocation(false);
          
          if (error.code === error.TIMEOUT && retryCount < MAX_RETRIES) {
            retryCount++;
            setTimeout(captureCurrentLocation, 2000);
          }
        },
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 10000 }
      );
    };

    // Smart Auto-Capture: Check permission state first
    const initLocationCapture = async () => {
      try {
        if (navigator.permissions && navigator.permissions.query) {
          const result = await navigator.permissions.query({ name: 'geolocation' });
          console.log('📡 Geolocation permission state:', result.state);
          
          if (result.state === 'granted') {
            // Permission already exists, we can capture automatically
            captureCurrentLocation();
          }
          
          // Listen for permission changes
          result.onchange = () => {
            if (result.state === 'granted') captureCurrentLocation();
          };
        } else {
          // Fallback for browsers that don't support Permissions API
          captureCurrentLocation();
        }
      } catch (err) {
        console.warn('Permissions API check failed, falling back to standard capture:', err);
        captureCurrentLocation();
      }
    };

    window.addEventListener('triggerLocationCapture', captureCurrentLocation);
    const timer = setTimeout(initLocationCapture, 1500);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('triggerLocationCapture', captureCurrentLocation);
    };
  }, []);

  // Real-time AI Analysis
  useEffect(() => {
    if (formData.description.length < 20) {
      setAiSuggestion(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsAnalyzing(true);
      try {
        // Set a 10s timeout for the request
        const analysisPromise = analyzeIssue(formData.description);
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 10000));
        
        const { data, error } = await Promise.race([analysisPromise, timeoutPromise]);
        
        if (data) {
          setAiSuggestion(data);
          // Auto-fill category if not already selected
          if (!formData?.category || formData?.category === 'other') {
            handleInputChange('category', data?.category);
          }
          
          // Auto-select priority if still default
          if (formData.priority === 'medium' && data.priority !== 'medium') {
             handleInputChange('priority', data.priority);
          }
        } else if (error) {
           console.warn('AI Analysis failed:', error);
           setAiSuggestion(null);
        }
      } catch (err) {
        console.warn('AI Analysis skipped or failed:', err.message);
        setAiSuggestion(null);
      } finally {
        setIsAnalyzing(false);
      }
    }, 1500); // 1.5s debounce

    return () => clearTimeout(timer);
  }, [formData.description, analyzeIssue]);

  // Calculate form progress
  const getFormProgress = () => {
    const requiredFields = ['category', 'title', 'description', 'location.address'];
    const completedFields = requiredFields?.filter(field => {
      if (field?.includes('.')) {
        const [parent, child] = field?.split('.');
        return formData?.[parent] && formData?.[parent]?.[child];
      }
      return formData?.[field];
    })?.length;

    return {
      completed: completedFields,
      total: requiredFields?.length,
      percentage: Math.round((completedFields / requiredFields?.length) * 100)
    };
  };

  const progress = getFormProgress();

  // Form validation
  const validateForm = () => {
      const newErrors = {};
  
      if (!formData?.category) {
        newErrors.category = t('validationCategoryRequired');
      }
  
      if (!formData?.title?.trim()) {
        newErrors.title = t('validationTitleRequired');
      } else if (formData?.title?.trim()?.length < 10) {
        newErrors.title = t('validationTitleMinLength');
      }
  
      if (!formData?.description?.trim()) {
        newErrors.description = t('validationDescriptionRequired');
      } else if (formData?.description?.trim()?.length < 20) {
        newErrors.description = t('validationDescriptionMinLength');
      }
  
      // Ensure location object and address exist
      if (!formData?.location?.address || !formData.location.address.trim()) {
        newErrors.location = t('validationLocationRequired');
      }
  
      // Only validate contact info if user is not authenticated
      if (!isAuthenticated) {
        if (!formData?.contactInfo?.name?.trim()) {
          newErrors.contactName = t('validationContactNameRequired');
        }
  
        if (!formData?.contactInfo?.email?.trim()) {
          newErrors.contactEmail = t('validationContactEmailRequired');
        } else if (!/\S+@\S+\.\S+/?.test(formData?.contactInfo?.email)) {
          newErrors.contactEmail = t('validationContactEmailInvalid');
        }
  
        if (!formData?.contactInfo?.phone?.trim()) {
          newErrors.contactPhone = t('validationContactPhoneRequired');
        }
      }
  
      setErrors(newErrors);
      return Object.keys(newErrors)?.length === 0;
    };

  // Prevent Enter key from submitting the form
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      console.log('🚀 Submitting issue report...');
      
      const result = await createIssue(formData);

      if (!result.success) {
        console.error('❌ Issue submission failed:', result.error);
        setSubmitError(result.error || t('submissionFailed'));
        showToast(t('submissionFailed'), 'error');
        return;
      }

      console.log('✅ Issue submitted successfully:', result.data);
      
      // Show success toast immediately
      showToast(t('reportSubmittedMessage'), 'success', 5000);
      
      // Show the success page
      setShowSuccessMessage(true);

      // Redirect after success message
      setTimeout(() => {
        navigate('/public-reports-listing');
      }, 3000);

    } catch (error) {
      console.error('💥 Submission error:', error);
      setSubmitError(t('submissionFailed'));
      showToast(t('unexpectedError'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle draft save
  const handleSaveDraft = async () => {
    setIsDraftSaving(true);

    try {
      // Store draft in localStorage for now
      const draftKey = `civic_issue_draft_${user?.id || 'anonymous'}`;
      localStorage.setItem(draftKey, JSON.stringify({
        ...formData,
        savedAt: new Date()?.toISOString()
      }));

      alert(t('draftSaved'));
    } catch (error) {
      console.error('Draft save error:', error);
      alert(t('draftSaveFailed'));
    } finally {
      setIsDraftSaving(false);
    }
  };

  // Handle voice transcript
  const handleVoiceTranscript = (transcript) => {
    if (transcript?.trim()) {
      setFormData(prev => ({
        ...prev,
        description: prev?.description + (prev?.description ? ' ' : '') + transcript
      }));
    }
  };

  // Handle form field changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors?.[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleContactInfoChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      contactInfo: {
        ...prev?.contactInfo,
        [field]: value
      }
    }));

    // Clear error when user starts typing
    const errorKey = `contact${field?.charAt(0)?.toUpperCase() + field?.slice(1)}`;
    if (errors?.[errorKey]) {
      setErrors(prev => ({
        ...prev,
        [errorKey]: ''
      }));
    }
  };

  if (showSuccessMessage) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-green-50 border border-green-200 rounded-lg p-8">
              <Icon name="CheckCircle" size={48} className="mx-auto text-green-500 mb-4" />
              <h2 className="text-xl font-bold text-green-700 mb-2">{t('reportSubmittedSuccessfully')}</h2>
              <p className="text-sm text-gray-600 mb-4">
                {t('reportSubmittedMessage')}
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <div className="flex items-center space-x-2">
                  <Icon name="MessageCircle" size={16} className="text-blue-500" />
                  <p className="text-xs text-blue-700 font-medium">
                    {t('whatsappConfirmation')}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-gray-500">
                  {t('reportIdLabel')} <span className="font-mono font-medium">RPT-{Date.now()}</span>
                </p>
                <p className="text-xs text-gray-500">
                  {t('redirectingToReports')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#1e293b]">
      <Header />
      
      {/* Premium Hero Section */}
      <div className="bg-primary text-white py-12 mb-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-dot-grid opacity-20"></div>
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-accent/20 rounded-full blur-2xl"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
              Report a Civic Issue
            </h1>
            <p className="text-lg text-blue-100 max-w-xl leading-relaxed">
              Help us build a better city. Report problems in your neighborhood and track their resolution in real-time.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-premium border border-slate-200 overflow-hidden">
              {/* Form Progress Visual */}
              <div className="h-1.5 w-full bg-slate-100">
                <div 
                  className="h-full bg-primary transition-all duration-500 ease-out"
                  style={{ width: `${progress.percentage}%` }}
                ></div>
              </div>

              {/* Form Content */}
              <form 
                onSubmit={handleSubmit} 
                onKeyDown={handleKeyDown}
                className="p-8 space-y-10"
              >
                {/* GPS Location Capture Notice */}
                {isCapturingLocation && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 animate-pulse">
                    <div className="flex items-start space-x-3">
                      <div className="animate-spin">
                        <Icon name="Crosshair" size={20} className="text-blue-500 mt-0.5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-blue-800">{t('capturingYourLocation')}</h3>
                        <p className="text-sm text-blue-700 mt-1">
                          {t('detectingCurrentLocation')}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Explicit Permission Request if not captured and not capturing */}
                {!formData?.location?.coordinates && !isCapturingLocation && !locationCaptured && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-amber-100 rounded-full">
                          <Icon name="MapPin" size={20} className="text-amber-600" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-amber-900">Enable Live Location</h3>
                          <p className="text-xs text-amber-700 mt-0.5">
                            Grant location permission to automatically pin this issue on the map for faster response.
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          console.log('👆 User triggered location request');
                          // Re-trigger the capture logic
                          const event = new CustomEvent('triggerLocationCapture');
                          window.dispatchEvent(event);
                        }}
                        className="whitespace-nowrap bg-amber-600 hover:bg-amber-700 border-none shadow-sm"
                        iconName="Crosshair"
                        iconPosition="left"
                      >
                        Allow GPS Access
                      </Button>
                    </div>
                  </div>
                )}

                {/* GPS Location Captured Success */}
                {locationCaptured && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <Icon name="CheckCircle" size={20} className="text-green-500 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-medium text-green-800">{t('gpsCoordinatesCaptured')}</h3>
                        <p className="text-sm text-green-700 mt-1">
                          {t('locationDetectedMessage')}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Authentication Notice */}
                {!isAuthenticated && !isCapturingLocation && !locationCaptured && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <Icon name="Info" size={20} className="text-blue-500 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-medium text-blue-800">{t('anonymousReporting')}</h3>
                        <p className="text-sm text-blue-700 mt-1">
                          {t('anonymousReportingMessage')} <button
                            type="button"
                            onClick={() => navigate('/login')}
                            className="underline hover:no-underline font-medium"
                          >
                            {t('signingIn')}
                          </button>.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Error */}
                {submitError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <Icon name="AlertCircle" size={20} className="text-red-500 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-medium text-red-800">{t('submissionError')}</h3>
                        <p className="text-sm text-red-700 mt-1">{submitError}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Category Selection */}
                <div className="space-y-6">
                  <CategorySelector
                    value={formData?.category}
                    onChange={(value) => handleInputChange('category', value)}
                    error={errors?.category}
                  />
                </div>

                {/* Issue Title */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-blue-50 rounded-lg">
                       <Icon name="FileText" size={20} className="text-primary" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">{t('issueTitle')}</h3>
                    <span className="text-destructive font-bold">*</span>
                  </div>
                  <Input
                    type="text"
                    placeholder={t('issueTitlePlaceholder')}
                    value={formData?.title}
                    onChange={(e) => handleInputChange('title', e?.target?.value)}
                    error={errors?.title}
                    required
                    className="h-12 text-lg focus:ring-primary/20"
                    description={t('issueTitleDescription')}
                  />
                </div>

                {/* Issue Description */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Icon name="AlignLeft" size={20} className="text-primary" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">{t('issueDescription')}</h3>
                    <span className="text-destructive font-bold">*</span>
                  </div>
  
                  <div className="space-y-3">
                    <textarea
                      placeholder={t('issueDescriptionPlaceholder')}
                      value={formData?.description}
                      onChange={(e) => handleInputChange('description', e?.target?.value)}
                      rows={6}
                      className={`w-full px-3 py-2 border rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth resize-vertical ${errors?.description ? 'border-destructive' : 'border-border'
                        }`}
                    />
                    {errors?.description && (
                      <p className="text-sm text-destructive">{errors?.description}</p>
                    )}
  
                    {/* Voice Input */}
                    <VoiceInput
                      onTranscript={handleVoiceTranscript}
                      isActive={isVoiceActive}
                      onToggle={setIsVoiceActive}
                    />

                    {/* AI Suggestions Box */}
                    {(isAnalyzing || aiSuggestion) && (
                      <div className={`p-4 rounded-lg border transition-all ${isAnalyzing ? 'bg-gray-50 border-gray-200 animate-pulse' : 'bg-primary/5 border-primary/20'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Icon name="Cpu" size={16} className={isAnalyzing ? 'text-gray-400' : 'text-primary'} />
                            <span className="text-sm font-semibold">{isAnalyzing ? 'AI is analyzing your report...' : 'Smart Auto-Categorization'}</span>
                          </div>
                          {!isAnalyzing && aiSuggestion?.confidence > 0.8 && (
                            <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">High Confidence</span>
                          )}
                        </div>
                        
                        {!isAnalyzing && aiSuggestion && (
                          <div className="space-y-2">
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {aiSuggestion.reasoning}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              <div className="flex items-center gap-1.5 bg-white border border-border px-2.5 py-1 rounded-md text-[11px] font-medium">
                                <span className="text-muted-foreground">Category:</span>
                                <span className="text-primary font-bold">{aiSuggestion.category.charAt(0).toUpperCase() + aiSuggestion.category.slice(1)}</span>
                              </div>
                              <div className="flex items-center gap-1.5 bg-white border border-border px-2.5 py-1 rounded-md text-[11px] font-medium">
                                <span className="text-muted-foreground">Priority:</span>
                                <span className={`font-bold ${aiSuggestion.priority === 'critical' ? 'text-red-600' : aiSuggestion.priority === 'high' ? 'text-orange-600' : 'text-primary'}`}>
                                  {aiSuggestion.priority.charAt(0).toUpperCase() + aiSuggestion.priority.slice(1)}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Image Upload */}
                <ImageUpload
                  images={formData?.images}
                  onImagesChange={(images) => handleInputChange('images', images)}
                />

                {/* Location Selection */}
                <LocationSelector
                  location={formData?.location}
                  onLocationChange={(location) => handleInputChange('location', location)}
                  error={errors?.location}
                />

                {/* Priority Selection */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Icon name="AlertTriangle" size={20} className="text-primary" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">{t('priorityLevel')}</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'low', label: t('lowPriority'), color: 'bg-gray-100 text-gray-700', description: t('lowPriorityDesc') },
                      { value: 'medium', label: t('mediumPriority'), color: 'bg-yellow-100 text-yellow-700 border-yellow-200', description: t('mediumPriorityDesc') },
                      { value: 'high', label: t('highPriority'), color: 'bg-red-100 text-red-700 border-red-200', description: t('highPriorityDesc') }
                    ]?.map((priority) => (
                      <button
                        key={priority?.value}
                        type="button"
                        onClick={() => handleInputChange('priority', priority?.value)}
                        className={`p-3 border rounded-md text-center transition-all ${formData?.priority === priority?.value
                            ? `${priority?.color} border-current`
                            : 'border-border hover:border-primary/50'
                          }`}
                      >
                        <p className="text-sm font-medium">{priority?.label}</p>
                        <p className="text-xs opacity-75">{priority?.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Contact Information - Only show if not authenticated */}
                {!isAuthenticated && (
                  <div className="space-y-6 pt-10 border-t border-slate-100">
                    <div className="flex items-center space-x-2">
                       <div className="p-2 bg-blue-50 rounded-lg">
                        <Icon name="User" size={20} className="text-primary" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-800">{t('contactInformation')}</h3>
                      <span className="text-destructive font-bold">*</span>
                    </div>
  
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label={t('fullName')}
                        type="text"
                        placeholder={t('fullNamePlaceholder')}
                        value={formData?.contactInfo?.name}
                        onChange={(e) => handleContactInfoChange('name', e?.target?.value)}
                        error={errors?.contactName}
                        required
                      />
                      <Input
                        label={t('emailAddress')}
                        type="email"
                        placeholder={t('emailPlaceholder')}
                        value={formData?.contactInfo?.email}
                        onChange={(e) => handleContactInfoChange('email', e?.target?.value)}
                        error={errors?.contactEmail}
                        required
                      />
                    </div>
  
                    <Input
                      label={t('phoneNumber')}
                      type="tel"
                      placeholder={t('phonePlaceholder')}
                      value={formData?.contactInfo?.phone}
                      onChange={(e) => handleContactInfoChange('phone', e?.target?.value)}
                      error={errors?.contactPhone}
                      required
                      description={t('smsUpdates')}
                    />
                  </div>
                )}

                {/* Form Actions */}
                <div className="flex flex-col sm:flex-row gap-4 pt-10 border-t border-slate-100">
                  <Button
                    type="submit"
                    loading={isSubmitting}
                    disabled={progress?.percentage < 100}
                    iconName="Send"
                    iconPosition="left"
                    variant="primary"
                    size="xl"
                    className="flex-1 shadow-lg shadow-primary/20"
                  >
                    {isSubmitting ? t('submittingReport') : t('submitReport')}
                  </Button>
  
                  <Button
                    type="button"
                    variant="outline"
                    size="xl"
                    onClick={handleSaveDraft}
                    loading={isDraftSaving}
                    iconName="Save"
                    className="flex-1 md:flex-none"
                  >
                    {isDraftSaving ? t('savingDraft') : t('saveDraft')}
                  </Button>
  
                  <Button
                    type="button"
                    variant="ghost"
                    size="xl"
                    onClick={() => navigate('/public-landing-page')}
                    iconName="X"
                    className="flex-1 md:flex-none uppercase text-xs font-bold tracking-widest text-slate-400 hover:text-slate-600"
                  >
                    {t('cancel')}
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Progress Tracker */}
            <FormProgress
              currentStep={0}
              totalSteps={4}
              completedFields={progress?.completed}
              totalFields={progress?.total}
            />

            {/* Reporting Tips */}
            <ReportingTips />
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueReportingForm;
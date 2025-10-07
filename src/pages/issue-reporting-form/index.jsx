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
  const { createIssue } = useCivicIssues();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraftSaving, setIsDraftSaving] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [submitError, setSubmitError] = useState('');

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
          name: user?.user_metadata?.full_name || user?.email?.split('@')?.[0] || '',
          email: user?.email || '',
          phone: user?.phone || ''
        }
      }));
    }
  }, [user, isAuthenticated]);

  // Auto-capture GPS location when form loads
  useEffect(() => {
    const captureCurrentLocation = () => {
      if (!navigator.geolocation) {
        console.warn('Geolocation is not supported by this browser');
        return;
      }

      // Check if location is already captured
      if (formData?.location?.coordinates) {
        return;
      }

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
              coordinates: { lat: latitude, lng: longitude }
              // Don't auto-fill address - let user enter it manually
            }
          }));
          
          setIsCapturingLocation(false);
          setLocationCaptured(true);
          
          // Hide the success message after 5 seconds
          setTimeout(() => setLocationCaptured(false), 5000);
        },
        (error) => {
          console.warn('❌ GPS location capture failed:', error.message);
          setIsCapturingLocation(false);
          // Don't show alert, just silently fail - user can manually set location
        },
        { 
          enableHighAccuracy: true, 
          timeout: 10000, 
          maximumAge: 300000 // 5 minutes cache
        }
      );
    };

    // Capture location after a short delay to ensure form is loaded
    const timer = setTimeout(captureCurrentLocation, 1000);
    
    return () => clearTimeout(timer);
  }, []); // Only run once when component mounts

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
  
      if (!formData?.location?.address?.trim()) {
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
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-6">
        <Breadcrumb />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-3">
            <div className="bg-card border border-border rounded-lg">
              {/* Form Header */}
              <div className="border-b border-border p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                    <Icon name="Plus" size={20} color="white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-text-primary">{t('reportAnIssue')}</h1>
                    <p className="text-sm text-muted-foreground">
                      {t('reportAnIssueSubtitle')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSubmit} className="p-6 space-y-8">
                {/* GPS Location Capture Notice */}
                {isCapturingLocation && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
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
                <CategorySelector
                  value={formData?.category}
                  onChange={(value) => handleInputChange('category', value)}
                  error={errors?.category}
                />

                {/* Issue Title */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Icon name="FileText" size={18} className="text-primary" />
                    <h3 className="text-sm font-medium text-text-primary">{t('issueTitle')}</h3>
                    <span className="text-accent">*</span>
                  </div>
                  <Input
                    type="text"
                    placeholder={t('issueTitlePlaceholder')}
                    value={formData?.title}
                    onChange={(e) => handleInputChange('title', e?.target?.value)}
                    error={errors?.title}
                    required
                    description={t('issueTitleDescription')}
                  />
                </div>

                {/* Issue Description */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Icon name="AlignLeft" size={18} className="text-primary" />
                    <h3 className="text-sm font-medium text-text-primary">{t('issueDescription')}</h3>
                    <span className="text-accent">*</span>
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
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Icon name="AlertTriangle" size={18} className="text-primary" />
                    <h3 className="text-sm font-medium text-text-primary">{t('priorityLevel')}</h3>
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
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Icon name="User" size={18} className="text-primary" />
                      <h3 className="text-sm font-medium text-text-primary">{t('contactInformation')}</h3>
                      <span className="text-accent">*</span>
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
                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-border">
                  <Button
                    type="submit"
                    loading={isSubmitting}
                    disabled={progress?.percentage < 100}
                    iconName="Send"
                    iconPosition="left"
                    iconSize={16}
                    className="flex-1 sm:flex-none"
                  >
                    {isSubmitting ? t('submittingReport') : t('submitReport')}
                  </Button>
  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSaveDraft}
                    loading={isDraftSaving}
                    iconName="Save"
                    iconPosition="left"
                    iconSize={16}
                  >
                    {isDraftSaving ? t('savingDraft') : t('saveDraft')}
                  </Button>
  
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => navigate('/public-landing-page')}
                    iconName="X"
                    iconPosition="left"
                    iconSize={16}
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
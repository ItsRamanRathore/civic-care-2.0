import React, { useState } from 'react';
import { useTranslation } from '../../../contexts/LanguageContext';
import { civicIssueService } from '../../../services/civicIssueService';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const ComplaintTrackingSection = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    complaintId: '',
    email: ''
  });
  const [isTracking, setIsTracking] = useState(false);
  const [trackingResult, setTrackingResult] = useState(null);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear errors when user starts typing
    if (error) setError('');
    if (trackingResult) setTrackingResult(null);
  };

  const validateForm = () => {
    if (!formData.complaintId.trim()) {
      setError(t('complaintIdRequired'));
      return false;
    }
    if (!formData.email.trim()) {
      setError(t('emailForTrackingRequired'));
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError(t('invalidEmailForTracking'));
      return false;
    }
    return true;
  };

  const handleTrackComplaint = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsTracking(true);
    setError('');
    setTrackingResult(null);

    try {
      // Use the dedicated tracking service
      const { data: complaint, error: trackingError } = await civicIssueService.trackComplaint(
        formData.complaintId.trim(),
        formData.email.trim()
      );

      if (trackingError) {
        setError(t('complaintNotFoundMessage'));
      } else if (complaint) {
        setTrackingResult(complaint);
      } else {
        setError(t('complaintNotFoundMessage'));
      }
    } catch (err) {
      console.error('Error tracking complaint:', err);
      setError(t('trackingErrorMessage'));
    } finally {
      setIsTracking(false);
    }
  };

  const handleTrackAnother = () => {
    setFormData({ complaintId: '', email: '' });
    setTrackingResult(null);
    setError('');
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'in_review':
      case 'inreview':
        return 'bg-yellow-100 text-yellow-800';
      case 'assigned':
        return 'bg-purple-100 text-purple-800';
      case 'in_progress':
      case 'inprogress':
        return 'bg-orange-100 text-orange-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t('trackYourComplaint')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('trackComplaintSubtitle')}
            </p>
          </div>

          {!trackingResult ? (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <form onSubmit={handleTrackComplaint} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="complaintId" className="block text-sm font-medium text-gray-700 mb-2">
                      {t('complaintId')} *
                    </label>
                    <Input
                      id="complaintId"
                      name="complaintId"
                      type="text"
                      value={formData.complaintId}
                      onChange={handleInputChange}
                      placeholder={t('complaintIdPlaceholder')}
                      className="w-full"
                      disabled={isTracking}
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      {t('emailForTracking')} *
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder={t('emailForTrackingPlaceholder')}
                      className="w-full"
                      disabled={isTracking}
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-800">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-center">
                  <Button
                    type="submit"
                    disabled={isTracking}
                    className="px-8 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isTracking ? t('tracking') : t('trackNow')}
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('complaintFound')}</h3>
              </div>

              <div className="space-y-6">
                {/* Status Badge */}
                <div className="text-center">
                  <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(trackingResult.status)}`}>
                    {t(trackingResult.status) || trackingResult.status}
                  </span>
                </div>

                {/* Complaint Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">{t('complaintDetails')}</h4>
                      <p className="mt-1 text-lg font-semibold text-gray-900">{trackingResult.title}</p>
                      <p className="mt-1 text-gray-600">{trackingResult.description}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">{t('category')}</h4>
                      <p className="mt-1 text-gray-900 capitalize">{t(trackingResult.category) || trackingResult.category}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">{t('location')}</h4>
                      <p className="mt-1 text-gray-900">{trackingResult.address}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">{t('submittedOn')}</h4>
                      <p className="mt-1 text-gray-900">{formatDate(trackingResult.created_at)}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">{t('lastUpdated')}</h4>
                      <p className="mt-1 text-gray-900">{formatDate(trackingResult.updated_at || trackingResult.created_at)}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">{t('priority')}</h4>
                      <p className="mt-1 text-gray-900 capitalize">{t(trackingResult.priority) || trackingResult.priority}</p>
                    </div>
                  </div>
                </div>

                {/* Updates */}
                {trackingResult.issue_updates && trackingResult.issue_updates.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">{t('updates')}</h4>
                    <div className="space-y-3">
                      {trackingResult.issue_updates.map((update, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(update.status)}`}>
                                {t(update.status) || update.status}
                              </span>
                              {update.comment && (
                                <p className="mt-2 text-gray-700">{update.comment}</p>
                              )}
                            </div>
                            <span className="text-xs text-gray-500">{formatDate(update.created_at)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Images */}
                {trackingResult.issue_images && trackingResult.issue_images.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">{t('images')}</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {trackingResult.issue_images.map((image, index) => (
                        <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                          <img
                            src={image.image_url}
                            alt={image.caption || `Issue image ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = '/assets/images/no_image.png';
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-center pt-6 border-t border-gray-200">
                  <Button
                    onClick={handleTrackAnother}
                    className="px-6 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700"
                  >
                    {t('trackAnother')}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ComplaintTrackingSection;
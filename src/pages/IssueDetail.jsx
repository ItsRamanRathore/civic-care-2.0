import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Header from '../components/ui/Header';
import Button from '../components/ui/Button';
import Icon from '../components/AppIcon';
import { civicIssueService } from '../services/civicIssueService';


const IssueDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [issue, setIssue] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        const loadIssue = async () => {
            try {
                setLoading(true);
                const { data, error: issueError } = await civicIssueService.getIssueById(id);

                if (issueError) {
                    setError(issueError);
                } else {
                    setIssue(data);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            loadIssue();
        }
    }, [id]);

    // Handle escape key for modal
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && selectedImage) {
                setSelectedImage(null);
            }
        };

        if (selectedImage) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [selectedImage]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'submitted': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'in_review': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'assigned': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'in_progress': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
            case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
            case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'low': return 'text-green-600';
            case 'medium': return 'text-yellow-600';
            case 'high': return 'text-orange-600';
            case 'critical': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };

    const getCategoryIcon = (category) => {
        switch (category) {
            case 'roads': return 'Car';
            case 'sanitation': return 'Trash';
            case 'utilities': return 'Zap';
            case 'infrastructure': return 'Building';
            case 'safety': return 'Shield';
            case 'environment': return 'Leaf';
            default: return 'AlertCircle';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="animate-pulse">
                            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                            <div className="bg-card border border-border rounded-lg p-6">
                                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                                <div className="h-32 bg-gray-200 rounded mb-4"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !issue) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-4xl mx-auto text-center">
                        <Icon name="AlertCircle" size={48} className="mx-auto text-red-500 mb-4" />
                        <h1 className="text-2xl font-bold text-text-primary mb-2">Issue Not Found</h1>
                        <p className="text-muted-foreground mb-6">
                            {error || 'The issue you are looking for does not exist or has been removed.'}
                        </p>
                        <div className="space-x-4">
                            <Button onClick={() => navigate(-1)} variant="outline">
                                Go Back
                            </Button>
                            <Button onClick={() => navigate('/public-reports-listing')}>
                                Browse All Reports
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    {/* Breadcrumb */}
                    <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
                        <Link to="/" className="hover:text-primary">Home</Link>
                        <Icon name="ChevronRight" size={14} />
                        <Link to="/public-reports-listing" className="hover:text-primary">Reports</Link>
                        <Icon name="ChevronRight" size={14} />
                        <span className="text-text-primary">Issue Details</span>
                    </nav>

                    {/* Main Content */}
                    <div className="bg-card border border-border rounded-lg overflow-hidden">
                        {/* Header */}
                        <div className="p-6 border-b border-border">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <h1 className="text-2xl font-bold text-text-primary mb-2">{issue.title}</h1>
                                    <p className="text-sm text-muted-foreground">Issue ID: {issue.id}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(issue.status)}`}>
                                    {issue.status.replace('_', ' ').toUpperCase()}
                                </span>
                            </div>

                            {/* Meta Information */}
                            <div className="flex flex-wrap items-center gap-6 text-sm">
                                <div className="flex items-center space-x-2">
                                    <Icon name={getCategoryIcon(issue.category)} size={16} className="text-primary" />
                                    <span className="text-text-primary capitalize">{issue.category.replace('_', ' ')}</span>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Icon name="AlertTriangle" size={16} className={getPriorityColor(issue.priority)} />
                                    <span className={`capitalize ${getPriorityColor(issue.priority)}`}>
                                        {issue.priority} Priority
                                    </span>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Icon name="Calendar" size={16} className="text-muted-foreground" />
                                    <span className="text-muted-foreground">
                                        Reported on {formatDate(issue.created_at)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Main Content */}
                                <div className="lg:col-span-2 space-y-6">
                                    {/* Description */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-text-primary mb-3">Description</h3>
                                        <p className="text-muted-foreground leading-relaxed">{issue.description}</p>
                                    </div>

                                    {/* Images */}
                                    {issue.issue_images && issue.issue_images.length > 0 && (
                                        <div>
                                            <h3 className="text-lg font-semibold text-text-primary mb-3">
                                                <Icon name="Camera" size={20} className="inline mr-2" />
                                                Images ({issue.issue_images.length})
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {issue.issue_images.map((image, index) => (
                                                    <div key={image.id} className="relative group">
                                                        <div className="relative overflow-hidden rounded-lg border border-border bg-muted">
                                                            <img
                                                                src={image.image_url || image.image_path || `https://via.placeholder.com/400x300?text=Image+${index + 1}`}
                                                                alt={image.caption || `Issue image ${index + 1}`}
                                                                className="w-full h-48 object-cover transition-transform group-hover:scale-105 cursor-pointer"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    setSelectedImage(image);
                                                                }}
                                                                onError={(e) => {
                                                                    e.target.src = `https://via.placeholder.com/400x300?text=Image+Not+Available`;
                                                                }}
                                                            />
                                                            {/* Image overlay */}
                                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                                                <Icon
                                                                    name="ZoomIn"
                                                                    size={24}
                                                                    className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                                                />
                                                            </div>
                                                        </div>
                                                        {image.caption && (
                                                            <p className="text-sm text-muted-foreground mt-2 px-1">{image.caption}</p>
                                                        )}
                                                        <p className="text-xs text-muted-foreground mt-1 px-1">
                                                            Uploaded {formatDate(image.created_at)}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Show placeholder if no images */}
                                    {(!issue.issue_images || issue.issue_images.length === 0) && (
                                        <div>
                                            <h3 className="text-lg font-semibold text-text-primary mb-3">
                                                <Icon name="Camera" size={20} className="inline mr-2" />
                                                Images
                                            </h3>
                                            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                                                <Icon name="ImageOff" size={32} className="mx-auto text-muted-foreground mb-2" />
                                                <p className="text-muted-foreground">No images were uploaded with this report</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Updates */}
                                    {issue.issue_updates && issue.issue_updates.length > 0 && (
                                        <div>
                                            <h3 className="text-lg font-semibold text-text-primary mb-3">Updates</h3>
                                            <div className="space-y-4">
                                                {issue.issue_updates.map((update) => (
                                                    <div key={update.id} className="border border-border rounded-lg p-4">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(update.status)}`}>
                                                                {update.status.replace('_', ' ').toUpperCase()}
                                                            </span>
                                                            <span className="text-sm text-muted-foreground">
                                                                {formatDate(update.created_at)}
                                                            </span>
                                                        </div>
                                                        {update.comment && (
                                                            <p className="text-muted-foreground">{update.comment}</p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Sidebar */}
                                <div className="space-y-6">
                                    {/* Location */}
                                    <div className="bg-muted/50 rounded-lg p-4">
                                        <h4 className="font-semibold text-text-primary mb-3 flex items-center">
                                            <Icon name="MapPin" size={16} className="mr-2" />
                                            Location
                                        </h4>
                                        <p className="text-sm text-muted-foreground mb-2">{issue.address}</p>
                                        {issue.latitude && issue.longitude && (
                                            <p className="text-xs text-muted-foreground">
                                                {issue.latitude.toFixed(6)}, {issue.longitude.toFixed(6)}
                                            </p>
                                        )}
                                    </div>

                                    {/* Reporter */}
                                    <div className="bg-muted/50 rounded-lg p-4">
                                        <h4 className="font-semibold text-text-primary mb-3 flex items-center">
                                            <Icon name="User" size={16} className="mr-2" />
                                            Reporter
                                        </h4>
                                        <p className="text-sm text-text-primary font-medium">
                                            {issue.reporter_name || issue.user_profiles?.full_name || 'Anonymous'}
                                        </p>
                                        {issue.reporter_email && (
                                            <p className="text-xs text-muted-foreground">{issue.reporter_email}</p>
                                        )}
                                    </div>

                                    {/* Department */}
                                    {issue.departments && (
                                        <div className="bg-muted/50 rounded-lg p-4">
                                            <h4 className="font-semibold text-text-primary mb-3 flex items-center">
                                                <Icon name="Building" size={16} className="mr-2" />
                                                Assigned Department
                                            </h4>
                                            <p className="text-sm text-text-primary font-medium">{issue.departments.name}</p>
                                            {issue.departments.contact_email && (
                                                <p className="text-xs text-muted-foreground">{issue.departments.contact_email}</p>
                                            )}
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="space-y-3">
                                        <Button
                                            variant="outline"
                                            fullWidth
                                            iconName="Share2"
                                            iconPosition="left"
                                            onClick={() => {
                                                if (navigator.share) {
                                                    navigator.share({
                                                        title: issue.title,
                                                        text: issue.description,
                                                        url: window.location.href
                                                    });
                                                } else {
                                                    navigator.clipboard.writeText(window.location.href);
                                                    alert('Link copied to clipboard!');
                                                }
                                            }}
                                        >
                                            Share Issue
                                        </Button>

                                        <Button
                                            variant="outline"
                                            fullWidth
                                            iconName="Plus"
                                            iconPosition="left"
                                            onClick={() => navigate('/issue-reporting-form')}
                                        >
                                            Report Similar Issue
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Back Button */}
                    <div className="mt-8 text-center">
                        <Button
                            variant="outline"
                            onClick={() => navigate(-1)}
                            iconName="ArrowLeft"
                            iconPosition="left"
                        >
                            Go Back
                        </Button>
                    </div>
                </div>
            </div>

            {/* Image Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setSelectedImage(null);
                        }
                    }}
                >
                    <div
                        className="relative max-w-4xl max-h-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={selectedImage.image_url || selectedImage.image_path}
                            alt={selectedImage.caption || 'Issue image'}
                            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                        />
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white border-0"
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedImage(null);
                            }}
                        >
                            <Icon name="X" size={20} />
                        </Button>
                        {selectedImage.caption && (
                            <div className="absolute bottom-4 left-4 right-4 bg-black/70 text-white p-3 rounded">
                                <p className="text-sm">{selectedImage.caption}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default IssueDetail;
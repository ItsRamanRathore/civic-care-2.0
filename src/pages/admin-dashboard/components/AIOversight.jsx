import React, { useState, useEffect } from 'react';
import apiClient from '../../../lib/apiClient';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const AIOversight = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  const fetchAIInsights = async () => {
    try {
      const response = await apiClient.get('/issues/insights/ai');
      setIssues(response.data.data);
    } catch (error) {
      console.error('Error fetching AI insights:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAIInsights();
  }, []);

  const handleReview = async (issueId, category, priority, isApproved) => {
    setProcessing(issueId);
    try {
      await apiClient.patch(`/issues/${issueId}/review-ai`, {
        category,
        priority,
        is_approved: isApproved
      });
      setIssues(issues.filter(i => i._id !== issueId));
    } catch (error) {
      console.error('Error reviewing AI analysis:', error);
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Icon name="Brain" className="text-purple-600" />
            AI Oversight Dashboard
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Review and verify machine-learning categorizations for incoming civic issues.
          </p>
        </div>
        <div className="bg-purple-50 px-3 py-1 rounded-full border border-purple-100">
          <span className="text-sm font-medium text-purple-700">
            {issues.length} items awaiting review
          </span>
        </div>
      </div>

      {issues.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-12 text-center">
          <Icon name="CheckCircle" size={48} className="text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">All caught up!</h3>
          <p className="text-gray-600 mt-1">There are no new AI-categorized issues requiring oversight.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {issues.map((issue) => (
            <div 
              key={issue._id} 
              className="bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col"
            >
              <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded uppercase tracking-wider">
                    AI Suggested
                  </span>
                  <span className="text-xs text-gray-400 font-mono">
                    ID: {issue._id.substring(0, 8)}...
                  </span>
                </div>

                <h3 className="font-semibold text-gray-900 mb-2 truncate">{issue.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-3 mb-4 italic p-3 bg-gray-50 rounded-lg border-l-4 border-gray-200">
                  "{issue.description}"
                </p>

                <div className="flex flex-wrap gap-3 mb-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-gray-400 mb-1">Category</span>
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-md text-sm font-medium border border-blue-100 capitalize">
                      {issue.category}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-gray-400 mb-1">Priority</span>
                    <span className={`px-3 py-1 rounded-md text-sm font-medium border capitalize ${
                      issue.priority === 'critical' ? 'bg-red-50 text-red-700 border-red-100' :
                      issue.priority === 'high' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                      'bg-gray-50 text-gray-700 border-gray-200'
                    }`}>
                      {issue.priority}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon name="Lightbulb" size={14} className="text-indigo-600" />
                    <span className="text-xs font-bold text-indigo-900 uppercase">Gemini Reasoning</span>
                  </div>
                  <p className="text-xs text-indigo-800 leading-relaxed">
                    {issue.ai_analysis?.reasoning || "Automatic classification based on text content."}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 border-t border-gray-100 flex gap-3">
                <Button
                  onClick={() => handleReview(issue._id, issue.category, issue.priority, true)}
                  loading={processing === issue._id}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white shadow-sm"
                  size="sm"
                >
                  <Icon name="Check" size={16} className="mr-2" />
                  Confirm AI
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {/* Open manual edit modal or link to detail */}}
                  className="flex-1 bg-white"
                  size="sm"
                >
                  <Icon name="Edit3" size={16} className="mr-2" />
                  Manual Fix
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AIOversight;

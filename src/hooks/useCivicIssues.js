import { useState, useEffect, useCallback } from 'react';
import { civicIssueService } from '../services/civicIssueService';
import { useAuth } from '../contexts/AuthContext';

export const useCivicIssues = (filters = {}) => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const { user } = useAuth();

  // Load issues with filters
  const loadIssues = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: issueError } = await civicIssueService?.getIssues(filters);

      if (issueError) {
        setError(issueError);
        return;
      }

      setIssues(data || []);
    } catch (err) {
      setError(err?.message);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]); // Use JSON.stringify to prevent object reference issues

  // Load statistics
  const loadStats = useCallback(async () => {
    try {
      const { data, error: statsError } = await civicIssueService?.getIssuesStats();

      if (statsError) {
        console.error('Error loading stats:', statsError);
        return;
      }

      setStats(data);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  }, []);

  // Create a new issue
  const createIssue = useCallback(async (issueData) => {
    try {
      setError(null);
      const { data, error: createError } = await civicIssueService?.createIssue(issueData);

      if (createError) {
        setError(createError);
        return { success: false, error: createError };
      }

      // Add to local state
      setIssues(prev => [data, ...prev]);

      // Refresh stats
      loadStats();

      return { success: true, data };
    } catch (err) {
      setError(err?.message);
      return { success: false, error: err?.message };
    }
  }, [loadStats]);

  // Update issue status
  const updateIssueStatus = useCallback(async (issueId, status, comment) => {
    try {
      setError(null);
      const { data, error: updateError } = await civicIssueService?.updateIssueStatus(
        issueId,
        status,
        comment
      );

      if (updateError) {
        setError(updateError);
        return { success: false, error: updateError };
      }

      // Update local state
      setIssues(prev => prev?.map(issue =>
        issue?.id === issueId ? { ...issue, ...data } : issue
      ));

      // Refresh stats
      loadStats();

      return { success: true, data };
    } catch (err) {
      setError(err?.message);
      return { success: false, error: err?.message };
    }
  }, [loadStats]);

  // Vote on an issue
  const voteOnIssue = useCallback(async (issueId, voteType = 'upvote') => {
    if (!user) {
      setError('Please sign in to vote on issues');
      return { success: false, error: 'Authentication required' };
    }

    try {
      setError(null);
      const { data, error: voteError } = await civicIssueService?.voteOnIssue(issueId, voteType);

      if (voteError) {
        setError(voteError);
        return { success: false, error: voteError };
      }

      // Update local state - refresh the specific issue
      const { data: updatedIssue } = await civicIssueService?.getIssueById(issueId);
      if (updatedIssue) {
        setIssues(prev => prev?.map(issue =>
          issue?.id === issueId ? updatedIssue : issue
        ));
      }

      return { success: true, data };
    } catch (err) {
      setError(err?.message);
      return { success: false, error: err?.message };
    }
  }, [user]);

  // Add issue update/comment
  const addIssueUpdate = useCallback(async (issueId, status, comment, isPublic = true) => {
    try {
      setError(null);
      const { data, error: updateError } = await civicIssueService?.addIssueUpdate(
        issueId,
        status,
        comment,
        isPublic
      );

      if (updateError) {
        setError(updateError);
        return { success: false, error: updateError };
      }

      // Update local state - refresh the specific issue
      const { data: updatedIssue } = await civicIssueService?.getIssueById(issueId);
      if (updatedIssue) {
        setIssues(prev => prev?.map(issue =>
          issue?.id === issueId ? updatedIssue : issue
        ));
      }

      return { success: true, data };
    } catch (err) {
      setError(err?.message);
      return { success: false, error: err?.message };
    }
  }, []);

  // AI analysis of issue description
  const analyzeIssue = useCallback(async (description) => {
    try {
      const { data, error: analysisError } = await civicIssueService?.analyzeIssue(description);
      if (analysisError) return { success: false, error: analysisError };
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err?.message };
    }
  }, []);

  // Real-time subscription
  useEffect(() => {
    let subscription;

    if (issues?.length > 0) {
      subscription = civicIssueService?.subscribeToIssueChanges((payload) => {
        if (!payload) return;

        // Node backend emits different event names or payloads
        // Assuming payload is the actual issue object or has a standard structure
        const issueId = payload.id || payload._id;

        setIssues(prev => {
          // If the issue already exists, update it, otherwise add it
          const exists = prev?.some(i => (i.id || i._id) === issueId);
          
          if (exists) {
            return prev?.map(issue =>
              (issue?.id || issue?._id) === issueId ? { ...issue, ...payload } : issue
            );
          } else {
            return [payload, ...(prev || [])];
          }
        });

        // Refresh stats on any change
        loadStats();
      });
    }

    return () => {
      if (subscription) {
        civicIssueService?.unsubscribeFromChanges(subscription);
      }
    };
  }, [issues?.length, loadStats]);

  // Initial load - only run once on mount and when filters change
  useEffect(() => {
    loadIssues();
    loadStats();
  }, [JSON.stringify(filters)]); // Only depend on filters, not the functions

  return {
    issues,
    loading,
    error,
    stats,
    loadIssues,
    createIssue,
    updateIssueStatus,
    voteOnIssue,
    addIssueUpdate,
    analyzeIssue,
    clearError: () => setError(null)
  };
};

export default useCivicIssues;
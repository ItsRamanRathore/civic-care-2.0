import React from 'react';
import IssueCard from './IssueCard';
import Icon from '../../../components/AppIcon';

const IssueGrid = ({ issues, loading, onViewDetails }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)]?.map((_, index) => (
          <div key={index} className="bg-card border border-border rounded-lg overflow-hidden shadow-card animate-pulse">
            <div className="h-48 bg-muted" />
            <div className="p-4 space-y-3">
              <div className="flex justify-between">
                <div className="h-4 bg-muted rounded w-24" />
                <div className="h-3 bg-muted rounded w-16" />
              </div>
              <div className="h-6 bg-muted rounded w-3/4" />
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded w-full" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </div>
              <div className="h-4 bg-muted rounded w-1/2" />
              <div className="flex justify-between">
                <div className="h-4 bg-muted rounded w-20" />
                <div className="h-8 bg-muted rounded w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!issues || issues?.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="Search" size={24} className="text-muted-foreground" />
        </div>
        <h3 className="font-heading font-semibold text-lg text-card-foreground mb-2">
          No Issues Found
        </h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          No civic issues match your current search criteria. Try adjusting your filters or search terms.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => window.location?.reload()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-smooth"
          >
            <Icon name="RotateCcw" size={16} />
            Reset Filters
          </button>
          <a
            href="/issue-reporting-form"
            className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-md hover:bg-muted transition-smooth"
          >
            <Icon name="Plus" size={16} />
            Report New Issue
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {issues?.map((issue) => (
        <IssueCard
          key={issue?.id}
          issue={issue}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
};

export default IssueGrid;
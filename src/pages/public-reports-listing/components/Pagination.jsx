import React from 'react';

import Button from '../../../components/ui/Button';

const Pagination = ({ 
  currentPage = 1, 
  totalPages = 1, 
  totalItems = 0, 
  itemsPerPage = 12, 
  onPageChange,
  onItemsPerPageChange 
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range?.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots?.push(1, '...');
    } else {
      rangeWithDots?.push(1);
    }

    rangeWithDots?.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots?.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots?.push(totalPages);
    }

    return rangeWithDots;
  };

  const visiblePages = getVisiblePages();

  const itemsPerPageOptions = [
    { value: 6, label: '6 per page' },
    { value: 12, label: '12 per page' },
    { value: 24, label: '24 per page' },
    { value: 48, label: '48 per page' }
  ];

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 p-4 bg-card border border-border rounded-lg">
      {/* Items Info */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>
          Showing {startItem}-{endItem} of {totalItems} issues
        </span>
        
        {/* Items per page selector */}
        <select
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange?.(Number(e?.target?.value))}
          className="px-2 py-1 border border-border rounded text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {itemsPerPageOptions?.map(option => (
            <option key={option?.value} value={option?.value}>
              {option?.label}
            </option>
          ))}
        </select>
      </div>
      {/* Pagination Controls */}
      <div className="flex items-center gap-1">
        {/* Previous Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange?.(currentPage - 1)}
          disabled={currentPage === 1}
          iconName="ChevronLeft"
          iconSize={16}
          className="h-8 w-8 p-0"
        />

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {visiblePages?.map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <span className="px-2 py-1 text-muted-foreground">...</span>
              ) : (
                <Button
                  variant={currentPage === page ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onPageChange?.(page)}
                  className="h-8 w-8 p-0"
                >
                  {page}
                </Button>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Next Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange?.(currentPage + 1)}
          disabled={currentPage === totalPages}
          iconName="ChevronRight"
          iconSize={16}
          className="h-8 w-8 p-0"
        />
      </div>
      {/* Quick Jump */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">Go to:</span>
        <input
          type="number"
          min="1"
          max={totalPages}
          placeholder="Page"
          className="w-16 px-2 py-1 border border-border rounded text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          onKeyPress={(e) => {
            if (e?.key === 'Enter') {
              const page = parseInt(e?.target?.value);
              if (page >= 1 && page <= totalPages) {
                onPageChange?.(page);
                e.target.value = '';
              }
            }
          }}
        />
      </div>
    </div>
  );
};

export default Pagination;
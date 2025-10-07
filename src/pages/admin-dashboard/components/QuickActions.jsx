import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const QuickActions = ({ selectedIssues, onBulkAssign, onBulkStatusUpdate, onExportData }) => {
  const [assignmentDepartment, setAssignmentDepartment] = useState('');
  const [statusUpdate, setStatusUpdate] = useState('');

  const departmentOptions = [
    { value: '', label: 'Select Department' },
    { value: 'roads', label: 'Roads Department' },
    { value: 'sanitation', label: 'Sanitation Department' },
    { value: 'utilities', label: 'Utilities Department' },
    { value: 'public-works', label: 'Public Works' },
    { value: 'environment', label: 'Environment Department' }
  ];

  const statusOptions = [
    { value: '', label: 'Select Status' },
    { value: 'pending', label: 'Mark as Pending' },
    { value: 'in-progress', label: 'Start Progress' },
    { value: 'resolved', label: 'Mark as Resolved' },
    { value: 'rejected', label: 'Mark as Rejected' }
  ];

  const handleBulkAssign = () => {
    if (assignmentDepartment && selectedIssues?.length > 0) {
      onBulkAssign(selectedIssues, assignmentDepartment);
      setAssignmentDepartment('');
    }
  };

  const handleBulkStatusUpdate = () => {
    if (statusUpdate && selectedIssues?.length > 0) {
      onBulkStatusUpdate(selectedIssues, statusUpdate);
      setStatusUpdate('');
    }
  };

  const quickActionButtons = [
    {
      label: 'New Issue Report',
      icon: 'Plus',
      variant: 'default',
      action: () => console.log('Navigate to issue reporting form')
    },
    {
      label: 'View Analytics',
      icon: 'BarChart3',
      variant: 'outline',
      action: () => console.log('Navigate to analytics dashboard')
    },
    {
      label: 'Export All Data',
      icon: 'Download',
      variant: 'outline',
      action: onExportData
    },
    {
      label: 'Send Notifications',
      icon: 'Bell',
      variant: 'outline',
      action: () => console.log('Send bulk notifications')
    }
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-6">
      <div className="flex items-center space-x-2">
        <Icon name="Zap" size={20} className="text-primary" />
        <h3 className="font-medium text-card-foreground">Quick Actions</h3>
      </div>
      {/* Bulk Actions for Selected Issues */}
      {selectedIssues?.length > 0 && (
        <div className="space-y-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex items-center space-x-2">
            <Icon name="CheckSquare" size={16} className="text-primary" />
            <span className="text-sm font-medium text-primary">
              {selectedIssues?.length} issue{selectedIssues?.length > 1 ? 's' : ''} selected
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Select
                label="Assign to Department"
                options={departmentOptions}
                value={assignmentDepartment}
                onChange={setAssignmentDepartment}
                placeholder="Choose department"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkAssign}
                disabled={!assignmentDepartment}
                iconName="Users"
                iconPosition="left"
                iconSize={14}
                fullWidth
              >
                Assign Selected
              </Button>
            </div>

            <div className="space-y-2">
              <Select
                label="Update Status"
                options={statusOptions}
                value={statusUpdate}
                onChange={setStatusUpdate}
                placeholder="Choose status"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkStatusUpdate}
                disabled={!statusUpdate}
                iconName="RefreshCw"
                iconPosition="left"
                iconSize={14}
                fullWidth
              >
                Update Status
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* General Quick Actions */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-muted-foreground">General Actions</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {quickActionButtons?.map((button, index) => (
            <Button
              key={index}
              variant={button?.variant}
              size="sm"
              onClick={button?.action}
              iconName={button?.icon}
              iconPosition="left"
              iconSize={14}
              fullWidth
            >
              {button?.label}
            </Button>
          ))}
        </div>
      </div>
      {/* Priority Actions */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-muted-foreground">Priority Management</h4>
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => console.log('Set high priority')}
            className="text-accent border-accent/20 hover:bg-accent/10"
            fullWidth
          >
            <Icon name="AlertTriangle" size={14} className="mr-1" />
            High
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => console.log('Set medium priority')}
            className="text-warning border-warning/20 hover:bg-warning/10"
            fullWidth
          >
            <Icon name="AlertCircle" size={14} className="mr-1" />
            Medium
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => console.log('Set low priority')}
            className="text-success border-success/20 hover:bg-success/10"
            fullWidth
          >
            <Icon name="Info" size={14} className="mr-1" />
            Low
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;
import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Icon from '../../../components/AppIcon';

const AssignmentModal = ({ 
  isOpen, 
  onClose, 
  selectedIssues, 
  departments, 
  onAssign 
}) => {
  const [formData, setFormData] = useState({
    departmentId: '',
    assigneeName: '',
    assigneePhone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.departmentId || !formData.assigneeName || !formData.assigneePhone) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onAssign(selectedIssues, formData);
      onClose();
      setFormData({
        departmentId: '',
        assigneeName: '',
        assigneePhone: '',
        message: ''
      });
    } catch (error) {
      alert(`Assignment failed: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-text-primary">
            Assign Issues to Department
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <Icon name="X" size={16} />
          </Button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Selected Issues Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Icon name="Info" size={16} className="text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                Assigning {selectedIssues.length} issue(s)
              </span>
            </div>
            <p className="text-xs text-blue-600">
              This will assign all selected issues to the chosen department and assignee.
            </p>
          </div>

          {/* Department Selection */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Department <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.departmentId}
              onChange={(e) => handleInputChange('departmentId', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            >
              <option value="">Select Department</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          {/* Assignee Name */}
          <Input
            label="Assignee Name"
            type="text"
            placeholder="Enter assignee's full name"
            value={formData.assigneeName}
            onChange={(e) => handleInputChange('assigneeName', e.target.value)}
            required
          />

          {/* Assignee Phone */}
          <Input
            label="Mobile Number"
            type="tel"
            placeholder="Enter mobile number"
            value={formData.assigneePhone}
            onChange={(e) => handleInputChange('assigneePhone', e.target.value)}
            required
          />

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Assignment Message
            </label>
            <textarea
              placeholder="Enter assignment instructions or notes (optional)"
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-vertical"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={isSubmitting}
              disabled={isSubmitting}
              iconName="UserCheck"
              iconPosition="left"
            >
              {isSubmitting ? 'Assigning...' : 'Assign Issues'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignmentModal;
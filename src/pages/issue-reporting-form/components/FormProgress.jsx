import React from 'react';
import Icon from '../../../components/AppIcon';

const FormProgress = ({ currentStep, totalSteps, completedFields, totalFields, className = "" }) => {
  const progressPercentage = Math.round((completedFields / totalFields) * 100);
  
  const getStepStatus = (stepIndex) => {
    if (stepIndex < currentStep) return 'completed';
    if (stepIndex === currentStep) return 'current';
    return 'pending';
  };

  const steps = [
    { label: 'Category & Title', icon: 'Tag' },
    { label: 'Description & Photos', icon: 'FileText' },
    { label: 'Location Details', icon: 'MapPin' },
    { label: 'Review & Submit', icon: 'CheckCircle' }
  ];

  return (
    <div className={`bg-card border border-border rounded-lg p-4 ${className}`}>
      <div className="space-y-4">
        {/* Progress Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-text-primary">Form Progress</h3>
          <span className="text-xs text-muted-foreground">
            {completedFields}/{totalFields} fields completed
          </span>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium text-primary">{progressPercentage}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary rounded-full h-2 transition-all duration-300 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Step Indicators */}
        <div className="space-y-3">
          {steps?.map((step, index) => {
            const status = getStepStatus(index);
            return (
              <div key={index} className="flex items-center space-x-3">
                <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium transition-colors ${
                  status === 'completed' 
                    ? 'bg-success text-success-foreground' 
                    : status === 'current' ?'bg-primary text-primary-foreground' :'bg-muted text-muted-foreground'
                }`}>
                  {status === 'completed' ? (
                    <Icon name="Check" size={12} />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <div className="flex-1">
                  <p className={`text-sm ${
                    status === 'current' ?'text-primary font-medium' 
                      : status === 'completed' ?'text-success font-medium' :'text-muted-foreground'
                  }`}>
                    {step?.label}
                  </p>
                </div>
                <Icon 
                  name={step?.icon} 
                  size={14} 
                  className={
                    status === 'completed' 
                      ? 'text-success' 
                      : status === 'current' ?'text-primary' :'text-muted-foreground'
                  }
                />
              </div>
            );
          })}
        </div>

        {/* Completion Status */}
        {progressPercentage === 100 ? (
          <div className="bg-success/10 border border-success/20 rounded-md p-3">
            <div className="flex items-center space-x-2">
              <Icon name="CheckCircle" size={16} className="text-success" />
              <span className="text-sm font-medium text-success">Ready to Submit!</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              All required fields are completed. Review your information and submit the report.
            </p>
          </div>
        ) : (
          <div className="bg-warning/10 border border-warning/20 rounded-md p-3">
            <div className="flex items-center space-x-2">
              <Icon name="AlertCircle" size={16} className="text-warning" />
              <span className="text-sm font-medium text-warning">
                {totalFields - completedFields} fields remaining
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Complete all required fields to submit your report.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormProgress;
import React from 'react';
import Select from '../../../components/ui/Select';
import Icon from '../../../components/AppIcon';

const CategorySelector = ({ value, onChange, error, required = true }) => {
  const categories = [
    { 
      value: 'roads', 
      label: 'Roads & Transportation',
      description: 'Potholes, traffic signals, road damage'
    },
    { 
      value: 'sanitation', 
      label: 'Sanitation & Cleanliness',
      description: 'Garbage collection, public toilets, drainage'
    },
    { 
      value: 'utilities', 
      label: 'Utilities',
      description: 'Water supply, electricity, gas connections'
    },
    { 
      value: 'infrastructure', 
      label: 'Public Infrastructure',
      description: 'Parks, buildings, streetlights'
    },
    { 
      value: 'safety', 
      label: 'Public Safety',
      description: 'Security concerns, emergency services'
    },
    { 
      value: 'environment', 
      label: 'Environment',
      description: 'Pollution, tree cutting, noise complaints'
    },
    { 
      value: 'other', 
      label: 'Other Issues',
      description: 'Issues not covered in above categories'
    }
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <Icon name="Tag" size={18} className="text-primary" />
        <h3 className="text-sm font-medium text-text-primary">Issue Category</h3>
        {required && <span className="text-accent">*</span>}
      </div>
      <Select
        options={categories}
        value={value}
        onChange={onChange}
        placeholder="Select issue category"
        error={error}
        required={required}
        searchable
        description="Choose the category that best describes your issue"
      />
    </div>
  );
};

export default CategorySelector;
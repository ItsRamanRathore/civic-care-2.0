import React, { useState, useMemo } from 'react';
import Icon from '../AppIcon';
import Button from '../ui/Button';
import SearchBar from '../ui/SearchBar';
import chatbotService from '../../services/chatbotService';

const FAQPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedItems, setExpandedItems] = useState(new Set());

  const faqsByCategory = useMemo(() => {
    return chatbotService.getFAQsByCategory();
  }, []);

  const categories = [
    { key: 'all', label: 'All Categories', icon: 'List' },
    { key: 'reporting', label: 'Issue Reporting', icon: 'AlertCircle' },
    { key: 'tracking', label: 'Tracking & Status', icon: 'Search' },
    { key: 'account', label: 'Account & Access', icon: 'User' },
    { key: 'categories', label: 'Issue Types', icon: 'Grid3X3' },
    { key: 'resolution', label: 'Resolution Process', icon: 'CheckCircle' },
    { key: 'technical', label: 'Technical Support', icon: 'Settings' },
    { key: 'general', label: 'General Information', icon: 'Info' }
  ];

  const filteredFAQs = useMemo(() => {
    let faqs = [];
    
    if (selectedCategory === 'all') {
      faqs = Object.values(faqsByCategory).flat();
    } else {
      faqs = faqsByCategory[selectedCategory] || [];
    }

    if (searchQuery.trim()) {
      faqs = chatbotService.searchFAQs(searchQuery);
    }

    return faqs;
  }, [faqsByCategory, selectedCategory, searchQuery]);

  const toggleExpanded = (faqId) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(faqId)) {
      newExpanded.delete(faqId);
    } else {
      newExpanded.add(faqId);
    }
    setExpandedItems(newExpanded);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setSelectedCategory('all'); // Reset category when searching
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-foreground/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="HelpCircle" size={32} className="text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Frequently Asked Questions</h1>
            <p className="text-primary-foreground/80 max-w-2xl mx-auto">
              Find answers to common questions about reporting civic issues, tracking complaints, and using our platform.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="max-w-2xl mx-auto mb-6">
            <SearchBar
              placeholder="Search FAQs..."
              onSearch={handleSearch}
              className="w-full"
            />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {categories.map((category) => (
              <Button
                key={category.key}
                variant={selectedCategory === category.key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category.key)}
                iconName={category.icon}
                iconPosition="left"
                iconSize={16}
                className="text-sm"
              >
                {category.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="text-center mb-6">
          <p className="text-muted-foreground">
            {filteredFAQs.length} {filteredFAQs.length === 1 ? 'question' : 'questions'} found
            {searchQuery && ` for "${searchQuery}"`}
          </p>
        </div>

        {/* FAQ Items */}
        <div className="max-w-4xl mx-auto">
          {filteredFAQs.length > 0 ? (
            <div className="space-y-4">
              {filteredFAQs.map((faq) => (
                <div
                  key={faq.id}
                  className="bg-card border border-border rounded-lg shadow-card overflow-hidden"
                >
                  <button
                    onClick={() => toggleExpanded(faq.id)}
                    className="w-full p-4 text-left hover:bg-muted/50 transition-colors flex items-center justify-between"
                  >
                    <h3 className="font-semibold text-card-foreground pr-4">
                      {faq.question}
                    </h3>
                    <Icon
                      name={expandedItems.has(faq.id) ? 'ChevronUp' : 'ChevronDown'}
                      size={20}
                      className="text-muted-foreground flex-shrink-0"
                    />
                  </button>
                  
                  {expandedItems.has(faq.id) && (
                    <div className="px-4 pb-4 border-t border-border">
                      <div className="pt-4">
                        <p className="text-muted-foreground leading-relaxed">
                          {faq.answer}
                        </p>
                        
                        {/* Category Badge */}
                        <div className="mt-3">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                            {categories.find(cat => cat.key === faq.category)?.label || faq.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="Search" size={32} className="text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-card-foreground mb-2">No FAQs Found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery 
                  ? `No questions match your search for "${searchQuery}"`
                  : 'No questions available in this category'
                }
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>

        {/* Contact Support Section */}
        <div className="max-w-2xl mx-auto mt-12 text-center">
          <div className="bg-card border border-border rounded-lg p-6 shadow-card">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="MessageCircle" size={24} className="text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-card-foreground mb-2">
              Still Need Help?
            </h3>
            <p className="text-muted-foreground mb-4">
              Can't find what you're looking for? Our chatbot assistant is available 24/7 to help you with any questions.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="default"
                iconName="MessageCircle"
                iconPosition="left"
                iconSize={16}
                onClick={() => {
                  // This would trigger the chatbot widget
                  window.dispatchEvent(new CustomEvent('openChatbot'));
                }}
              >
                Chat with Assistant
              </Button>
              <Button
                variant="outline"
                iconName="Mail"
                iconPosition="left"
                iconSize={16}
              >
                Contact Support
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
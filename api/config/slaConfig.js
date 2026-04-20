/**
 * SLA thresholds for different categories and priorities (in hours)
 * Based on Phase 3 Master Strategy
 */
const SLA_CONFIG = {
  // Public Safety / Life-threatening
  'sanitation': {
    critical: 30, // 30 hours
    high: 48,
    medium: 96,
    low: 168
  },
  'safety': {
    critical: 24,
    high: 48,
    medium: 72,
    low: 120
  },
  'utilities': {
    critical: 24,
    high: 48,
    medium: 72,
    low: 120
  },
  // Infrastructure
  'roads': {
    critical: 48,
    high: 120,
    medium: 240, // 10 days
    low: 720    // 30 days (e.g., Graffiti)
  },
  'infrastructure': {
    critical: 48,
    high: 120,
    medium: 240,
    low: 480
  },
  // Environment & Others
  'environment': {
    critical: 48,
    high: 96,
    medium: 168,
    low: 480
  },
  'other': {
    critical: 72,
    high: 168,
    medium: 336,
    low: 720
  }
};

/**
 * Get SLA threshold for a specific category and priority
 */
const getSLAThreshold = (category, priority) => {
  const cat = category?.toLowerCase() || 'other';
  const prio = priority?.toLowerCase() || 'medium';
  
  const categorySLA = SLA_CONFIG[cat] || SLA_CONFIG.other;
  return categorySLA[prio] || categorySLA.medium;
};

module.exports = {
  SLA_CONFIG,
  getSLAThreshold
};

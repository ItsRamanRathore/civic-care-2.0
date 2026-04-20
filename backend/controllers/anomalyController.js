const CivicIssue = require('../models/CivicIssue');
const AlertService = require('../services/alertService');

/**
 * Controller for detecting system anomalies, SLA breaches, and reporting spikes
 */
exports.detectAnomalies = async (req, res) => {
  try {
    const io = req.app.get('io');
    const anomalies = [];

    // 1. Detect Reporting Spikes (>2x baseline of previous month)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const thirtySevenDaysAgo = new Date(Date.now() - 37 * 24 * 60 * 60 * 1000);

    const recentTrends = await CivicIssue.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { 
            category: '$category', 
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } } 
          },
          count: { $sum: 1 }
        }
      }
    ]);

    const historicalBaseline = await CivicIssue.aggregate([
      { 
        $match: { 
          createdAt: { $gte: thirtySevenDaysAgo, $lt: sevenDaysAgo } 
        } 
      },
      {
        $group: {
          _id: '$category',
          avgDaily: { $avg: 1 } // Simplified baseline
        }
      }
    ]);

    for (const trend of recentTrends) {
      const baseline = historicalBaseline.find(b => b._id === trend._id.category);
      const baselineAvg = baseline ? baseline.avgDaily : 1;

      if (trend.count > baselineAvg * 2 && trend.count > 5) { // Min 5 reports to avoid small sample noise
        anomalies.push({
          type: 'spike',
          severity: 'high',
          message: `Reporting spike detected in ${trend._id.category}: ${trend.count} reports (Baseline: ${Math.round(baselineAvg)})`,
          category: trend._id.category,
          data: { count: trend.count, baseline: baselineAvg }
        });
      }
    }

    // 2. Detect SLA Breaches
    const { SLA_CONFIG } = require('../config/slaConfig');
    
    const activeIssues = await CivicIssue.find({
      status: { $in: ['submitted', 'in_review', 'assigned', 'in_progress'] },
      createdAt: { $gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) } 
    });

    let slaBreachCount = 0;
    activeIssues.forEach(issue => {
      const config = SLA_CONFIG[issue.category] || SLA_CONFIG.other;
      const thresholdHours = config[issue.priority] || config.medium;
      const deadline = new Date(issue.createdAt.getTime() + thresholdHours * 60 * 60 * 1000);

      if (new Date() > deadline) {
        slaBreachCount++;
      }
    });

    if (slaBreachCount > 0) {
      anomalies.push({
        type: 'sla_breach',
        severity: slaBreachCount > 10 ? 'critical' : 'high',
        message: `${slaBreachCount} issues have EXCEEDED their SLA resolution deadline`,
        data: { count: slaBreachCount }
      });
    }

    for (const anomaly of anomalies) {
      await AlertService.notifyAdmins(anomaly, io);
    }

    res.status(200).json({
      success: true,
      data: {
        anomalies,
        count: anomalies.length,
        timestamp: new Date()
      }
    });

  } catch (error) {
    console.error('❌ Anomaly Detection Error:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

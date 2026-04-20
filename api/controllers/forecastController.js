const regression = require('regression');
const CivicIssue = require('../models/CivicIssue');

/**
 * Controller for generating predictive reporting trends and budget forecasts
 */
exports.getForecast = async (req, res) => {
  try {
    const { days = 30, category } = req.query;

    // 1. Fetch historical data (last 90 days)
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const filter = { createdAt: { $gte: ninetyDaysAgo } };
    if (category) filter.category = category;

    const historicalData = await CivicIssue.aggregate([
      { $match: filter },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    if (historicalData.length < 2) {
      return res.status(200).json({
        success: true,
        message: 'Insufficient historical data for forecasting',
        data: { historical: historicalData, predictions: [] }
      });
    }

    // 2. Prepare data for Linear Regression
    const points = historicalData.map((d, index) => [index, d.count]);
    const result = regression.linear(points);
    const { points: regPoints, equation, r2, string } = result;

    // 3. Generate Predictions
    const predictions = [];
    const startIndex = historicalData.length;
    const lastDateString = historicalData[historicalData.length - 1]._id;
    const lastDate = new Date(lastDateString);

    for (let i = 1; i <= parseInt(days); i++) {
      const predictedVal = result.predict(startIndex + i)[1];
      const date = new Date(lastDate);
      date.setDate(date.getDate() + i);

      predictions.push({
        date: date.toISOString().split('T')[0],
        count: Math.max(0, Math.round(predictedVal))
      });
    }

    // 4. Budget Forecast
    const costTable = {
      roads: 5000,
      sanitation: 2000,
      utilities: 3500,
      infrastructure: 8000,
      safety: 1500,
      environment: 2500,
      other: 1000
    };

    const totalPredictedCount = predictions.reduce((sum, p) => sum + p.count, 0);
    const defaultCost = 2500;
    const estimatedBudget = totalPredictedCount * (costTable[category] || defaultCost);

    res.status(200).json({
      success: true,
      data: {
        metadata: {
          r2,
          equation: string,
          trend: equation[0] > 0 ? 'increasing' : 'decreasing',
          confidence: r2 > 0.7 ? 'high' : r2 > 0.4 ? 'medium' : 'low'
        },
        historical: historicalData.map(h => ({ date: h._id, count: h.count })),
        predictions,
        budget: {
          estimatedCount: totalPredictedCount,
          estimatedTotalCost: estimatedBudget,
          currency: 'INR'
        }
      }
    });

  } catch (error) {
    console.error('❌ Forecasting Error:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

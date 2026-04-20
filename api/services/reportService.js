const { jsPDF } = require('jspdf');
require('jspdf-autotable');
const { createObjectCsvWriter } = require('csv-writer');
const fs = require('fs');
const path = require('path');

class ReportService {
  /**
   * Mock generation of a PDF report (Returns buffer)
   */
  static async generatePDFReport(data, metadata) {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.text('Civic Care - Administrative Report', 14, 22);
    
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
    doc.text(`Range: ${metadata.dateRange?.start || 'N/A'} to ${metadata.dateRange?.end || 'N/A'}`, 14, 37);

    // Summary Section
    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text('Analytics Summary', 14, 50);

    const summaryTable = [
      ['Metric', 'Value'],
      ['Total Issues', data.timeline.reduce((sum, d) => sum + d.reported, 0).toString()],
      ['Resolved Issues', data.timeline.reduce((sum, d) => sum + d.resolved, 0).toString()],
      ['Active Anomalies', data.anomalies?.length.toString() || '0']
    ];

    doc.autoTable({
      startY: 55,
      head: [summaryTable[0]],
      body: summaryTable.slice(1),
      theme: 'grid'
    });

    // Detailed Timeline
    doc.text('Daily Activity', 14, doc.lastAutoTable.finalY + 15);
    
    const timelineData = data.timeline.map(d => [d._id, d.reported, d.resolved]);
    
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 20,
      head: [['Date', 'Reported', 'Resolved']],
      body: timelineData,
      theme: 'striped'
    });

    return doc.output('arraybuffer');
  }

  /**
   * Mock generation of a CSV report (Returns file path)
   */
  static async generateCSVReport(data, filename) {
    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
    
    const filePath = path.join(tempDir, filename);
    const csvWriter = createObjectCsvWriter({
      path: filePath,
      header: [
        { id: '_id', title: 'DATE' },
        { id: 'reported', title: 'REPORTED' },
        { id: 'resolved', title: 'RESOLVED' }
      ]
    });

    await csvWriter.writeRecords(data.timeline);
    return filePath;
  }
}

module.exports = ReportService;

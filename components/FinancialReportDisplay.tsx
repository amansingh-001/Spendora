import React from 'react';
import type { FinancialReport } from '../types';
import ReportDonutChart from './ReportDonutChart';

interface FinancialReportDisplayProps {
  report: FinancialReport;
  onClear: () => void;
}

const FinancialReportDisplay: React.FC<FinancialReportDisplayProps> = ({ report, onClear }) => {

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full">
      {/* Action Buttons - Hidden on Print */}
      <div className="flex justify-end items-center mb-6 space-x-4 no-print">
        <button
          onClick={handlePrint}
          className="px-4 py-2 text-sm font-medium rounded-md text-black bg-green-400 hover:bg-green-500"
        >
          Download as PDF
        </button>
        <button
          onClick={onClear}
          className="px-4 py-2 text-sm font-medium rounded-md text-gray-300 bg-gray-700/50 hover:bg-gray-700"
        >
          &larr; Back to Ledger
        </button>
      </div>

      {/* Printable Report Area */}
      <div id="printable-report" className="printable-area w-full bg-gray-900 p-6 sm:p-8 rounded-lg border border-gray-800 animate-fade-in">
        
        {/* Report Header */}
        <div className="mb-8 pb-4 border-b border-gray-800">
          <h1 className="text-3xl font-bold text-white">Financial Report</h1>
          <p className="text-gray-400">For: Spendora</p>
          <p className="text-gray-500 text-sm">Generated on: {new Date().toLocaleDateString()}</p>
        </div>

        {/* Executive Summary */}
        <div className="mb-8 p-6 bg-gray-800/50 rounded-lg">
          <h3 className="text-xl font-semibold text-green-400 mb-2">Executive Summary</h3>
          <p className="text-gray-300 leading-relaxed">{report.executiveSummary}</p>
        </div>

        {/* Chart and Breakdown */}
        <div className="mb-8">
            <h3 className="text-xl font-semibold text-green-400 mb-4">Expense Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-gray-800/50 p-6 rounded-lg">
                <div>
                    <ReportDonutChart data={report.expenseBreakdown} />
                </div>
                <div>
                    <ul className="space-y-2">
                        {report.expenseBreakdown.map((item, index) => (
                        <li key={index} className="flex items-center justify-between text-sm">
                            <div className="flex items-center">
                            <span 
                              className="w-3 h-3 rounded-full mr-2"
                              style={{ backgroundColor: item.color || '#6b7280' }}
                            ></span>
                            <span className="text-gray-300">{item.category}</span>
                            </div>
                            <span className="font-mono text-gray-400">${item.totalAmount.toFixed(2)} ({item.percentage.toFixed(1)}%)</span>
                        </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>

        {/* Insights & Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="p-6 bg-gray-800/50 rounded-lg">
            <h3 className="text-xl font-semibold text-green-400 mb-3">Key Insights</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              {report.keyInsights.map((insight, index) => (
                <li key={index}>{insight}</li>
              ))}
            </ul>
          </div>
          <div className="p-6 bg-gray-800/50 rounded-lg">
            <h3 className="text-xl font-semibold text-green-400 mb-3">Recommendations</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              {report.recommendations.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
};

export default FinancialReportDisplay;
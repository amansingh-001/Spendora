import React, { useState, useEffect } from 'react';
import { getHistory } from '../services/historyService';
import type { HistoryItem } from '../types';
import { InvoiceIcon, ExpenseIcon, ReconciliationIcon } from '../components/icons';

interface HistoryPageProps {
  onViewItem: (item: HistoryItem) => void;
}

const HistoryPage: React.FC<HistoryPageProps> = ({ onViewItem }) => {
    const [history, setHistory] = useState<HistoryItem[]>([]);

    useEffect(() => {
        setHistory(getHistory());
    }, []);

    const getHistoryItemDetails = (item: HistoryItem) => {
        switch (item.type) {
            case 'invoice':
                return `File: ${item.fileName} | Vendor: ${item.invoiceResult.vendor} | Amount: $${item.invoiceResult.totalAmount.toFixed(2)}`;
            case 'expense':
                return `Description: ${item.expenseResult.description} | Category: ${item.expenseResult.category} | Amount: $${item.expenseResult.amount.toFixed(2)}`;
            case 'reconciliation':
                return `File: ${item.fileName} | Matched: ${item.reconciliationResult.matchedTransactions.length} | Unmatched: ${item.reconciliationResult.unmatchedTransactions.length}`;
        }
    }

    const getHistoryItemIcon = (item: HistoryItem) => {
        switch (item.type) {
            case 'invoice':
                return <InvoiceIcon className="w-4 h-4 mr-2 text-green-500" />;
            case 'expense':
                return <ExpenseIcon className="w-4 h-4 mr-2 text-purple-500" />;
            case 'reconciliation':
                return <ReconciliationIcon className="w-4 h-4 mr-2 text-blue-500" />;
        }
    }

    if (history.length === 0) {
        return (
             <div className="text-center py-16 px-6 rounded-lg border-2 border-dashed border-gray-800">
                <h2 className="text-xl font-semibold text-gray-300 mt-4">No History Yet</h2>
                <p className="text-gray-500 mt-2">
                    Process an invoice or categorize an expense to see your history here.
                </p>
            </div>
        );
    }
    
    return (
        <div className="w-full">
            <div className="overflow-x-auto bg-gray-900 rounded-lg border border-gray-800">
                <table className="w-full text-left">
                    <thead className="bg-gray-800/50">
                        <tr>
                            <th className="p-4 text-sm font-semibold text-gray-400">Type</th>
                            <th className="p-4 text-sm font-semibold text-gray-400">Details</th>
                            <th className="p-4 text-sm font-semibold text-gray-400">Date</th>
                            <th className="p-4 text-sm font-semibold text-gray-400"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.map((item) => (
                            <tr key={item.id} className="border-b border-gray-800 last:border-b-0 hover:bg-gray-800/30">
                                <td className="p-4 text-gray-300 capitalize flex items-center">
                                    {getHistoryItemIcon(item)}
                                    {item.type}
                                </td>
                                <td className="p-4 text-gray-400 text-sm">{getHistoryItemDetails(item)}</td>
                                <td className="p-4 text-gray-400 text-sm">{new Date(item.id).toLocaleString()}</td>
                                <td className="p-4 text-right">
                                    <button
                                        onClick={() => onViewItem(item)}
                                        className="px-3 py-1 text-xs font-medium rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600"
                                    >
                                        View
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default HistoryPage;

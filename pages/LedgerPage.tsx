import React, { useState, useEffect } from 'react';
import { getHistory } from '../services/historyService';
import { generateFinancialReport } from '../services/geminiService';
import type { HistoryItem, FinancialReport, LedgerItem } from '../types';
import { InvoiceIcon, ExpenseIcon } from '../components/icons';
import SubmitButton from '../components/SubmitButton';
import ErrorMessage from '../components/ErrorMessage';
import FinancialReportDisplay from '../components/FinancialReportDisplay';
import LoadingSpinner from '../components/LoadingSpinner';

const LedgerPage: React.FC = () => {
    const [ledgerItems, setLedgerItems] = useState<HistoryItem[]>([]);
    const [report, setReport] = useState<FinancialReport | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const allHistory = getHistory();
        const financialItems = allHistory.filter(
            item => item.type === 'invoice' || item.type === 'expense'
        );
        setLedgerItems(financialItems);
    }, []);

    const handleGenerateReport = async () => {
        setIsLoading(true);
        setError(null);
        setReport(null);

        try {
            const formattedLedger: LedgerItem[] = ledgerItems.flatMap(item => {
                if (item.type === 'invoice') {
                    return [{
                        date: new Date(item.id).toLocaleDateString(),
                        description: `Invoice from ${item.invoiceResult.vendor}`,
                        category: item.invoiceResult.category,
                        amount: item.invoiceResult.totalAmount,
                    }];
                }
                if (item.type === 'expense') {
                    return [{
                        date: new Date(item.id).toLocaleDateString(),
                        description: item.expenseResult.description,
                        category: item.expenseResult.category,
                        amount: item.expenseResult.amount,
                    }];
                }
                return [];
            });
            
            const generatedReport = await generateFinancialReport(formattedLedger);

            // Assign hex colors to the breakdown for chart consistency
            const breakdownColors = [
                '#22c55e', '#84cc16', '#16a34a', '#65a30d', '#15803d', '#4d7c0f', '#a3e635'
            ];
            const reportWithColors = {
                ...generatedReport,
                expenseBreakdown: generatedReport.expenseBreakdown.map((item, index) => ({
                    ...item,
                    color: breakdownColors[index % breakdownColors.length],
                })),
            };

            setReport(reportWithColors);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to generate report.");
        } finally {
            setIsLoading(false);
        }
    };

    const renderItemDetails = (item: HistoryItem) => {
        switch (item.type) {
            case 'invoice':
                return `Invoice from ${item.invoiceResult.vendor}`;
            case 'expense':
                return item.expenseResult.description;
            default:
                return '—';
        }
    };

    const renderItemAmount = (item: HistoryItem) => {
        let amount = 0;
        if (item.type === 'invoice') {
            amount = item.invoiceResult.totalAmount;
        } else if (item.type === 'expense') {
            amount = item.expenseResult.amount;
        }
        return <span className="text-red-400 font-mono">-${amount.toFixed(2)}</span>;
    };
    
    const renderItemIcon = (item: HistoryItem) => {
        switch (item.type) {
            case 'invoice':
                return <InvoiceIcon className="w-4 h-4 mr-3 text-gray-500" />;
            case 'expense':
                return <ExpenseIcon className="w-4 h-4 mr-3 text-gray-500" />;
            default:
                return null;
        }
    }

    if (isLoading) {
        return (
            <div className="text-center py-16">
                <LoadingSpinner className="w-12 h-12 mx-auto" />
                <h3 className="text-xl font-semibold text-gray-300 mt-4">Generating Financial Report...</h3>
                <p className="text-gray-500 mt-2">The AI is analyzing your ledger data. This may take a moment.</p>
            </div>
        );
    }
    
    if (report) {
        return <FinancialReportDisplay report={report} onClear={() => setReport(null)} />;
    }

    return (
        <div className="w-full">
            <div className="mb-6 flex justify-end">
                <SubmitButton
                    onClick={handleGenerateReport}
                    isLoading={isLoading}
                    disabled={ledgerItems.length === 0}
                    text="Generate Detailed Report"
                    loadingText="Generating..."
                />
            </div>
            {error && <ErrorMessage message={error} />}

            {ledgerItems.length === 0 && !error ? (
                 <div className="text-center py-16 px-6 rounded-lg border-2 border-dashed border-gray-800">
                    <h2 className="text-xl font-semibold text-gray-300 mt-4">Your Ledger is Empty</h2>
                    <p className="text-gray-500 mt-2">
                        Process an invoice or categorize an expense to see your transaction history here.
                    </p>
                </div>
            ) : (
                <div className="overflow-x-auto bg-gray-900 rounded-lg border border-gray-800">
                    <table className="w-full text-left">
                        <thead className="bg-gray-800/50">
                            <tr>
                                <th className="p-4 text-sm font-semibold text-gray-400">Date</th>
                                <th className="p-4 text-sm font-semibold text-gray-400">Description</th>
                                <th className="p-4 text-sm font-semibold text-gray-400">Category</th>
                                <th className="p-4 text-sm font-semibold text-gray-400 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ledgerItems.map((item) => (
                                <tr key={item.id} className="border-b border-gray-800 last:border-b-0 hover:bg-gray-800/30">
                                    <td className="p-4 text-gray-400 text-sm">{new Date(item.id).toLocaleDateString()}</td>
                                    <td className="p-4 text-gray-300 flex items-center">
                                        {renderItemIcon(item)}
                                        {renderItemDetails(item)}
                                    </td>
                                    <td className="p-4 text-gray-300 capitalize">
                                        {item.type === 'invoice' ? item.invoiceResult.category : (item.type === 'expense' ? item.expenseResult.category : 'N/A')}
                                    </td>
                                    <td className="p-4 text-right">
                                        {renderItemAmount(item)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default LedgerPage;
import React, { useState, useEffect } from 'react';
import { getHistory } from '../services/historyService';
import type { HistoryItem, Page } from '../types';
import ExpenseChart from '../components/ExpenseChart';
import InvoiceChart from '../components/InvoiceChart';

interface DashboardPageProps {
    onNavigate: (page: Page) => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
    const [history, setHistory] = useState<HistoryItem[]>([]);

    useEffect(() => {
        setHistory(getHistory());
    }, []);

    const recentHistory = history.slice(0, 5);

    const getHistoryItemTitle = (item: HistoryItem): string => {
    if (item.type === 'invoice') return item.fileName;
    if (item.type === 'expense') return item.expenseResult?.description ?? 'No Description';
    return 'Unknown Item';
};


    return (
        <div className="w-full">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <InvoiceChart items={history} />
                    <ExpenseChart items={history} />
                </div>
                <div className="space-y-6">
                    <div className="p-6 rounded-lg bg-gray-900">
                        <h3 className="text-lg font-semibold text-gray-200 mb-4">Recent Activity</h3>
                        {recentHistory.length > 0 ? (
                            <ul className="space-y-3">
                                {recentHistory.map(item => (
                                    <li key={item.id} className="text-sm text-gray-400 flex justify-between items-center">
                                        <span className="truncate pr-2">{item.type.charAt(0).toUpperCase() + item.type.slice(1)}: {getHistoryItemTitle(item)}</span>
                                        <span className="text-gray-500 flex-shrink-0">{new Date(item.id).toLocaleDateString()}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                             <p className="text-sm text-gray-500">No recent activity.</p>
                        )}
                         <button onClick={() => onNavigate('history')} className="w-full mt-4 px-4 py-2 text-sm font-medium rounded-md text-gray-300 bg-gray-700/50 hover:bg-gray-700">
                           View All History
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;

import React, { useState, useEffect } from 'react';
import type { HistoryItem, InvoiceHistoryItem } from '../types';
import { InvoiceIcon } from './icons';

interface ChartData {
    category: string;
    amount: number;
    percentage: number;
    color: string;
}

const colors = [
    'bg-green-500', 'bg-lime-500', 'bg-green-600', 'bg-lime-600', 'bg-green-700', 'bg-lime-700', 'bg-green-400'
];

interface InvoiceChartProps {
    items: HistoryItem[];
}

const InvoiceChart: React.FC<InvoiceChartProps> = ({ items }) => {
    const [chartData, setChartData] = useState<ChartData[]>([]);
    const [totalInvoices, setTotalInvoices] = useState(0);

    useEffect(() => {
        const invoiceItems = items.filter(
            (item): item is InvoiceHistoryItem => item.type === 'invoice'
        );

        if (invoiceItems.length === 0) {
            setChartData([]);
            setTotalInvoices(0);
            return;
        }

        // FIX: Use a generic parameter on `reduce` to ensure correct type inference for the accumulator and the result.
        const totalsByCategory = invoiceItems.reduce<Record<string, number>>((acc, item) => {
            const category = item.invoiceResult.category || 'Uncategorized';
            const amount = item.invoiceResult.totalAmount;
            acc[category] = (acc[category] || 0) + amount;
            return acc;
        }, {});

        const total = Object.values(totalsByCategory).reduce((sum, amount) => sum + amount, 0);
        setTotalInvoices(total);

        const formattedData = Object.entries(totalsByCategory)
            .map(([category, amount], index) => ({
                category,
                amount,
                percentage: total > 0 ? (amount / total) * 100 : 0,
                color: colors[index % colors.length],
            }))
            .sort((a, b) => b.amount - a.amount);

        setChartData(formattedData);
    }, [items]);

    if (chartData.length === 0) {
        return (
            <div className="text-center py-10 px-6 rounded-lg bg-gray-900 border-2 border-dashed border-gray-800">
                <InvoiceIcon className="w-12 h-12 mx-auto text-gray-700" />
                <h3 className="text-xl font-semibold text-gray-300 mt-4">No Invoice Data</h3>
                <p className="text-gray-500 mt-2">
                    Process some invoices to see a breakdown here.
                </p>
            </div>
        );
    }

    return (
        <div className="p-6 rounded-lg bg-gray-900">
            <h3 className="text-lg font-semibold text-gray-200 mb-4">Invoice Breakdown by Category</h3>
            <div className="space-y-4">
                {chartData.map(data => (
                    <div key={data.category}>
                        <div className="flex justify-between items-center mb-1 text-sm">
                            <span className="font-medium text-gray-300">{data.category}</span>
                            <span className="text-gray-400 font-mono">${data.amount.toFixed(2)}</span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-2.5">
                            <div
                                className={`${data.color} h-2.5 rounded-full transition-all duration-1000 ease-out`}
                                style={{ width: `${data.percentage}%` }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
             <div className="mt-6 pt-4 border-t border-gray-800 text-right">
                <span className="text-gray-400">Total from Invoices: </span>
                <span className="text-xl font-bold text-green-400 font-mono">${totalInvoices.toFixed(2)}</span>
            </div>
        </div>
    );
};

export default InvoiceChart;

import React, { useState, useEffect } from 'react';
import type { HistoryItem, ExpenseHistoryItem } from '../types';
import { ExpenseIcon } from './icons';

interface ChartData {
    category: string;
    amount: number;
    percentage: number;
    color: string;
}

const colors = [
    'bg-green-500', 'bg-lime-500', 'bg-green-600', 'bg-lime-600', 'bg-green-700', 'bg-lime-700', 'bg-green-400'
];

interface ExpenseChartProps {
    items: HistoryItem[];
}

const ExpenseChart: React.FC<ExpenseChartProps> = ({ items }) => {
    const [chartData, setChartData] = useState<ChartData[]>([]);
    const [totalExpenses, setTotalExpenses] = useState(0);

    useEffect(() => {
        const expenseItems = items.filter(
            (item): item is ExpenseHistoryItem => item.type === 'expense'
        );

        if (expenseItems.length === 0) {
            setChartData([]);
            setTotalExpenses(0);
            return;
        }

       
        const totalsByCategory = expenseItems.reduce<Record<string, number>>((acc, item) => {
            const category = item.expenseResult.category;
            const amount = item.expenseResult.amount;
            acc[category] = (acc[category] || 0) + amount;
            return acc;
        }, {});

        const total = Object.values(totalsByCategory).reduce((sum, amount) => sum + amount, 0);
        setTotalExpenses(total);

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
                <ExpenseIcon className="w-12 h-12 mx-auto text-gray-700" />
                <h3 className="text-xl font-semibold text-gray-300 mt-4">No Expense Data</h3>
                <p className="text-gray-500 mt-2">
                    Categorize some expenses to see a breakdown here.
                </p>
            </div>
        );
    }

    return (
        <div className="p-6 rounded-lg bg-gray-900">
            <h3 className="text-lg font-semibold text-gray-200 mb-4">Expense Breakdown by Category</h3>
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
                <span className="text-gray-400">Total Expenses: </span>
                <span className="text-xl font-bold text-green-400 font-mono">${totalExpenses.toFixed(2)}</span>
            </div>
        </div>
    );
};

export default ExpenseChart;
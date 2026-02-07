import React, { useState, useEffect } from 'react';
import type { HistoryItem, ExpenseHistoryItem, ExpenseResult } from '../types';
import { categorizeExpense } from '../services/geminiService';
import { saveHistoryItem } from '../services/historyService';
import { ExpenseIcon } from '../components/icons';
import SubmitButton from '../components/SubmitButton';
import ErrorMessage from '../components/ErrorMessage';

interface ExpenseManagerPageProps {
    historyItem: ExpenseHistoryItem | null;
    onViewHistoryItem: (item: HistoryItem | null) => void;
}

const ExpenseManagerPage: React.FC<ExpenseManagerPageProps> = ({ historyItem, onViewHistoryItem }) => {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [expenseResult, setExpenseResult] = useState<ExpenseResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (historyItem) {
            setExpenseResult(historyItem.expenseResult);
        }
        return () => {
            onViewHistoryItem(null);
        };
    }, [historyItem, onViewHistoryItem]);


    const handleCategorize = async () => {
        const numericAmount = parseFloat(amount);
        if (!description.trim() || isNaN(numericAmount) || numericAmount <= 0) {
            setError('Please enter a valid description and a positive amount.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setExpenseResult(null);
        
        try {
            const { category, justification } = await categorizeExpense(description, numericAmount);
            const result: ExpenseResult = { description, amount: numericAmount, category, justification };
            setExpenseResult(result);
            saveHistoryItem({
                type: 'expense',
                expenseResult: result,
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const reset = () => {
        setDescription('');
        setAmount('');
        setExpenseResult(null);
        setError(null);
        onViewHistoryItem(null);
    };

    if (expenseResult) {
        return (
            <div className="max-w-2xl mx-auto text-center">
                <div className="p-8 rounded-lg bg-gray-900 border border-gray-800">
                     <ExpenseIcon className="w-12 h-12 mx-auto mb-4 text-green-400" />
                     <h2 className="text-2xl font-bold text-white">Expense Categorized</h2>

                     <div className="text-left mt-6 space-y-3">
                        <p><span className="font-semibold text-gray-400">Description:</span> <span className="text-gray-200">{expenseResult.description}</span></p>
                        <p><span className="font-semibold text-gray-400">Amount:</span> <span className="text-gray-200 font-mono">${expenseResult.amount.toFixed(2)}</span></p>
                        <p><span className="font-semibold text-gray-400">Suggested Category:</span> <span className="font-bold text-green-400">{expenseResult.category}</span></p>
                        <p className="text-sm text-gray-500 italic">"{expenseResult.justification}"</p>
                     </div>
                </div>
                 <button onClick={reset} className="w-full mt-6 px-6 py-3 text-base font-medium rounded-lg text-gray-300 bg-gray-700/50 hover:bg-gray-700">
                    Categorize Another Expense
                </button>
            </div>
        )
    }

    return (
         <div className="max-w-md mx-auto">
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Expense Description</label>
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="e.g., Monthly subscription for design software"
                        className="w-full p-2 border border-gray-700 rounded-md shadow-sm bg-gray-900 text-gray-200 focus:ring-2 focus:ring-green-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Amount ($)</label>
                    <input
                        type="number"
                        value={amount}
                        // FIX: Corrected a typo from `e.g. target.value` to `e.target.value`.
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="e.g., 49.99"
                        className="w-full p-2 border border-gray-700 rounded-md shadow-sm bg-gray-900 text-gray-200 focus:ring-2 focus:ring-green-500"
                    />
                </div>
            </div>
            {error && <div className="mt-4"><ErrorMessage message={error} /></div>}
            <div className="mt-6">
                <SubmitButton 
                    onClick={handleCategorize}
                    isLoading={isLoading}
                    text="Categorize Expense"
                    loadingText="Analyzing..."
                />
            </div>
        </div>
    );
};

export default ExpenseManagerPage;
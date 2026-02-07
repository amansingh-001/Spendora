import React, { useState, useEffect } from 'react';
import { getReminders } from '../services/taxService';
import type { TaxReminder } from '../types';
import { TaxIcon } from '../components/icons';

const TaxRemindersPage: React.FC = () => {
    const [reminders, setReminders] = useState<TaxReminder[]>([]);

    useEffect(() => {
        setReminders(getReminders());
    }, []);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: 'UTC', // Ensure date is not shifted by local timezone
        });
    };

    if (reminders.length === 0) {
        return (
            <div className="text-center py-16 px-6 rounded-lg border-2 border-dashed border-gray-800">
                <TaxIcon className="w-12 h-12 mx-auto text-gray-700" />
                <h2 className="text-xl font-semibold text-gray-300 mt-4">No Tax Reminders</h2>
                <p className="text-gray-500 mt-2">
                    Process an invoice with GST or TDS information to automatically create a reminder here.
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
                            <th className="p-4 text-sm font-semibold text-gray-400">Due Date</th>
                            <th className="p-4 text-sm font-semibold text-gray-400">Tax Type</th>
                            <th className="p-4 text-sm font-semibold text-gray-400 text-right">Amount</th>
                            <th className="p-4 text-sm font-semibold text-gray-400">Source</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reminders.map((reminder) => (
                            <tr key={reminder.id} className="border-b border-gray-800 last:border-b-0 hover:bg-gray-800/30">
                                <td className="p-4 font-medium text-green-400">{formatDate(reminder.dueDate)}</td>
                                <td className="p-4 text-gray-300">{reminder.taxType} Return Filing</td>
                                <td className="p-4 text-gray-300 font-mono text-right">${reminder.amount.toFixed(2)}</td>
                                <td className="p-4 text-gray-400 text-sm truncate" title={reminder.sourceInvoiceFile}>
                                    Invoice: {reminder.sourceInvoiceFile}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TaxRemindersPage;

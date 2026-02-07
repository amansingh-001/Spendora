import React, { useState, useCallback, useEffect } from 'react';
import FileInput from '../components/FileInput';
import SubmitButton from '../components/SubmitButton';
import ErrorMessage from '../components/ErrorMessage';
import { processInvoice } from '../services/geminiService';
import { saveHistoryItem } from '../services/historyService';
import { calculateDueDate, addReminder } from '../services/taxService';
import type { InvoiceResult, InvoiceHistoryItem, HistoryItem } from '../types';
import { InvoiceIcon } from '../components/icons';

interface InvoiceProcessorPageProps {
    historyItem: InvoiceHistoryItem | null;
    onViewHistoryItem: (item: HistoryItem | null) => void;
}

const InvoiceProcessorPage: React.FC<InvoiceProcessorPageProps> = ({ historyItem, onViewHistoryItem }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invoiceResult, setInvoiceResult] = useState<InvoiceResult | null>(null);

  useEffect(() => {
      if (historyItem) {
          setInvoiceResult(historyItem.invoiceResult);
      }
      return () => {
          onViewHistoryItem(null);
      }
  }, [historyItem, onViewHistoryItem]);

  const handleFileSelect = useCallback((file: File | null) => {
    setSelectedFile(file);
    setError(null);
  }, []);

  const handleSubmit = async () => {
    if (!selectedFile) {
      setError('Please select a file to process.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setInvoiceResult(null);

    try {
      const result = await processInvoice(selectedFile);
      setInvoiceResult(result);
      const savedHistoryItem = saveHistoryItem({
        type: 'invoice',
        fileName: selectedFile.name,
        invoiceResult: result,
      });

      // Automatically create a tax reminder if applicable
      if (result.taxType && result.taxAmount && result.taxAmount > 0) {
        const invoiceDate = new Date(result.invoiceDate);
        if (!isNaN(invoiceDate.getTime())) {
          const dueDate = calculateDueDate(invoiceDate, result.taxType);
          addReminder({
            taxType: result.taxType,
            dueDate: dueDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
            amount: result.taxAmount,
            sourceInvoiceFile: savedHistoryItem.fileName,
            sourceInvoiceId: savedHistoryItem.id,
          });
        }
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred during processing.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const reset = () => {
      setSelectedFile(null);
      setInvoiceResult(null);
      setError(null);
      onViewHistoryItem(null);
  }

  if (invoiceResult) {
    return (
        <div className="max-w-4xl mx-auto">
            <div className="p-8 rounded-lg bg-gray-900 border border-gray-800">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center mb-4">
                            <InvoiceIcon className="w-8 h-8 mr-3 text-green-400" />
                            <h2 className="text-2xl font-bold text-white">Invoice Processed Successfully</h2>
                        </div>
                    </div>
                    <button onClick={reset} className="px-4 py-2 text-sm font-medium rounded-md text-gray-300 bg-gray-700/50 hover:bg-gray-700">
                        Process Another
                    </button>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    <div className="bg-gray-800/50 p-4 rounded-lg">
                        <p className="font-semibold text-gray-400">Vendor</p>
                        <p className="text-lg text-gray-200">{invoiceResult.vendor}</p>
                    </div>
                    <div className="bg-gray-800/50 p-4 rounded-lg">
                        <p className="font-semibold text-gray-400">Total Amount</p>
                        <p className="text-lg font-bold text-green-400 font-mono">${invoiceResult.totalAmount.toFixed(2)}</p>
                    </div>
                    <div className="bg-gray-800/50 p-4 rounded-lg">
                        <p className="font-semibold text-gray-400">Invoice Date</p>
                        <p className="text-gray-200">{invoiceResult.invoiceDate}</p>
                    </div>
                     <div className="bg-gray-800/50 p-4 rounded-lg">
                        <p className="font-semibold text-gray-400">Due Date</p>
                        <p className="text-gray-200">{invoiceResult.dueDate || 'N/A'}</p>
                    </div>
                     <div className="bg-gray-800/50 p-4 rounded-lg">
                        <p className="font-semibold text-gray-400">Suggested Category</p>
                        <p className="text-gray-200">{invoiceResult.category}</p>
                    </div>
                    {invoiceResult.taxType && (
                         <div className="bg-gray-800/50 p-4 rounded-lg">
                            <p className="font-semibold text-gray-400">Tax Detected</p>
                            <p className="text-gray-200">{invoiceResult.taxType}: <span className="font-mono">${invoiceResult.taxAmount?.toFixed(2)}</span></p>
                        </div>
                    )}
                </div>

                <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-300 mb-2">Line Items</h3>
                    <div className="overflow-x-auto rounded-lg border border-gray-800">
                        <table className="w-full text-left">
                            <thead className="bg-gray-800/50">
                                <tr>
                                    <th className="p-3 text-xs font-semibold text-gray-400">Description</th>
                                    <th className="p-3 text-xs font-semibold text-gray-400 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoiceResult.lineItems.map((item, index) => (
                                    <tr key={index} className="border-t border-gray-800">
                                        <td className="p-3 text-gray-300">{item.description}</td>
                                        <td className="p-3 text-gray-300 font-mono text-right">${item.amount.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <FileInput onFileSelect={handleFileSelect} disabled={isLoading} onError={setError} />
      {error && <div className="mt-4"><ErrorMessage message={error} /></div>}
      <div className="mt-6">
        <SubmitButton
          onClick={handleSubmit}
          isLoading={isLoading}
          disabled={!selectedFile}
          text="Process Invoice"
          loadingText="Analyzing..."
        />
      </div>
    </div>
  );
};

export default InvoiceProcessorPage;

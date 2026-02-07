import React, { useState, useEffect, useCallback } from 'react';
import { reconcileStatement } from '../services/geminiService';
import { getHistory, saveHistoryItem } from '../services/historyService';
import type { ReconciliationResult, ReconciliationHistoryItem } from '../types';
import FileInput from '../components/FileInput';
import SubmitButton from '../components/SubmitButton';
import ErrorMessage from '../components/ErrorMessage';
import LoadingSpinner from '../components/LoadingSpinner';

const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsText(file);
  });
};

interface ReconciliationPageProps {
  historyItem: ReconciliationHistoryItem | null;
}

const ReconciliationPage: React.FC<ReconciliationPageProps> = ({ historyItem }) => {
    const [reconciliationResult, setReconciliationResult] = useState<ReconciliationResult | null>(null);
    const [isHistoryView, setIsHistoryView] = useState(false);
    
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [statementText, setStatementText] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (historyItem) {
            setReconciliationResult(historyItem.reconciliationResult);
            setIsHistoryView(true);
        }
    }, [historyItem]);
    
    const resetForNewSession = useCallback(() => {
        setReconciliationResult(null);
        setIsHistoryView(false);
        setSelectedFile(null);
        setStatementText(null);
        setError(null);
    }, []);

    const handleFileSelect = useCallback(async (file: File | null) => {
        setSelectedFile(file);
        setError(null);
        if (file) {
            try {
                if(file.type !== 'text/plain') {
                    setError('Invalid file type. Please upload a .txt file for the bank statement.');
                    setStatementText(null);
                    return;
                }
                const text = await readFileAsText(file);
                setStatementText(text);
            } catch(err) {
                 setError('Failed to read the selected file.');
                 setStatementText(null);
            }
        } else {
            setStatementText(null);
        }
    }, []);

    const handleProcess = async () => {
        if (!statementText || !selectedFile) {
            setError('Please select a valid bank statement file (.txt).');
            return;
        }

        setIsLoading(true);
        setError(null);
        
        try {
            const ledgerItems = getHistory();
            const result = await reconcileStatement(statementText, ledgerItems);
            setReconciliationResult(result);
            saveHistoryItem({ type: 'reconciliation', fileName: selectedFile.name, reconciliationResult: result });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="text-center py-16">
                <LoadingSpinner className="w-12 h-12 mx-auto" />
                <h3 className="text-xl font-semibold text-gray-300 mt-4">Analyzing Statement...</h3>
                <p className="text-gray-500 mt-2">The AI is matching transactions against your ledger. This may take a moment.</p>
            </div>
        );
    }
    
    if (reconciliationResult) {
        return (
            <div className="w-full space-y-8">
                <div className="flex-shrink-0 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-200">
                        Reconciliation Complete {isHistoryView && `: ${historyItem?.fileName}`}
                    </h3>
                    <button onClick={resetForNewSession} className="px-4 py-2 text-sm font-medium rounded-md text-gray-300 bg-gray-700/50 hover:bg-gray-700">
                        {isHistoryView ? 'Start New Reconciliation' : 'Clear Results'}
                    </button>
                </div>
                
                {/* Matched Transactions */}
                <div>
                    <h4 className="text-xl font-bold text-green-400 mb-4">Matched Transactions ({reconciliationResult.matchedTransactions.length})</h4>
                    <div className="overflow-x-auto bg-gray-900 rounded-lg border border-gray-800">
                        <table className="w-full text-left">
                            <thead className="bg-gray-800/50">
                                <tr>
                                    <th className="p-4 text-sm font-semibold text-gray-400">Bank Transaction</th>
                                    <th className="p-4 text-sm font-semibold text-gray-400">Amount</th>
                                    <th className="p-4 text-sm font-semibold text-gray-400">Matched Ledger Item</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reconciliationResult.matchedTransactions.map((match, index) => (
                                    <tr key={index} className="border-b border-gray-800 last:border-b-0">
                                        <td className="p-4 text-gray-300">{match.bankTransaction.description} <span className="text-xs text-gray-500 block">{match.bankTransaction.date}</span></td>
                                        <td className="p-4 text-gray-200 font-mono">${match.bankTransaction.amount.toFixed(2)}</td>
                                        <td className="p-4 text-gray-300 text-sm">{match.ledgerItem.description}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Unmatched Transactions */}
                 <div>
                    <h4 className="text-xl font-bold text-yellow-400 mb-4">Unmatched Transactions ({reconciliationResult.unmatchedTransactions.length})</h4>
                    <div className="overflow-x-auto bg-gray-900 rounded-lg border border-gray-800">
                        <table className="w-full text-left">
                            <thead className="bg-gray-800/50">
                                <tr>
                                    <th className="p-4 text-sm font-semibold text-gray-400">Bank Transaction</th>
                                    <th className="p-4 text-sm font-semibold text-gray-400">Amount</th>
                                    <th className="p-4 text-sm font-semibold text-gray-400">AI Suggested Category</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reconciliationResult.unmatchedTransactions.map((unmatched, index) => (
                                    <tr key={index} className="border-b border-gray-800 last:border-b-0">
                                        <td className="p-4 text-gray-300">{unmatched.bankTransaction.description} <span className="text-xs text-gray-500 block">{unmatched.bankTransaction.date}</span></td>
                                        <td className="p-4 text-gray-200 font-mono">${unmatched.bankTransaction.amount.toFixed(2)}</td>
                                        <td className="p-4 text-yellow-300 text-sm font-semibold">{unmatched.suggestedCategory}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-shrink-0 w-full max-w-xl mx-auto flex flex-col items-center justify-center text-center">
            <p className="text-gray-400 mb-4">Upload your bank statement as a plain text (.txt) file. The AI will analyze it and compare it against your existing ledger entries.</p>
            <FileInput onFileSelect={handleFileSelect} disabled={isLoading} onError={setError} />
            {error && <ErrorMessage message={error} />}
            <div className="w-full mt-6">
                <SubmitButton 
                    onClick={handleProcess} 
                    isLoading={isLoading} 
                    disabled={!selectedFile}
                    text="Reconcile Statement"
                    loadingText="Analyzing..."
                />
            </div>
        </div>
    );
};

export default ReconciliationPage;

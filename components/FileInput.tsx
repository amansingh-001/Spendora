import React, { useState, useRef, useCallback } from 'react';

interface FileInputProps {
  onFileSelect: (file: File | null) => void;
  disabled: boolean;
  onError: (message: string) => void;
}

const ACCEPTED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'text/plain',
];

const FileInput: React.FC<FileInputProps> = ({ onFileSelect, disabled, onError }) => {
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndSelectFile = useCallback((file: File | null) => {
    if (!file) {
      onFileSelect(null);
      setSelectedFileName(null);
      return;
    }
    if (!ACCEPTED_MIME_TYPES.includes(file.type)) {
      onError(`Invalid file type. Please upload one of: JPEG, PNG, PDF, or TXT.`);
      onFileSelect(null);
      setSelectedFileName(null);
      return;
    }
    onFileSelect(file);
    setSelectedFileName(file.name);
  }, [onFileSelect, onError]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    validateAndSelectFile(file);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled) return;

    const file = e.dataTransfer.files?.[0] || null;
    if (fileInputRef.current) {
        fileInputRef.current.files = e.dataTransfer.files;
    }
    validateAndSelectFile(file);
  };


  return (
    <div className="w-full">
        <label
            htmlFor="file-upload"
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors
                ${isDragging ? 'border-green-400 bg-gray-800' : 'border-gray-700 bg-gray-900'}
                ${disabled ? 'cursor-not-allowed bg-gray-800' : 'hover:bg-gray-800'}
            `}
        >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                </svg>
                <p className="mb-2 text-sm text-gray-400">
                    <span className="font-semibold text-green-400">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">PDF, PNG, JPG or TXT</p>
            </div>
            <input id="file-upload" ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} disabled={disabled} accept={ACCEPTED_MIME_TYPES.join(',')} />
        </label>
        {selectedFileName && (
            <div className="mt-4 text-center text-sm text-gray-400">
                Selected: <span className="font-medium text-gray-200">{selectedFileName}</span>
            </div>
        )}
    </div>
  );
};

export default FileInput;

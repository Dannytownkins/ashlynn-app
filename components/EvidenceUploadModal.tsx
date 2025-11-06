import React, { useState } from 'react';
import { Upload, Link, X, File } from 'lucide-react';
import { uploadEvidence } from '../services/firestoreApi';

interface EvidenceUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete: (url: string) => void;
  taskId: string;
}

const EvidenceUploadModal: React.FC<EvidenceUploadModalProps> = ({
  isOpen,
  onClose,
  onUploadComplete,
  taskId,
}) => {
  const [uploadMethod, setUploadMethod] = useState<'file' | 'link'>('file');
  const [file, setFile] = useState<File | null>(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleSubmit = async () => {
    setIsUploading(true);
    try {
      let evidenceUrl = '';
      
      if (uploadMethod === 'file' && file) {
        evidenceUrl = await uploadEvidence(file, taskId);
      } else if (uploadMethod === 'link' && linkUrl.trim()) {
        // Validate URL format
        try {
          new URL(linkUrl);
          evidenceUrl = linkUrl.trim();
        } catch {
          alert('Please enter a valid URL');
          setIsUploading(false);
          return;
        }
      } else {
        alert('Please select a file or enter a link');
        setIsUploading(false);
        return;
      }

      onUploadComplete(evidenceUrl);
      setFile(null);
      setLinkUrl('');
      onClose();
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload evidence. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-slate-800">Submit Evidence</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="mb-6">
          <div className="flex space-x-2 mb-4">
            <button
              onClick={() => setUploadMethod('file')}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                uploadMethod === 'file'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Upload size={18} className="inline mr-2" />
              Upload File
            </button>
            <button
              onClick={() => setUploadMethod('link')}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                uploadMethod === 'link'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Link size={18} className="inline mr-2" />
              Drive Link
            </button>
          </div>

          {uploadMethod === 'file' ? (
            <div>
              <label className="block mb-2 text-sm font-semibold text-slate-700">
                Select Photo or PDF
              </label>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-indigo-400 transition-colors cursor-pointer">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload size={32} className="mx-auto mb-2 text-slate-400" />
                  <p className="text-sm text-slate-600">
                    Click to upload or drag and drop
                  </p>
                  {file && (
                    <p className="mt-2 text-sm text-indigo-600 font-semibold">
                      <File size={16} className="inline mr-1" />
                      {file.name}
                    </p>
                  )}
                </label>
              </div>
            </div>
          ) : (
            <div>
              <label className="block mb-2 text-sm font-semibold text-slate-700">
                Google Drive Link
              </label>
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://drive.google.com/..."
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <p className="mt-2 text-xs text-slate-500">
                Paste a link to your work on Google Drive
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={isUploading}
            className="px-4 py-2 text-slate-700 font-semibold rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isUploading || (uploadMethod === 'file' && !file) || (uploadMethod === 'link' && !linkUrl.trim())}
            className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? 'Uploading...' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EvidenceUploadModal;


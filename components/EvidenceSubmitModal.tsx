import React, { useState, useRef } from 'react';
import { Camera, Upload, Link as LinkIcon, X, Check, Image as ImageIcon } from 'lucide-react';

interface EvidenceSubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (evidenceData: string, evidenceType: 'image' | 'link') => void;
  taskTitle: string;
}

const EvidenceSubmitModal: React.FC<EvidenceSubmitModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  taskTitle
}) => {
  const [evidenceType, setEvidenceType] = useState<'image' | 'link'>('image');
  const [linkUrl, setLinkUrl] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImageData(result);
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (evidenceType === 'image' && imageData) {
      onSubmit(imageData, 'image');
    } else if (evidenceType === 'link' && linkUrl.trim()) {
      onSubmit(linkUrl.trim(), 'link');
    }
    handleClose();
  };

  const handleClose = () => {
    setLinkUrl('');
    setImagePreview(null);
    setImageData(null);
    setEvidenceType('image');
    onClose();
  };

  const isValid = evidenceType === 'image' ? !!imageData : !!linkUrl.trim();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-lg transform transition-all animate-fade-in-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Submit Work</h2>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <p className="text-slate-600 mb-4">
          Submit evidence for: <span className="font-semibold">{taskTitle}</span>
        </p>

        {/* Evidence Type Selector */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setEvidenceType('image')}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
              evidenceType === 'image'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <ImageIcon size={18} className="inline mr-2" />
            Photo/Image
          </button>
          <button
            onClick={() => setEvidenceType('link')}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
              evidenceType === 'link'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <LinkIcon size={18} className="inline mr-2" />
            Link
          </button>
        </div>

        {/* Image Upload Section */}
        {evidenceType === 'image' && (
          <div className="space-y-4">
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Evidence preview"
                  className="w-full h-64 object-cover rounded-lg border-2 border-slate-200"
                />
                <button
                  onClick={() => {
                    setImagePreview(null);
                    setImageData(null);
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
                >
                  <Camera size={32} className="text-slate-400 mb-2" />
                  <span className="text-sm font-semibold text-slate-600">Take Photo</span>
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
                >
                  <Upload size={32} className="text-slate-400 mb-2" />
                  <span className="text-sm font-semibold text-slate-600">Upload Image</span>
                </button>
              </div>
            )}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        )}

        {/* Link Input Section */}
        {evidenceType === 'link' && (
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Enter a link to your work:
            </label>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://..."
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <p className="text-xs text-slate-500 mt-2">
              Examples: Google Docs, Dropbox, OneDrive, etc.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 mt-6 pt-6 border-t border-slate-200">
          <button
            onClick={handleClose}
            className="py-2 px-6 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isValid}
            className="py-2 px-6 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            <Check size={18} className="mr-2" />
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default EvidenceSubmitModal;

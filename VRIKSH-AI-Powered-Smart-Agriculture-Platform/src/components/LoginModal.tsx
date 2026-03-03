import React, { useState } from 'react';
import { X } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (name: string, location: string) => void;
  language: 'en' | 'hi';
}

export default function LoginModal({ isOpen, onClose, onLogin, language }: LoginModalProps) {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && location.trim()) {
      onLogin(name.trim(), location.trim());
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={24} />
        </button>

        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🚜</div>
          <h2 className="text-2xl font-bold text-green-800">
            {language === 'en' ? 'Farmer Login' : 'किसान लॉगिन'}
          </h2>
          <p className="text-gray-600 mt-2">
            {language === 'en'
              ? 'Enter your details to access Vriksh dashboard'
              : 'वृक्ष डैशबोर्ड तक पहुंचने के लिए अपना विवरण दर्ज करें'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {language === 'en' ? 'Your Name' : 'आपका नाम'}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={language === 'en' ? 'Enter your name' : 'अपना नाम दर्ज करें'}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {language === 'en' ? 'Farm Location' : 'खेत का स्थान'}
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder={language === 'en' ? 'Enter your farm location' : 'अपने खेत का स्थान दर्ज करें'}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors"
          >
            {language === 'en' ? 'Enter Dashboard' : 'डैशबोर्ड में प्रवेश करें'}
          </button>
        </form>
      </div>
    </div>
  );
}
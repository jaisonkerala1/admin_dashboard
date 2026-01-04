import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { astrologersApi } from '@/api/astrologers';
import type { Astrologer } from '@/types';
import { Loader } from '@/components/common';

interface CreateBoostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: { astrologerId: string; durationDays: number; startDate?: string; categories: string[] }) => void;
  isProcessing?: boolean;
}

export const CreateBoostModal = ({
  isOpen,
  onClose,
  onCreate,
  isProcessing = false,
}: CreateBoostModalProps) => {
  const [astrologerSearch, setAstrologerSearch] = useState('');
  const [astrologers, setAstrologers] = useState<Astrologer[]>([]);
  const [selectedAstrologer, setSelectedAstrologer] = useState<Astrologer | null>(null);
  const [showAstrologerDropdown, setShowAstrologerDropdown] = useState(false);
  const [isLoadingAstrologers, setIsLoadingAstrologers] = useState(false);
  const [durationDays, setDurationDays] = useState<number>(7);
  const [startDate, setStartDate] = useState<string>('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const availableCategories = [
    { value: 'general', label: 'General' },
    { value: 'astrology', label: 'Astrology' },
    { value: 'tarot', label: 'Tarot' },
    { value: 'numerology', label: 'Numerology' },
    { value: 'palmistry', label: 'Palmistry' },
    { value: 'healing', label: 'Healing' },
    { value: 'meditation', label: 'Meditation' },
    { value: 'spiritual', label: 'Spiritual' },
  ];

  const dailyCost = 500;
  const totalCost = durationDays * dailyCost;

  useEffect(() => {
    if (isOpen && astrologerSearch.length >= 2) {
      const debounce = setTimeout(() => {
        loadAstrologers();
      }, 300);
      return () => clearTimeout(debounce);
    } else if (isOpen && astrologerSearch.length === 0) {
      loadAstrologers();
    }
  }, [astrologerSearch, isOpen]);

  const loadAstrologers = async () => {
    try {
      setIsLoadingAstrologers(true);
      const response = await astrologersApi.getAll({
        search: astrologerSearch,
        page: 1,
        limit: 20,
        sortBy: 'name',
        sortOrder: 'asc',
      });
      const data = (response.data || []).filter((a: Astrologer) => a.isActive && a.isApproved);
      setAstrologers(data);
    } catch (error) {
      console.error('Failed to load astrologers:', error);
    } finally {
      setIsLoadingAstrologers(false);
    }
  };

  const handleSelectAstrologer = (astrologer: Astrologer) => {
    setSelectedAstrologer(astrologer);
    setShowAstrologerDropdown(false);
    setAstrologerSearch(astrologer.name);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAstrologer) {
      return;
    }
    if (selectedCategories.length === 0) {
      alert('Please select at least one category');
      return;
    }
    onCreate({
      astrologerId: selectedAstrologer._id,
      durationDays,
      startDate: startDate || undefined,
      categories: selectedCategories,
    });
  };

  const toggleCategory = (categoryValue: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(categoryValue)) {
        return prev.filter((c) => c !== categoryValue);
      } else {
        return [...prev, categoryValue];
      }
    });
  };

  const handleClose = () => {
    setSelectedAstrologer(null);
    setAstrologerSearch('');
    setDurationDays(7);
    setStartDate('');
    setSelectedCategories([]);
    setShowAstrologerDropdown(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Create Boost Request</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isProcessing}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Astrologer Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Astrologer <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={astrologerSearch}
                onChange={(e) => {
                  setAstrologerSearch(e.target.value);
                  setShowAstrologerDropdown(true);
                  if (!e.target.value) {
                    setSelectedAstrologer(null);
                  }
                }}
                onFocus={() => setShowAstrologerDropdown(true)}
                placeholder="Search astrologer by name or email..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={isProcessing}
              />
              {showAstrologerDropdown && astrologerSearch.length >= 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {isLoadingAstrologers ? (
                    <div className="p-4 text-center">
                      <Loader />
                    </div>
                  ) : astrologers.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">No astrologers found</div>
                  ) : (
                    astrologers.map((astrologer) => (
                      <button
                        key={astrologer._id}
                        type="button"
                        onClick={() => handleSelectAstrologer(astrologer)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3"
                      >
                        {astrologer.profilePicture ? (
                          <img
                            src={astrologer.profilePicture}
                            alt={astrologer.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                            <span className="text-purple-600 font-semibold">
                              {astrologer.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{astrologer.name}</p>
                          <p className="text-sm text-gray-500">{astrologer.email}</p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
            {selectedAstrologer && (
              <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  Selected: <span className="font-semibold">{selectedAstrologer.name}</span>
                </p>
              </div>
            )}
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration (Days) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              max="30"
              value={durationDays}
              onChange={(e) => setDurationDays(parseInt(e.target.value) || 1)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
              disabled={isProcessing}
            />
            <p className="mt-1 text-xs text-gray-500">Minimum 1 day, maximum 30 days</p>
          </div>

          {/* Start Date (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date (Optional)
            </label>
            <input
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={isProcessing}
            />
            <p className="mt-1 text-xs text-gray-500">
              Leave empty to start immediately. Defaults to current time.
            </p>
          </div>

          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categories <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Select one or more categories to boost the profile in
            </p>
            <div className="flex flex-wrap gap-2">
              {availableCategories.map((category) => {
                const isSelected = selectedCategories.includes(category.value);
                return (
                  <button
                    key={category.value}
                    type="button"
                    onClick={() => toggleCategory(category.value)}
                    disabled={isProcessing}
                    className={`px-4 py-2 rounded transition-all ${
                      isSelected
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    } disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm`}
                  >
                    {category.label}
                  </button>
                );
              })}
            </div>
            {selectedCategories.length === 0 && (
              <p className="mt-2 text-xs text-red-500">
                Please select at least one category
              </p>
            )}
          </div>

          {/* Cost Preview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Daily Cost:</span>
              <span className="font-medium text-gray-900">₹{dailyCost}/day</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Total Cost:</span>
              <span className="text-lg font-bold text-purple-600">₹{totalCost.toFixed(0)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={isProcessing}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedAstrologer || isProcessing || selectedCategories.length === 0}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isProcessing ? 'Creating...' : 'Create Boost Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


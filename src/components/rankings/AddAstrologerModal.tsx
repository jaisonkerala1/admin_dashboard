import { useState, useEffect } from 'react';
import { Search, X, UserPlus, Loader2 } from 'lucide-react';
import { Modal, SearchBar, Avatar, Loader } from '@/components/common';
import { astrologersApi } from '@/api';
import { Astrologer } from '@/types';
import { useToastContext } from '@/contexts/ToastContext';

interface AddAstrologerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (astrologerIds: string[]) => void;
  existingAstrologerIds: Set<string>;
  category: string;
}

export const AddAstrologerModal = ({
  isOpen,
  onClose,
  onAdd,
  existingAstrologerIds,
  category,
}: AddAstrologerModalProps) => {
  const [search, setSearch] = useState('');
  const [astrologers, setAstrologers] = useState<Astrologer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const { success, error: toastError } = useToastContext();

  useEffect(() => {
    if (isOpen && search.length >= 2) {
      const debounce = setTimeout(() => {
        loadAstrologers();
      }, 300);
      return () => clearTimeout(debounce);
    } else if (isOpen && search.length === 0) {
      loadAstrologers();
    }
  }, [search, isOpen]);

  const loadAstrologers = async () => {
    try {
      setIsLoading(true);
      const response = await astrologersApi.getAll({
        search,
        sortBy: 'name',
        sortOrder: 'asc',
      });
      const data = response.data || [];
      // Filter out already added astrologers
      const filtered = data.filter(
        (a: Astrologer) => !existingAstrologerIds.has(a._id)
      );
      setAstrologers(filtered);
    } catch (err: any) {
      toastError(err.message || 'Failed to load astrologers');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleAdd = () => {
    if (selectedIds.size === 0) {
      toastError('Please select at least one astrologer');
      return;
    }
    onAdd(Array.from(selectedIds));
    setSelectedIds(new Set());
    setSearch('');
    onClose();
  };

  const handleClose = () => {
    setSelectedIds(new Set());
    setSearch('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Add Astrologers to ${category}`}
      size="lg"
    >
      <div className="p-6">
        {/* Search */}
        <div className="mb-4">
          <SearchBar
            placeholder="Search astrologers by name, email, or phone..."
            value={search}
            onSearch={setSearch}
            onClear={() => setSearch('')}
          />
        </div>

        {/* Selected Count */}
        {selectedIds.size > 0 && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-medium text-blue-900">
              {selectedIds.size} astrologer{selectedIds.size !== 1 ? 's' : ''} selected
            </p>
          </div>
        )}

        {/* Astrologers List */}
        <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
          {isLoading ? (
            <div className="py-12">
              <Loader text="Loading astrologers..." />
            </div>
          ) : astrologers.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <p className="text-sm">
                {search ? 'No astrologers found matching your search' : 'Start typing to search for astrologers'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {astrologers.map((astrologer) => {
                const isSelected = selectedIds.has(astrologer._id);
                return (
                  <button
                    key={astrologer._id}
                    onClick={() => handleToggleSelect(astrologer._id)}
                    className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left ${
                      isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSelect(astrologer._id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <Avatar
                      src={astrologer.profilePicture}
                      name={astrologer.name}
                      size="md"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{astrologer.name}</p>
                      <p className="text-sm text-gray-500 truncate">{astrologer.email}</p>
                      {astrologer.specialization && astrologer.specialization.length > 0 && (
                        <p className="text-xs text-gray-400 mt-1">
                          {astrologer.specialization.slice(0, 2).join(', ')}
                        </p>
                      )}
                    </div>
                    {isSelected && (
                      <UserPlus className="w-5 h-5 text-blue-600" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={selectedIds.size === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Add {selectedIds.size > 0 && `(${selectedIds.size})`}
          </button>
        </div>
      </div>
    </Modal>
  );
};


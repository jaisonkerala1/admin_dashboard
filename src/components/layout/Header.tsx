import { useState } from 'react';
import { Bell, Menu } from 'lucide-react';
import { Avatar, SearchBar } from '@/components/common';

interface HeaderProps {
  onMenuClick?: () => void;
}

export const Header = ({ onMenuClick }: HeaderProps) => {
  const [headerSearch, setHeaderSearch] = useState('');

  return (
    <header className="h-16 bg-gray-50 border-b border-gray-200 fixed top-0 right-0 left-0 lg:left-64 z-30">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors mr-2"
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>

        {/* Search */}
        <div className="flex-1 max-w-xl">
          <SearchBar
            value={headerSearch}
            onSearch={(q) => setHeaderSearch(q)}
            onClear={() => setHeaderSearch('')}
            placeholder="Search..."
            className="max-w-xl"
            debounceMs={0}
          />
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2 lg:gap-4 ml-2 lg:ml-0">
          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* Admin Profile */}
          <div className="hidden sm:flex items-center gap-3 pl-2 lg:pl-4 border-l border-gray-200">
            <div className="text-right hidden lg:block">
              <p className="text-sm font-medium text-gray-900">Admin</p>
              <p className="text-xs text-gray-500">Platform Manager</p>
            </div>
            <Avatar name="Admin" size="md" />
          </div>
        </div>
      </div>
    </header>
  );
};


import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Menu, LogOut, User, Settings, ChevronDown, Loader2 } from 'lucide-react';
import { Avatar, SearchBar } from '@/components/common';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { useToastContext } from '@/contexts/ToastContext';
import { cn } from '@/utils/helpers';
import { ROUTES } from '@/utils/constants';
import { useAuth } from '@/hooks/useAuth';
import {
  setSearchQuery,
  performSearchRequest,
  setShowDropdown,
  selectNextResult,
  selectPreviousResult,
  resetSelection,
  clearSearch,
  addRecentSearch,
} from '@/store/slices/searchSlice';
import { selectSelectedResult } from '@/store/selectors/searchSelectors';
import { GlobalSearchDropdown } from '@/components/search/GlobalSearchDropdown';

interface HeaderProps {
  onMenuClick?: () => void;
}

export const Header = ({ onMenuClick }: HeaderProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const { unreadCount } = useAppSelector((state) => state.notification);
  const { logout } = useAuth();
  const { error: showError, success: showSuccess } = useToastContext();
  
  const searchQuery = useAppSelector((state) => state.search.query);
  const selectedResult = useAppSelector(selectSelectedResult);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Global keyboard shortcut (Ctrl/Cmd + K)
  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.querySelector('input')?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle keyboard navigation for accessibility
  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Escape') {
      setIsProfileOpen(false);
      buttonRef.current?.focus();
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setIsProfileOpen(!isProfileOpen);
    }
  };

  const handleLogout = async () => {
    if (isLoggingOut) return; // Prevent multiple clicks
    
    setIsProfileOpen(false);
    setIsLoggingOut(true);
    
    try {
      await logout();
      showSuccess('Logged out successfully');
      navigate(ROUTES.LOGIN);
    } catch (error: any) {
      // Logout will still clear local state even if API fails
      showError(error.message || 'Failed to logout. Please try again.');
      // Still navigate to login even on error
      navigate(ROUTES.LOGIN);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="h-16 bg-gray-50 dark:bg-background border-b border-gray-200 dark:border-border fixed top-0 right-0 left-0 lg:left-64 z-30">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-muted transition-colors mr-2"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5 text-gray-600 dark:text-foreground" />
        </button>

        {/* Search */}
        <div className="flex-1 max-w-xl relative" ref={searchRef}>
          <SearchBar
            value={searchQuery}
            onSearch={(q) => {
              dispatch(setSearchQuery(q));
              if (q.trim().length >= 2) {
                dispatch(performSearchRequest({ query: q, limit: 5 }));
              }
            }}
            onClear={() => dispatch(clearSearch())}
            onKeyDown={(e) => {
              switch (e.key) {
                case 'Enter':
                  if (selectedResult) {
                    // Navigate to selected result
                    const routes: Record<string, string> = {
                      astrologer: `/astrologers/${selectedResult._id}`,
                      consultation: `/consultations/${selectedResult._id}`,
                      service: `/services/${selectedResult._id}`,
                      serviceRequest: `/service-requests/${selectedResult._id}`,
                    };
                    if (routes[selectedResult.type]) {
                      navigate(routes[selectedResult.type]);
                      dispatch(addRecentSearch(searchQuery));
                      dispatch(setShowDropdown(false));
                      dispatch(resetSelection());
                    }
                  } else if (searchQuery.trim()) {
                    // Navigate to full search page
                    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
                    dispatch(addRecentSearch(searchQuery));
                    dispatch(setShowDropdown(false));
                  }
                  break;
                  
                case 'ArrowDown':
                  e.preventDefault();
                  dispatch(selectNextResult());
                  break;
                  
                case 'ArrowUp':
                  e.preventDefault();
                  dispatch(selectPreviousResult());
                  break;
                  
                case 'Escape':
                  dispatch(setShowDropdown(false));
                  dispatch(resetSelection());
                  break;
              }
            }}
            placeholder="Search astrologers, consultations, services... (Ctrl+K)"
            className="max-w-xl"
            debounceMs={0}
          />
          <GlobalSearchDropdown />
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2 lg:gap-4 ml-2 lg:ml-0">
          {/* Notifications */}
          <Link 
            to={ROUTES.NOTIFICATIONS}
            className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-muted transition-colors"
            aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
          >
            <Bell className="w-5 h-5 text-gray-600 dark:text-foreground" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-gray-50 dark:ring-background" aria-label={`${unreadCount} unread notifications`}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>

          {/* Admin Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              ref={buttonRef}
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              onKeyDown={handleKeyDown}
              className={cn(
                "flex items-center gap-2 sm:gap-3 pl-2 lg:pl-4 border-l border-gray-200 dark:border-border hover:bg-gray-100/50 dark:hover:bg-muted/50 py-1.5 px-2 rounded-lg transition-colors focus:outline-none",
                isProfileOpen ? "" : "focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-background"
              )}
              aria-label="Admin profile menu"
              aria-expanded={isProfileOpen}
              aria-haspopup="true"
            >
              <div className="text-right hidden lg:block">
                <p className="text-sm font-semibold text-gray-900 dark:text-foreground leading-tight">Admin</p>
                <p className="text-[11px] text-gray-500 dark:text-muted-foreground font-medium">Platform Manager</p>
              </div>
              <Avatar name="Admin" size="sm" />
              <ChevronDown className={`w-4 h-4 text-gray-400 dark:text-muted-foreground transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
            </button>

            {/* Dropdown Menu */}
            {isProfileOpen && (
              <div 
                className="absolute right-0 mt-2 w-56 bg-white dark:bg-card rounded-xl shadow-xl border border-gray-100 dark:border-border py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="profile-menu-button"
              >
                <div className="px-4 py-3 border-b border-gray-50 dark:border-border mb-1 lg:hidden">
                  <p className="text-sm font-semibold text-gray-900 dark:text-foreground">Admin</p>
                  <p className="text-xs text-gray-500 dark:text-muted-foreground">Platform Manager</p>
                </div>

                <Link
                  to="/profile"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-foreground hover:bg-gray-50 dark:hover:bg-muted transition-colors focus:outline-none focus:bg-gray-50 dark:focus:bg-muted"
                  onClick={() => setIsProfileOpen(false)}
                  role="menuitem"
                  tabIndex={0}
                >
                  <User className="w-4 h-4 text-gray-400 dark:text-muted-foreground" aria-hidden="true" />
                  Profile Settings
                </Link>
                
                <Link
                  to={ROUTES.SETTINGS}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-foreground hover:bg-gray-50 dark:hover:bg-muted transition-colors focus:outline-none focus:bg-gray-50 dark:focus:bg-muted"
                  onClick={() => setIsProfileOpen(false)}
                  role="menuitem"
                  tabIndex={0}
                >
                  <Settings className="w-4 h-4 text-gray-400 dark:text-muted-foreground" aria-hidden="true" />
                  Settings
                </Link>

                <div className="h-px bg-gray-100 dark:bg-border my-1" role="separator" />

                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors focus:outline-none text-left",
                    isLoggingOut
                      ? "text-red-400 bg-red-50 cursor-not-allowed"
                      : "text-red-600 hover:bg-red-50 focus:bg-red-50"
                  )}
                  role="menuitem"
                  tabIndex={0}
                >
                  {isLoggingOut ? (
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <LogOut className="w-4 h-4" aria-hidden="true" />
                  )}
                  {isLoggingOut ? 'Logging out...' : 'Logout'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};


import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, User, FileText, Package, MapPin } from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { Card, Loader, EmptyState } from '@/components/common';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import {
  setSearchQuery,
  performSearchRequest,
  setActiveCategory,
  setCurrentPage,
  setEntriesPerPage,
} from '@/store/slices/searchSlice';
import {
  selectSearchQuery,
  selectSearchResults,
  selectIsSearching,
} from '@/store/selectors/searchSelectors';
import { RootState } from '@/store';
import { AstrologerSearchResult } from '@/components/search/results/AstrologerSearchResult';
import { ConsultationSearchResult } from '@/components/search/results/ConsultationSearchResult';
import { ServiceSearchResult } from '@/components/search/results/ServiceSearchResult';
import { ServiceRequestSearchResult } from '@/components/search/results/ServiceRequestSearchResult';

type Category = 'all' | 'astrologers' | 'consultations' | 'services' | 'serviceRequests';

export const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const query = searchParams.get('q') || '';
  const searchQuery = useAppSelector(selectSearchQuery);
  const results = useAppSelector(selectSearchResults);
  const isSearching = useAppSelector(selectIsSearching);
  const activeCategory = useAppSelector((state: RootState) => state.search.activeCategory);
  const currentPage = useAppSelector((state: RootState) => state.search.currentPage);
  const entriesPerPage = useAppSelector((state: RootState) => state.search.entriesPerPage);

  useEffect(() => {
    if (query) {
      dispatch(setSearchQuery(query));
      dispatch(performSearchRequest({ query, limit: 20 }));
    }
  }, [query, dispatch]);

  const categories: { key: Category; label: string; icon: any; count: number }[] = [
    {
      key: 'all',
      label: 'All',
      icon: Search,
      count: results
        ? results.astrologers.length +
          results.consultations.length +
          results.services.length +
          results.serviceRequests.length
        : 0,
    },
    {
      key: 'astrologers',
      label: 'Astrologers',
      icon: User,
      count: results?.astrologers.length || 0,
    },
    {
      key: 'consultations',
      label: 'Consultations',
      icon: FileText,
      count: results?.consultations.length || 0,
    },
    {
      key: 'services',
      label: 'Services',
      icon: Package,
      count: results?.services.length || 0,
    },
    {
      key: 'serviceRequests',
      label: 'Service Requests',
      icon: MapPin,
      count: results?.serviceRequests.length || 0,
    },
  ];

  const handleCategoryChange = (category: Category) => {
    dispatch(setActiveCategory(category));
    dispatch(setCurrentPage(1));
  };

  const getFilteredResults = () => {
    if (!results) return null;

    switch (activeCategory) {
      case 'astrologers':
        return { ...results, consultations: [], services: [], serviceRequests: [] };
      case 'consultations':
        return { ...results, astrologers: [], services: [], serviceRequests: [] };
      case 'services':
        return { ...results, astrologers: [], consultations: [], serviceRequests: [] };
      case 'serviceRequests':
        return { ...results, astrologers: [], consultations: [], services: [] };
      default:
        return results;
    }
  };

  const filteredResults = getFilteredResults();
  const totalResults = filteredResults
    ? filteredResults.astrologers.length +
      filteredResults.consultations.length +
      filteredResults.services.length +
      filteredResults.serviceRequests.length
    : 0;

  const handleResultClick = (result: any) => {
    const routes: Record<string, string> = {
      astrologer: `/astrologers/${result._id}`,
      consultation: `/consultations/${result._id}`,
      service: `/services/${result._id}`,
      serviceRequest: `/service-requests/${result._id}`,
    };

    if (routes[result.type]) {
      navigate(routes[result.type]);
    }
  };

  return (
    <MainLayout>
      <div className="mb-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Search Results
            {query && <span className="text-gray-500 font-normal"> for "{query}"</span>}
          </h1>
          {totalResults > 0 && (
            <p className="text-gray-500 mt-1">{totalResults} result{totalResults !== 1 ? 's' : ''} found</p>
          )}
        </div>

        {/* Category Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <div className="flex gap-8 overflow-x-auto">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.key}
                  onClick={() => handleCategoryChange(category.key)}
                  className={`pb-4 px-2 border-b-2 transition-colors whitespace-nowrap ${
                    activeCategory === category.key
                      ? 'border-primary-500 text-primary-600 font-semibold'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    {category.label}
                    <span className="text-sm font-normal">({category.count})</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Results */}
        <Card>
          {isSearching ? (
            <div className="py-12">
              <Loader size="lg" text="Searching..." />
            </div>
          ) : !query ? (
            <EmptyState
              icon={Search}
              title="Enter a search query"
              description="Use the search bar in the header to search for astrologers, consultations, services, or service requests"
            />
          ) : totalResults === 0 ? (
            <EmptyState
              icon={Search}
              title="No results found"
              description={`No results found for "${query}". Try different keywords or check spelling.`}
            />
          ) : (
            <div className="space-y-6">
              {/* Astrologers */}
              {filteredResults && filteredResults.astrologers.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Astrologers ({filteredResults.astrologers.length})
                  </h2>
                  <div className="space-y-2">
                    {filteredResults.astrologers.map((astrologer) => (
                      <AstrologerSearchResult
                        key={astrologer._id}
                        astrologer={astrologer}
                        isSelected={false}
                        onClick={() => handleResultClick({ ...astrologer, type: 'astrologer' })}
                        query={query}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Consultations */}
              {filteredResults && filteredResults.consultations.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Consultations ({filteredResults.consultations.length})
                  </h2>
                  <div className="space-y-2">
                    {filteredResults.consultations.map((consultation) => (
                      <ConsultationSearchResult
                        key={consultation._id}
                        consultation={consultation}
                        isSelected={false}
                        onClick={() => handleResultClick({ ...consultation, type: 'consultation' })}
                        query={query}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Services */}
              {filteredResults && filteredResults.services.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Services ({filteredResults.services.length})
                  </h2>
                  <div className="space-y-2">
                    {filteredResults.services.map((service) => (
                      <ServiceSearchResult
                        key={service._id}
                        service={service}
                        isSelected={false}
                        onClick={() => handleResultClick({ ...service, type: 'service' })}
                        query={query}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Service Requests */}
              {filteredResults && filteredResults.serviceRequests.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Service Requests ({filteredResults.serviceRequests.length})
                  </h2>
                  <div className="space-y-2">
                    {filteredResults.serviceRequests.map((request) => (
                      <ServiceRequestSearchResult
                        key={request._id}
                        request={request}
                        isSelected={false}
                        onClick={() => handleResultClick({ ...request, type: 'serviceRequest' })}
                        query={query}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </MainLayout>
  );
};


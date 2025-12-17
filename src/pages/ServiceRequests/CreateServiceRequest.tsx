import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Save,
  Search,
  Calendar,
  Clock,
  DollarSign,
  User,
  Package
} from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, Loader, Avatar } from '@/components/common';
import { poojaRequestsApi, astrologersApi, servicesApi } from '@/api';
import { Astrologer, Service } from '@/types';
import { useToastContext } from '@/contexts/ToastContext';
import { ROUTES } from '@/utils/constants';

export const CreateServiceRequest = () => {
  const navigate = useNavigate();
  const toast = useToastContext();
  
  // Form state
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedAstrologer, setSelectedAstrologer] = useState<Astrologer | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [requestedDate, setRequestedDate] = useState('');
  const [requestedTime, setRequestedTime] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState<'INR' | 'USD' | 'EUR'>('INR');
  const [specialInstructions, setSpecialInstructions] = useState('');
  
  // Search & data
  const [astrologers, setAstrologers] = useState<Astrologer[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [astrologerSearch, setAstrologerSearch] = useState('');
  const [serviceSearch, setServiceSearch] = useState('');
  const [isLoadingAstrologers, setIsLoadingAstrologers] = useState(false);
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load astrologers
  useEffect(() => {
    const debounce = setTimeout(() => {
      loadAstrologers();
    }, 300);
    return () => clearTimeout(debounce);
  }, [astrologerSearch]);

  // Load services when astrologer is selected
  useEffect(() => {
    if (selectedAstrologer) {
      loadServices();
    }
  }, [selectedAstrologer, serviceSearch]);

  const loadAstrologers = async () => {
    try {
      setIsLoadingAstrologers(true);
      const response = await astrologersApi.getAll({ 
        page: 1, 
        limit: 50,
        search: astrologerSearch,
        sortBy: 'name',
        sortOrder: 'asc'
      });
      const data: Astrologer[] = response.data || [];
      // Filter only active astrologers
      setAstrologers(data.filter((a: Astrologer) => a.isActive && a.isApproved));
    } catch (err) {
      console.error('Failed to load astrologers:', err);
    } finally {
      setIsLoadingAstrologers(false);
    }
  };

  const loadServices = async () => {
    try {
      setIsLoadingServices(true);
      const response = await servicesApi.getAll({ 
        page: 1, 
        limit: 100,
        astrologerId: selectedAstrologer?._id,
        search: serviceSearch,
        sortBy: 'name',
        sortOrder: 'asc'
      } as any);
      const data = response.data || [];
      setServices(data.filter((s: Service) => s.isActive && !s.isDeleted));
    } catch (err) {
      console.error('Failed to load services:', err);
    } finally {
      setIsLoadingServices(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!customerName.trim()) {
      toast.error('Customer name is required');
      return;
    }
    if (!customerPhone.trim()) {
      toast.error('Customer phone is required');
      return;
    }
    if (!selectedAstrologer) {
      toast.error('Please select an astrologer');
      return;
    }
    if (!requestedDate) {
      toast.error('Requested date is required');
      return;
    }
    if (!requestedTime) {
      toast.error('Requested time is required');
      return;
    }
    if (!price || parseFloat(price) <= 0) {
      toast.error('Valid price is required');
      return;
    }

    try {
      setIsSubmitting(true);
      const data = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        astrologerId: selectedAstrologer._id,
        serviceId: selectedService?._id || null,
        serviceName: selectedService?.name || 'Custom Service',
        serviceCategory: selectedService?.category || 'other',
        requestedDate,
        requestedTime,
        price: parseFloat(price),
        currency,
        specialInstructions: specialInstructions.trim() || undefined,
        source: 'admin',
        isManual: true,
        status: 'pending',
        paymentStatus: 'pending'
      };

      const response = await poojaRequestsApi.create(data);
      toast.success('Service request created successfully!');
      if (response.data?._id) {
        navigate(`${ROUTES.SERVICE_REQUESTS}/${response.data._id}`);
      } else {
        navigate(ROUTES.SERVICE_REQUESTS);
      }
    } catch (err: any) {
      console.error('Failed to create service request:', err);
      toast.error(err?.message || 'Failed to create service request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <PageHeader
        title="Create Service Request"
        subtitle="Manually create a service request for a client"
        action={
          <button
            onClick={() => navigate(ROUTES.SERVICE_REQUESTS)}
            className="btn btn-secondary"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Service Requests
          </button>
        }
      />

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <Card>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-primary-600" />
                Customer Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter customer name"
                    className="input w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+91 1234567890"
                    className="input w-full"
                    required
                  />
                </div>
              </div>
            </Card>

            {/* Select Astrologer */}
            <Card>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Search className="w-5 h-5 text-primary-600" />
                Select Astrologer *
              </h3>
              <div className="mb-4">
                <input
                  type="text"
                  value={astrologerSearch}
                  onChange={(e) => setAstrologerSearch(e.target.value)}
                  placeholder="Search astrologers..."
                  className="input w-full"
                />
              </div>
              {isLoadingAstrologers ? (
                <div className="py-8">
                  <Loader text="Loading astrologers..." />
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {astrologers.map((astrologer) => (
                    <button
                      key={astrologer._id}
                      type="button"
                      onClick={() => setSelectedAstrologer(astrologer)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                        selectedAstrologer?._id === astrologer._id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="relative">
                        <Avatar src={astrologer.profilePicture} name={astrologer.name} size="md" />
                        {astrologer.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium text-gray-900">{astrologer.name}</p>
                        <p className="text-sm text-gray-600">
                          {astrologer.specialization?.slice(0, 2).join(', ') || 'Astrologer'}
                        </p>
                      </div>
                      {astrologer.isOnline && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Online</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </Card>

            {/* Select Service (Optional) */}
            {selectedAstrologer && (
              <Card>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary-600" />
                  Select Service (Optional)
                </h3>
                <div className="mb-4">
                  <input
                    type="text"
                    value={serviceSearch}
                    onChange={(e) => setServiceSearch(e.target.value)}
                    placeholder="Search services..."
                    className="input w-full"
                  />
                </div>
                {isLoadingServices ? (
                  <div className="py-8">
                    <Loader text="Loading services..." />
                  </div>
                ) : services.length > 0 ? (
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    <button
                      type="button"
                      onClick={() => setSelectedService(null)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                        !selectedService
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                      }`}
                    >
                      <Package className="w-8 h-8 text-gray-400" />
                      <div className="flex-1 text-left">
                        <p className="font-medium text-gray-900">Custom Service</p>
                        <p className="text-sm text-gray-600">Enter details manually</p>
                      </div>
                    </button>
                    {services.map((service) => (
                      <button
                        key={service._id}
                        type="button"
                        onClick={() => {
                          setSelectedService(service);
                          setPrice(service.price.toString());
                        }}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                          selectedService?._id === service._id
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                        }`}
                      >
                        <Package className="w-8 h-8 text-primary-400" />
                        <div className="flex-1 text-left">
                          <p className="font-medium text-gray-900">{service.name}</p>
                          <p className="text-sm text-gray-600">₹{service.price} • {service.duration} min</p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-8 text-gray-500">
                    No services found for this astrologer. You can still create a custom service request.
                  </p>
                )}
              </Card>
            )}

            {/* Schedule & Payment */}
            <Card>
              <h3 className="text-lg font-semibold mb-4">Schedule & Payment</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Requested Date *
                  </label>
                  <input
                    type="date"
                    value={requestedDate}
                    onChange={(e) => setRequestedDate(e.target.value)}
                    className="input w-full"
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Requested Time *
                  </label>
                  <input
                    type="time"
                    value={requestedTime}
                    onChange={(e) => setRequestedTime(e.target.value)}
                    className="input w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Price *
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Enter price"
                    className="input w-full"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as any)}
                    className="input w-full"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>
              </div>
            </Card>

            {/* Special Instructions */}
            <Card>
              <h3 className="text-lg font-semibold mb-4">Special Instructions (Optional)</h3>
              <textarea
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="Add any special instructions or notes..."
                className="input w-full"
                rows={4}
              />
            </Card>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <h3 className="text-lg font-semibold mb-4">Request Summary</h3>
              
              <div className="space-y-4">
                {/* Customer */}
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2">Customer</p>
                  {customerName ? (
                    <div>
                      <p className="font-medium text-gray-900">{customerName}</p>
                      <p className="text-sm text-gray-600">{customerPhone || 'No phone'}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">Not specified</p>
                  )}
                </div>

                {/* Astrologer */}
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs font-medium text-gray-500 mb-2">Astrologer</p>
                  {selectedAstrologer ? (
                    <div className="flex items-center gap-2">
                      <Avatar src={selectedAstrologer.profilePicture} name={selectedAstrologer.name} size="sm" />
                      <div>
                        <p className="font-medium text-gray-900">{selectedAstrologer.name}</p>
                        {selectedAstrologer.isOnline && (
                          <span className="text-xs text-green-600">● Online</span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">Not selected</p>
                  )}
                </div>

                {/* Service */}
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs font-medium text-gray-500 mb-2">Service</p>
                  {selectedService ? (
                    <div>
                      <p className="font-medium text-gray-900">{selectedService.name}</p>
                      <p className="text-sm text-gray-600">{selectedService.category}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">Custom service</p>
                  )}
                </div>

                {/* Schedule */}
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs font-medium text-gray-500 mb-2">Schedule</p>
                  {requestedDate ? (
                    <div>
                      <p className="font-medium text-gray-900">{new Date(requestedDate).toLocaleDateString()}</p>
                      <p className="text-sm text-gray-600">{requestedTime || 'No time set'}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">Not specified</p>
                  )}
                </div>

                {/* Price */}
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs font-medium text-gray-500 mb-2">Total Price</p>
                  {price ? (
                    <p className="font-bold text-2xl text-gray-900">
                      {currency === 'INR' && '₹'}
                      {currency === 'USD' && '$'}
                      {currency === 'EUR' && '€'}
                      {parseFloat(price).toFixed(2)}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500 italic">Not specified</p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !customerName || !customerPhone || !selectedAstrologer || !requestedDate || !requestedTime || !price}
                className="w-full btn btn-primary mt-6"
              >
                {isSubmitting ? (
                  'Creating...'
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Create Service Request
                  </>
                )}
              </button>
            </Card>
          </div>
        </div>
      </form>
    </MainLayout>
  );
};


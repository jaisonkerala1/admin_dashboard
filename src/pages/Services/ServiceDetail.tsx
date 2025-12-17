import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Package,
  DollarSign,
  Clock,
  Star,
  TrendingUp,
  Calendar,
  CheckCircle,
  XCircle,
  Trash2,
  AlertCircle,
  User,
  Tag
} from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, Loader, Avatar, Modal } from '@/components/common';
import { servicesApi, astrologersApi } from '@/api';
import { Service, Astrologer } from '@/types';
import { formatCurrency, formatNumber, formatDateTime } from '@/utils/formatters';
import { useToastContext } from '@/contexts/ToastContext';
import { ROUTES } from '@/utils/constants';

const categoryLabels: Record<string, string> = {
  reiki_healing: 'Reiki Healing',
  tarot_reading: 'Tarot Reading',
  numerology: 'Numerology',
  vastu_consultation: 'Vastu Consultation',
  kundli_matching: 'Kundli Matching',
  gemstone_consultation: 'Gemstone Consultation',
  horoscope_analysis: 'Horoscope Analysis',
  palm_reading: 'Palm Reading',
  face_reading: 'Face Reading',
  other: 'Other'
};

export const ServiceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToastContext();
  const [service, setService] = useState<Service | null>(null);
  const [astrologer, setAstrologer] = useState<Astrologer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      loadService();
    }
  }, [id]);

  const loadService = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const response = await servicesApi.getById(id);
      const serviceData = response.data;
      setService(serviceData);

      // Load associated astrologer
      if (serviceData?.astrologerId) {
        const astroId = typeof serviceData.astrologerId === 'string' 
          ? serviceData.astrologerId 
          : (serviceData.astrologerId as any)?._id;
        
        if (astroId) {
          const astroResponse = await astrologersApi.getById(astroId);
          setAstrologer(astroResponse.data);
        }
      }
    } catch (err) {
      console.error('Failed to load service:', err);
      toast.error('Failed to load service details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!id || !service) return;
    try {
      setIsApproving(true);
      await servicesApi.approve(id);
      await loadService();
      toast.success('Service approved successfully!');
    } catch (err: any) {
      console.error('Failed to approve:', err);
      toast.error(err?.message || 'Failed to approve service');
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!id || !service) return;
    try {
      setIsRejecting(true);
      await servicesApi.reject(id);
      await loadService();
      toast.success('Service rejected successfully!');
    } catch (err: any) {
      console.error('Failed to reject:', err);
      toast.error(err?.message || 'Failed to reject service');
    } finally {
      setIsRejecting(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !service) return;
    try {
      setIsDeleting(true);
      await servicesApi.delete(id);
      toast.success('Service deleted successfully!');
      navigate(ROUTES.SERVICES);
    } catch (err: any) {
      console.error('Failed to delete:', err);
      toast.error(err?.message || 'Failed to delete service');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const getServiceStatus = (service: Service) => {
    if (service.isDeleted) return 'deleted';
    if (!service.isActive) return 'inactive';
    return 'active';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'inactive': return 'bg-gray-100 text-gray-700';
      case 'deleted': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader size="lg" text="Loading service details..." />
        </div>
      </MainLayout>
    );
  }

  if (!service) {
    return (
      <MainLayout>
        <Card>
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Service Not Found</h3>
            <p className="text-gray-600 mb-6">The service you're looking for doesn't exist.</p>
            <button
              onClick={() => navigate(ROUTES.SERVICES)}
              className="btn btn-primary"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Services
            </button>
          </div>
        </Card>
      </MainLayout>
    );
  }

  const status = getServiceStatus(service);

  return (
    <MainLayout>
      <PageHeader
        title={service.name}
        subtitle={`Service ID: ${service._id}`}
        action={
          <button
            onClick={() => navigate(ROUTES.SERVICES)}
            className="btn btn-secondary"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Services
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Service Info Card */}
        <Card className="lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            <div className="p-6 bg-primary-50 rounded-full">
              <Package className="w-16 h-16 text-primary-600" />
            </div>
            <h2 className="mt-4 text-xl font-bold text-gray-900">{service.name}</h2>
            <div className={`mt-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </div>
            
            <div className="w-full mt-6 space-y-3 border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Price</span>
                <span className="font-semibold text-gray-900">{formatCurrency(service.price)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Duration</span>
                <span className="font-semibold text-gray-900">{service.duration} min</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Category</span>
                <span className="font-semibold text-gray-900">
                  {categoryLabels[service.category] || service.category}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Total Bookings</span>
                <span className="font-semibold text-gray-900">{formatNumber(service.totalBookings || 0)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Completed</span>
                <span className="font-semibold text-gray-900">{formatNumber(service.completedBookings || 0)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Avg Rating</span>
                <span className="font-semibold text-gray-900">
                  {(service.averageRating || 0).toFixed(1)} ⭐
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Total Ratings</span>
                <span className="font-semibold text-gray-900">{formatNumber(service.totalRatings || 0)}</span>
              </div>
            </div>

            {/* Admin Actions */}
            <div className="w-full mt-6 space-y-2">
              {!service.isActive && !service.isDeleted && (
                <button
                  onClick={handleApprove}
                  disabled={isApproving}
                  className="w-full btn btn-primary"
                >
                  {isApproving ? (
                    'Approving...'
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve Service
                    </>
                  )}
                </button>
              )}
              {service.isActive && !service.isDeleted && (
                <button
                  onClick={handleReject}
                  disabled={isRejecting}
                  className="w-full btn btn-secondary"
                >
                  {isRejecting ? (
                    'Deactivating...'
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 mr-2" />
                      Deactivate Service
                    </>
                  )}
                </button>
              )}
              {!service.isDeleted && (
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="w-full btn bg-red-50 text-red-700 hover:bg-red-100"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Service
                </button>
              )}
            </div>
          </div>
        </Card>

        {/* Details Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Service Description */}
          <Card>
            <h3 className="text-lg font-semibold mb-4">Service Description</h3>
            <p className="text-gray-700 whitespace-pre-wrap">
              {service.description || 'No description provided.'}
            </p>
          </Card>

          {/* Astrologer Info */}
          {astrologer && (
            <Card>
              <h3 className="text-lg font-semibold mb-4">Service Provider</h3>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar src={astrologer.profilePicture} name={astrologer.name} size="lg" />
                  {astrologer.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-900">{astrologer.name}</h4>
                    {astrologer.isOnline && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                        Online
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{astrologer.email}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {astrologer.experience} years experience • {(astrologer.rating || 0).toFixed(1)} ⭐ ({formatNumber(astrologer.totalReviews || 0)} reviews)
                  </p>
                </div>
                <button
                  onClick={() => navigate(`${ROUTES.ASTROLOGERS}/${astrologer._id}`)}
                  className="btn btn-secondary"
                >
                  View Profile
                </button>
              </div>
            </Card>
          )}

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="!p-4 border-l-4 border-l-blue-500">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(service.totalBookings || 0)}</p>
                  <p className="text-xs text-gray-600">Total Bookings</p>
                </div>
              </div>
            </Card>
            
            <Card className="!p-4 border-l-4 border-l-green-500">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(service.completedBookings || 0)}</p>
                  <p className="text-xs text-gray-600">Completed</p>
                </div>
              </div>
            </Card>
            
            <Card className="!p-4 border-l-4 border-l-yellow-500">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{(service.averageRating || 0).toFixed(1)}</p>
                  <p className="text-xs text-gray-600">Avg Rating</p>
                </div>
              </div>
            </Card>
            
            <Card className="!p-4 border-l-4 border-l-purple-500">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency((service.price || 0) * (service.totalBookings || 0))}
                  </p>
                  <p className="text-xs text-gray-600">Total Revenue</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Additional Info */}
          <Card>
            <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Created</p>
                <p className="text-sm font-medium text-gray-900">{formatDateTime(service.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Last Updated</p>
                <p className="text-sm font-medium text-gray-900">{formatDateTime(service.updatedAt)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Currency</p>
                <p className="text-sm font-medium text-gray-900">{service.currency || 'INR'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Service ID</p>
                <p className="text-sm font-medium text-gray-900 font-mono">{service._id}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <Modal onClose={() => setShowDeleteModal(false)} title="Delete Service">
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-medium text-red-900">Are you sure?</p>
                <p className="text-sm text-red-700 mt-1">
                  This will permanently delete "{service.name}". This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="btn bg-red-600 text-white hover:bg-red-700"
              >
                {isDeleting ? 'Deleting...' : 'Delete Service'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </MainLayout>
  );
};


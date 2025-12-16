import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Mail, Phone, Star, Calendar, DollarSign, Clock, CheckCircle, Ban, Package, MessageSquare, FileText, ThumbsUp } from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, Loader, Avatar, StatusBadge, Modal } from '@/components/common';
import { astrologersApi, servicesApi, reviewsApi, discussionsApi } from '@/api';
import { Astrologer, Service, Review, Discussion } from '@/types';
import { formatCurrency, formatNumber, formatDateTime } from '@/utils/formatters';
import { useToastContext } from '@/contexts/ToastContext';

export const AstrologerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const toast = useToastContext();
  const [astrologer, setAstrologer] = useState<Astrologer | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [discussionsLoading, setDiscussionsLoading] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isSuspending, setIsSuspending] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [suspensionReason, setSuspensionReason] = useState('');

  useEffect(() => {
    if (id) {
      loadAstrologer();
      loadServices();
      loadReviews();
      loadDiscussions();
    }
  }, [id]);

  const loadAstrologer = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const response = await astrologersApi.getById(id);
      const data = response.data;
      
      if (!data) {
        setAstrologer(null);
        return;
      }
      
      // Backend now returns properly formatted data with:
      // - specialization, rating, totalReviews, consultationCharge already mapped
      const mappedAstrologer: Astrologer = {
        ...data,
        specialization: data.specialization || (data as any).specializations || [],
        languages: data.languages || [],
        rating: data.rating ?? 0,
        totalReviews: data.totalReviews ?? 0,
        consultationCharge: data.consultationCharge || (data as any).ratePerMinute || 0,
        callCharge: data.callCharge || (data as any).ratePerMinute || 0,
        chatCharge: data.chatCharge || (data as any).ratePerMinute || 0,
        totalEarnings: data.totalEarnings || 0,
        totalConsultations: data.totalConsultations || 0,
        isApproved: data.isApproved ?? false,
        isSuspended: data.isSuspended ?? false,
        bio: data.bio || '',
      };
      
      setAstrologer(mappedAstrologer);
    } catch (err) {
      console.error('Failed to load astrologer:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadServices = async () => {
    if (!id) return;
    try {
      setServicesLoading(true);
      const response = await servicesApi.getAll({ 
        page: 1,
        limit: 100,
        astrologerId: id
      } as any);
      setServices(response.data || []);
    } catch (err) {
      console.error('Failed to load services:', err);
    } finally {
      setServicesLoading(false);
    }
  };

  const loadReviews = async () => {
    if (!id) return;
    try {
      setReviewsLoading(true);
      const response = await reviewsApi.getAll({ 
        page: 1,
        limit: 10, // Show latest 10 reviews
        astrologerId: id,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      } as any);
      setReviews(response.data || []);
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setReviewsLoading(false);
    }
  };

  const loadDiscussions = async () => {
    if (!id) return;
    try {
      setDiscussionsLoading(true);
      const response = await discussionsApi.getAll({ 
        page: 1,
        limit: 10, // Show latest 10 discussions
        authorId: id,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      } as any);
      setDiscussions(response.data || []);
    } catch (err) {
      console.error('Failed to load discussions:', err);
    } finally {
      setDiscussionsLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!id || !astrologer) return;
    try {
      setIsApproving(true);
      await astrologersApi.approve(id, { approvedBy: 'Admin' });
      await loadAstrologer();
      toast.success(`${astrologer.name} has been approved successfully!`);
    } catch (err: any) {
      console.error('Failed to approve:', err);
      toast.error(err?.message || 'Failed to approve astrologer');
    } finally {
      setIsApproving(false);
    }
  };

  const handleSuspend = async () => {
    if (!id || !suspensionReason.trim()) return;
    try {
      setIsSuspending(true);
      await astrologersApi.suspend(id, { reason: suspensionReason });
      setShowSuspendModal(false);
      setSuspensionReason('');
      await loadAstrologer();
      toast.warning('Astrologer has been suspended');
    } catch (err: any) {
      console.error('Failed to suspend:', err);
      toast.error(err?.message || 'Failed to suspend astrologer');
    } finally {
      setIsSuspending(false);
    }
  };

  const handleUnsuspend = async () => {
    if (!id) return;
    try {
      await astrologersApi.unsuspend(id);
      await loadAstrologer();
      toast.success('Astrologer has been unsuspended');
    } catch (err: any) {
      console.error('Failed to unsuspend:', err);
      toast.error(err?.message || 'Failed to unsuspend astrologer');
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-20">
          <Loader size="lg" text="Loading astrologer details..." />
        </div>
      </MainLayout>
    );
  }

  if (!astrologer) {
    return (
      <MainLayout>
        <div className="text-center py-20">
          <p className="text-gray-500">Astrologer not found</p>
        </div>
      </MainLayout>
    );
  }

  const getStatus = () => {
    if (astrologer.isSuspended) return 'suspended';
    if (astrologer.isApproved) return 'approved';
    return 'pending';
  };

  const getServiceStatus = (service: Service) => {
    if (service.isDeleted) return 'rejected';
    if (service.isActive) return 'approved';
    return 'pending';
  };

  return (
    <MainLayout>
      <PageHeader
        title={astrologer.name}
        subtitle="Astrologer Details"
        backButton
        action={
          <div className="flex gap-2">
            {!astrologer.isApproved && !astrologer.isSuspended && (
              <button
                onClick={handleApprove}
                disabled={isApproving}
                className="btn btn-primary btn-md flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                {isApproving ? 'Approving...' : 'Approve'}
              </button>
            )}
            {astrologer.isSuspended ? (
              <button
                onClick={handleUnsuspend}
                className="btn btn-secondary btn-md flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Unsuspend
              </button>
            ) : (
              <button
                onClick={() => setShowSuspendModal(true)}
                className="btn btn-danger btn-md flex items-center gap-2"
              >
                <Ban className="w-4 h-4" />
                Suspend
              </button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            <Avatar src={astrologer.profilePicture} name={astrologer.name} size="xl" />
            <h2 className="mt-4 text-xl font-bold text-gray-900">{astrologer.name}</h2>
            <StatusBadge status={getStatus()} className="mt-2" />
            
            <div className="w-full mt-6 space-y-3 border-t border-gray-200 pt-6">
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="w-4 h-4" />
                <span className="text-sm">{astrologer.email}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="w-4 h-4" />
                <span className="text-sm">{astrologer.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Joined {formatDateTime(astrologer.createdAt)}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <div className="flex items-center gap-3">
                <Star className="w-8 h-8 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold">{(astrologer.rating || 0).toFixed(1)}</p>
                  <p className="text-xs text-gray-500">Rating</p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-3">
                <Calendar className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{formatNumber(astrologer.totalConsultations || 0)}</p>
                  <p className="text-xs text-gray-500">Consultations</p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-3">
                <DollarSign className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{formatCurrency(astrologer.totalEarnings || 0)}</p>
                  <p className="text-xs text-gray-500">Earnings</p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">{astrologer.experience || 0}</p>
                  <p className="text-xs text-gray-500">Years Exp</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Bio */}
          {astrologer.bio && (
            <Card title="About">
              <p className="text-gray-600">{astrologer.bio}</p>
            </Card>
          )}

          {/* Specializations */}
          <Card title="Specializations">
            <div className="flex flex-wrap gap-2">
              {(astrologer.specialization || []).length > 0 ? (
                (astrologer.specialization || []).map((spec, i) => (
                  <span key={i} className="badge bg-primary-100 text-primary-700">{spec}</span>
                ))
              ) : (
                <span className="text-gray-500 text-sm">No specializations listed</span>
              )}
            </div>
          </Card>

          {/* Languages */}
          <Card title="Languages">
            <div className="flex flex-wrap gap-2">
              {(astrologer.languages || []).length > 0 ? (
                (astrologer.languages || []).map((lang, i) => (
                  <span key={i} className="badge bg-gray-100 text-gray-700">{lang}</span>
                ))
              ) : (
                <span className="text-gray-500 text-sm">No languages listed</span>
              )}
            </div>
          </Card>

          {/* Charges */}
          <Card title="Service Charges">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Rate per Min</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(astrologer.consultationCharge || 0)}</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Call</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(astrologer.callCharge || 0)}/min</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Chat</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(astrologer.chatCharge || 0)}/min</p>
              </div>
            </div>
          </Card>

          {/* Services */}
          <Card 
            title={
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                <span>Services Offered</span>
                <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-medium rounded-full">
                  {services.length}
                </span>
              </div>
            }
          >
            {servicesLoading ? (
              <div className="flex justify-center py-8">
                <Loader size="sm" text="Loading services..." />
              </div>
            ) : services.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((service) => (
                  <div
                    key={service._id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50/30 transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{service.name}</h4>
                      <StatusBadge status={getServiceStatus(service)} />
                    </div>
                    {service.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {service.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-600">
                          <span className="font-medium text-gray-900">
                            {formatCurrency(service.price)}
                          </span>
                        </span>
                        {service.duration && (
                          <span className="text-gray-500">
                            {service.duration} mins
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {service.category}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No services offered yet</p>
              </div>
            )}
          </Card>

          {/* Reviews */}
          <Card 
            title={
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                <span>Recent Reviews</span>
                <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                  {reviews.length}
                </span>
              </div>
            }
          >
            {reviewsLoading ? (
              <div className="flex justify-center py-8">
                <Loader size="sm" text="Loading reviews..." />
              </div>
            ) : reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div
                    key={review._id}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <Avatar
                        src={review.clientAvatar}
                        name={review.clientName || 'Anonymous'}
                        size="md"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium text-gray-900">
                              {review.clientName || 'Anonymous'}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < review.rating
                                        ? 'text-yellow-400 fill-yellow-400'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-500">
                                {formatDateTime(review.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                        {review.reviewText && (
                          <p className="text-gray-700 text-sm mt-2">{review.reviewText}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No reviews yet</p>
              </div>
            )}
          </Card>

          {/* Discussions/Posts */}
          <Card 
            title={
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                <span>Recent Posts & Discussions</span>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                  {discussions.length}
                </span>
              </div>
            }
          >
            {discussionsLoading ? (
              <div className="flex justify-center py-8">
                <Loader size="sm" text="Loading discussions..." />
              </div>
            ) : discussions.length > 0 ? (
              <div className="space-y-4">
                {discussions.map((discussion) => (
                  <div
                    key={discussion._id}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{discussion.title}</h4>
                      {discussion.isPinned && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                          Pinned
                        </span>
                      )}
                    </div>
                    {discussion.content && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {discussion.content}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="w-4 h-4" />
                        <span>{formatNumber(discussion.likes || 0)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        <span>{formatNumber(discussion.commentCount || 0)}</span>
                      </div>
                      <span>{formatDateTime(discussion.createdAt)}</span>
                      {discussion.category && (
                        <span className="ml-auto px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                          {discussion.category}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No discussions posted yet</p>
              </div>
            )}
          </Card>

          {/* Suspension Info */}
          {astrologer.isSuspended && astrologer.suspensionReason && (
            <Card title="Suspension Details" className="border-red-200 bg-red-50">
              <p className="text-red-800">{astrologer.suspensionReason}</p>
              <p className="text-sm text-red-600 mt-2">
                Suspended on {formatDateTime(astrologer.suspendedAt!)}
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Suspend Modal */}
      <Modal
        isOpen={showSuspendModal}
        onClose={() => setShowSuspendModal(false)}
        title="Suspend Astrologer"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Please provide a reason for suspending <strong>{astrologer.name}</strong>:
          </p>
          <textarea
            value={suspensionReason}
            onChange={(e) => setSuspensionReason(e.target.value)}
            className="input min-h-[120px] resize-none"
            placeholder="Enter suspension reason..."
          />
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setShowSuspendModal(false)}
              className="btn btn-secondary btn-md"
            >
              Cancel
            </button>
            <button
              onClick={handleSuspend}
              disabled={!suspensionReason.trim() || isSuspending}
              className="btn btn-danger btn-md"
            >
              {isSuspending ? 'Suspending...' : 'Suspend'}
            </button>
          </div>
        </div>
      </Modal>
    </MainLayout>
  );
};


import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mail, Phone, Star, Calendar, DollarSign, Clock, CheckCircle, Ban, Package, MessageSquare, FileText, ThumbsUp, MessageCircle, Edit2, ChevronDown, ChevronUp, Plus, Trash2, BadgeCheck, XCircle, Zap } from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, Loader, Avatar, StatusBadge, Modal, PillBadge } from '@/components/common';
import { AstrologerStatsCards } from '@/components/astrologers/AstrologerStatsCards';
import { ReviewFormModal } from '@/components/reviews/ReviewFormModal';
import { astrologersApi, servicesApi, reviewsApi, discussionsApi, consultationsApi, poojaRequestsApi, adCentreApi } from '@/api';
import { Astrologer, Service, Review, Discussion, Consultation, PoojaRequest } from '@/types';
import { formatCurrency, formatNumber, formatDateTime } from '@/utils/formatters';
import { useToastContext } from '@/contexts/ToastContext';
import { ROUTES } from '@/utils/constants';
import { CountdownTimer } from '@/components/common';
import { getImageUrl } from '@/utils/helpers';

export const AstrologerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToastContext();
  const [astrologer, setAstrologer] = useState<Astrologer | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [serviceRequests, setServiceRequests] = useState<PoojaRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [discussionsLoading, setDiscussionsLoading] = useState(false);
  const [consultationsLoading, setConsultationsLoading] = useState(false);
  const [serviceRequestsLoading, setServiceRequestsLoading] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isSuspending, setIsSuspending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isUnverifying, setIsUnverifying] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [suspensionReason, setSuspensionReason] = useState('');
  const [activeTab, setActiveTab] = useState<'consultations' | 'serviceRequests' | 'services' | 'reviews' | 'posts' | 'ads'>('consultations');
  const [boosts, setBoosts] = useState<any[]>([]);
  const [boostsLoading, setBoostsLoading] = useState(false);
  const [isBioExpanded, setIsBioExpanded] = useState(false);
  const bioRef = useRef<HTMLParagraphElement>(null);
  const [showBioExpandButton, setShowBioExpandButton] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadAstrologer();
      loadServices();
      loadReviews();
      loadConsultations();
      loadServiceRequests();
      loadBoosts();
    }
  }, [id]);

  useEffect(() => {
    if (astrologer) {
      loadDiscussions();
    }
  }, [astrologer]);

  // Check if bio content exceeds max height and needs expand button
  useEffect(() => {
    if (bioRef.current && astrologer?.bio) {
      const maxHeight = 120; // 3 lines approximately (40px per line)
      const actualHeight = bioRef.current.scrollHeight;
      setShowBioExpandButton(actualHeight > maxHeight);
    }
  }, [astrologer?.bio]);

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
        totalConsultations: data.totalConsultations ?? 0,
        isApproved: data.isApproved ?? false,
        isVerified: data.isVerified ?? false,
        verificationStatus: data.verificationStatus,
        verificationApprovedAt: data.verificationApprovedAt,
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

  const handleDeleteReview = async () => {
    if (!deletingReviewId) return;
    try {
      await reviewsApi.delete(deletingReviewId);
      toast.success('Review deleted successfully');
      setDeletingReviewId(null);
      loadReviews();
      if (astrologer) {
        loadAstrologer(); // Refresh astrologer to update rating
      }
    } catch (error: any) {
      console.error('Failed to delete review:', error);
      toast.error(error?.response?.data?.message || 'Failed to delete review');
    }
  };

  const handleReviewModalSuccess = () => {
    loadReviews();
    if (astrologer) {
      loadAstrologer(); // Refresh astrologer to update rating
    }
  };

  const loadDiscussions = async () => {
    if (!id || !astrologer) return;
    try {
      setDiscussionsLoading(true);
      const response = await discussionsApi.getAll({ 
        page: 1,
        limit: 10, // Show latest 10 discussions
        authorId: id,
        authorName: astrologer.name, // Also filter by name for backward compatibility
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

  const loadBoosts = async () => {
    if (!id) return;
    try {
      setBoostsLoading(true);
      // Fetch all boosts and filter by astrologer ID
      const response = await adCentreApi.getAllBoosts({});
      if (response.success && response.data) {
        const astrologerBoosts = response.data.boosts.filter(
          (boost: any) => boost.astrologerId === id
        );
        setBoosts(astrologerBoosts);
      }
    } catch (err) {
      console.error('Failed to load boosts:', err);
    } finally {
      setBoostsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      active: 'bg-gray-900 text-white',
      pending: 'bg-gray-200 text-gray-700',
      expired: 'bg-gray-100 text-gray-600',
      rejected: 'bg-gray-200 text-gray-700',
      cancelled_by_user: 'bg-gray-100 text-gray-600',
      cancelled_by_admin: 'bg-gray-200 text-gray-700',
    };
    const labelMap: Record<string, string> = {
      active: 'Active',
      pending: 'Pending',
      expired: 'Expired',
      rejected: 'Rejected',
      cancelled_by_user: 'Cancelled',
      cancelled_by_admin: 'Cancelled',
    };
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          statusStyles[status] || 'bg-gray-100 text-gray-600'
        }`}
      >
        {labelMap[status] || status}
      </span>
    );
  };

  const loadConsultations = async () => {
    if (!id) return;
    try {
      setConsultationsLoading(true);
      const params: any = {
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        astrologerId: id
      };
      const response = await consultationsApi.getAll(params);
      setConsultations(response.data || []);
    } catch (err) {
      console.error('Failed to load consultations:', err);
    } finally {
      setConsultationsLoading(false);
    }
  };

  const loadServiceRequests = async () => {
    if (!id) return;
    try {
      setServiceRequestsLoading(true);
      const params: any = {
        page: 1,
        limit: 50,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        astrologerId: id
      };
      const response = await poojaRequestsApi.getAll(params);
      const list = response.data || [];
      // Fallback: if backend doesn't filter by astrologerId, filter client-side
      const filtered = list.filter((r) => r.astrologerId?._id === id);
      setServiceRequests(filtered.slice(0, 10));
    } catch (err) {
      console.error('Failed to load service requests:', err);
    } finally {
      setServiceRequestsLoading(false);
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

  const handleVerify = async () => {
    if (!id || !astrologer) return;
    try {
      setIsVerifying(true);
      await astrologersApi.verify(id);
      await loadAstrologer();
      toast.success(`${astrologer.name} has been verified successfully!`);
    } catch (err: any) {
      console.error('Failed to verify:', err);
      toast.error(err?.message || 'Failed to verify astrologer');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleUnverify = async () => {
    if (!id || !astrologer) return;
    try {
      setIsUnverifying(true);
      await astrologersApi.unverify(id);
      await loadAstrologer();
      toast.warning(`Verification removed from ${astrologer.name}`);
    } catch (err: any) {
      console.error('Failed to unverify:', err);
      toast.error(err?.message || 'Failed to remove verification');
    } finally {
      setIsUnverifying(false);
    }
  };

  // Communication handlers
  const handleMessage = () => {
    if (!astrologer) return;
    navigate('/communication', {
      state: {
        selectedAstrologerId: astrologer._id,
        action: 'message'
      }
    });
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

  const getServiceStatus = (service: Service) => {
    if (service.isDeleted) return 'rejected';
    if (service.isActive) return 'approved';
    return 'pending';
  };

  // Calculate statistics for stat cards
  const totalConsultations = consultations.length;
  const completedConsultations = consultations.filter(c => c.status === 'completed').length;
  const totalServiceRequests = serviceRequests.length;
  
  // Calculate percentages (simplified - can be enhanced with period comparison)
  const consultationsPercentage = totalConsultations > 0 ? ((completedConsultations / totalConsultations) * 100) : 0;
  const completedPercentage = totalConsultations > 0 ? ((completedConsultations / totalConsultations) * 100) : 0;
  const serviceRequestsPercentage = 0; // Can be calculated with period comparison if needed

  // Get verification status badge (Facebook-inspired blue badge for verified astrologers)
  const getVerificationStatus = () => {
    if (astrologer.isSuspended) {
      return { text: 'Suspended', variant: 'rejected' as const, show: true };
    }
    if (astrologer.isVerified) {
      return { text: 'Verified', variant: 'blue' as const, show: true };
    }
    // Don't show badge if not verified and not suspended
    return { text: '', variant: 'pending' as const, show: false };
  };

  const verificationStatus = getVerificationStatus();

  return (
    <MainLayout>
      <PageHeader
        title={astrologer.name}
        subtitle="Astrologer Details"
        backButton
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card - Left Side */}
        <Card className="lg:col-span-1">
          <div className="flex flex-col">
            {/* Profile Picture with Edit Icon */}
            <div className="relative flex justify-center mb-4">
              <div className="relative">
                <Avatar src={astrologer.profilePicture} name={astrologer.name} size="3xl" />
                {astrologer.isOnline && (
                  <div className="absolute -bottom-1 -right-1 flex items-center justify-center">
                    <div className="w-6 h-6 bg-green-500 border-4 border-white rounded-full" />
                    <div className="absolute w-6 h-6 bg-green-400 rounded-full animate-ping" />
                  </div>
                )}
                {/* Edit Icon Overlay */}
                <button 
                  onClick={() => navigate(`/astrologers/${id}/edit`)}
                  className="absolute top-0 right-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors shadow-lg"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Name with Verified Badge */}
            <div className="flex items-center justify-center gap-2 mb-3">
              <h2 className="text-xl font-bold text-gray-900">{astrologer.name}</h2>
              {astrologer.isVerified && (
                <BadgeCheck className="w-5 h-5 text-white fill-[#1877F2] flex-shrink-0" />
              )}
            </div>

            {/* Status Badge - Blue Verified Badge (Facebook-inspired) */}
            {verificationStatus.show && (
              <div className="flex justify-center mb-4">
                <PillBadge
                  variant={verificationStatus.variant}
                  label={verificationStatus.text}
                  showDot={verificationStatus.variant !== 'blue'}
                />
              </div>
            )}

            {/* Primary Action Button */}
            <button
              onClick={handleMessage}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium mb-6"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Send Message</span>
            </button>

            {/* Admin Actions Section */}
            <div className="border-t border-gray-200 pt-6 mb-6">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Admin Actions</p>
              <div className="space-y-2">
                {/* Approve Button */}
                {!astrologer.isApproved && !astrologer.isSuspended && (
                  <button
                    onClick={handleApprove}
                    disabled={isApproving}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {isApproving ? 'Approving...' : 'Approve Astrologer'}
                  </button>
                )}

                {/* Verify/Unverify Buttons */}
                {astrologer.isApproved && !astrologer.isSuspended && (
                  <>
                    {!astrologer.isVerified ? (
                      <button
                        onClick={handleVerify}
                        disabled={isVerifying}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1877F2] text-white rounded-lg hover:bg-[#1565C0] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <BadgeCheck className="w-4 h-4" />
                        {isVerifying ? 'Verifying...' : 'Verify Astrologer'}
                      </button>
                    ) : (
                      <button
                        onClick={handleUnverify}
                        disabled={isUnverifying}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <XCircle className="w-4 h-4" />
                        {isUnverifying ? 'Removing...' : 'Remove Verification'}
                      </button>
                    )}
                  </>
                )}

                {/* Suspend/Unsuspend Buttons */}
                {astrologer.isSuspended ? (
                  <button
                    onClick={handleUnsuspend}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Unsuspend Astrologer
                  </button>
                ) : (
                  <button
                    onClick={() => setShowSuspendModal(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    <Ban className="w-4 h-4" />
                    Suspend Astrologer
                  </button>
                )}
              </div>
            </div>

            {/* Info Fields */}
            <div className="space-y-4 border-t border-gray-200 pt-6">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-0.5">Email</p>
                  <p className="text-sm font-medium text-gray-900">{astrologer.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-0.5">Phone</p>
                  <p className="text-sm font-medium text-gray-900">{astrologer.phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-0.5">Joined</p>
                  <p className="text-sm font-medium text-gray-900">{formatDateTime(astrologer.createdAt)}</p>
                </div>
              </div>
            </div>

            {/* Bio */}
            {astrologer.bio && (
              <div className="border-t border-gray-200 pt-6 mt-6">
                <p className="text-xs text-gray-500 mb-2 font-medium">About</p>
                <div className="relative">
                  <p 
                    ref={bioRef}
                    className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-words"
                    style={{
                      maxHeight: !isBioExpanded && showBioExpandButton ? '120px' : 'none',
                      overflow: !isBioExpanded && showBioExpandButton ? 'hidden' : 'visible',
                      transition: 'max-height 0.3s ease-in-out',
                    }}
                  >
                    {astrologer.bio}
                  </p>
                  {showBioExpandButton && (
                    <button
                      onClick={() => setIsBioExpanded(!isBioExpanded)}
                      className="mt-2 flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors"
                    >
                      {isBioExpanded ? (
                        <>
                          <span>Show less</span>
                          <ChevronUp className="w-4 h-4" />
                        </>
                      ) : (
                        <>
                          <span>Show more</span>
                          <ChevronDown className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Specializations */}
            {(astrologer.specialization || []).length > 0 && (
              <div className="border-t border-gray-200 pt-6 mt-6">
                <p className="text-xs text-gray-500 mb-2 font-medium">Specializations</p>
                <div className="flex flex-wrap gap-1.5">
                  {(astrologer.specialization || []).map((spec, i) => (
                    <span key={i} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Languages */}
            {(astrologer.languages || []).length > 0 && (
              <div className="border-t border-gray-200 pt-6 mt-6">
                <p className="text-xs text-gray-500 mb-2 font-medium">Languages</p>
                <div className="flex flex-wrap gap-1.5">
                  {(astrologer.languages || []).map((lang, i) => (
                    <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Service Charges */}
            <div className="border-t border-gray-200 pt-6 mt-6">
              <p className="text-xs text-gray-500 mb-3 font-medium">Service Charges</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                  <span className="text-xs text-gray-600">Rate per Min</span>
                  <span className="text-sm font-semibold text-gray-900">{formatCurrency(astrologer.consultationCharge || 0)}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                  <span className="text-xs text-gray-600">Call</span>
                  <span className="text-sm font-semibold text-gray-900">{formatCurrency(astrologer.callCharge || 0)}/min</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                  <span className="text-xs text-gray-600">Chat</span>
                  <span className="text-sm font-semibold text-gray-900">{formatCurrency(astrologer.chatCharge || 0)}/min</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Right Side - Stats and Tabs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Performance Metrics - Consolidated Card */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-200 ease-out">
            <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wider">Performance Metrics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Rating */}
              <div className="text-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex items-center justify-center mb-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-1">{(astrologer.rating || 0).toFixed(1)}</p>
                <p className="text-xs font-medium text-gray-500">Rating</p>
                <div className="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-yellow-500 rounded-full" 
                    style={{ width: `${Math.min(100, ((astrologer.rating || 0) / 5) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Earnings */}
              <div className="text-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex items-center justify-center mb-2">
                  <DollarSign className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-xl font-bold text-gray-900 mb-1 truncate">{formatCurrency(astrologer.totalEarnings || 0)}</p>
                <p className="text-xs font-medium text-gray-500">Earnings</p>
                <div className="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 rounded-full" 
                    style={{ width: `${Math.min(100, ((astrologer.totalEarnings || 0) / Math.max(1, (astrologer.totalEarnings || 0) + 10000)) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Experience */}
              <div className="text-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="w-5 h-5 text-purple-500" />
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-1">{astrologer.experience || 0}</p>
                <p className="text-xs font-medium text-gray-500">Years</p>
                <div className="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-500 rounded-full" 
                    style={{ width: `${Math.min(100, ((astrologer.experience || 0) / 50) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Reviews */}
              <div className="text-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex items-center justify-center mb-2">
                  <MessageSquare className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-1">{formatNumber(astrologer.totalReviews || 0)}</p>
                <p className="text-xs font-medium text-gray-500">Reviews</p>
                <div className="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full" 
                    style={{ width: `${Math.min(100, ((astrologer.totalReviews || 0) / Math.max(1, (astrologer.totalReviews || 0) + 100)) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <AstrologerStatsCards
            totalConsultations={totalConsultations}
            completedConsultations={completedConsultations}
            serviceRequests={totalServiceRequests}
            consultationsPercentage={consultationsPercentage}
            completedPercentage={completedPercentage}
            serviceRequestsPercentage={serviceRequestsPercentage}
          />
          {/* Unified Tabbed Section */}
          <Card>
            {/* Unified Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <div className="flex gap-4 sm:gap-6 -mb-px overflow-x-auto scrollbar-hide">
                <button
                  onClick={() => setActiveTab('consultations')}
                  className={`pb-4 px-2 sm:px-3 md:px-4 text-sm font-medium transition-colors relative whitespace-nowrap flex-shrink-0 ${
                    activeTab === 'consultations'
                      ? 'text-gray-900'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <span className="flex items-center gap-1.5 sm:gap-2">
                    Consultations
                    <span className={`px-1.5 sm:px-2 py-0.5 text-xs font-semibold rounded-full ${
                      activeTab === 'consultations'
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {consultations.length}
                    </span>
                  </span>
                  {activeTab === 'consultations' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('serviceRequests')}
                  className={`pb-4 px-2 sm:px-3 md:px-4 text-sm font-medium transition-colors relative whitespace-nowrap flex-shrink-0 ${
                    activeTab === 'serviceRequests'
                      ? 'text-gray-900'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <span className="flex items-center gap-1.5 sm:gap-2">
                    Service Requests
                    <span className={`px-1.5 sm:px-2 py-0.5 text-xs font-semibold rounded-full ${
                      activeTab === 'serviceRequests'
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {serviceRequests.length}
                    </span>
                  </span>
                  {activeTab === 'serviceRequests' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('services')}
                  className={`pb-4 px-2 sm:px-3 md:px-4 text-sm font-medium transition-colors relative whitespace-nowrap flex-shrink-0 ${
                    activeTab === 'services'
                      ? 'text-gray-900'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <span className="flex items-center gap-1.5 sm:gap-2">
                    Services
                    <span className={`px-1.5 sm:px-2 py-0.5 text-xs font-semibold rounded-full ${
                      activeTab === 'services'
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {services.length}
                    </span>
                  </span>
                  {activeTab === 'services' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`pb-4 px-2 sm:px-3 md:px-4 text-sm font-medium transition-colors relative whitespace-nowrap flex-shrink-0 ${
                    activeTab === 'reviews'
                      ? 'text-gray-900'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <span className="flex items-center gap-1.5 sm:gap-2">
                    Reviews
                    <span className={`px-1.5 sm:px-2 py-0.5 text-xs font-semibold rounded-full ${
                      activeTab === 'reviews'
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {reviews.length}
                    </span>
                  </span>
                  {activeTab === 'reviews' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('posts')}
                  className={`pb-4 px-2 sm:px-3 md:px-4 text-sm font-medium transition-colors relative whitespace-nowrap flex-shrink-0 ${
                    activeTab === 'posts'
                      ? 'text-gray-900'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <span className="flex items-center gap-1.5 sm:gap-2">
                    <span className="hidden sm:inline">Posts & Discussions</span>
                    <span className="sm:hidden">Posts</span>
                    <span className={`px-1.5 sm:px-2 py-0.5 text-xs font-semibold rounded-full ${
                      activeTab === 'posts'
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {discussions.length}
                    </span>
                  </span>
                  {activeTab === 'posts' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('ads')}
                  className={`pb-4 px-2 sm:px-3 md:px-4 text-sm font-medium transition-colors relative whitespace-nowrap flex-shrink-0 ${
                    activeTab === 'ads'
                      ? 'text-gray-900'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <span className="flex items-center gap-1.5 sm:gap-2">
                    Ads
                    <span className={`px-1.5 sm:px-2 py-0.5 text-xs font-semibold rounded-full ${
                      activeTab === 'ads'
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {boosts.length}
                    </span>
                  </span>
                  {activeTab === 'ads' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />
                  )}
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div>
              {/* Consultations Tab */}
              {activeTab === 'consultations' && (
                <div>
                  {consultationsLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader size="sm" text="Loading consultations..." />
                    </div>
                  ) : consultations.length > 0 ? (
                    <div className="space-y-3">
                      {consultations.map((consultation) => {
                        const consultationDate = new Date(consultation.scheduledTime || consultation.createdAt);
                        const timeRange = consultationDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        const endTime = new Date(consultationDate.getTime() + (consultation.duration || 0) * 60000);
                        const endTimeStr = endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        
                        return (
                          <div
                            key={consultation._id}
                            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center gap-4 flex-1">
                              <div className="text-sm font-medium text-gray-900 min-w-[60px]">
                                {consultationDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                              </div>
                              <div className="flex-1">
                                <div className="text-sm font-medium text-gray-900 capitalize">
                                  {consultation.type || 'Consultation'}
                                </div>
                                <div className="text-xs text-gray-500 mt-0.5">
                                  {timeRange} - {endTimeStr}
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <div className="text-sm font-semibold text-gray-900">
                                    {formatCurrency(consultation.amount || 0)}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {formatCurrency(astrologer.consultationCharge || 0)}/hr
                                  </div>
                                </div>
                                <div>
                                  {consultation.status === 'cancelled' ? (
                                    <span className="px-2.5 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-lg">
                                      Cancelled
                                    </span>
                                  ) : consultation.status === 'completed' ? (
                                    <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-lg flex items-center gap-1">
                                      <CheckCircle className="w-3 h-3" />
                                      Done
                                    </span>
                                  ) : (
                                    <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-lg">
                                      Booked
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No consultations yet</p>
                    </div>
                  )}
                </div>
              )}

              {/* Service Requests Tab */}
              {activeTab === 'serviceRequests' && (
                <div>
                  {serviceRequestsLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader size="sm" text="Loading service requests..." />
                    </div>
                  ) : serviceRequests.length > 0 ? (
                    <div className="space-y-3">
                      {serviceRequests.map((req) => {
                        const requestDate = req.requestedDate ? new Date(req.requestedDate) : new Date(req.createdAt || '');
                        return (
                          <div
                            key={req._id}
                            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center gap-4 flex-1">
                              <div className="text-sm font-medium text-gray-900 min-w-[80px]">
                                {requestDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
                              </div>
                              <div className="flex-1">
                                <div className="text-sm font-medium text-gray-900">
                                  {req.serviceName}
                                </div>
                                <div className="text-xs text-gray-500 mt-0.5">
                                  {req.customerName}
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <div className="text-sm font-semibold text-gray-900">
                                    {formatCurrency(req.price || 0)}
                                  </div>
                                </div>
                                <div>
                                  <StatusBadge status={req.status} />
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No service requests yet</p>
                    </div>
                  )}
                </div>
              )}

              {/* Services Tab */}
              {activeTab === 'services' && (
                <div>
                  {servicesLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader size="sm" text="Loading services..." />
                    </div>
                  ) : services.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {services.map((service) => (
                        <div
                          key={service._id}
                          className="p-5 bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-md transition-all duration-200"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="font-semibold text-gray-900 text-base">{service.name}</h4>
                            <StatusBadge status={getServiceStatus(service)} />
                          </div>
                          {service.description && (
                            <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                              {service.description}
                            </p>
                          )}
                          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <div className="flex flex-col gap-1">
                              <span className="text-base font-bold text-gray-900">
                                {formatCurrency(service.price)}
                              </span>
                              {service.duration && (
                                <span className="text-xs text-gray-500">
                                  {service.duration} mins
                                </span>
                              )}
                            </div>
                            <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg">
                              {service.category}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">No services offered yet</p>
                    </div>
                  )}
                </div>
              )}

              {/* Reviews Tab */}
              {activeTab === 'reviews' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Reviews</h3>
                  <button
                    onClick={() => {
                      setEditingReview(null);
                      setShowReviewModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Review
                  </button>
                </div>
                {reviewsLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader size="sm" text="Loading reviews..." />
                  </div>
                ) : reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review) => {
                      const displayDate = review.customCreatedAt || review.createdAt;
                      const isCustomDate = !!review.customCreatedAt;
                      return (
                        <div
                          key={review._id}
                          className="p-5 bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-sm transition-all duration-200"
                        >
                          <div className="flex items-start gap-4">
                            <Avatar
                              src={review.clientAvatar}
                              name={review.clientName || 'Anonymous'}
                              size="md"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1.5">
                                    <p className="font-semibold text-gray-900 text-base">
                                      {review.clientName || 'Anonymous'}
                                    </p>
                                    {review.isAdminCreated && (
                                      <PillBadge
                                        variant="blue"
                                        label="Admin"
                                        title="This review was created by admin"
                                      />
                                    )}
                                    {isCustomDate && (
                                      <PillBadge
                                        variant="purple"
                                        label="Custom Date"
                                        title={`Original: ${formatDateTime(review.createdAt)}, Custom: ${formatDateTime(review.customCreatedAt!)}`}
                                      />
                                    )}
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-0.5">
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
                                    <span className="text-xs text-gray-500">
                                      {formatDateTime(displayDate)}
                                    </span>
                                  </div>
                                </div>
                                {review.isAdminCreated && (
                                  <div className="flex items-center gap-2 ml-4">
                                    <button
                                      onClick={() => {
                                        setEditingReview(review);
                                        setShowReviewModal(true);
                                      }}
                                      className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                      title="Edit review"
                                    >
                                      <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => setDeletingReviewId(review._id)}
                                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                      title="Delete review"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                )}
                              </div>
                              {review.reviewText && (
                                <p className="text-sm text-gray-700 leading-relaxed mt-2">{review.reviewText}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No reviews yet</p>
                  </div>
                )}
              </div>
            )}

              {/* Posts & Discussions Tab */}
              {activeTab === 'posts' && (
              <div>
                {discussionsLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader size="sm" text="Loading discussions..." />
                  </div>
                ) : discussions.length > 0 ? (
                  <div className="space-y-4">
                    {discussions.map((discussion) => (
                      <div
                        key={discussion._id}
                        className="p-5 bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-sm transition-all duration-200"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-semibold text-gray-900 text-base flex-1 pr-4">{discussion.title}</h4>
                          {discussion.isPinned && (
                            <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-lg flex-shrink-0">
                              Pinned
                            </span>
                          )}
                        </div>
                        {discussion.content && (
                          <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                            {discussion.content}
                          </p>
                        )}
                        <div className="flex items-center gap-5 text-sm text-gray-500 pt-3 border-t border-gray-100">
                          <div className="flex items-center gap-1.5">
                            <ThumbsUp className="w-4 h-4" />
                            <span className="font-medium">{formatNumber(discussion.likeCount || 0)}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MessageSquare className="w-4 h-4" />
                            <span className="font-medium">{formatNumber(discussion.commentCount || 0)}</span>
                          </div>
                          <span className="text-xs">{formatDateTime(discussion.createdAt)}</span>
                          {discussion.category && (
                            <span className="ml-auto px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg">
                              {discussion.category}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No discussions posted yet</p>
                  </div>
                )}
              </div>
            )}

              {/* Ads Tab */}
              {activeTab === 'ads' && (
              <div>
                {boostsLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader size="sm" text="Loading ads..." />
                  </div>
                ) : boosts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {boosts.map((boost) => (
                      <div
                        key={boost.boostId}
                        onClick={() => navigate(`${ROUTES.AD_CENTRE}/${boost.boostId}`)}
                        className="cursor-pointer"
                      >
                        <Card className="hover:shadow-md transition-all">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              {boost.astrologerAvatar ? (
                                <img
                                  src={getImageUrl(boost.astrologerAvatar) || ''}
                                  alt={boost.astrologerName}
                                  className="w-10 h-10 rounded-full object-cover border border-gray-200"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    const fallback = e.currentTarget.nextElementSibling;
                                    if (fallback) {
                                      (fallback as HTMLElement).style.display = 'flex';
                                    }
                                  }}
                                />
                              ) : null}
                              <div 
                                className={`w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 ${boost.astrologerAvatar ? 'hidden' : ''}`}
                              >
                                <span className="text-gray-600 font-semibold text-sm">
                                  {boost.astrologerName?.charAt(0).toUpperCase() || 'A'}
                                </span>
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900 text-sm">{boost.astrologerName || 'Unknown'}</h3>
                                <p className="text-xs text-gray-500">Boost ID: {boost.boostId}</p>
                              </div>
                            </div>
                            {getStatusBadge(boost.status)}
                          </div>

                          <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Duration:</span>
                              <span className="font-medium text-gray-900">{boost.durationDays} days</span>
                            </div>
                            {boost.status === 'active' && (
                              <div className="flex justify-between text-sm items-center">
                                <span className="text-gray-500">Time Remaining:</span>
                                <CountdownTimer endDate={boost.endDate} className="text-xs font-medium" />
                              </div>
                            )}
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Cost:</span>
                              <span className="font-medium text-gray-900">
                                ₹{boost.totalCost?.toFixed(0) || '0'}
                              </span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-500">Start:</span>
                              <span className="font-medium text-gray-700">{formatDateTime(boost.startDate)}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-500">End:</span>
                              <span className="font-medium text-gray-700">{formatDateTime(boost.endDate)}</span>
                            </div>
                          </div>
                        </Card>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Zap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No active ads for this astrologer</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

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

      {/* Review Form Modal */}
      <ReviewFormModal
        isOpen={showReviewModal}
        onClose={() => {
          setShowReviewModal(false);
          setEditingReview(null);
        }}
        onSuccess={handleReviewModalSuccess}
        astrologerId={id}
        review={editingReview || undefined}
      />

      {/* Delete Review Confirmation Modal */}
      <Modal
        isOpen={!!deletingReviewId}
        onClose={() => setDeletingReviewId(null)}
        title="Delete Review"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete this review? This action cannot be undone.
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setDeletingReviewId(null)}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteReview}
              className="px-6 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </MainLayout>
  );
};


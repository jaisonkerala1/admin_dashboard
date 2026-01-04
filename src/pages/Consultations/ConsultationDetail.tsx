import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { 
  ArrowLeft,
  Calendar,
  Clock,
  DollarSign,
  User,
  Phone,
  Video,
  MessageCircle,
  MapPin,
  Star,
  Activity,
  AlertCircle
} from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { Card, Loader, Avatar } from '@/components/common';
import { consultationsApi } from '@/api';
import { Consultation } from '@/types';
import { formatCurrency, formatDuration, formatTimeBetween } from '@/utils/formatters';
import { useToastContext } from '@/contexts/ToastContext';
import { ROUTES } from '@/utils/constants';

const statusConfig: Record<string, { label: string; color: string }> = {
  scheduled: { label: 'Scheduled', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' },
  inProgress: { label: 'In Progress', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' },
  completed: { label: 'Completed', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' },
  cancelled: { label: 'Cancelled', color: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300' },
  noShow: { label: 'No Show', color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' },
};

const typeConfig: Record<string, { icon: any; label: string }> = {
  phone: { icon: Phone, label: 'Phone' },
  video: { icon: Video, label: 'Video' },
  chat: { icon: MessageCircle, label: 'Chat' },
  inPerson: { icon: MapPin, label: 'In Person' },
};

export const ConsultationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToastContext();
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadConsultation();
    }
  }, [id]);

  const loadConsultation = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const response = await consultationsApi.getById(id);
      setConsultation(response.data || null);
    } catch (err) {
      console.error('Failed to load consultation:', err);
      toast.error('Failed to load consultation details');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    return statusConfig[status]?.color || 'bg-gray-100 text-gray-700';
  };

  const getStatusLabel = (status: string) => {
    return statusConfig[status]?.label || status;
  };

  const getTypeIcon = (type: string) => {
    const config = typeConfig[type];
    if (!config) return null;
    const Icon = config.icon;
    return (
      <div className="flex items-center gap-2">
        <Icon className="w-5 h-5 text-gray-400 dark:text-muted-foreground" />
        <span className="text-sm font-medium text-gray-900 dark:text-foreground">{config.label}</span>
      </div>
    );
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader size="lg" text="Loading consultation details..." />
        </div>
      </MainLayout>
    );
  }

  if (!consultation) {
    return (
      <MainLayout>
        <Card>
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 dark:text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-foreground mb-2">Consultation Not Found</h3>
            <p className="text-gray-600 dark:text-muted-foreground mb-6">The consultation you're looking for doesn't exist.</p>
            <button
              onClick={() => navigate(ROUTES.CONSULTATIONS)}
              className="btn btn-primary"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Consultations
            </button>
          </div>
        </Card>
      </MainLayout>
    );
  }

  const status = consultation.status;
  const TypeIcon = typeConfig[consultation.type]?.icon || Activity;

  return (
    <MainLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(ROUTES.CONSULTATIONS)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-muted-foreground" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm text-gray-500 dark:text-muted-foreground">
                Consultation ID: <span className="font-mono">{consultation._id}</span>
              </span>
              <div className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                {getStatusLabel(status)}
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-foreground">
              Consultation - {typeConfig[consultation.type]?.label || consultation.type}
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4">
            {/* Consultation Info */}
            <Card className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-foreground mb-2">
                    Consultation Information
                  </h3>
                  <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-muted rounded-xl">
                    <TypeIcon className="w-10 h-10 text-gray-400 dark:text-muted-foreground" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-foreground">
                        {typeConfig[consultation.type]?.label || consultation.type} Consultation
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-muted-foreground">
                        Duration: {formatDuration(consultation.duration)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Topics */}
            {consultation.consultationTopics && consultation.consultationTopics.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-foreground mb-4">
                  Consultation Topics
                </h3>
                <div className="flex flex-wrap gap-2">
                  {consultation.consultationTopics.map((topic, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 dark:bg-muted text-gray-700 dark:text-foreground text-sm font-medium rounded-lg border border-gray-200 dark:border-border"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </Card>
            )}

            {/* Notes */}
            {consultation.notes && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-foreground mb-4">
                  Notes
                </h3>
                <p className="text-gray-700 dark:text-foreground whitespace-pre-wrap leading-relaxed">{consultation.notes}</p>
              </Card>
            )}

            {/* Rating & Feedback */}
            {consultation.rating && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-foreground mb-4">
                  Client Feedback
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < consultation.rating!
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-gray-300 dark:text-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-foreground">
                      {consultation.rating}/5
                    </span>
                  </div>
                  {consultation.feedback && (
                    <p className="text-sm text-gray-700 dark:text-foreground whitespace-pre-wrap leading-relaxed">{consultation.feedback}</p>
                  )}
                </div>
              </Card>
            )}

            {/* Cancellation Info */}
            {consultation.cancelledAt && (
              <Card className="p-6 bg-red-50/50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-foreground mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  Cancellation Details
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-muted-foreground">Cancelled At: </span>
                    <span className="font-medium text-gray-900 dark:text-foreground">
                      {format(new Date(consultation.cancelledAt), 'MMM d, yyyy h:mm a')}
                    </span>
                  </div>
                  {consultation.cancelledBy && (
                    <div>
                      <span className="text-gray-600 dark:text-muted-foreground">Cancelled By: </span>
                      <span className="font-medium text-gray-900 dark:text-foreground capitalize">{consultation.cancelledBy}</span>
                    </div>
                  )}
                  {consultation.cancellationReason && (
                    <div>
                      <span className="text-gray-600 dark:text-muted-foreground">Reason: </span>
                      <span className="font-medium text-gray-900 dark:text-foreground">{consultation.cancellationReason}</span>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Consultation Details */}
            <Card className="p-6">
              <h3 className="text-sm font-bold text-gray-900 dark:text-foreground uppercase tracking-wider mb-4">
                Consultation Details
              </h3>
              <div className="space-y-5">
                {/* Status */}
                <div>
                  <label className="block text-xs font-medium text-gray-400 dark:text-muted-foreground uppercase tracking-tighter mb-2">
                    Status
                  </label>
                  <div className={`inline-block px-3 py-1.5 rounded-lg text-sm font-medium ${getStatusColor(status)}`}>
                    {getStatusLabel(status)}
                  </div>
                </div>

                {/* Type */}
                <div>
                  <label className="block text-xs font-medium text-gray-400 dark:text-muted-foreground uppercase tracking-tighter mb-2">
                    Type
                  </label>
                  {getTypeIcon(consultation.type)}
                </div>

                {/* Scheduled Time */}
                <div>
                  <label className="block text-xs font-medium text-gray-400 dark:text-muted-foreground uppercase tracking-tighter mb-2">
                    Scheduled Time
                  </label>
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-foreground">
                    <Calendar className="w-4 h-4 text-primary-500 dark:text-primary-400" />
                    {format(new Date(consultation.scheduledTime), 'MMM d, yyyy h:mm a')}
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-xs font-medium text-gray-400 dark:text-muted-foreground uppercase tracking-tighter mb-2">
                    Duration
                  </label>
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-foreground">
                    <Clock className="w-4 h-4 text-primary-500 dark:text-primary-400" />
                    {formatDuration(consultation.duration)}
                  </div>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-xs font-medium text-gray-400 dark:text-muted-foreground uppercase tracking-tighter mb-2">
                    Amount
                  </label>
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-foreground">
                    <DollarSign className="w-4 h-4 text-primary-500 dark:text-primary-400" />
                    {formatCurrency(consultation.amount, consultation.currency)}
                  </div>
                </div>

                {/* Consultation ID */}
                <div>
                  <label className="block text-xs font-medium text-gray-400 dark:text-muted-foreground uppercase tracking-tighter mb-2">
                    Consultation ID
                  </label>
                  <div className="text-sm font-medium text-gray-900 dark:text-foreground font-mono break-all">
                    {consultation._id}
                  </div>
                </div>
              </div>
            </Card>

            {/* Client Information */}
            <Card className="p-6">
              <h3 className="text-sm font-bold text-gray-900 dark:text-foreground uppercase tracking-wider mb-4">
                Client Information
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-muted border border-gray-100 dark:border-border flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-400 dark:text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-gray-900 dark:text-foreground truncate">
                      {consultation.clientName}
                    </div>
                  </div>
                </div>
                {consultation.clientPhone && (
                  <div className="flex items-center gap-3 group">
                    <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-muted flex items-center justify-center group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 transition-colors">
                      <Phone className="w-4 h-4 text-gray-400 dark:text-muted-foreground group-hover:text-primary-500 dark:group-hover:text-primary-400" />
                    </div>
                    <div className="text-sm text-gray-600 dark:text-muted-foreground">
                      {consultation.clientPhone}
                    </div>
                  </div>
                )}
                {consultation.clientEmail && (
                  <div className="flex items-center gap-3 group">
                    <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-muted flex items-center justify-center group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 transition-colors">
                      <User className="w-4 h-4 text-gray-400 dark:text-muted-foreground group-hover:text-primary-500 dark:group-hover:text-primary-400" />
                    </div>
                    <div className="text-sm text-gray-600 dark:text-muted-foreground truncate">
                      {consultation.clientEmail}
                    </div>
                  </div>
                )}
                {(consultation.clientAge || consultation.clientGender) && (
                  <div className="pt-3 border-t border-gray-100 dark:border-border space-y-2 text-sm">
                    {consultation.clientAge && (
                      <div>
                        <span className="text-gray-500 dark:text-muted-foreground">Age: </span>
                        <span className="font-medium text-gray-900 dark:text-foreground">{consultation.clientAge} years</span>
                      </div>
                    )}
                    {consultation.clientGender && (
                      <div>
                        <span className="text-gray-500 dark:text-muted-foreground">Gender: </span>
                        <span className="font-medium text-gray-900 dark:text-foreground capitalize">{consultation.clientGender}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>

            {/* Astrologer Information */}
            {consultation.astrologerId && (
              <Card className="p-6">
                <h3 className="text-sm font-bold text-gray-900 dark:text-foreground uppercase tracking-wider mb-4">
                  Assigned Astrologer
                </h3>
                <div className="space-y-4">
                  <Link 
                    to={`${ROUTES.ASTROLOGERS}/${consultation.astrologerId._id}`}
                    className="flex items-center gap-3 group"
                  >
                    <Avatar 
                      src={consultation.astrologerId.profilePicture}
                      name={consultation.astrologerId.name} 
                      size="md"
                      className="border border-gray-100 dark:border-border"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold text-gray-900 dark:text-foreground truncate">
                        {consultation.astrologerId.name}
                      </div>
                      <div className="text-[10px] text-gray-400 dark:text-muted-foreground font-mono truncate">
                        {consultation.astrologerId.email}
                      </div>
                    </div>
                  </Link>
                  <button
                    onClick={() => navigate(`${ROUTES.ASTROLOGERS}/${consultation.astrologerId!._id}`)}
                    className="w-full px-4 py-2 bg-white dark:bg-card border border-gray-200 dark:border-border text-gray-700 dark:text-foreground rounded-lg hover:bg-gray-50 dark:hover:bg-muted text-sm font-medium transition-all"
                  >
                    View Profile
                  </button>
                </div>
              </Card>
            )}

            {/* Timeline */}
            <Card className="p-6">
              <h3 className="text-sm font-bold text-gray-900 dark:text-foreground uppercase tracking-wider mb-6">
                Timeline
              </h3>
              <div className="relative">
                {(() => {
                  // Build timeline events array in chronological order
                  const timelineEvents = [
                    {
                      label: 'Consultation Created',
                      description: 'The consultation has been scheduled',
                      timestamp: consultation.createdAt,
                      iconColor: 'bg-blue-600',
                      isActive: false,
                    },
                    consultation.startedAt && {
                      label: 'Consultation Started',
                      description: 'The consultation has been started',
                      timestamp: consultation.startedAt,
                      iconColor: 'bg-blue-600',
                      isActive: false,
                    },
                    consultation.completedAt && {
                      label: 'Consultation Completed',
                      description: 'The consultation has been completed',
                      timestamp: consultation.completedAt,
                      iconColor: 'bg-green-500',
                      isActive: true,
                    },
                    consultation.cancelledAt && {
                      label: 'Consultation Cancelled',
                      description: 'The consultation has been cancelled',
                      timestamp: consultation.cancelledAt,
                      iconColor: 'bg-red-500',
                      isActive: true,
                    },
                  ].filter(Boolean) as Array<{
                    label: string;
                    description: string;
                    timestamp: string;
                    iconColor: string;
                    isActive: boolean;
                  }>;

                  return timelineEvents.map((event, index) => {
                    const isLast = index === timelineEvents.length - 1;
                    const hasNext = !isLast;
                    const previousEvent = index > 0 ? timelineEvents[index - 1] : null;
                    const timeSincePrevious = previousEvent 
                      ? formatTimeBetween(previousEvent.timestamp, event.timestamp)
                      : null;
                    
                    return (
                      <div key={event.label} className="relative">
                        {/* Vertical line connecting events */}
                        {hasNext && (
                          <div className="absolute left-[11px] top-[24px] w-0.5 h-full bg-gray-200 dark:bg-border" />
                        )}
                        
                        {/* Event content */}
                        <div className={`relative flex items-start gap-4 pb-6 ${isLast ? 'pb-0' : ''}`}>
                          {/* Icon */}
                          <div className="relative z-10 flex-shrink-0">
                            <div className={`w-6 h-6 rounded-full ${event.iconColor} flex items-center justify-center shadow-md`}>
                              <div className="w-2.5 h-2.5 rounded-full bg-white dark:bg-card" />
                            </div>
                          </div>
                          
                          {/* Content */}
                          <div className={`flex-1 pt-0.5 ${event.isActive ? 'pb-4' : ''}`}>
                            {/* Active event highlight background */}
                            {event.isActive && (
                              <div className={`absolute left-0 right-0 -mx-6 -my-2 px-6 py-3 rounded-lg ${
                                event.iconColor === 'bg-green-500' 
                                  ? 'bg-green-50/50 dark:bg-green-900/20 border border-green-100/50 dark:border-green-800/50' 
                                  : 'bg-red-50/50 dark:bg-red-900/20 border border-red-100/50 dark:border-red-800/50'
                              }`} />
                            )}
                            
                            <div className="relative">
                              <p className={`font-semibold mb-1 ${
                                event.isActive 
                                  ? event.iconColor === 'bg-green-500' 
                                    ? 'text-green-700 dark:text-green-400' 
                                    : 'text-red-700 dark:text-red-400'
                                  : 'text-gray-900 dark:text-foreground'
                              }`}>
                                {event.description}
                              </p>
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-sm text-gray-500 dark:text-muted-foreground font-medium">
                                  {format(new Date(event.timestamp), 'd MMM HH:mm')}
                                </p>
                                {timeSincePrevious && (
                                  <>
                                    <span className="text-gray-300 dark:text-border">•</span>
                                    <p className="text-xs text-gray-400 dark:text-muted-foreground font-medium">
                                      {timeSincePrevious} taken
                                    </p>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};


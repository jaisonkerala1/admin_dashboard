import React, { useState } from 'react';
import type { ApprovalRequest } from '@/types/approval';
import { X, User, Mail, Phone, Briefcase, Star, Users, CheckCircle2, XCircle } from 'lucide-react';
import { ApprovalStatusBadge } from './ApprovalStatusBadge';
import { ApprovalTypeBadge } from './ApprovalTypeBadge';
import { DocumentViewer } from './DocumentViewer';

interface ApprovalRequestDetailModalProps {
  request: ApprovalRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (requestId: string, notes?: string) => void;
  onReject: (requestId: string, rejectionReason: string) => void;
  isProcessing?: boolean;
}

export const ApprovalRequestDetailModal: React.FC<ApprovalRequestDetailModalProps> = ({
  request,
  isOpen,
  onClose,
  onApprove,
  onReject,
  isProcessing = false,
}) => {
  const [notes, setNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  if (!isOpen || !request) {
    return null;
  }

  const handleApprove = () => {
    onApprove(request._id, notes.trim() || undefined);
    setNotes('');
  };

  const handleReject = () => {
    if (rejectionReason.trim()) {
      onReject(request._id, rejectionReason.trim());
      setRejectionReason('');
      setShowRejectForm(false);
    }
  };

  const canApprove = request.status === 'pending';
  const canReject = request.status === 'pending';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            {request.astrologerAvatar ? (
              <img
                src={request.astrologerAvatar}
                alt={request.astrologerName}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="w-6 h-6 text-gray-500" />
              </div>
            )}
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{request.astrologerName}</h2>
              <div className="flex items-center gap-2 mt-1">
                <ApprovalTypeBadge type={request.requestType} />
                <ApprovalStatusBadge status={request.status} />
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Astrologer Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-sm font-medium text-gray-900">{request.astrologerEmail}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="text-sm font-medium text-gray-900">{request.astrologerPhone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Briefcase className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Experience</p>
                <p className="text-sm font-medium text-gray-900">
                  {request.astrologerData.experience} years
                </p>
              </div>
            </div>
            {request.astrologerData.rating > 0 && (
              <div className="flex items-center gap-3">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <div>
                  <p className="text-sm text-gray-500">Rating</p>
                  <p className="text-sm font-medium text-gray-900">
                    {request.astrologerData.rating.toFixed(1)} / 5.0
                  </p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Consultations</p>
                <p className="text-sm font-medium text-gray-900">
                  {request.astrologerData.consultationsCount}
                </p>
              </div>
            </div>
          </div>

          {/* Specializations */}
          {request.astrologerData.specializations.length > 0 && (
            <div>
              <p className="text-sm text-gray-500 mb-2">Specializations</p>
              <div className="flex flex-wrap gap-2">
                {request.astrologerData.specializations.map((spec, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Languages (for onboarding) */}
          {request.requestType === 'onboarding' && request.astrologerData.languages && request.astrologerData.languages.length > 0 && (
            <div>
              <p className="text-sm text-gray-500 mb-2">Languages</p>
              <div className="flex flex-wrap gap-2">
                {request.astrologerData.languages.map((lang, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Bio (for onboarding) */}
          {request.requestType === 'onboarding' && request.astrologerData.bio && (
            <div>
              <p className="text-sm text-gray-500 mb-2">Bio</p>
              <p className="text-sm text-gray-900 whitespace-pre-wrap">{request.astrologerData.bio}</p>
            </div>
          )}

          {/* Awards (for onboarding) */}
          {request.requestType === 'onboarding' && request.astrologerData.awards && (
            <div>
              <p className="text-sm text-gray-500 mb-2">Awards</p>
              <p className="text-sm text-gray-900 whitespace-pre-wrap">{request.astrologerData.awards}</p>
            </div>
          )}

          {/* Certificates (for onboarding) */}
          {request.requestType === 'onboarding' && request.astrologerData.certificates && (
            <div>
              <p className="text-sm text-gray-500 mb-2">Certificates</p>
              <p className="text-sm text-gray-900 whitespace-pre-wrap">{request.astrologerData.certificates}</p>
            </div>
          )}

          {/* Documents (only for verification_badge) */}
          {request.requestType === 'verification_badge' && request.documents && request.documents.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Documents</h3>
              <DocumentViewer documents={request.documents} />
            </div>
          )}

          {/* Rejection Reason (if rejected) */}
          {request.status === 'rejected' && request.rejectionReason && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-medium text-red-900 mb-1">Rejection Reason</p>
                  <p className="text-sm text-red-700">{request.rejectionReason}</p>
                </div>
              </div>
            </div>
          )}

          {/* Admin Notes (if approved) */}
          {request.status === 'approved' && request.notes && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-green-900 mb-1">Admin Notes</p>
                  <p className="text-sm text-green-700">{request.notes}</p>
                </div>
              </div>
            </div>
          )}

          {/* Submission Info */}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Submitted: {new Date(request.submittedAt).toLocaleString()}
            </p>
            {request.reviewedAt && (
              <p className="text-sm text-gray-500 mt-1">
                Reviewed: {new Date(request.reviewedAt).toLocaleString()}
                {request.reviewedBy && ` by ${request.reviewedBy}`}
              </p>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        {canApprove || canReject ? (
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            {!showRejectForm ? (
              <div className="flex items-center gap-4">
                {canApprove && (
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Admin Notes (Optional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add any notes about this approval..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      rows={2}
                    />
                  </div>
                )}
                <div className="flex gap-3">
                  {canApprove && (
                    <button
                      onClick={handleApprove}
                      disabled={isProcessing}
                      className="px-6 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      Approve
                    </button>
                  )}
                  {canReject && (
                    <button
                      onClick={() => setShowRejectForm(true)}
                      disabled={isProcessing}
                      className="px-6 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <XCircle className="w-5 h-5" />
                      Reject
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-red-700 mb-2">
                    Rejection Reason <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Please provide a reason for rejection..."
                    className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                    rows={3}
                    required
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => {
                      setShowRejectForm(false);
                      setRejectionReason('');
                    }}
                    disabled={isProcessing}
                    className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={isProcessing || !rejectionReason.trim()}
                    className="px-6 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <XCircle className="w-5 h-5" />
                    Confirm Rejection
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};


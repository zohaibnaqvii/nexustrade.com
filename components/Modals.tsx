import React, { useState, useEffect } from 'react';
import { CRYPTO_ADDRESSES } from '../constants';
import { TransactionStatus, KYCStatus } from '../types';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#161b22] border border-[#30363d] w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-4 border-b border-[#30363d]">
          <h3 className="text-xl font-bold">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

export const DepositModal: React.FC<{ isOpen: boolean; onClose: () => void; onSubmit: (data: any) => void }> = ({ isOpen, onClose, onSubmit }) => {
  const [step, setStep] = useState(1);
  const [network, setNetwork] = useState('');
  const [amount, setAmount] = useState('');
  const [timeLeft, setTimeLeft] = useState(900); // 15 mins

  useEffect(() => {
    if (step === 2 && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [step, timeLeft]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Address Copied!');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Deposit Crypto">
      {step === 1 ? (
        <div className="space-y-4">
          <div>
            <label className="block text-gray-400 text-sm mb-2">Enter Amount ($)</label>
            <input 
              type="number" 
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg p-3 text-white focus:border-blue-500 outline-none"
              placeholder="Min $10"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-2">Select Network</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(CRYPTO_ADDRESSES).map(net => (
                <button 
                  key={net} 
                  onClick={() => setNetwork(net)}
                  className={`p-3 rounded-lg border ${network === net ? 'bg-blue-600 border-blue-500' : 'bg-[#0d1117] border-[#30363d]'} transition-all`}
                >
                  {net}
                </button>
              ))}
            </div>
          </div>
          <button 
            disabled={!amount || !network}
            onClick={() => setStep(2)}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-bold mt-4"
          >
            Generate Payment Details
          </button>
        </div>
      ) : (
        <div className="text-center space-y-6">
          <div className="bg-yellow-900/20 border border-yellow-700/30 p-4 rounded-lg text-yellow-500 text-sm">
            Please send exactly ${amount} in {network} to the address below.
          </div>
          <div>
            <label className="block text-gray-400 text-xs mb-1 uppercase">Payment Address</label>
            <div className="flex items-center gap-2 bg-[#0d1117] p-3 rounded-lg border border-[#30363d]">
              <span className="text-xs truncate flex-1 font-mono">{(CRYPTO_ADDRESSES as any)[network]}</span>
              <button onClick={() => handleCopy((CRYPTO_ADDRESSES as any)[network])} className="text-blue-500 hover:text-blue-400 font-bold px-2">Copy</button>
            </div>
          </div>
          <div className="text-2xl font-mono font-bold text-red-500">{formatTime(timeLeft)}</div>
          <button 
            onClick={() => onSubmit({ amount, network })}
            className="w-full py-4 bg-green-600 hover:bg-green-700 rounded-lg font-bold"
          >
            I have made payment
          </button>
        </div>
      )}
    </Modal>
  );
};

export const WithdrawalModal: React.FC<{ isOpen: boolean; onClose: () => void; onSubmit: (data: any) => void }> = ({ isOpen, onClose, onSubmit }) => {
    const [method, setMethod] = useState('');
    const [amount, setAmount] = useState('');
    const [details, setDetails] = useState('');

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Withdraw Funds">
            <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                    {['Crypto', 'EasyPaisa', 'JazzCash'].map(m => (
                        <button key={m} onClick={() => setMethod(m)} className={`p-2 text-xs rounded-lg border ${method === m ? 'bg-blue-600 border-blue-500' : 'bg-[#0d1117] border-[#30363d]'}`}>{m}</button>
                    ))}
                </div>
                <input 
                    type="number" placeholder="Amount ($)" className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg p-3 text-white outline-none"
                    value={amount} onChange={(e) => setAmount(e.target.value)}
                />
                <textarea 
                    placeholder="Account Number / Wallet Address" className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg p-3 text-white outline-none h-24"
                    value={details} onChange={(e) => setDetails(e.target.value)}
                />
                <button 
                    disabled={!amount || !method || !details}
                    onClick={() => onSubmit({ amount, method, details })}
                    className="w-full py-3 bg-red-600 hover:bg-red-700 rounded-lg font-bold mt-4 disabled:opacity-50"
                >
                    Submit Withdrawal
                </button>
            </div>
        </Modal>
    );
};

export const KYCModal: React.FC<{ isOpen: boolean; onClose: () => void; onSubmit: (data: any) => void }> = ({ isOpen, onClose, onSubmit }) => {
    const [fullName, setFullName] = useState('');
    const [idNumber, setIdNumber] = useState('');
    const [frontImg, setFrontImg] = useState<string | null>(null);
    const [backImg, setBackImg] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (side === 'front') setFrontImg(reader.result as string);
                else setBackImg(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Identity Verification (KYC)">
            <div className="space-y-4">
                <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg text-[10px] text-blue-400 font-bold uppercase tracking-wider">
                    Auto-Verification System active. ETA: 3 Minutes.
                </div>
                <input 
                    type="text" placeholder="Full Legal Name" className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg p-3 text-white outline-none"
                    value={fullName} onChange={(e) => setFullName(e.target.value)}
                />
                <input 
                    type="text" placeholder="ID / Passport / CNIC Number" className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg p-3 text-white outline-none"
                    value={idNumber} onChange={(e) => setIdNumber(e.target.value)}
                />
                <div className="grid grid-cols-2 gap-4">
                    <label className={`relative border-2 border-dashed ${frontImg ? 'border-green-500 bg-green-500/5' : 'border-[#30363d]'} p-4 text-center rounded-lg cursor-pointer hover:border-blue-500 transition-colors`}>
                        <span className="text-[10px] text-gray-500 font-bold uppercase">{frontImg ? 'FRONT UPLOADED' : 'FRONT ID PHOTO'}</span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'front')} />
                        {frontImg && <div className="absolute top-1 right-1 text-green-500">✓</div>}
                    </label>
                    <label className={`relative border-2 border-dashed ${backImg ? 'border-green-500 bg-green-500/5' : 'border-[#30363d]'} p-4 text-center rounded-lg cursor-pointer hover:border-blue-500 transition-colors`}>
                        <span className="text-[10px] text-gray-500 font-bold uppercase">{backImg ? 'BACK UPLOADED' : 'BACK ID PHOTO'}</span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'back')} />
                        {backImg && <div className="absolute top-1 right-1 text-green-500">✓</div>}
                    </label>
                </div>
                <button 
                    disabled={!fullName || !idNumber || !frontImg || !backImg}
                    onClick={() => onSubmit({ fullName, idNumber, frontImage: frontImg, backImage: backImg })}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold mt-4 uppercase tracking-widest text-xs disabled:opacity-30 transition-all"
                >
                    Submit for Terminal Approval
                </button>
            </div>
        </Modal>
    );
};
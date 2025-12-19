import React from 'react';
import { ShieldAlert, Lock } from 'lucide-react';

interface Props {
  onVerify: () => void;
  onCancel: () => void;
}

const AgeVerificationModal: React.FC<Props> = ({ onVerify, onCancel }) => {
  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#1a1a1a] border border-red-900/50 rounded-2xl max-w-md w-full p-8 relative overflow-hidden text-center shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-red-900"></div>
        
        <div className="w-20 h-20 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldAlert className="w-10 h-10 text-red-600" />
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">تنبيه محتوى للكبار</h2>
        <p className="text-gray-400 mb-8 leading-relaxed">
          هذا المحتوى مصنف <span className="text-red-500 font-bold px-1 text-lg">١٨+</span>. 
          <br/>
          يحتوي على مشاهد قد لا تكون مناسبة للمشاهدين الصغار. يرجى تأكيد أنك تبلغ السن القانوني للمتابعة.
        </p>

        <div className="space-y-4">
            <button 
            onClick={onVerify}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 shadow-lg shadow-red-900/20"
            >
            أنا أبلغ ١٨ عاماً أو أكثر - دخول
            </button>
            <button 
            onClick={onCancel}
            className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 py-3 px-6 rounded-lg transition-colors border border-white/5"
            >
            عودة للصفحة السابقة
            </button>
        </div>

        <div className="mt-6 text-xs text-gray-500 flex items-center justify-center gap-1">
          <Lock className="w-3 h-3" />
          <span>تأكيدك يعني تحملك مسؤولية المحتوى المعروض</span>
        </div>
      </div>
    </div>
  );
};

export default AgeVerificationModal;
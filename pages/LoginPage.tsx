
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, ChevronRight, AlertCircle, Film, User, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { supabase, MovieService } from '../constants';

const LoginPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [backdrop, setBackdrop] = useState('https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070');
  const navigate = useNavigate();

  // البريد الإلكتروني المخصص للمسؤول
  const ADMIN_EMAIL = 'mohamedaouslim@gmail.com';

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // التحقق من البريد الإلكتروني أو الرتبة
        const isHardcodedAdmin = session.user.email === ADMIN_EMAIL;
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (isHardcodedAdmin || profile?.role === 'admin') {
          sessionStorage.setItem('admin_auth', 'true');
          navigate('/admin');
        } else {
          sessionStorage.setItem('admin_auth', 'false');
          navigate('/');
        }
      }
    };
    checkAuth();

    const loadBackdrop = async () => {
        const movies = await MovieService.getAll();
        if (movies.length > 0 && movies[0].backdropUrl) {
            setBackdrop(movies[0].backdropUrl);
        }
    };
    loadBackdrop();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isLogin) {
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (authError) {
          if (authError.message.includes('Email not confirmed')) {
            throw new Error('يرجى تفعيل حسابك من خلال الرابط المرسل إلى بريدك الإلكتروني أولاً.');
          }
          throw authError;
        }
        
        const isHardcodedAdmin = data.user.email === ADMIN_EMAIL;

        // جلب البيانات الشخصية للتحقق من الرتبة
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        if (isHardcodedAdmin || profile?.role === 'admin') {
          sessionStorage.setItem('admin_auth', 'true');
          navigate('/admin');
        } else {
          sessionStorage.setItem('admin_auth', 'false');
          navigate('/');
        }
      } else {
        if (!name.trim()) throw new Error('يرجى إدخال الاسم الكامل');

        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name },
            emailRedirectTo: window.location.origin
          },
        });

        if (authError) throw authError;
        
        if (data.user) {
          setSuccess('تم إنشاء الحساب بنجاح! يرجى التحقق من بريدك الإلكتروني لتفعيل الحساب قبل تسجيل الدخول.');
          setIsLogin(true); 
          setPassword('');
        }
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء الاتصال');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-black font-sans">
      <div className="absolute inset-0 z-0">
        <img 
          src={backdrop} 
          alt="Login Background" 
          className="w-full h-full object-cover opacity-40 blur-sm scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/40"></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        <div className="bg-[#0f0f0f]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 sm:p-10 shadow-2xl transition-all duration-300">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 group mb-2">
              <div className="bg-red-600 rounded p-1.5 group-hover:bg-red-700 transition-colors">
                 <Film className="w-6 h-6 text-white" />
              </div>
              <span className="text-3xl font-black text-white tracking-tighter uppercase font-sans">
                Cinema<span className="text-red-600">Stream</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm mt-2">
              {isLogin ? 'سجل دخولك للمتابعة' : 'أنشئ حسابك الجديد وانضم إلينا'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg p-3 flex items-center gap-2 text-sm animate-fadeIn">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="bg-green-500/10 border border-green-500/20 text-green-500 rounded-lg p-3 flex items-center gap-2 text-sm animate-fadeIn">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <div className="space-y-4">
              {!isLogin && (
                <div className="animate-fadeIn">
                  <label className="block text-gray-400 text-xs font-bold mb-2 mr-1 text-right">الاسم الكامل</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg py-3 px-4 pl-10 text-white focus:border-red-600 focus:ring-1 focus:ring-red-600 focus:outline-none transition-all placeholder-gray-600 text-right"
                      placeholder="أدخل اسمك الكامل"
                      required={!isLogin}
                    />
                    <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-gray-400 text-xs font-bold mb-2 mr-1 text-right">البريد الإلكتروني</label>
                <div className="relative">
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg py-3 px-4 pl-10 text-white focus:border-red-600 focus:ring-1 focus:ring-red-600 focus:outline-none transition-all placeholder-gray-600 text-left"
                    placeholder="name@example.com"
                    dir="ltr"
                    required
                  />
                  <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-xs font-bold mb-2 mr-1 text-right">كلمة المرور</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg py-3 px-12 pl-12 text-white focus:border-red-600 focus:ring-1 focus:ring-red-600 focus:outline-none transition-all placeholder-gray-600 text-left"
                    placeholder="••••••••"
                    dir="ltr"
                    required
                  />
                  <Lock className="absolute right-3 top-3.5 w-5 h-5 text-gray-500" />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-3.5 text-gray-500 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className={`w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-lg transition-all transform hover:scale-[1.02] shadow-lg shadow-red-900/30 flex items-center justify-center gap-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>جاري المعالجة...</span>
                </>
              ) : (
                isLogin ? 'تسجيل الدخول' : 'إنشاء حساب'
              )}
            </button>
          </form>

          <div className="mt-8 text-center space-y-4">
             <div className="text-gray-400 text-sm">
               {isLogin ? 'ليس لديك حساب؟' : 'لديك حساب بالفعل؟'}
               <button 
                 onClick={() => {
                   setIsLogin(!isLogin);
                   setError('');
                   setSuccess('');
                 }}
                 className="text-white font-bold hover:text-red-500 mr-2 transition-colors underline decoration-red-600/30 hover:decoration-red-600"
               >
                 {isLogin ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}
               </button>
             </div>

            <Link to="/" className="text-gray-600 hover:text-gray-400 text-xs flex items-center justify-center gap-1 transition-colors">
              العودة للصفحة الرئيسية
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

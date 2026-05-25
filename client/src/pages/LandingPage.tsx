
import { Link } from 'react-router-dom';
import { Sparkles, Zap, Lock, Shield, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-['Inter'] overflow-hidden selection:bg-[#FF6B00] selection:text-white relative">
      
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#FF6B00] rounded-full blur-[150px] opacity-[0.07] pointer-events-none" />

      {/* Navbar */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-1">
          <div className="font-['Georgia'] text-[24px] leading-none tracking-tight">
            <span className="text-white font-bold">Kai</span>
            <span className="text-[#FF6B00] font-bold">ro</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8 text-[14px] text-[#A0A0A0] font-medium">
          <a href="#" className="hover:text-white transition-colors">Product</a>
          <a href="#" className="hover:text-white transition-colors">FAQs</a>
          <a href="#" className="hover:text-white transition-colors">Community</a>
          <a href="#" className="hover:text-white transition-colors">Contact</a>
        </div>

        <div className="flex items-center gap-6">
          <Link to="/auth" className="hidden md:block text-[#A0A0A0] text-[14px] hover:text-white transition-colors">
            Current Customer?
          </Link>
          <Link 
            to="/auth" 
            className="flex items-center gap-2 bg-[#FF6B00] hover:bg-[#FF8C2A] text-white px-5 py-2.5 rounded-full text-[14px] font-semibold transition-colors"
          >
            Go to App <ArrowRight size={16} />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center pt-20 pb-32 px-4 text-center min-h-[80vh]">
        
        <p className="text-[14px] font-medium text-[#A0A0A0] mb-6 flex items-center gap-2">
          Your Workspace <span className="text-xl">🌱</span>
        </p>
        
        <h1 className="text-[52px] md:text-[84px] font-bold leading-[1.05] tracking-tight max-w-[900px] mb-16">
          THINK clearly, WRITE<br />
          beautifully, WORK together.
        </h1>

        {/* 3D Glass Bowl & Pencil Visual */}
        <div className="relative w-full max-w-[800px] h-[400px] flex items-center justify-center mt-10">
          
          {/* Glass Bowl Container */}
          <div className="absolute bottom-0 w-[500px] h-[200px] bg-white/5 backdrop-blur-2xl border border-white/10 rounded-b-[100px] rounded-t-[20px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-20 flex items-center justify-center overflow-visible">
            {/* Inner rim glow */}
            <div className="absolute top-0 w-full h-[40px] border-t border-white/20 rounded-full" />
            <div className="absolute bottom-4 w-[200px] h-[20px] bg-[#FF6B00] blur-[40px] opacity-40 rounded-full" />
          </div>

          {/* Floating Orange Pencil */}
          <div className="absolute z-30 bottom-[80px] animate-float-slow">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FF6B00" stroke="#FF8C2A" strokeWidth="1" className="w-32 h-32 md:w-48 md:h-48 drop-shadow-[0_10px_20px_rgba(255,107,0,0.4)]" style={{ filter: 'drop-shadow(0 0 20px rgba(255,107,0,0.4))' }}>
              <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
              <path d="m15 5 4 4" stroke="#FFF" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
              <path d="m11 9 4 4" stroke="#FFF" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
            </svg>
          </div>

          {/* Floating Badges */}
          <div className="absolute top-[20px] left-[10%] z-40 animate-float-medium bg-black/40 backdrop-blur-md border border-white/10 rounded-full px-4 py-2 flex items-center gap-2 text-[13px] text-white">
            <Sparkles size={14} className="text-[#FF6B00]" /> AI Assisted
          </div>

          <div className="absolute top-[80px] right-[15%] z-40 animate-float-fast bg-black/40 backdrop-blur-md border border-white/10 rounded-full px-4 py-2 flex items-center gap-2 text-[13px] text-white">
            <Zap size={14} className="text-[#FF6B00]" /> Real-time Sync
          </div>

          <div className="absolute bottom-[160px] left-[5%] z-40 animate-float-slow bg-black/40 backdrop-blur-md border border-white/10 rounded-full px-4 py-2 flex items-center gap-2 text-[13px] text-white" style={{ animationDelay: '1s' }}>
            <Lock size={14} className="text-[#FF6B00]" /> Secure
          </div>

          <div className="absolute bottom-[120px] right-[5%] z-40 animate-float-medium bg-black/40 backdrop-blur-md border border-white/10 rounded-full px-4 py-2 flex items-center gap-2 text-[13px] text-white" style={{ animationDelay: '2s' }}>
            <Shield size={14} className="text-[#FF6B00]" /> Privacy First
          </div>
        </div>

      </main>

      {/* Bottom Overlays */}
      <div className="absolute bottom-10 left-10 z-50 flex flex-col items-start max-w-[280px]">
        <div className="flex gap-2 mb-4">
          <span className="border border-white/20 rounded-full px-4 py-1.5 text-[12px] font-medium">Fast</span>
          <span className="border border-white/20 rounded-full px-4 py-1.5 text-[12px] font-medium">Minimal</span>
        </div>
        <h3 className="text-[20px] font-semibold mb-2 leading-tight">From your brain to the canvas.</h3>
        <p className="text-[13px] text-[#A0A0A0] leading-relaxed">
          Note-taking made effortless. Fuel your creativity and free your time.
        </p>
      </div>

      <div className="absolute bottom-10 right-10 z-50">
        <Link 
          to="/auth" 
          className="flex items-center gap-2 bg-[#FF6B00] hover:bg-[#FF8C2A] text-white px-8 py-4 rounded-xl text-[16px] font-bold transition-all hover:scale-105"
        >
          Start Writing <ArrowRight size={20} />
        </Link>
      </div>

      {/* Right side navigation dots */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-50 hidden md:flex">
        <div className="w-[3px] h-[16px] bg-[#FF6B00] rounded-full" />
        <div className="w-[3px] h-[16px] bg-white/20 rounded-full" />
        <div className="w-[3px] h-[16px] bg-white/20 rounded-full" />
        <div className="w-[3px] h-[16px] bg-white/20 rounded-full" />
      </div>

    </div>
  );
}

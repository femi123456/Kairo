import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Zap, Lock, Shield, ArrowRight, Menu, X } from 'lucide-react';
import { motion, useScroll, useTransform, useMotionTemplate } from 'framer-motion';

export default function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 400], [1, 0.95]);
  const heroBlur = useTransform(scrollY, [0, 400], [0, 8]);
  const filter = useMotionTemplate`blur(${heroBlur}px)`;

  return (
    <div className="bg-[#050505] text-white font-['Inter'] relative selection:bg-[#FF6B00] selection:text-white">
      
      {/* Sticky Hero Section */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <motion.div 
          className="w-full h-full relative flex flex-col"
          style={{ opacity: heroOpacity, scale: heroScale, filter }}
        >
          {/* Background Grid */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage: 'linear-gradient(to right, #333 1px, transparent 1px), linear-gradient(to bottom, #333 1px, transparent 1px)',
              backgroundSize: '60px 60px'
            }}
          />

          {/* Background glow effects */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#FF6B00] rounded-full blur-[150px] opacity-[0.07] pointer-events-none" />

          {/* Navbar */}
          <nav className="relative z-[1000] flex items-center justify-between px-6 py-6 max-w-7xl mx-auto w-full">
            <div className="flex items-center gap-1">
              <div className="font-['Arial_Black',sans-serif] text-[24px] leading-none tracking-widest uppercase">
                <span className="text-white">KAI</span>
                <span className="text-[#FF6B00]">RO</span>
              </div>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-6">
              <Link to="/features" className="text-[#A0A0A0] text-[14px] hover:text-white transition-colors">
                Features
              </Link>
              <Link to="/auth?mode=signup" className="text-[#A0A0A0] text-[14px] hover:text-white transition-colors">
                New writer?
              </Link>
              <Link 
                to="/auth" 
                className="flex items-center gap-2 bg-[#FF6B00] hover:bg-[#FF8C2A] text-white px-5 py-2.5 rounded-full text-[14px] font-semibold transition-colors"
              >
                Go to App <ArrowRight size={16} />
              </Link>
            </div>

            {/* Mobile Hamburger Button */}
            <button 
              className="md:hidden text-white p-2 z-[1000]" 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </nav>

          {/* Mobile Menu Overlay */}
          {isMobileMenuOpen && (
            <div className="md:hidden fixed top-[80px] left-0 w-full h-[calc(100vh-80px)] bg-[#050505]/95 backdrop-blur-xl z-[900] flex flex-col items-center justify-center gap-8">
              <Link to="/features" onClick={() => setIsMobileMenuOpen(false)} className="text-white text-3xl font-semibold tracking-tight">
                Features
              </Link>
              <Link to="/auth?mode=signup" onClick={() => setIsMobileMenuOpen(false)} className="text-white text-3xl font-semibold tracking-tight">
                New writer?
              </Link>
              <Link 
                to="/auth" 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="flex items-center gap-2 bg-[#FF6B00] hover:bg-[#FF8C2A] text-white px-8 py-4 rounded-full text-xl font-bold transition-all shadow-[0_10px_20px_rgba(255,107,0,0.3)]"
              >
                Go to App <ArrowRight size={20} />
              </Link>
            </div>
          )}

          {/* Hero Content */}
          <div className="flex-1 w-full relative flex flex-col items-center justify-center pb-20 px-4 text-center">
            
            <p className="text-[14px] font-medium text-[#A0A0A0] mb-6 flex items-center justify-center gap-2">
              Your Workspace 
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FF6B00" stroke="#FF8C2A" strokeWidth="1" className="w-4 h-4 mt-0.5">
                <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
                <path d="m15 5 4 4" stroke="#FFF" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
                <path d="m11 9 4 4" stroke="#FFF" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
              </svg>
            </p>
            
            <h1 className="text-[40px] sm:text-[52px] md:text-[84px] font-bold leading-[1.05] tracking-tight max-w-[900px]">
              THINK clearly, WRITE<br className="hidden sm:block" />
              beautifully, WORK together.
            </h1>
          </div>
        </motion.div>
      </div>

      {/* Next Section (Slides naturally over sticky hero) */}
      <div className="relative z-10 w-full min-h-screen bg-[#080808] border-t border-white/5 flex items-center justify-center py-32">
        {/* 3D Glass Bowl & Pencil Visual */}
        <div className="relative w-full max-w-[800px] h-[300px] md:h-[400px] flex items-center justify-center mx-auto">
          {/* Glass Bowl Container */}
          <div className="absolute bottom-0 w-[85%] sm:w-[500px] h-[160px] md:h-[200px] bg-white/5 backdrop-blur-2xl border border-white/10 rounded-b-[100px] rounded-t-[20px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-20 flex items-center justify-center overflow-visible">
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
          <div className="absolute top-[20px] left-[5%] md:left-[10%] z-40 animate-float-medium bg-black/40 backdrop-blur-md border border-white/10 rounded-full px-3 md:px-4 py-1.5 md:py-2 flex items-center gap-1.5 md:gap-2 text-[11px] md:text-[13px] text-white">
            <Sparkles size={14} className="text-[#FF6B00]" /> <span className="hidden sm:inline">AI Assisted</span><span className="sm:hidden">AI</span>
          </div>

          <div className="absolute top-[80px] right-[5%] md:right-[15%] z-40 animate-float-fast bg-black/40 backdrop-blur-md border border-white/10 rounded-full px-3 md:px-4 py-1.5 md:py-2 flex items-center gap-1.5 md:gap-2 text-[11px] md:text-[13px] text-white">
            <Zap size={14} className="text-[#FF6B00]" /> <span className="hidden sm:inline">Real-time Sync</span><span className="sm:hidden">Sync</span>
          </div>

          <div className="absolute bottom-[140px] md:bottom-[160px] left-[2%] md:left-[5%] z-40 animate-float-slow bg-black/40 backdrop-blur-md border border-white/10 rounded-full px-3 md:px-4 py-1.5 md:py-2 flex items-center gap-1.5 md:gap-2 text-[11px] md:text-[13px] text-white" style={{ animationDelay: '1s' }}>
            <Lock size={14} className="text-[#FF6B00]" /> Secure
          </div>

          <div className="absolute bottom-[100px] md:bottom-[120px] right-[2%] md:right-[5%] z-40 animate-float-medium bg-black/40 backdrop-blur-md border border-white/10 rounded-full px-3 md:px-4 py-1.5 md:py-2 flex items-center gap-1.5 md:gap-2 text-[11px] md:text-[13px] text-white" style={{ animationDelay: '2s' }}>
            <Shield size={14} className="text-[#FF6B00]" /> Privacy
          </div>
        </div>

        {/* Bottom Overlays */}
        <div className="absolute bottom-8 md:bottom-10 left-0 w-full px-6 md:px-10 z-[100] flex flex-col-reverse md:flex-row items-center md:items-end justify-between gap-6 md:gap-8">
          <div className="flex flex-col items-center md:items-start max-w-[280px] text-center md:text-left">
            <div className="flex gap-2 mb-4">
              <span className="border border-white/20 rounded-full px-4 py-1.5 text-[12px] font-medium">Fast</span>
              <span className="border border-white/20 rounded-full px-4 py-1.5 text-[12px] font-medium">Minimal</span>
            </div>
            <h3 className="text-[20px] font-semibold mb-2 leading-tight w-full">From your brain to the canvas.</h3>
            <p className="text-[13px] text-[#A0A0A0] leading-relaxed w-full">
              Note-taking made effortless. Fuel your creativity and free your time.
            </p>
          </div>

          <div>
            <Link 
              to="/auth" 
              className="flex items-center gap-2 bg-[#FF6B00] hover:bg-[#FF8C2A] text-white px-8 py-4 rounded-xl text-[16px] font-bold transition-all hover:scale-105 shadow-[0_10px_20px_rgba(255,107,0,0.3)]"
            >
              Start Writing <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

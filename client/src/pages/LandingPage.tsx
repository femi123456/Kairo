import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Zap, Lock, Shield, ArrowRight, Cloud, Smartphone, Laptop } from 'lucide-react';

export default function LandingPage() {
  const [activeSlide, setActiveSlide] = useState(0);
  const isAnimatingRef = useRef(false);

  const changeSlide = (newSlide: number) => {
    isAnimatingRef.current = true;
    setActiveSlide(newSlide);
    setTimeout(() => {
      isAnimatingRef.current = false;
    }, 1000); // 1000ms is the duration of our CSS transition
  };

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (isAnimatingRef.current) return;
      if (Math.abs(e.deltaY) < 40) return;
      
      if (e.deltaY > 0 && activeSlide < 1) {
        changeSlide(1);
      } else if (e.deltaY < 0 && activeSlide > 0) {
        changeSlide(0);
      }
    };

    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };
    const handleTouchEnd = (e: TouchEvent) => {
      if (isAnimatingRef.current) return;
      const touchEndY = e.changedTouches[0].clientY;
      const deltaY = touchStartY - touchEndY;
      if (Math.abs(deltaY) < 40) return;
      
      if (deltaY > 0 && activeSlide < 1) {
        changeSlide(1);
      } else if (deltaY < 0 && activeSlide > 0) {
        changeSlide(0);
      }
    };

    window.addEventListener('wheel', handleWheel);
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [activeSlide]);

  return (
    <div className="h-screen w-screen bg-[#050505] text-white font-['Inter'] overflow-hidden selection:bg-[#FF6B00] selection:text-white relative">
      
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#FF6B00] rounded-full blur-[150px] opacity-[0.07] pointer-events-none" />

      {/* Navbar (Static, stays on top) */}
      <nav className="absolute top-0 w-full z-[100] flex items-center justify-between px-6 py-6 max-w-7xl mx-auto left-1/2 -translate-x-1/2">
        <div className="flex items-center gap-1">
          <div className="font-['Georgia'] text-[24px] leading-none tracking-tight">
            <span className="text-white font-bold">Kai</span>
            <span className="text-[#FF6B00] font-bold">ro</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <Link to="/auth?mode=signup" className="hidden md:block text-[#A0A0A0] text-[14px] hover:text-white transition-colors">
            New writer?
          </Link>
          <Link 
            to="/auth" 
            className="flex items-center gap-2 bg-[#FF6B00] hover:bg-[#FF8C2A] text-white px-5 py-2.5 rounded-full text-[14px] font-semibold transition-colors"
          >
            Go to App <ArrowRight size={16} />
          </Link>
        </div>
      </nav>

      {/* Slide Containers */}
      <div 
        className="w-full h-full relative transition-transform duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)]"
        style={{ transform: `translateY(-${activeSlide * 100}vh)` }}
      >
        
        {/* SLIDE 0 */}
        <div className="w-full h-screen relative flex flex-col items-center justify-center pt-20 pb-32 px-4 text-center">
          <div 
            className={`transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] ${activeSlide === 0 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-20 scale-95'}`}
          >
            <p className="text-[14px] font-medium text-[#A0A0A0] mb-6 flex items-center justify-center gap-2">
              Your Workspace <span className="text-xl">🌱</span>
            </p>
            
            <h1 className="text-[52px] md:text-[84px] font-bold leading-[1.05] tracking-tight max-w-[900px] mb-16">
              THINK clearly, WRITE<br />
              beautifully, WORK together.
            </h1>

            {/* 3D Glass Bowl & Pencil Visual */}
            <div className="relative w-full max-w-[800px] h-[400px] flex items-center justify-center mt-10 mx-auto">
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
          </div>
        </div>

        {/* SLIDE 1 */}
        <div className="w-full h-screen relative flex flex-col items-center justify-center pt-20 pb-32 px-4 text-center">
          <div 
            className={`transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] ${activeSlide === 1 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-20 scale-95'}`}
          >
            <p className="text-[14px] font-medium text-[#A0A0A0] mb-6 flex items-center justify-center gap-2">
              Cross Platform ⚡
            </p>
            
            <h1 className="text-[52px] md:text-[84px] font-bold leading-[1.05] tracking-tight max-w-[900px] mb-16">
              Your Second Brain,<br />
              Synced Everywhere.
            </h1>

            {/* Isometric Stack Visual */}
            <div className="relative w-full max-w-[800px] h-[400px] flex items-center justify-center mt-10 mx-auto" style={{ perspective: '1000px' }}>
              
              {/* Stack 1 (Bottom) */}
              <div 
                className="absolute top-[180px] w-[400px] h-[250px] bg-[#111111]/80 backdrop-blur-xl border border-white/5 rounded-2xl shadow-2xl animate-float-medium flex items-center justify-center"
                style={{ transform: 'rotateX(60deg) rotateZ(45deg) translateX(-48px)' }}
              >
                <Laptop size={64} className="text-white/10" style={{ transform: 'rotateZ(-45deg) rotateX(-60deg)' }} />
              </div>

              {/* Stack 2 (Middle) */}
              <div 
                className="absolute top-[120px] w-[400px] h-[250px] bg-[#1a1a1a]/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl animate-float-slow flex items-center justify-center" 
                style={{ animationDelay: '1s', transform: 'rotateX(60deg) rotateZ(45deg) translateX(0px)' }}
              >
                <Smartphone size={64} className="text-[#FF6B00]/20" style={{ transform: 'rotateZ(-45deg) rotateX(-60deg)' }} />
              </div>

              {/* Stack 3 (Top) */}
              <div 
                className="absolute top-[60px] w-[400px] h-[250px] bg-[#222]/80 backdrop-blur-xl border border-[#FF6B00]/30 rounded-2xl shadow-[0_30px_60px_rgba(255,107,0,0.15)] animate-float-fast flex flex-col items-center justify-center p-8 text-left" 
                style={{ animationDelay: '0.5s', transform: 'rotateX(60deg) rotateZ(45deg) translateX(48px)' }}
              >
                <div style={{ transform: 'rotateZ(-45deg) rotateX(-60deg)' }} className="flex flex-col items-center w-full">
                  <Cloud size={48} className="text-[#FF6B00] mb-4 drop-shadow-[0_0_15px_rgba(255,107,0,0.5)]" />
                  <div className="w-full h-3 bg-white/10 rounded-full mb-3" />
                  <div className="w-3/4 h-3 bg-white/10 rounded-full mb-3" />
                  <div className="w-5/6 h-3 bg-white/10 rounded-full" />
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* Bottom Overlays - Crossfade based on slide */}
      <div className="absolute bottom-10 left-10 z-[100] flex flex-col items-start max-w-[280px]">
        {/* Overlay Slide 0 */}
        <div className={`absolute bottom-0 left-0 w-full transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] ${activeSlide === 0 ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
          <div className="flex gap-2 mb-4">
            <span className="border border-white/20 rounded-full px-4 py-1.5 text-[12px] font-medium">Fast</span>
            <span className="border border-white/20 rounded-full px-4 py-1.5 text-[12px] font-medium">Minimal</span>
          </div>
          <h3 className="text-[20px] font-semibold mb-2 leading-tight w-[300px]">From your brain to the canvas.</h3>
          <p className="text-[13px] text-[#A0A0A0] leading-relaxed w-[300px]">
            Note-taking made effortless. Fuel your creativity and free your time.
          </p>
        </div>

        {/* Overlay Slide 1 */}
        <div className={`absolute bottom-0 left-0 w-full transition-all duration-700 delay-300 ease-[cubic-bezier(0.25,1,0.5,1)] ${activeSlide === 1 ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
          <div className="flex gap-2 mb-4">
            <span className="border border-[#FF6B00]/40 text-[#FF6B00] bg-[#FF6B00]/10 rounded-full px-4 py-1.5 text-[12px] font-medium whitespace-nowrap">Lightning Fast</span>
            <span className="border border-white/20 rounded-full px-4 py-1.5 text-[12px] font-medium whitespace-nowrap">Cloud Sync</span>
          </div>
          <h3 className="text-[20px] font-semibold mb-2 leading-tight w-[300px]">Always up to date.</h3>
          <p className="text-[13px] text-[#A0A0A0] leading-relaxed w-[300px]">
            Start writing on your laptop, finish on your phone. Kairo syncs instantly across all your devices.
          </p>
        </div>
      </div>

      <div className="absolute bottom-10 right-10 z-[100]">
        <Link 
          to="/auth" 
          className="flex items-center gap-2 bg-[#FF6B00] hover:bg-[#FF8C2A] text-white px-8 py-4 rounded-xl text-[16px] font-bold transition-all hover:scale-105 shadow-[0_10px_20px_rgba(255,107,0,0.3)]"
        >
          Start Writing <ArrowRight size={20} />
        </Link>
      </div>

    </div>
  );
}

import { useRef } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Mic, Bot, Focus, Zap, Lock, Share2, ArrowRight } from 'lucide-react';

const FEATURES = [
  {
    id: 0,
    title: 'Voice-to-Text',
    desc: 'Speak your thoughts and let AI perfectly transcribe and format them into beautiful Markdown.',
    Icon: Mic
  },
  {
    id: 1,
    title: 'Chat with Notes',
    desc: 'Ask questions and instantly get intelligent answers based on the complete context of your workspace.',
    Icon: Bot
  },
  {
    id: 2,
    title: 'Zen Focus Mode',
    desc: 'Eliminate all distractions and immerse yourself in deep work with curated ambient soundscapes.',
    Icon: Focus
  },
  {
    id: 3,
    title: 'Real-time Sync',
    desc: 'Your creative process never stops. Collaborate with yourself seamlessly across all your devices.',
    Icon: Zap
  },
  {
    id: 4,
    title: 'Secure & Private',
    desc: 'Your ideas belong to you. Every note is encrypted and accessible only by your account.',
    Icon: Lock
  },
  {
    id: 5,
    title: 'Public Sharing',
    desc: 'Generate a stunning public link to share your knowledge and writing with the world.',
    Icon: Share2
  }
];

function FeatureItem({ feature, index, progress }: { feature: typeof FEATURES[0], index: number, progress: MotionValue<number> }) {
  const start = index / 6;
  const end = (index + 1) / 6;
  const center = (start + end) / 2;

  // Widen the visible range slightly for smooth overlaps
  const opacity = useTransform(progress, [start - 0.05, center, end + 0.05], [0, 1, 0]);
  const scale = useTransform(progress, [start - 0.05, center, end + 0.05], [0.8, 1, 0.8]);
  const y = useTransform(progress, [start - 0.05, center, end + 0.05], [100, 0, -100]);
  const textY = useTransform(progress, [start - 0.05, center, end + 0.05], [50, 0, -50]);

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center z-30 pointer-events-none"
      style={{ opacity }}
    >
      {/* Text Area */}
      <motion.div style={{ y: textY }} className="absolute top-[20%] md:top-[25%] flex flex-col items-center text-center max-w-[800px] px-6">
        <h2 className="text-[40px] md:text-[72px] font-bold leading-[1.05] tracking-tight mb-6">{feature.title}</h2>
        <p className="text-[18px] md:text-[22px] text-[#A0A0A0] leading-relaxed max-w-[600px]">{feature.desc}</p>
      </motion.div>

      {/* Floating Icon over the Bowl */}
      <motion.div style={{ scale, y }} className="absolute bottom-[160px] md:bottom-[200px] z-30 flex items-center justify-center w-full">
        <feature.Icon 
          className="w-32 h-32 md:w-48 md:h-48 text-[#FF6B00]" 
          style={{ filter: 'drop-shadow(0 0 40px rgba(255,107,0,0.6))' }} 
        />
      </motion.div>
    </motion.div>
  );
}

export default function FeaturesPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ 
    target: containerRef,
    offset: ["start start", "end end"]
  });

  return (
    <div className="bg-[#050505] text-white font-['Inter'] relative selection:bg-[#FF6B00] selection:text-white" ref={containerRef}>
      
      {/* 600vh height to allow scrolling through 6 items */}
      <div className="h-[600vh] w-full">
        {/* Sticky viewport */}
        <div className="sticky top-0 h-screen w-full flex flex-col overflow-hidden">
          
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
          <nav className="relative z-[100] flex items-center justify-between px-6 py-6 max-w-7xl mx-auto w-full">
            <Link to="/" className="flex items-center gap-1">
              <div className="font-['Arial_Black',sans-serif] text-[24px] leading-none tracking-widest uppercase">
                <span className="text-white">KAI</span>
                <span className="text-[#FF6B00]">RO</span>
              </div>
            </Link>

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

          {/* Interactive Center Content */}
          <div className="flex-1 w-full relative flex items-center justify-center">
            
            {/* The Static Glass Bowl at the bottom */}
            <div className="absolute bottom-0 w-[85%] sm:w-[500px] h-[160px] md:h-[200px] bg-white/5 backdrop-blur-2xl border border-white/10 rounded-b-[100px] rounded-t-[20px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-20 flex items-center justify-center overflow-visible">
              <div className="absolute top-0 w-full h-[40px] border-t border-white/20 rounded-full" />
              <div className="absolute bottom-4 w-[200px] h-[20px] bg-[#FF6B00] blur-[40px] opacity-40 rounded-full" />
            </div>

            {/* Feature Animations */}
            {FEATURES.map((feature, i) => (
              <FeatureItem 
                key={feature.id} 
                feature={feature} 
                index={i} 
                progress={scrollYProgress} 
              />
            ))}

            {/* Scroll Indicator */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50 animate-bounce z-50">
              <span className="text-[12px] uppercase tracking-widest font-semibold">Scroll</span>
              <div className="w-[1px] h-8 bg-white/50" />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

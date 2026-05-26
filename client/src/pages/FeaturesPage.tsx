import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const FEATURES = [
  {
    id: 0,
    title: 'Voice-to-Text',
    desc: 'Speak your thoughts and let AI perfectly transcribe and format them into beautiful Markdown.',
    Svg: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FF6B00" stroke="#FF8C2A" strokeWidth="1" className="w-48 h-48 drop-shadow-[0_10px_20px_rgba(255,107,0,0.4)]" style={{ filter: 'drop-shadow(0 0 20px rgba(255,107,0,0.4))' }}>
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="#FFF" strokeWidth="2" strokeLinecap="round" opacity="0.5" fill="none" />
        <line x1="12" x2="12" y1="19" y2="22" stroke="#FFF" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
      </svg>
    )
  },
  {
    id: 1,
    title: 'Chat with Notes',
    desc: 'Ask questions and instantly get intelligent answers based on the complete context of your workspace.',
    Svg: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FF6B00" stroke="#FF8C2A" strokeWidth="1" className="w-48 h-48 drop-shadow-[0_10px_20px_rgba(255,107,0,0.4)]" style={{ filter: 'drop-shadow(0 0 20px rgba(255,107,0,0.4))' }}>
        <rect width="18" height="18" x="3" y="3" rx="4" />
        <path d="M8 9h8" stroke="#FFF" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
        <path d="M8 13h6" stroke="#FFF" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
      </svg>
    )
  },
  {
    id: 2,
    title: 'Zen Focus Mode',
    desc: 'Eliminate all distractions and immerse yourself in deep work with curated ambient soundscapes.',
    Svg: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FF6B00" stroke="#FF8C2A" strokeWidth="1" className="w-48 h-48 drop-shadow-[0_10px_20px_rgba(255,107,0,0.4)]" style={{ filter: 'drop-shadow(0 0 20px rgba(255,107,0,0.4))' }}>
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" stroke="#FFF" strokeWidth="2" opacity="0.5" fill="none" />
        <circle cx="12" cy="12" r="2" stroke="#FFF" strokeWidth="2" opacity="0.3" fill="none" />
      </svg>
    )
  },
  {
    id: 3,
    title: 'Real-time Sync',
    desc: 'Your creative process never stops. Collaborate with yourself seamlessly across all your devices.',
    Svg: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FF6B00" stroke="#FF8C2A" strokeWidth="1" className="w-48 h-48 drop-shadow-[0_10px_20px_rgba(255,107,0,0.4)]" style={{ filter: 'drop-shadow(0 0 20px rgba(255,107,0,0.4))' }}>
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="#FFF" strokeWidth="2" strokeLinejoin="round" opacity="0.5" fill="none" />
      </svg>
    )
  },
  {
    id: 4,
    title: 'Secure & Private',
    desc: 'Your ideas belong to you. Every note is encrypted and accessible only by your account.',
    Svg: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FF6B00" stroke="#FF8C2A" strokeWidth="1" className="w-48 h-48 drop-shadow-[0_10px_20px_rgba(255,107,0,0.4)]" style={{ filter: 'drop-shadow(0 0 20px rgba(255,107,0,0.4))' }}>
        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="#FFF" strokeWidth="2" strokeLinecap="round" opacity="0.5" fill="none" />
      </svg>
    )
  },
  {
    id: 5,
    title: 'Public Sharing',
    desc: 'Generate a stunning public link to share your knowledge and writing with the world.',
    Svg: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FF6B00" stroke="#FF8C2A" strokeWidth="1" className="w-48 h-48 drop-shadow-[0_10px_20px_rgba(255,107,0,0.4)]" style={{ filter: 'drop-shadow(0 0 20px rgba(255,107,0,0.4))' }}>
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <line x1="8.59" x2="15.42" y1="13.51" y2="17.49" stroke="#FFF" strokeWidth="2" opacity="0.5" />
        <line x1="15.41" x2="8.59" y1="6.51" y2="10.49" stroke="#FFF" strokeWidth="2" opacity="0.3" />
      </svg>
    )
  }
];

export default function FeaturesPage() {
  return (
    <div className="bg-[#050505] text-white font-['Inter'] relative selection:bg-[#FF6B00] selection:text-white min-h-screen">
      
      {/* Background Grid */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-20 z-0"
        style={{
          backgroundImage: 'linear-gradient(to right, #333 1px, transparent 1px), linear-gradient(to bottom, #333 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }}
      />

      {/* Navbar */}
      <nav className="fixed top-0 z-[100] flex items-center justify-between px-6 py-6 w-full backdrop-blur-md bg-[#050505]/50 border-b border-white/5">
        <Link to="/" className="flex items-center gap-1">
          <div className="font-['Arial_Black',sans-serif] text-[24px] leading-none tracking-widest uppercase">
            <span className="text-white">KAI</span>
            <span className="text-[#FF6B00]">RO</span>
          </div>
        </Link>
        <div className="flex items-center gap-6">
          <Link to="/auth" className="flex items-center gap-2 bg-[#FF6B00] hover:bg-[#FF8C2A] text-white px-5 py-2.5 rounded-full text-[14px] font-semibold transition-colors">
            Go to App <ArrowRight size={16} />
          </Link>
        </div>
      </nav>

      {/* Scrollable Features Content */}
      <div className="relative z-10 flex flex-col w-full">
        {FEATURES.map((feature, i) => {
          // Alternate the layout between Left-Image and Right-Image
          const isEven = i % 2 === 0;
          return (
            <motion.div 
              key={feature.id}
              initial={{ opacity: 0, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.4 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={`w-full min-h-screen flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} items-center justify-center gap-16 md:gap-32 px-8 border-b border-white/5 last:border-b-0 py-32`}
            >
              {/* Image Side */}
              <motion.div 
                whileHover={{ scale: 1.05, rotate: isEven ? 5 : -5 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="flex-1 flex justify-center items-center"
              >
                {feature.Svg}
              </motion.div>

              {/* Text Side */}
              <div className="flex-1 flex flex-col justify-center max-w-xl text-center md:text-left">
                <h2 className="text-[48px] md:text-[64px] font-bold leading-[1.1] mb-6 tracking-tight">
                  {feature.title}
                </h2>
                <p className="text-[20px] md:text-[24px] text-[#A0A0A0] leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

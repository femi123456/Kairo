import { useRef } from 'react';
import { motion, useScroll, useTransform, useMotionTemplate } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const FEATURES = [
  {
    id: 0,
    title: 'Voice-to-Text',
    desc: 'Speak your thoughts and let AI perfectly transcribe and format them into beautiful Markdown.',
    moreText: "Stop typing and start thinking out loud. Our intelligent AI doesn't just transcribe your words—it understands your context, automatically formatting headers, bullet points, and code snippets on the fly. It's like having a professional editor instantly organizing your brainstorms into polished documents.",
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
    moreText: "Never lose a great idea again. By leveraging advanced RAG (Retrieval-Augmented Generation), Kairo AI reads through all your past notes, journals, and snippets to answer your questions. It turns your scattered thoughts into a unified, queryable second brain.",
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
    moreText: "Writing requires unbroken concentration. Zen Mode strips away the UI, leaving only you and your words. With integrated high-quality ambient tracks—from lofi beats to rainy soundscapes—you can instantly drop into a flow state and stay there for hours.",
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
    moreText: "Start a note on your phone during your commute, and finish it on your laptop when you get to the office. Our blazing-fast WebSocket architecture ensures that every keystroke is instantly synced to the cloud, so you're always picking up exactly where you left off.",
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
    moreText: "We believe privacy is a fundamental human right. Kairo uses industry-standard encryption to ensure that your private thoughts, novel drafts, and business ideas remain strictly yours. We don't train our models on your personal data.",
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
    moreText: "When you're ready to publish, Kairo makes it effortless. One click generates a beautiful, read-only webpage for your note. Share it on social media, send it to a colleague, or use it as a minimalist blog post—no setup required.",
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

function FeatureSection({ feature, index, isLast }: { feature: typeof FEATURES[0], index: number, isLast: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  
  // Track scroll progress of THIS section.
  // When it starts to get covered by the NEXT section, scrollYProgress goes from 0 -> 0.5.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);
  const blur = useTransform(scrollYProgress, [0, 0.5], [0, 8]);
  const filter = useMotionTemplate`blur(${blur}px)`;

  const isEven = index % 2 === 0;

  return (
    <div 
      ref={ref} 
      className={`relative w-full ${isLast ? 'h-screen' : 'h-[200vh]'} bg-[#050505]`} 
      style={{ 
        zIndex: index * 10,
        marginTop: index > 0 ? '-100vh' : '0' 
      }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden border-t border-white/5 bg-[#050505]">
        {/* Background Grid */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-20 z-0"
          style={{
            backgroundImage: 'linear-gradient(to right, #333 1px, transparent 1px), linear-gradient(to bottom, #333 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }}
        />

        <motion.div 
          className={`w-full h-full relative z-10 flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} items-center justify-center gap-16 md:gap-32 px-8 pt-20`}
          style={{ opacity, scale, filter }}
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
            <p className="text-[20px] md:text-[24px] font-medium text-[#F0F0F0] leading-relaxed mb-6">
              {feature.desc}
            </p>
            <p className="text-[16px] md:text-[18px] text-[#A0A0A0] leading-relaxed">
              {feature.moreText}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function FeaturesPage() {
  return (
    <div className="bg-[#050505] text-white font-['Inter'] relative selection:bg-[#FF6B00] selection:text-white">
      
      {/* Navbar */}
      <nav className="fixed top-0 z-[1000] flex items-center justify-between px-6 py-6 w-full backdrop-blur-md bg-[#050505]/50 border-b border-white/5">
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

      {/* Stacked Parallax Feature Sections */}
      <div className="relative w-full">
        {FEATURES.map((feature, i) => (
          <FeatureSection 
            key={feature.id} 
            feature={feature} 
            index={i} 
            isLast={i === FEATURES.length - 1} 
          />
        ))}
      </div>
    </div>
  );
}

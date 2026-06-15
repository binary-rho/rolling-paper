import { motion } from "motion/react";

interface HeroBannerProps {
  memoCount: number;
  onWriteClick: () => void;
}

const FLOATING_EMOJIS = ["🎉", "🌟", "💐", "✨", "🎊", "💪", "🌸", "🥂"];

export function HeroBanner({ memoCount, onWriteClick }: HeroBannerProps) {
  return (
    <section
      className="relative w-full overflow-hidden flex flex-col items-center justify-center"
      style={{
        minHeight: "88vh",
        background:
          "linear-gradient(160deg, #0C0C0C 0%, #120008 50%, #0C0C0C 100%)",
      }}
    >
      {/* Dot grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Magenta glow blob */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: "600px",
          height: "600px",
          background:
            "radial-gradient(circle, rgba(230,0,126,0.15) 0%, transparent 70%)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          filter: "blur(40px)",
        }}
      />

      {/* Floating emoji decorations */}
      {FLOATING_EMOJIS.map((emoji, i) => (
        <motion.div
          key={i}
          className="absolute pointer-events-none select-none"
          style={{
            fontSize: `${20 + (i % 3) * 10}px`,
            left: `${8 + i * 11}%`,
            top: `${10 + (i % 4) * 20}%`,
            opacity: 0.55,
          }}
          animate={{
            y: [0, -10, 0],
            rotate: [-5, 5, -5],
          }}
          transition={{
            duration: 3 + i * 0.4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.3,
          }}
        >
          {emoji}
        </motion.div>
      ))}

      {/* Top label */}
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6 }}
        className="uppercase tracking-[0.25em] text-[11px] mb-6"
        style={{ color: "#E6007E", fontFamily: "'Noto Sans KR', sans-serif" }}
      >
        Rolling Paper ✦ 2026
      </motion.p>

      {/* Main heading */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="text-center relative"
      >
        <h1
          className="leading-none tracking-tight"
          style={{
            fontFamily: "'Black Han Sans', sans-serif",
            fontSize: "clamp(52px, 10vw, 120px)",
            color: "#F0F0F0",
            letterSpacing: "-0.02em",
          }}
        >
          감사했습니다,
        </h1>
        <h1
          className="leading-none"
          style={{
            fontFamily: "'Black Han Sans', sans-serif",
            fontSize: "clamp(56px, 11vw, 132px)",
            letterSpacing: "-0.02em",
            background: "linear-gradient(135deg, #E6007E 0%, #FF6B9D 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          팀장님 ✦
        </h1>
      </motion.div>

      {/* Divider line */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.5, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="my-8"
        style={{
          width: "clamp(200px, 30vw, 400px)",
          height: "2px",
          background:
            "linear-gradient(90deg, transparent, #E6007E, transparent)",
          transformOrigin: "center",
        }}
      />

      {/* Description card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="max-w-lg mx-auto px-8 text-center mb-10"
      >
        <p
          className="leading-relaxed"
          style={{
            color: "rgba(240,240,240,0.65)",
            fontFamily: "'Noto Sans KR', sans-serif",
            fontSize: "16px",
            fontWeight: 300,
            wordBreak: "keep-all",
          }}
        >
          항상 따뜻하게 이끌어 주셔서 감사합니다.
          <br />
          팀장님이 걸어가시는 새로운 길 위에도 늘 행복이 가득하길 바랍니다. 🌸
        </p>
      </motion.div>

      {/* Memo count + CTA */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.75, duration: 0.5 }}
        className="flex flex-col items-center gap-4"
      >
        <p
          style={{
            color: "rgba(240,240,240,0.4)",
            fontFamily: "'Noto Sans KR', sans-serif",
            fontSize: "13px",
          }}
        >
          지금까지{" "}
          <span style={{ color: "#E6007E", fontWeight: 700 }}>
            {memoCount}명
          </span>
          이 마음을 전했어요
        </p>

        <button
          onClick={onWriteClick}
          className="group relative px-8 py-4 rounded-full flex items-center gap-2.5 transition-all overflow-hidden"
          style={{
            background: "#E6007E",
            fontFamily: "'Noto Sans KR', sans-serif",
            fontSize: "15px",
            fontWeight: 700,
            color: "#FFF",
            letterSpacing: "0.03em",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform =
              "scale(1.05)";
            (e.currentTarget as HTMLButtonElement).style.boxShadow =
              "0 0 32px rgba(230,0,126,0.6)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
          }}
        >
          <span>✏</span>
          <span>나도 메모 남기기</span>
        </button>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      >
        <p
          className="text-[10px] uppercase tracking-widest"
          style={{
            color: "rgba(240,240,240,0.25)",
            fontFamily: "'Noto Sans KR', sans-serif",
          }}
        >
          scroll
        </p>
        <div
          style={{
            width: "1px",
            height: "32px",
            background:
              "linear-gradient(to bottom, rgba(230,0,126,0.6), transparent)",
          }}
        />
      </motion.div>
    </section>
  );
}

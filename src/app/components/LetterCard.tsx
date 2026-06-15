import { motion } from "motion/react";

interface LetterCardProps {
  memoCount: number;
}

export function LetterCard({ memoCount }: LetterCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: "relative",
        margin: "5vw auto 0",
        width: "min(440px, 92vw)",
        zIndex: 10,
        pointerEvents: "auto",
        cursor: "default",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: "6px",
          padding: "36px 32px 30px",
          boxShadow:
            "0 1px 2px rgba(0,0,0,0.04), 0 6px 16px rgba(0,0,0,0.06), 0 24px 48px rgba(0,0,0,0.08)",
          position: "relative",
        }}
      >
        {/* Top metadata row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "28px",
          }}
        >
          <div>
            <p
              style={{
                fontFamily: "'Noto Sans KR', sans-serif",
                fontSize: "10px",
                color: "#BBBBBB",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                marginBottom: "4px",
              }}
            >
              From
            </p>
            <p
              style={{
                fontFamily: "'Noto Sans KR', sans-serif",
                fontSize: "15px",
                color: "#1A1A1A",
                fontWeight: 500,
                letterSpacing: "0.01em",
              }}
            >
              디지털플랫폼개발랩
            </p>
          </div>

          {/* Right: dates */}
          <div style={{ textAlign: "right" }}>
            <p
              style={{
                fontFamily: "'Noto Sans KR', sans-serif",
                fontSize: "10px",
                color: "#BBBBBB",
                letterSpacing: "0.1em",
                marginBottom: "4px",
                textTransform: "uppercase",
              }}
            >
              마지막 날
            </p>
            <p
              style={{
                fontFamily: "'Noto Sans KR', sans-serif",
                fontSize: "14px",
                color: "#1A1A1A",
                fontWeight: 500,
                letterSpacing: "0.03em",
              }}
            >
              2025. 06. 30
            </p>
          </div>
        </div>

        {/* Main type */}
        <p
          style={{
            fontFamily: "'Noto Sans KR', sans-serif",
            fontSize: "16px",
            color: "#888888",
            letterSpacing: "0.01em",
            lineHeight: 1.2,
            marginBottom: "12px",
            fontWeight: 400,
          }}
        >
          감사했습니다,
        </p>
        <h1
          style={{
            fontFamily: "'Noto Sans KR', sans-serif",
            fontWeight: 700,
            fontSize: "clamp(20px, 3vw, 32px)",
            color: "#0F0F0F",
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            marginBottom: "16px",
          }}
        >
          디지털FE팀 박형윤님
        </h1>

        {/* Magenta rule */}
        <div
          style={{
            width: "100%",
            height: "1.5px",
            background: "#E6007E",
            marginBottom: "20px",
          }}
        />

        {/* Body — editable length */}
        <p
          style={{
            fontFamily: "'Noto Sans KR', sans-serif",
            fontSize: "13.5px",
            color: "#777777",
            lineHeight: 2,
            wordBreak: "keep-all",
            marginBottom: "24px",
            fontWeight: 300,
          }}
        >
          디지털플랫폼개발랩과 함께해 주신 소중한 시간에 진심으로 감사드립니다.
          팀장님의 따뜻한 리더십과 깊은 통찰 덕분에 저희 모두가 한 뼘씩 성장할
          수 있었습니다. 앞으로 걸어가실 새로운 길 위에도 언제나 좋은 일들만
          가득하시길, 그리고 저희가 배운 것들을 잊지 않고 더 잘
          해나가겠습니다.디지털플랫폼개발랩과 함께해 주신 소중한 시간에 진심으로
          감사드립니다. 팀장님의 따뜻한 리더십과 깊은 통찰 덕분에 저희 모두가 한
          뼘씩 성장할 수 있었습니다. 앞으로 걸어가실 새로운 길 위에도 언제나
          좋은 일들만 가득하시길, 그리고 저희가 배운 것들을 잊지 않고 더 잘
          해나가겠습니다. 팀장님의 따뜻한 리더십과 깊은 통찰 덕분에 저희 모두가
          한 뼘씩 성장할 수 있었습니다. 앞으로 걸어가실 새로운 길 위에도 언제나
          좋은 일들만 가득하시길, 그리고 저희가 배운 것들을 잊지 않고 더 잘
          해나가겠습니다.디지털플랫폼개발랩과 함께해 주신 소중한 시간에 진심으로
          감사드립니다. 팀장님의 따뜻한 리더십과 깊은 통찰 덕분에 저희 모두가 한
          뼘씩 성장할 수 있었습니다. 앞으로 걸어가실 새로운 길 위에도 언제나
          좋은 일들만 가득하시길, 그리고 저희가 배운 것들을 잊지 않고 더 잘
          해나가겠습니다.
        </p>

        {/* Count */}
        <p
          style={{
            fontFamily: "'Noto Sans KR', sans-serif",
            fontSize: "11px",
            color: "#CCCCCC",
            textAlign: "right",
            letterSpacing: "0.03em",
          }}
        >
          <span style={{ color: "#E6007E", fontWeight: 700 }}>{memoCount}</span>
          명이 함께 마음을 전합니다
        </p>
      </div>
    </motion.div>
  );
}

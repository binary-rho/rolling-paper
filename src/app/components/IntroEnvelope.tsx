import { motion } from "motion/react";

interface IntroEnvelopeProps {
  /** 받는 사람 표시(예: "박형윤 팀장님께"). */
  to: string;
  /** 함께한 사람 수 — 봉투에 작은 카피로 노출. */
  memoCount: number;
  /** 봉투(또는 배경)를 클릭해 입장할 때 호출. */
  onEnter: () => void;
}

const serif = "'Nanum Myeongjo', 'Noto Serif KR', serif";
const GOLD = "#c9a227";

/**
 * 첫 방문 인트로에서 화면 중앙에 띄우는 "편지 봉투" 카드.
 * 닫힌 봉투 모양을 보여주고, 클릭하면 입장(onEnter)한다.
 */
export function IntroEnvelope({ to, memoCount, onEnter }: IntroEnvelopeProps) {
  return (
    <motion.button
      type="button"
      onClick={onEnter}
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4 }}
      style={{
        position: "relative",
        width: "min(340px, 82vw)",
        aspectRatio: "3 / 2",
        border: "none",
        padding: 0,
        cursor: "pointer",
        background: "linear-gradient(180deg, #fffdf7 0%, #fbf3df 100%)",
        borderRadius: "8px",
        boxShadow:
          "0 0 60px rgba(255,235,180,0.35), 0 24px 60px rgba(0,0,0,0.45)",
        outline: `1px solid ${GOLD}`,
        outlineOffset: "-6px",
        overflow: "hidden",
      }}
    >
      {/* 봉투 뚜껑(삼각형) */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 0,
          height: 0,
          borderLeft: "min(170px, 41vw) solid transparent",
          borderRight: "min(170px, 41vw) solid transparent",
          borderTop: "min(113px, 27vw) solid rgba(201,162,39,0.18)",
        }}
      />
      {/* 뚜껑 가장자리 라인 */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          width: "1px",
          height: "min(113px, 27vw)",
          background: GOLD,
          opacity: 0.35,
          transform: "translateX(-0.5px)",
        }}
      />

      {/* 가운데 왁스 씰 느낌의 원형 배지 */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 35% 30%, #e2bf57 0%, #c9a227 55%, #a9851b 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 10px rgba(0,0,0,0.25)",
        }}
      >
        <span
          style={{
            fontFamily: serif,
            fontWeight: 800,
            fontSize: "18px",
            color: "#fffdf7",
            letterSpacing: "0.02em",
          }}
        >
          U+
        </span>
      </div>

      {/* 하단 카피 */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: "16px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontFamily: serif,
            fontSize: "14px",
            fontWeight: 700,
            color: "#3a2f12",
            letterSpacing: "0.04em",
            marginBottom: "4px",
          }}
        >
          {to}
        </p>
        <p
          style={{
            fontFamily: "'Noto Sans KR', sans-serif",
            fontSize: "11px",
            color: "#9a8541",
            letterSpacing: "0.03em",
          }}
        >
          {memoCount}명의 마음이 도착했어요 · 클릭해서 열어보기
        </p>
      </div>
    </motion.button>
  );
}

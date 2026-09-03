import { motion } from "motion/react";

interface IntroEnvelopeProps {
  /** 받는 사람 표시(예: "가영님께"). */
  to: string;
  /** 함께한 사람 수 — 봉투에 작은 카피로 노출. */
  memoCount: number;
  /** 봉투(또는 배경)를 클릭해 입장할 때 호출. */
  onEnter: () => void;
}

/** 축하장(LetterCard)과 같은 크레용 손글씨 — 봉투를 열면 톤이 이어진다. */
const TITLE_FONT = "'Gaegu', 'Noto Sans KR', sans-serif";
const BODY_FONT = "'Gowun Dodum', 'Noto Sans KR', sans-serif";

/**
 * 봉투 팔레트 — 안에 든 축하장(LetterCard)과 같은 파스텔 핑크 계열로 맞춘다.
 * 봉투를 열면 같은 톤의 카드가 나오도록 색을 이어 준다.
 */
const PAPER = "#FFFBFD";
const PAPER_DEEP = "#FCE4F0";
/** 안쪽 점선 스티치 */
const STITCH_PINK = "rgba(232,150,190,0.55)";
/** 봉투 뚜껑 면 */
const FLAP_PINK = "rgba(232,150,190,0.16)";
/** 뚜껑 사선 라인 */
const FLAP_LINE = "rgba(232,150,190,0.34)";
/** 받는 사람 이름 */
const TITLE_TEXT = "#4A2439";
/** 하단 보조 카피 */
const SUB_TEXT = "#B5789B";

/**
 * 첫 방문 인트로에서 화면 중앙에 띄우는 "편지 봉투" 카드.
 * 닫힌 봉투 모양을 보여주고, 클릭하면 입장(onEnter)한다.
 */
export function IntroEnvelope({ to, memoCount, onEnter }: IntroEnvelopeProps) {
  return (
    <motion.button
      type="button"
      onClick={onEnter}
      initial={{ opacity: 0, y: 18, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -5, scale: 1.015 }}
      style={{
        position: "relative",
        width: "min(690px, 92vw)",
        aspectRatio: "3 / 2",
        border: "none",
        padding: 0,
        cursor: "pointer",
        background: `linear-gradient(180deg, ${PAPER} 0%, ${PAPER_DEEP} 100%)`,
        borderRadius: "12px",
        boxShadow:
          "0 0 90px rgba(255,206,232,0.45), 0 36px 80px rgba(0,0,0,0.5)",
        overflow: "hidden",
      }}
    >
      {/* 안쪽 점선 스티치 테두리 */}
      <div
        style={{
          position: "absolute",
          inset: "14px",
          border: `1px dashed ${STITCH_PINK}`,
          borderRadius: "8px",
          pointerEvents: "none",
        }}
      />

      {/* 봉투 뚜껑(삼각형) */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 0,
          height: 0,
          borderLeft: "min(345px, 46vw) solid transparent",
          borderRight: "min(345px, 46vw) solid transparent",
          borderTop: `min(230px, 30vw) solid ${FLAP_PINK}`,
        }}
      />
      {/* 뚜껑 좌/우 사선 라인 */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: `linear-gradient(to bottom right, transparent calc(50% - 0.5px), ${FLAP_LINE} 50%, transparent calc(50% + 0.5px)) no-repeat`,
          backgroundSize: "50% 66%",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: `linear-gradient(to bottom left, transparent calc(50% - 0.5px), ${FLAP_LINE} 50%, transparent calc(50% + 0.5px)) no-repeat`,
          backgroundSize: "50% 66%",
          backgroundPosition: "right top",
        }}
      />

      {/* 가운데 왁스 씰 */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "110px",
          height: "110px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 35% 30%, #FCC0DC 0%, #EE8FBB 55%, #D66C9E 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow:
            "0 8px 18px rgba(0,0,0,0.24), inset 0 0 0 4px rgba(255,251,253,0.32)",
        }}
      >
        <span
          style={{
            fontFamily: TITLE_FONT,
            fontWeight: 700,
            fontSize: "36px",
            color: PAPER,
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
          bottom: "30px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontFamily: TITLE_FONT,
            fontSize: "30px",
            fontWeight: 700,
            color: TITLE_TEXT,
            letterSpacing: "0.03em",
            marginBottom: "7px",
          }}
        >
          {to}
        </p>
        <p
          style={{
            fontFamily: BODY_FONT,
            fontSize: "14px",
            color: SUB_TEXT,
            letterSpacing: "0.03em",
          }}
        >
          {memoCount}명의 마음이 도착했어요 · 클릭해서 열어보기
        </p>
      </div>
    </motion.button>
  );
}

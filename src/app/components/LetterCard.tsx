import { motion } from "motion/react";

interface LetterCardProps {
  memoCount: number;
}

/**
 * 축하장 서체 — 상장 느낌을 주던 명조체 대신,
 * 제목은 크레용 손글씨(Gaegu), 본문은 둥근 고딕(Gowun Dodum)을 쓴다.
 * 두 폰트는 index.html의 Google Fonts 링크에서 함께 받아온다.
 */
const TITLE_FONT = "'Gaegu', 'Noto Sans KR', sans-serif";
const BODY_FONT = "'Gowun Dodum', 'Noto Sans KR', sans-serif";

/**
 * 축하장 팔레트 — 치이카와 삼총사(치이=핑크 / 하치와레=블루 / 우사기=크림)와
 * 같은 계열로 맞춰, 캐릭터가 카드에 얹혔을 때 한 몸처럼 보이게 한다.
 */
const FRAME_GRADIENT =
  "linear-gradient(135deg, #FFF4FA 0%, #FFDDEC 28%, #F3F9FF 54%, #FFF1DE 78%, #FFE9F4 100%)";
const BORDER_PINK = "#F3B8D4";
/** 부제·받는이 보조 텍스트 */
const ACCENT_PINK = "#C97BA4";
/** 본문 강조 */
const STRONG_PINK = "#B0537F";
/** 점선 구분선 */
const SOFT_PINK = "#E9B4CE";
const TITLE_COLOR = "#4A2E3B";
const BODY_COLOR = "#5B4A52";
/** 함께한 사람 수 강조 — LG U+ 브랜드 마젠타 */
const BRAND_MAGENTA = "#E6007E";

/** 축하장 하단에 찍히는 날짜. 휴가 시작 시점에 맞춰 바꾼다. */
const GRANTED_AT = "2026년 10월";

/**
 * 카드를 꾸미는 캐릭터 크기. 위쪽 두 마리는 이 값의 절반쯤 위로 올라가
 * 카드 테두리에 걸터앉은 것처럼 보인다.
 */
const CHARACTER_SIZE = "clamp(62px, 13.2vw, 94px)";
const CHARACTER_TOP_OFFSET = `calc(-1 * ${CHARACTER_SIZE} / 2.1)`;
/** 카드 좌우 끝에서 캐릭터까지의 여백. */
const CHARACTER_SIDE_INSET = "clamp(6px, 3vw, 26px)";
/** 보내는이 옆(옛 직인 자리) 캐릭터는 테두리에 걸린 둘보다 살짝 크게. */
const FOOTER_CHARACTER_SIZE = "clamp(70px, 15vw, 102px)";

/** 캐릭터가 살짝 떠 있는 느낌을 주는 상하 흔들림(px)과 주기(초). */
const BOB_DISTANCE_PX = 5;
const BOB_DURATION_SEC = 3.4;

/** 테두리에 걸터앉는 위쪽 캐릭터 두 마리. */
const PERCHED_CHARACTERS = [
  { src: "/chii.png", alt: "축하하는 치이카와", side: "left", rotate: -9 },
  { src: "/usagi.png", alt: "축하하는 우사기", side: "right", rotate: 9 },
] as const;

export function LetterCard({ memoCount }: LetterCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: "relative",
        margin: "2vw auto 0",
        width: "min(520px, 92vw)",
        zIndex: 10,
        // 축하장도 보드의 일부로 취급한다. 클릭을 막지 않아 축하장 위에서도
        // 스티커를 붙이거나 편지를 남길 수 있다(클릭이 보드 캔버스로 통과).
        pointerEvents: "none",
        cursor: "default",
      }}
    >
      {/* Outer pastel frame */}
      <div
        style={{
          position: "relative",
          background: FRAME_GRADIENT,
          borderRadius: "30px",
          padding: "9px",
          boxShadow:
            "0 10px 30px rgba(230,0,126,0.10), 0 28px 60px rgba(0,0,0,0.07)",
        }}
      >
        {/* Inner card — 점선 테두리로 딱딱한 각을 덜어낸다. */}
        <div
          style={{
            position: "relative",
            background: "#FFFFFF",
            border: `1.5px dashed ${BORDER_PINK}`,
            borderRadius: "24px",
            padding:
              "clamp(34px, 7vw, 52px) clamp(26px, 5.5vw, 44px) clamp(26px, 5vw, 40px)",
            overflow: "hidden",
          }}
        >
          {/* Title */}
          <h1
            style={{
              fontFamily: TITLE_FONT,
              fontWeight: 700,
              fontSize: "clamp(40px, 9.5vw, 60px)",
              color: TITLE_COLOR,
              textAlign: "center",
              letterSpacing: "0.02em",
              lineHeight: 1.15,
              margin: "0 0 4px",
            }}
          >
            축하합니다
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontFamily: BODY_FONT,
              fontSize: "13px",
              color: ACCENT_PINK,
              textAlign: "center",
              letterSpacing: "0.02em",
              marginBottom: "22px",
            }}
          >
            출산휴가 · 육아휴직을 앞두고
          </p>

          {/* Dotted divider */}
          <div
            style={{
              width: "62%",
              margin: "0 auto 24px",
              borderTop: `1.5px dashed ${SOFT_PINK}`,
            }}
          />

          {/* Recipient */}
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <p
              style={{
                fontFamily: TITLE_FONT,
                fontSize: "clamp(26px, 6vw, 34px)",
                fontWeight: 700,
                color: TITLE_COLOR,
                lineHeight: 1.2,
                marginBottom: "2px",
              }}
            >
              가영님께
            </p>
            <p
              style={{
                fontFamily: BODY_FONT,
                fontSize: "14px",
                color: ACCENT_PINK,
                letterSpacing: "0.02em",
              }}
            >
              그리고 곧 만날 아기에게
            </p>
          </div>

          {/* Body */}
          <div
            style={{
              fontFamily: BODY_FONT,
              fontSize: "14.5px",
              color: BODY_COLOR,
              lineHeight: 1.95,
              wordBreak: "keep-all",
              letterSpacing: "0.01em",
            }}
          >
            <p style={{ marginBottom: "16px" }}>
              함께 일하며 늘 든든했던 가영님이, 이제 무엇보다{" "}
              <strong style={{ color: STRONG_PINK, fontWeight: 400 }}>
                소중한 시간
              </strong>
              을 맞이합니다.
            </p>
            <p style={{ marginBottom: "16px" }}>
              그동안 팀을 지탱해 주신 그 마음을 오래 기억하겠습니다. 이제는 그
              마음을 온전히 가영님과 아기에게 써 주세요.
            </p>
            <p>
              건강하게, 편안하게. 그리고{" "}
              <strong style={{ color: STRONG_PINK, fontWeight: 400 }}>
                돌아오실 그날
              </strong>
              까지 이 자리에서 기다리겠습니다. 💐
            </p>
          </div>

          {/* Dotted divider */}
          <div
            style={{
              width: "100%",
              margin: "28px 0 22px",
              borderTop: `1.5px dashed ${SOFT_PINK}`,
            }}
          />

          {/* Footer: date + sender + 우사기 */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: "16px",
            }}
          >
            <div>
              <p
                style={{
                  fontFamily: BODY_FONT,
                  fontSize: "14px",
                  color: ACCENT_PINK,
                  letterSpacing: "0.02em",
                  marginBottom: "4px",
                }}
              >
                {GRANTED_AT}
              </p>
              <p
                style={{
                  fontFamily: TITLE_FONT,
                  fontSize: "22px",
                  fontWeight: 700,
                  color: TITLE_COLOR,
                  lineHeight: 1.3,
                }}
              >
                유플러스 FE팀 일동
              </p>
              <p
                style={{
                  fontFamily: BODY_FONT,
                  fontSize: "11.5px",
                  color: "#A99AA1",
                  marginTop: "2px",
                }}
              >
                (그리고 가영님을 응원할 랩 전체)
              </p>
            </div>

            {/* 직인 대신 축하하는 하치와레 */}
            <motion.img
              src="/hachi.png"
              alt="축하하는 하치와레"
              draggable={false}
              // 회전은 style이 아니라 animate로 준다. motion이 transform을
              // 직접 만들어 쓰기 때문에, style의 transform은 덮어써진다.
              animate={{ y: [0, -BOB_DISTANCE_PX, 0], rotate: 6 }}
              transition={{
                duration: BOB_DURATION_SEC,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.8,
              }}
              style={{
                flexShrink: 0,
                width: FOOTER_CHARACTER_SIZE,
                height: "auto",
                userSelect: "none",
              }}
            />
          </div>

          {/* Co-signers count */}
          <p
            style={{
              fontFamily: BODY_FONT,
              fontSize: "12px",
              color: SOFT_PINK,
              textAlign: "center",
              letterSpacing: "0.02em",
              marginTop: "20px",
            }}
          >
            <span style={{ color: BRAND_MAGENTA, fontWeight: 700 }}>
              {memoCount}
            </span>
            명이 마음을 보탰습니다
          </p>
        </div>
      </div>

      {/* 테두리에 걸터앉은 치이카와 · 우사기 — 프레임 뒤가 아니라 위에 그린다. */}
      {PERCHED_CHARACTERS.map(({ src, alt, side, rotate }, i) => (
        <motion.img
          key={src}
          src={src}
          alt={alt}
          draggable={false}
          animate={{ y: [0, -BOB_DISTANCE_PX, 0], rotate }}
          transition={{
            duration: BOB_DURATION_SEC,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.7,
          }}
          style={{
            position: "absolute",
            top: CHARACTER_TOP_OFFSET,
            left: side === "left" ? CHARACTER_SIDE_INSET : undefined,
            right: side === "right" ? CHARACTER_SIDE_INSET : undefined,
            width: CHARACTER_SIZE,
            height: "auto",
            zIndex: 2,
            userSelect: "none",
            pointerEvents: "none",
            filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.10))",
          }}
        />
      ))}
    </motion.div>
  );
}

import { motion } from "motion/react";
import stampImg from "../../imports/stamp.png";

interface LetterCardProps {
  memoCount: number;
}

const serif = "'Nanum Myeongjo', 'Noto Serif KR', serif";

export function LetterCard({ memoCount }: LetterCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: "relative",
        margin: "5vw auto 0",
        width: "min(520px, 94vw)",
        zIndex: 10,
        pointerEvents: "auto",
        cursor: "default",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Outer gold frame */}
      <div
        style={{
          position: "relative",
          background:
            "linear-gradient(135deg, #f5e6b8 0%, #d4af37 25%, #f9f0c8 50%, #c9a227 75%, #e8d089 100%)",
          borderRadius: "8px",
          padding: "10px",
          boxShadow:
            "0 1px 2px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.10), 0 30px 60px rgba(0,0,0,0.12)",
        }}
      >
        {/* Inner gold hairline frame */}
        <div
          style={{
            position: "relative",
            background: "#FFFFFF",
            border: "1.5px solid #c9a227",
            outline: "1px solid #e8d089",
            outlineOffset: "3px",
            borderRadius: "3px",
            padding:
              "clamp(28px, 6vw, 48px) clamp(22px, 5vw, 40px) clamp(26px, 5vw, 40px)",
            overflow: "hidden",
          }}
        >
          {/* Corner flourishes */}
          {(
            [
              { top: 10, left: 10, rotate: 0 },
              { top: 10, right: 10, rotate: 90 },
              { bottom: 10, right: 10, rotate: 180 },
              { bottom: 10, left: 10, rotate: 270 },
            ] as const
          ).map((pos, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                width: "26px",
                height: "26px",
                borderTop: "2px solid #c9a227",
                borderLeft: "2px solid #c9a227",
                transform: `rotate(${pos.rotate}deg)`,
                opacity: 0.7,
                ...pos,
              }}
            />
          ))}

          {/* Trophy + wit badge */}
          <div
            style={{
              textAlign: "center",
              marginBottom: "10px",
            }}
          >
            <div style={{ fontSize: "34px", lineHeight: 1 }}>🏆</div>
            <span
              style={{
                display: "inline-block",
                marginTop: "10px",
                padding: "3px 12px",
                fontFamily: "'Noto Sans KR', sans-serif",
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.12em",
                color: "#8a6d1f",
                background: "rgba(212,175,55,0.14)",
                border: "1px solid #d4af37",
                borderRadius: "999px",
              }}
            >
              MADE IN U+ FE
            </span>
          </div>

          {/* Title */}
          <h1
            style={{
              fontFamily: serif,
              fontWeight: 800,
              fontSize: "clamp(30px, 7vw, 46px)",
              color: "#1a1a1a",
              textAlign: "center",
              letterSpacing: "0.3em",
              textIndent: "0.3em",
              margin: "6px 0 6px",
            }}
          >
            상&nbsp;&nbsp;장
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontFamily: serif,
              fontSize: "12px",
              color: "#8a6d1f",
              textAlign: "center",
              letterSpacing: "0.04em",
              marginBottom: "20px",
            }}
          >
            — 글로벌 인재 수출 인증서 / Made in U+ FE —
          </p>

          {/* Gold divider */}
          <div
            style={{
              width: "60%",
              height: "1px",
              margin: "0 auto 22px",
              background:
                "linear-gradient(90deg, transparent, #d4af37 30%, #c9a227 70%, transparent)",
            }}
          />

          {/* Recipient */}
          <p
            style={{
              fontFamily: serif,
              fontSize: "clamp(18px, 4.5vw, 24px)",
              fontWeight: 700,
              color: "#0f0f0f",
              textAlign: "center",
              letterSpacing: "0.06em",
              marginBottom: "22px",
            }}
          >
            박 형 윤 귀하
          </p>

          {/* Body */}
          <div
            style={{
              fontFamily: serif,
              fontSize: "14px",
              color: "#3a3a3a",
              lineHeight: 2.05,
              wordBreak: "keep-all",
              letterSpacing: "0.01em",
            }}
          >
            <p style={{ marginBottom: "16px" }}>
              위 사람은 유플러스 FE팀 팀장으로 재직하는 동안, 단 한 줄의 버그도
              그냥 넘기지 않는 깐깐함과, 어떤 무리한 요구 앞에서도{" "}
              <strong style={{ color: "#1a1a1a" }}>"네, 됩니다"</strong>를
              외치는 든든함으로 랩 전체를 지탱해 왔습니다.
            </p>
            <p style={{ marginBottom: "16px" }}>
              그 실력과 영향력이 국내 수요를 한참 초과한 나머지, 마침내 한반도가
              홀로 감당하기 어려운 수준에 이르렀으므로, 이에 부득이하게 글로벌
              시장으로의 <strong style={{ color: "#1a1a1a" }}>'수출'</strong>을
              정식 승인하는 바입니다.
            </p>

            {/* Spec list */}
            <div
              style={{
                margin: "18px 0",
                padding: "16px 18px",
                background: "rgba(212,175,55,0.07)",
                border: "1px solid rgba(201,162,39,0.3)",
                borderRadius: "4px",
                fontSize: "13px",
                lineHeight: 1.95,
              }}
            >
              <div>
                <span style={{ color: "#8a6d1f", fontWeight: 700 }}>
                  ▸ 원산지:
                </span>{" "}
                유플러스 FE팀
              </div>
              <div>
                <span style={{ color: "#8a6d1f", fontWeight: 700 }}>
                  ▸ 품질 보증:
                </span>{" "}
                평생 무상 A/S
              </div>
              <div>
                <span style={{ color: "#8a6d1f", fontWeight: 700 }}>
                  ▸ 주의사항:
                </span>{" "}
                어느 나라, 어느 팀에 가시더라도 merge conflict 없이 평탄하시길
              </div>
            </div>

            <p style={{ marginBottom: "16px" }}>
              부디 가시는 곳마다{" "}
              <strong style={{ color: "#1a1a1a" }}>'Made in U+'</strong>의
              자부심을 잃지 마시고, 이 팀에서 보여주신 그 든든함 그대로 세계를
              정복하시길 바랍니다.
            </p>
            <p>이에 그 공로와 무한한 잠재력을 인정하여 이 상장을 수여합니다.</p>
          </div>

          {/* Gold divider */}
          <div
            style={{
              width: "100%",
              height: "1px",
              margin: "26px 0 22px",
              background:
                "linear-gradient(90deg, transparent, #d4af37 30%, #c9a227 70%, transparent)",
            }}
          />

          {/* Footer: date + grantor + seal */}
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
                  fontFamily: serif,
                  fontSize: "15px",
                  color: "#1a1a1a",
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  marginBottom: "6px",
                }}
              >
                2026년 6월
              </p>
              <p
                style={{
                  fontFamily: serif,
                  fontSize: "16px",
                  color: "#0f0f0f",
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                }}
              >
                유플러스 FE팀 일동
              </p>
              <p
                style={{
                  fontFamily: serif,
                  fontSize: "11px",
                  color: "#999",
                  marginTop: "4px",
                }}
              >
                (그리고 팀장님을 그리워할 랩 전체)
              </p>
            </div>

            {/* Seal / stamp */}
            <img
              src={stampImg}
              alt="유플러스 FE팀 직인"
              style={{
                flexShrink: 0,
                width: "80px",
                height: "80px",
                objectFit: "contain",
                transform: "rotate(-8deg)",
              }}
            />
          </div>

          {/* Co-signers count */}
          <p
            style={{
              fontFamily: "'Noto Sans KR', sans-serif",
              fontSize: "11px",
              color: "#b09a55",
              textAlign: "center",
              letterSpacing: "0.03em",
              marginTop: "22px",
            }}
          >
            <span style={{ color: "#c0392b", fontWeight: 700 }}>
              {memoCount}
            </span>
            명이 마음을 보탰습니다
          </p>
        </div>
      </div>
    </motion.div>
  );
}

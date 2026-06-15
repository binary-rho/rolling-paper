import { motion } from "motion/react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

const PLACEHOLDER_BG = "linear-gradient(135deg, #F2F2F2 0%, #E7E7E7 100%)";
const EDGE_PADDING = "clamp(16px, 3vw, 28px)";

interface Milestone {
  year: string;
  title: string;
  description: string;
  /** 실제 사진 URL을 넣으면 플레이스홀더 대신 사진이 표시됩니다. */
  image?: string;
}

const MILESTONES: Milestone[] = [
  {
    year: "2021",
    title: "랩 출범",
    description: "디지털플랫폼개발랩의 첫 시작을 팀장님과 함께 열었습니다.",
  },
  {
    year: "2022",
    title: "신규 플랫폼 런칭",
    description: "수많은 밤을 지새우며 만든 첫 결실, 잊지 못할 순간이에요.",
  },
  {
    year: "2023",
    title: "전사 우수상 수상",
    description: "팀장님의 리더십으로 일군 값진 성과였습니다.",
  },
  {
    year: "2024",
    title: "워크샵 & 회식",
    description: "일만큼이나 즐거웠던 우리 팀의 따뜻한 추억들.",
  },
  {
    year: "2025",
    title: "새로운 출발",
    description: "이제 새 길 위에서도 늘 행복하시길 응원하겠습니다.",
  },
  {
    year: "2026",
    title: "새로운 출발",
    description: "이제 새 길 위에서도 늘 행복하시길 응원하겠습니다.",
  },
  {
    year: "2027",
    title: "새로운 출발",
    description: "이제 새 길 위에서도 늘 행복하시길 응원하겠습니다.",
  },
];

export function AchievementCarousel() {
  return (
    <section
      style={{
        width: "100%",
        background: "#FFFFFF",
        padding: "64px 0 88px",
      }}
    >
      {/* Header */}
      <div style={{ padding: `0 ${EDGE_PADDING}`, marginBottom: "28px" }}>
        <p
          style={{
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 900,
            fontSize: "12px",
            letterSpacing: "0.32em",
            color: "#E6007E",
            textTransform: "uppercase",
            marginBottom: "10px",
          }}
        >
          Our Moments
        </p>
        <h2
          style={{
            fontFamily: "'Noto Sans KR', sans-serif",
            fontWeight: 700,
            fontSize: "clamp(24px, 3vw, 34px)",
            color: "#1A1A1A",
            letterSpacing: "-0.01em",
            lineHeight: 1.2,
          }}
        >
          함께한 순간들
        </h2>
      </div>

      {/* Full-width scroll track */}
      <div
        className="no-scrollbar"
        style={{
          display: "flex",
          gap: "20px",
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          padding: `4px ${EDGE_PADDING} 8px`,
          scrollbarWidth: "none",
        }}
      >
        {MILESTONES.map((milestone) => (
          <motion.article
            key={milestone.year}
            whileHover={{ y: -6 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
            style={{
              flex: "0 0 auto",
              width: "clamp(260px, 78vw, 320px)",
              scrollSnapAlign: "start",
            }}
          >
            {/* Visual area — drop a real photo via `image` */}
            <div
              style={{
                position: "relative",
                width: "100%",
                aspectRatio: "4 / 3",
                borderRadius: "20px",
                overflow: "hidden",
                background: PLACEHOLDER_BG,
                border: "1px solid rgba(0,0,0,0.05)",
              }}
            >
              {milestone.image && (
                <ImageWithFallback
                  src={milestone.image}
                  alt={milestone.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              )}
              {!milestone.image && (
                <span
                  style={{
                    position: "absolute",
                    left: "22px",
                    bottom: "14px",
                    fontFamily: "'Noto Sans KR', sans-serif",
                    fontWeight: 700,
                    fontSize: "48px",
                    lineHeight: 1,
                    color: "rgba(0,0,0,0.10)",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {milestone.year}
                </span>
              )}
            </div>

            {/* Caption */}
            <div style={{ padding: "18px 4px 0" }}>
              <h3
                style={{
                  fontFamily: "'Noto Sans KR', sans-serif",
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "#1A1A1A",
                  marginBottom: "8px",
                  letterSpacing: "0.01em",
                }}
              >
                {milestone.title}
              </h3>
              <p
                style={{
                  fontFamily: "'Noto Sans KR', sans-serif",
                  fontSize: "13.5px",
                  fontWeight: 300,
                  lineHeight: 1.7,
                  color: "rgba(0,0,0,0.5)",
                  wordBreak: "keep-all",
                }}
              >
                {milestone.description}
              </p>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

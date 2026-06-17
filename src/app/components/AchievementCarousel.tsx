import { useRef } from "react";
import { motion } from "motion/react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

const PLACEHOLDER_BG = "linear-gradient(135deg, #F2F2F2 0%, #E7E7E7 100%)";
const EDGE_PADDING = "clamp(16px, 3vw, 28px)";

/** 드래그로 인식하기 위한 최소 이동 거리(px). 이보다 작으면 클릭으로 간주합니다. */
const DRAG_THRESHOLD_PX = 5;

/**
 * 가로 스크롤 트랙을 마우스로 꾹 눌러 드래그해서 스크롤할 수 있게 하는
 * 핸들러 모음을 반환합니다. 트랙패드의 가로 제스처는 기본 동작 그대로 둡니다.
 */
function useDragScroll() {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({
    isDown: false,
    startX: 0,
    startScrollLeft: 0,
    moved: false,
  });

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    if (!track) return;
    dragState.current = {
      isDown: true,
      startX: e.pageX,
      startScrollLeft: track.scrollLeft,
      moved: false,
    };
    // 드래그 중에는 스냅이 손가락을 따라오지 못하게 끕니다(뚝뚝 끊김 방지).
    track.style.scrollSnapType = "none";
    track.style.scrollBehavior = "auto";
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    if (!track || !dragState.current.isDown) return;
    e.preventDefault();
    const distance = e.pageX - dragState.current.startX;
    if (Math.abs(distance) > DRAG_THRESHOLD_PX) {
      dragState.current.moved = true;
    }
    track.scrollLeft = dragState.current.startScrollLeft - distance;
  };

  const endDrag = () => {
    const track = trackRef.current;
    if (!track || !dragState.current.isDown) return;
    dragState.current.isDown = false;
    // 드래그가 끝나면 스냅을 복원해 가장 가까운 카드로 정렬되게 합니다.
    track.style.scrollSnapType = "";
    track.style.scrollBehavior = "";
  };

  // 드래그 직후 발생하는 클릭(링크/버튼 이동 등)을 차단합니다.
  const handleClickCapture = (e: React.MouseEvent<HTMLDivElement>) => {
    if (dragState.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      dragState.current.moved = false;
    }
  };

  return {
    trackRef,
    trackHandlers: {
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: endDrag,
      onMouseLeave: endDrag,
      onClickCapture: handleClickCapture,
    },
  };
}

interface Milestone {
  year: string;
  title: string;
  description: string;
  /** 실제 사진 URL을 넣으면 플레이스홀더 대신 사진이 표시됩니다. */
  image?: string;
}

const MILESTONES: Milestone[] = [
  {
    year: "2022",
    title: "닷컴의 출범",
    description: "FE, BE 모두가 한 팀으로 시작",
    image: "/2022-groupphoto.jpeg",
  },
  {
    year: "2022",
    title: "다 같이 회식",
    description: "첫 고비를 넘기고 다 같이 모인 저녁",
    image: "/2022-dinner.jpeg",
  },
  {
    year: "2023",
    title: "팀 소개 시간",
    description: "서로를 처음 제대로 알아간 자리",
    image: "/2023-ignite.jpeg",
  },
  {
    year: "2023",
    title: "해커톤",
    description: "멘토로 참가하신 형윤님!",
    image: "/2023-hackaton2.jpeg",
  },
  {
    year: "2023",
    title: "해커톤, 그 열기",
    description: "빔새 몰입했던 현장",
    image: "/2023-hackaton.jpeg",
  },
  {
    year: "2023",
    title: "워크샵",
    description: "일에서 한 걸음 물러나 서로를 알아간 시간",
    image: "/2023-workshop.jpeg",
  },
  {
    year: "2023",
    title: "한우 오마카세",
    description: "처음이자 마지막으로 함께 즐긴 오마카세 😊",
    image: "/2023-cafe.jpeg",
  },
  {
    year: "2024",
    title: "9월의 산타",
    description: "늘 통크게 선물해주셨던 형윤님.",
    image: "/2024-moono.jpeg",
  },
  {
    year: "2024",
    title: "2024 개발자 대표로 LGCC 출연!",
    description: "<MZ 고객 1000% 취향저격 '유플닷컴'> 동영상을 참고해주세요 😉",
    image: "/2024-10.png",
  },
  {
    year: "2025",
    title: "디지털고객경험지수 2년 연속 1위",
    description: "LG유플러스의 값진 성과, 그 뒤엔 팀장님의 손길이 있었습니다.",
    image: "/2025-first.png",
  },
  {
    year: "2025",
    title: "타운홀",
    description: "함께 방향을 맞추고 미래를 그렸던 자리",
    image: "/2025-townhall.jpg",
  },
  {
    year: "2025",
    title: "다시, 회식",
    description: "회식 중에도 배포하는 이진님을 지켜보며..",
    image: "/2025-dinner.jpeg",
  },
  {
    year: "2026",
    title: "워크샵",
    description: "또 한 번 함께 떠나 채운 소중한 추억",
    image: "/2026-workshop.jpeg",
  },
  {
    year: "2026",
    title: "워크샵, 함께",
    description: "웃음이 끊이지 않았던 그날의 순간들.",
    image: "/2026-workshop2.jpeg",
  },
  {
    year: "2026",
    title: "워크샵, 마지막까지",
    description: "끝까지 함께한 모두",
    image: "/2026-workshop3.jpeg",
  },
];

export function AchievementCarousel() {
  const { trackRef, trackHandlers } = useDragScroll();

  return (
    <section
      style={{
        width: "100%",
        background: "transparent",
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
        ref={trackRef}
        className="no-scrollbar drag-scroll"
        {...trackHandlers}
        style={{
          display: "flex",
          gap: "20px",
          overflowX: "auto",
          scrollSnapType: "x proximity",
          padding: `4px ${EDGE_PADDING} 8px`,
          scrollbarWidth: "none",
          userSelect: "none",
        }}
      >
        {MILESTONES.map((milestone, i) => (
          <motion.article
            key={milestone.image ?? `${milestone.year}-${i}`}
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

            {/* Caption — 연도(제목) / 이벤트명 / 설명 */}
            <div style={{ padding: "18px 4px 0" }}>
              <h3
                style={{
                  fontFamily: "'Montserrat', 'Noto Sans KR', sans-serif",
                  fontSize: "22px",
                  fontWeight: 800,
                  color: "#E6007E",
                  marginBottom: "4px",
                  letterSpacing: "0.01em",
                }}
              >
                {milestone.year}
              </h3>
              <p
                style={{
                  fontFamily: "'Noto Sans KR', sans-serif",
                  fontSize: "15px",
                  fontWeight: 700,
                  color: "#1A1A1A",
                  marginBottom: "6px",
                  letterSpacing: "0.01em",
                }}
              >
                {milestone.title}
              </p>
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

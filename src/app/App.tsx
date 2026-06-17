import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Filter, Sticker, ChevronDown, X, Download } from "lucide-react";
import { Toaster, toast } from "sonner";
import { LetterCard } from "./components/LetterCard";
import { MemoCard } from "./components/MemoCard";
import { WriteMemoModal } from "./components/WriteMemoModal";
import { FilterPopup } from "./components/FilterPopup";
import { AchievementCarousel } from "./components/AchievementCarousel";
import { SiteFooter } from "./components/SiteFooter";
import { IntroEnvelope } from "./components/IntroEnvelope";
import { useBoard } from "./hooks/useBoard";
import { exportRollingPaperPdf } from "../lib/exportPdf";

export type NoteColor = "yellow" | "pink" | "mint" | "sky" | "lavender";

export interface Memo {
  id: string;
  authorName: string;
  team: string;
  message: string;
  color: NoteColor;
  rotation: number;
  x: number;
  y: number;
  createdAt: string;
  sessionId: string;
}

export interface Sticker {
  id: string;
  emoji: string;
  x: number;
  y: number;
  rotation: number;
  sessionId: string;
}

const CANVAS_HEIGHT = 1000;
const BOARD_TOP_SPACE = "clamp(72px, 9vh, 120px)";
const BOARD_BOTTOM_SPACE = "1600px";

/**
 * 보드 배경: 은은한 파스텔 그라데이션 + 도트 그리드.
 * 그라데이션이 위쪽 모서리에서 브랜드 핑크빛을 아주 옅게 풀어주고,
 * 도트는 그 위에 가벼운 질감을 더합니다. (메모·상장을 가리지 않도록 모두 매우 연하게)
 */
const BOARD_DOT_PATTERN =
  "radial-gradient(circle, rgba(230,0,126,0.05) 1px, transparent 1px)";
const BOARD_GRADIENT =
  "linear-gradient(180deg, #FFFFFF 0%, #FFF6FB 60%, #FDEFF7 100%)";

/** 배경 LG U+ 워드마크 윤곽선 색 — 메모를 가리지 않게 아주 연한 핑크. */
const WORDMARK_STROKE = "rgba(230,0,126, 0.5)";
/**
 * 이미지 스티커 토큰은 `img:` 접두사로 식별합니다. 이모지와 한 필드(`emoji`)에
 * 함께 저장되므로, DB 스키마를 바꾸지 않고 이미지 스티커를 표현할 수 있습니다.
 */
const IMAGE_STICKER_PREFIX = "img:";

/** 이미지 스티커 토큰 → public 경로 + 보드 표시 크기(px) 매핑. */
const STICKER_IMAGES: Record<string, { src: string; size: number }> = {
  "img:lion": { src: "/lion.png", size: 48 },
  "img:balloon": { src: "/balloon.png", size: 240 },
};

const STICKER_OPTIONS = [
  "img:balloon",
  "img:lion",
  "🎉",
  "🌟",
  "💐",
  "🎊",
  "🙌",
  "💪",
  "🔥",
  "❤️",
  "🥺",
  "😊",
  "🎈",
  "🌈",
  "🦋",
  "✨",
  "🌸",
  "🎁",
  "🥂",
  "💫",
];

const isImageSticker = (value: string) =>
  value.startsWith(IMAGE_STICKER_PREFIX);

/** 보드에 표시되는 이모지 스티커 기본 크기(px). */
const EMOJI_STICKER_SIZE_PX = 32;

/**
 * 스티커가 이미지 토큰이면 <img>, 아니면 이모지 텍스트를 렌더링합니다.
 * size를 주면 그 크기로, 없으면 이미지별 기본 크기(STICKER_IMAGES.size)를 씁니다.
 */
function StickerContent({ value, size }: { value: string; size?: number }) {
  if (isImageSticker(value)) {
    const image = STICKER_IMAGES[value];
    const px = size ?? image.size;
    return (
      <img
        src={image.src}
        alt="스티커"
        draggable={false}
        style={{
          width: `${px}px`,
          height: `${px}px`,
          objectFit: "contain",
          display: "block",
          pointerEvents: "none",
        }}
      />
    );
  }
  const px = size ?? EMOJI_STICKER_SIZE_PX;
  return <span style={{ fontSize: `${px}px`, lineHeight: 1 }}>{value}</span>;
}

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function getSession() {
  let id = localStorage.getItem("rp_sid");
  if (!id) {
    id = uid();
    localStorage.setItem("rp_sid", id);
  }
  return id;
}

/** 인트로(상장 공개 연출)를 이미 봤는지. 첫 방문에만 보여준다. */
const INTRO_SEEN_KEY = "rp_intro_seen";
function shouldShowIntro() {
  try {
    return !localStorage.getItem(INTRO_SEEN_KEY);
  } catch {
    return false;
  }
}
function markIntroSeen() {
  try {
    localStorage.setItem(INTRO_SEEN_KEY, "1");
  } catch {
    /* 저장 실패는 무시 */
  }
}

type DragState = {
  memoId: string;
  startPageX: number;
  startPageY: number;
  origX: number;
  origY: number;
};

type StickerDragState = {
  stickerId: string;
  startPageX: number;
  startPageY: number;
  origX: number;
  origY: number;
};

/** 클릭과 드래그를 구분하는 최소 이동 거리(px). 이보다 작으면 클릭(삭제)으로 처리합니다. */
const STICKER_DRAG_THRESHOLD_PX = 4;

export default function App() {
  const [sessionId] = useState(getSession);
  const {
    memos,
    stickers,
    addMemo,
    moveMemo,
    deleteMemo,
    addSticker,
    moveSticker,
    deleteSticker,
  } = useBoard(sessionId);
  const [introOpen, setIntroOpen] = useState(shouldShowIntro);
  const [modalOpen, setModalOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [stickerPanelOpen, setStickerPanelOpen] = useState(false);
  const [selectedSticker, setSelectedSticker] = useState<string | null>(null);
  const [pendingPos, setPendingPos] = useState<{ x: number; y: number }>({
    x: 50,
    y: 50,
  });
  const [dragging, setDragging] = useState<DragState | null>(null);
  const [draggingMemos, setDraggingMemos] = useState<
    Record<string, { x: number; y: number }>
  >({});
  const [stickerDrag, setStickerDrag] = useState<StickerDragState | null>(null);
  const [draggingStickerPos, setDraggingStickerPos] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [canvasHeight, setCanvasHeight] = useState(CANVAS_HEIGHT);
  const canvasRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const wasDragging = useRef(false);
  const stickerWasDragging = useRef(false);

  // Keep memo/sticker coordinates accurate as the board height changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const update = () => setCanvasHeight(canvas.offsetHeight);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  // Mouse move & up for dragging
  useEffect(() => {
    if (!dragging) return;

    const handleMove = (e: MouseEvent) => {
      if (!canvasRef.current) return;
      const canvas = canvasRef.current;
      const dx = ((e.pageX - dragging.startPageX) / canvas.offsetWidth) * 100;
      const dy = ((e.pageY - dragging.startPageY) / canvas.offsetHeight) * 100;
      const newX = Math.max(0, Math.min(90, dragging.origX + dx));
      const newY = Math.max(0, Math.min(96, dragging.origY + dy));
      setDraggingMemos({ [dragging.memoId]: { x: newX, y: newY } });
      wasDragging.current = true;
    };

    const handleUp = () => {
      const finalPos = draggingMemos[dragging.memoId];
      if (finalPos) {
        moveMemo(dragging.memoId, finalPos.x, finalPos.y);
      }
      setDragging(null);
      setDraggingMemos({});
      setTimeout(() => {
        wasDragging.current = false;
      }, 50);
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [dragging, draggingMemos, moveMemo]);

  const handleDragStart = useCallback(
    (memoId: string, e: React.MouseEvent) => {
      e.preventDefault();
      const memo = memos.find((m) => m.id === memoId);
      if (!memo) return;
      setDragging({
        memoId,
        startPageX: e.pageX,
        startPageY: e.pageY,
        origX: memo.x,
        origY: memo.y,
      });
    },
    [memos],
  );

  // Mouse move & up for dragging stickers
  useEffect(() => {
    if (!stickerDrag) return;

    const handleMove = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dx =
        ((e.pageX - stickerDrag.startPageX) / canvas.offsetWidth) * 100;
      const dy =
        ((e.pageY - stickerDrag.startPageY) / canvas.offsetHeight) * 100;
      const movedPx =
        Math.abs(e.pageX - stickerDrag.startPageX) +
        Math.abs(e.pageY - stickerDrag.startPageY);
      if (movedPx > STICKER_DRAG_THRESHOLD_PX) {
        stickerWasDragging.current = true;
      }
      setDraggingStickerPos({
        x: Math.max(0, Math.min(98, stickerDrag.origX + dx)),
        y: Math.max(0, Math.min(98, stickerDrag.origY + dy)),
      });
    };

    const handleUp = () => {
      if (stickerWasDragging.current && draggingStickerPos) {
        moveSticker(
          stickerDrag.stickerId,
          draggingStickerPos.x,
          draggingStickerPos.y,
        );
      }
      setStickerDrag(null);
      setDraggingStickerPos(null);
      setTimeout(() => {
        stickerWasDragging.current = false;
      }, 50);
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [stickerDrag, draggingStickerPos, moveSticker]);

  const handleStickerDragStart = useCallback(
    (stickerId: string, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const sticker = stickers.find((s) => s.id === stickerId);
      if (!sticker) return;
      stickerWasDragging.current = false;
      setStickerDrag({
        stickerId,
        startPageX: e.pageX,
        startPageY: e.pageY,
        origX: sticker.x,
        origY: sticker.y,
      });
    },
    [stickers],
  );

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    if (wasDragging.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const canvasRect = canvas.getBoundingClientRect();
    const canvasTop = canvasRect.top + window.scrollY;
    const x = ((e.pageX - canvasRect.left) / canvas.offsetWidth) * 100;
    const y = ((e.pageY - canvasTop) / canvas.offsetHeight) * 100;

    if (selectedSticker) {
      addSticker({ emoji: selectedSticker, x, y });
      setSelectedSticker(null);
    } else {
      setPendingPos({
        x: Math.max(2, Math.min(84, x)),
        y: Math.max(2, Math.min(94, y)),
      });
      setModalOpen(true);
    }
  };

  const handleAddMemo = useCallback(
    (data: {
      authorName: string;
      team: string;
      message: string;
      color: NoteColor;
    }) => {
      addMemo({ ...data, x: pendingPos.x, y: pendingPos.y });
    },
    [addMemo, pendingPos],
  );

  const scrollToContent = useCallback(() => {
    contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const closeIntro = useCallback(() => {
    setIntroOpen(false);
    markIntroSeen();
  }, []);

  // 인트로가 열려 있는 동안에는 배경 스크롤을 막는다.
  useEffect(() => {
    if (!introOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [introOpen]);

  const [exporting, setExporting] = useState(false);
  const handleExportPdf = useCallback(async () => {
    if (exporting) return;
    setExporting(true);
    const toastId = toast.loading("PDF 만드는 중…");
    try {
      await exportRollingPaperPdf();
      toast.success("rollingpaper.pdf 저장 완료!", { id: toastId });
    } catch (err) {
      console.error("PDF export failed", err);
      toast.error("PDF 저장에 실패했어요. 다시 시도해 주세요.", { id: toastId });
    } finally {
      setExporting(false);
    }
  }, [exporting]);

  return (
    <div
      style={{
        width: "100%",
        background: "#FFFFFF",
        fontFamily: "'Noto Sans KR', sans-serif",
        position: "relative",
      }}
    >
      {/* Intro spotlight overlay — 첫 방문에만. 클릭하면 본화면으로 전환된다. */}
      <AnimatePresence>
        {introOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            onClick={closeIntro}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 55,
              background:
                "radial-gradient(circle at 50% 45%, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.85) 60%, rgba(0,0,0,0.92) 100%)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IntroEnvelope
              to="박형윤 팀장님께"
              memoCount={memos.length}
              onEnter={closeIntro}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Board — one big canvas: place letters & stickers anywhere */}
      <div
        ref={canvasRef}
        data-export="board"
        onClick={handleCanvasClick}
        style={{
          position: "relative",
          width: "100%",
          paddingTop: BOARD_TOP_SPACE,
          cursor: selectedSticker ? "crosshair" : "default",
          backgroundImage: `${BOARD_DOT_PATTERN}, ${BOARD_GRADIENT}`,
          backgroundSize: "24px 24px, 100% 100%",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-36px",
            left: 0,
            width: "100%",
            zIndex: 0,
            userSelect: "none",
            pointerEvents: "none",
          }}
        >
          <svg
            viewBox="0 0 100 30"
            preserveAspectRatio="none"
            style={{
              display: "block",
              width: "100%",
              height: "550px",
            }}
          >
            <text
              x="50"
              y="16"
              textAnchor="middle"
              dominantBaseline="central"
              textLength="98"
              lengthAdjust="spacingAndGlyphs"
              fontFamily="'Noto Sans KR', sans-serif"
              fontWeight={900}
              fontSize="26"
              fill="none"
              stroke={WORDMARK_STROKE}
              strokeWidth={5}
              vectorEffect="non-scaling-stroke"
            >
              LG U+
            </text>
          </svg>
        </div>

        {/* Main letter — centered.
            인트로(봉투) 동안에는 숨겼다가, 입장하면 펼쳐지듯 등장한다. */}
        <motion.div
          initial={false}
          animate={
            introOpen
              ? { opacity: 0, scaleY: 0.15, y: -30 }
              : { opacity: 1, scaleY: 1, y: 0 }
          }
          transition={{
            duration: 0.75,
            ease: [0.16, 1, 0.3, 1],
            opacity: { duration: 0.5 },
          }}
          style={{
            transformOrigin: "top center",
            pointerEvents: introOpen ? "none" : "auto",
          }}
        >
          <LetterCard memoCount={memos.length} />
        </motion.div>

        {/* Scroll-down button (wrapper lets clicks pass through to the board) */}
        <div
          data-export-hide
          style={{
            display: "flex",
            justifyContent: "center",
            margin: "36px 0 44px",
            position: "relative",
            zIndex: 10,
            pointerEvents: "none",
          }}
        >
          <motion.button
            onClick={scrollToContent}
            whileHover={{ y: 3 }}
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: "#FFFFFF",
              border: "1px solid rgba(0,0,0,0.08)",
              boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              pointerEvents: "auto",
            }}
            title="아래로 내려가기"
          >
            <ChevronDown size={22} color="#E6007E" />
          </motion.button>
        </div>

        {/* Achievements / photos carousel — content right after the card */}
        <div ref={contentRef} style={{ position: "relative", zIndex: 6 }}>
          <AchievementCarousel />
        </div>

        {/* Open space below so letters have room to land */}
        <div
          style={{ height: BOARD_BOTTOM_SPACE, pointerEvents: "none" }}
          aria-hidden
        />

        {/* Stickers */}
        {stickers.map((sticker) => {
          const isOwn = sticker.sessionId === sessionId;
          const isThisDragging = stickerDrag?.stickerId === sticker.id;
          // 드래그 중인 동안에는 임시 좌표로 따라오게 합니다.
          const pos =
            isThisDragging && draggingStickerPos
              ? draggingStickerPos
              : { x: sticker.x, y: sticker.y };
          // 이미지 스티커(말풍선 등)는 기울이지 않고 똑바로 붙입니다.
          const rotation = isImageSticker(sticker.emoji) ? 0 : sticker.rotation;
          return (
            <div
              key={sticker.id}
              onMouseDown={(e) => {
                // 스티커를 붙이는 모드가 아닐 때만, 자기 스티커를 드래그합니다.
                if (isOwn && !selectedSticker) {
                  handleStickerDragStart(sticker.id, e);
                }
              }}
              className="group"
              style={{
                position: "absolute",
                left: `${pos.x}%`,
                top: `${(pos.y / 100) * canvasHeight}px`,
                transform: `rotate(${rotation}deg)`,
                lineHeight: 1,
                zIndex: isThisDragging ? 30 : 8,
                cursor:
                  isOwn && !selectedSticker
                    ? isThisDragging
                      ? "grabbing"
                      : "grab"
                    : "default",
                userSelect: "none",
                pointerEvents: "auto",
              }}
            >
              <StickerContent value={sticker.emoji} />
              {isOwn && !selectedSticker && (
                <button
                  data-export-hide
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSticker(sticker.id);
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  title="스티커 삭제"
                  style={{
                    position: "absolute",
                    top: "-8px",
                    right: "-8px",
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    background: "rgba(0,0,0,0.55)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: 0,
                    transition: "opacity 0.15s",
                    cursor: "pointer",
                    border: "none",
                    zIndex: 1,
                  }}
                  className="sticker-delete-btn"
                >
                  <X size={11} color="#FFF" strokeWidth={3} />
                </button>
              )}
            </div>
          );
        })}

        {/* Memos */}
        {memos.map((memo, index) => {
          const pos = draggingMemos[memo.id] ?? { x: memo.x, y: memo.y };
          return (
            <div
              key={memo.id}
              style={{
                position: "absolute",
                left: `${pos.x}%`,
                top: `${(pos.y / 100) * canvasHeight}px`,
                zIndex: dragging?.memoId === memo.id ? 200 : 20 + index,
                pointerEvents: "auto",
              }}
            >
              <MemoCard
                memo={{ ...memo, x: pos.x, y: pos.y }}
                canDelete={memo.sessionId === sessionId}
                onDelete={deleteMemo}
                onDragStart={handleDragStart}
                isDragging={dragging?.memoId === memo.id}
                zIndex={dragging?.memoId === memo.id ? 200 : 20 + index}
              />
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <SiteFooter />

      {/* Floating UI buttons — bottom right */}
      <div
        data-export-hide
        style={{
          position: "fixed",
          bottom: "28px",
          right: "28px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          zIndex: 50,
        }}
      >
        {/* Sticker panel toggle */}
        <AnimatePresence>
          {stickerPanelOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              style={{
                background: "#FFF",
                borderRadius: "16px",
                padding: "14px",
                boxShadow:
                  "0 8px 32px rgba(0,0,0,0.14), 0 0 0 1px rgba(0,0,0,0.06)",
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "6px",
                width: "220px",
                marginBottom: "4px",
              }}
            >
              <p
                style={{
                  gridColumn: "1 / -1",
                  fontSize: "11px",
                  color: selectedSticker ? "#E6007E" : "#AAA",
                  fontFamily: "'Noto Sans KR', sans-serif",
                  marginBottom: "4px",
                  fontWeight: selectedSticker ? 700 : 400,
                }}
              >
                {selectedSticker
                  ? "선택됨 — 보드에 클릭해서 붙이기"
                  : "스티커를 골라 보드에 붙이세요"}
              </p>
              {STICKER_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() =>
                    setSelectedSticker(selectedSticker === emoji ? null : emoji)
                  }
                  style={{
                    width: "100%",
                    aspectRatio: "1 / 1",
                    borderRadius: "8px",
                    background:
                      selectedSticker === emoji
                        ? "rgba(230,0,126,0.1)"
                        : "#F5F5F5",
                    border: `1.5px solid ${selectedSticker === emoji ? "#E6007E" : "transparent"}`,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.15s",
                    transform:
                      selectedSticker === emoji ? "scale(1.15)" : "scale(1)",
                  }}
                >
                  <StickerContent value={emoji} size={20} />
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div
          style={{
            display: "flex",
            gap: "10px",
            justifyContent: "flex-end",
            alignItems: "center",
          }}
        >
          {/* PDF export button */}
          <motion.button
            whileHover={{ scale: exporting ? 1 : 1.06 }}
            whileTap={{ scale: exporting ? 1 : 0.94 }}
            onClick={handleExportPdf}
            disabled={exporting}
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: exporting ? "default" : "pointer",
              border: "none",
              boxShadow: "0 4px 16px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.06)",
              opacity: exporting ? 0.55 : 1,
              transition: "opacity 0.2s",
            }}
            title="PDF로 저장"
          >
            {exporting ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
                style={{
                  width: "18px",
                  height: "18px",
                  borderRadius: "50%",
                  border: "2px solid rgba(0,0,0,0.15)",
                  borderTopColor: "#1A1A1A",
                }}
              />
            ) : (
              <Download size={18} color="#1A1A1A" />
            )}
          </motion.button>

          {/* Filter button */}
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => setFilterOpen(true)}
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: "#1A1A1A",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              border: "none",
              boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
            }}
            title="메모 보기"
          >
            <Filter size={18} color="#FFF" />
          </motion.button>

          {/* Sticker button */}
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => {
              setStickerPanelOpen(!stickerPanelOpen);
              setSelectedSticker(null);
            }}
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: stickerPanelOpen ? "#E6007E" : "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              border: "none",
              boxShadow: stickerPanelOpen
                ? "0 4px 20px rgba(230,0,126,0.45)"
                : "0 4px 16px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.06)",
              transition: "all 0.2s",
            }}
            title="스티커 붙이기"
          >
            <Sticker
              size={20}
              color={stickerPanelOpen ? "#FFFFFF" : "#1A1A1A"}
            />
          </motion.button>

          {/* Write button */}
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => {
              setPendingPos({
                x: 10 + Math.random() * 70,
                y: 10 + Math.random() * 70,
              });
              setModalOpen(true);
            }}
            style={{
              height: "42px",
              padding: "0 22px",
              borderRadius: "12px",
              background: "#E6007E",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
              border: "none",
              boxShadow: "0 4px 20px rgba(230,0,126,0.4)",
            }}
            title="편지 쓰기"
          >
            <span
              style={{
                color: "#FFF",
                fontFamily: "'Noto Sans KR', sans-serif",
                fontSize: "13px",
                fontWeight: 700,
              }}
            >
              편지 쓰기
            </span>
          </motion.button>
        </div>
      </div>

      {/* Hint text — top right */}
      <div
        data-export-hide
        style={{
          position: "fixed",
          top: "20px",
          right: "24px",
          zIndex: 40,
        }}
      >
        <p
          style={{
            fontFamily: "'Noto Sans KR', sans-serif",
            fontSize: "11px",
            color: "rgba(0,0,0,0.25)",
            letterSpacing: "0.05em",
          }}
        >
          보드를 클릭해도 편지를 남길 수 있어요
        </p>
      </div>

      {/* Modals */}
      <WriteMemoModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleAddMemo}
      />
      <FilterPopup
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        memos={memos}
      />

      {/* Toast host */}
      <Toaster position="top-center" richColors />
    </div>
  );
}

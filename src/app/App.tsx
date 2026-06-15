import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Filter, Pencil, Sticker, ChevronDown } from "lucide-react";
import { LetterCard } from "./components/LetterCard";
import { MemoCard } from "./components/MemoCard";
import { WriteMemoModal } from "./components/WriteMemoModal";
import { FilterPopup } from "./components/FilterPopup";
import { AchievementCarousel } from "./components/AchievementCarousel";
import { SiteFooter } from "./components/SiteFooter";
import { useBoard } from "./hooks/useBoard";

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
const BOARD_BOTTOM_SPACE = "min(72vh, 680px)";
const STICKER_OPTIONS = [
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

type DragState = {
  memoId: string;
  startPageX: number;
  startPageY: number;
  origX: number;
  origY: number;
};

export default function App() {
  const [sessionId] = useState(getSession);
  const {
    memos,
    stickers,
    addMemo,
    moveMemo,
    deleteMemo,
    addSticker,
    deleteSticker,
  } = useBoard(sessionId);
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
  const [canvasHeight, setCanvasHeight] = useState(CANVAS_HEIGHT);
  const canvasRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const wasDragging = useRef(false);

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

  return (
    <div
      style={{
        width: "100%",
        background: "#FFFFFF",
        fontFamily: "'Noto Sans KR', sans-serif",
        position: "relative",
      }}
    >
      {/* Board — one big canvas: place letters & stickers anywhere */}
      <div
        ref={canvasRef}
        onClick={handleCanvasClick}
        style={{
          position: "relative",
          width: "100%",
          paddingTop: BOARD_TOP_SPACE,
          cursor: selectedSticker ? "crosshair" : "cell",
          backgroundImage:
            "radial-gradient(circle, rgba(0,0,0,0.04) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          overflow: "hidden",
        }}
      >
        {/* Background wordmark — large outlined, natural proportions */}
        <div
          style={{
            position: "absolute",
            top: "clamp(8px, 1.5vw, 20px)",
            left: 0,
            width: "100%",
            textAlign: "center",
            zIndex: 0,
            userSelect: "none",
            pointerEvents: "none",
            lineHeight: 1,
          }}
        >
          <span
            style={{
              fontFamily: "'Noto Sans KR', sans-serif",
              fontWeight: 900,
              fontSize: "clamp(140px, 26vw, 380px)",
              letterSpacing: "-0.03em",
              color: "transparent",
              WebkitTextStroke: "1.5px #E6007E",
              whiteSpace: "nowrap",
            }}
          >
            LG U+
          </span>
        </div>

        {/* Main letter — centered */}
        <LetterCard memoCount={memos.length} />

        {/* Scroll-down button (wrapper lets clicks pass through to the board) */}
        <div
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
          return (
            <div
              key={sticker.id}
              onClick={(e) => {
                if (!selectedSticker && isOwn) {
                  e.stopPropagation();
                  deleteSticker(sticker.id);
                }
              }}
              className="group"
              style={{
                position: "absolute",
                left: `${sticker.x}%`,
                top: `${(sticker.y / 100) * canvasHeight}px`,
                transform: `rotate(${sticker.rotation}deg)`,
                fontSize: "32px",
                lineHeight: 1,
                zIndex: 8,
                cursor: isOwn && !selectedSticker ? "pointer" : "default",
                userSelect: "none",
                pointerEvents: "auto",
              }}
            >
              {sticker.emoji}
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
                  ? `${selectedSticker} 선택됨 — 보드에 클릭해서 붙이기`
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
                    fontSize: "20px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.15s",
                    transform:
                      selectedSticker === emoji ? "scale(1.15)" : "scale(1)",
                  }}
                >
                  {emoji}
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
    </div>
  );
}

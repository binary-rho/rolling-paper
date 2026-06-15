import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MemoCard } from "./MemoCard";
import type { Memo, Sticker } from "../App";

const ALL_TEAMS = [
  "전체",
  "기획팀",
  "개발팀",
  "디자인팀",
  "마케팅팀",
  "영업팀",
  "경영지원팀",
  "기타",
];

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

interface MemoBoardProps {
  memos: Memo[];
  stickers: Sticker[];
  sessionId: string;
  onDeleteMemo: (id: string) => void;
  onAddSticker: (sticker: Omit<Sticker, "id">) => void;
  onDeleteSticker: (id: string) => void;
}

export function MemoBoard({
  memos,
  stickers,
  sessionId,
  onDeleteMemo,
  onAddSticker,
  onDeleteSticker,
}: MemoBoardProps) {
  const [selectedTeam, setSelectedTeam] = useState("전체");
  const [selectedSticker, setSelectedSticker] = useState<string | null>(null);
  const [showStickerPanel, setShowStickerPanel] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);

  const filtered =
    selectedTeam === "전체"
      ? memos
      : memos.filter((m) => m.team === selectedTeam);

  const handleBoardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedSticker || !boardRef.current) return;
    const rect = boardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y =
      ((e.clientY - rect.top + boardRef.current.scrollTop) /
        boardRef.current.scrollHeight) *
      100;
    const rotation = (Math.random() - 0.5) * 30;
    const scale = 0.9 + Math.random() * 0.4;
    onAddSticker({ emoji: selectedSticker, x, y, rotation, sessionId });
    setSelectedSticker(null);
  };

  const teamCounts = ALL_TEAMS.reduce<Record<string, number>>((acc, team) => {
    if (team === "전체") {
      acc[team] = memos.length;
    } else {
      acc[team] = memos.filter((m) => m.team === team).length;
    }
    return acc;
  }, {});

  return (
    <section
      style={{
        background: "#0C0C0C",
        position: "relative",
      }}
    >
      {/* Section header */}
      <div
        className="px-8 pt-16 pb-0"
        style={{ maxWidth: "1400px", margin: "0 auto" }}
      >
        <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
          <div>
            <p
              className="uppercase tracking-[0.2em] text-[11px] mb-2"
              style={{
                color: "#E6007E",
                fontFamily: "'Noto Sans KR', sans-serif",
              }}
            >
              Messages
            </p>
            <h2
              style={{
                fontFamily: "'Noto Sans KR', sans-serif",
                fontSize: "clamp(28px, 4vw, 48px)",
                color: "#F0F0F0",
                lineHeight: 1.1,
              }}
            >
              모두의 한 마디
            </h2>
          </div>

          {/* Sticker toggle button */}
          <button
            onClick={() => {
              setShowStickerPanel(!showStickerPanel);
              setSelectedSticker(null);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full transition-all"
            style={{
              background: showStickerPanel
                ? "#E6007E"
                : "rgba(255,255,255,0.06)",
              color: showStickerPanel ? "#FFF" : "#888",
              fontFamily: "'Noto Sans KR', sans-serif",
              fontSize: "13px",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <span>✨</span>
            <span>스티커 붙이기</span>
          </button>
        </div>

        {/* Team filter tabs */}
        <div className="flex gap-2 flex-wrap mb-0">
          {ALL_TEAMS.filter((t) => t === "전체" || teamCounts[t] > 0).map(
            (team) => (
              <button
                key={team}
                onClick={() => setSelectedTeam(team)}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full transition-all"
                style={{
                  background:
                    selectedTeam === team
                      ? "#E6007E"
                      : "rgba(255,255,255,0.06)",
                  color: selectedTeam === team ? "#FFF" : "#888",
                  fontFamily: "'Noto Sans KR', sans-serif",
                  fontSize: "13px",
                  fontWeight: selectedTeam === team ? 700 : 400,
                  border: `1px solid ${selectedTeam === team ? "#E6007E" : "rgba(255,255,255,0.08)"}`,
                }}
              >
                <span>{team}</span>
                <span
                  style={{
                    fontSize: "11px",
                    opacity: 0.7,
                    fontWeight: 400,
                  }}
                >
                  {teamCounts[team]}
                </span>
              </button>
            ),
          )}
        </div>
      </div>

      {/* Sticker panel */}
      <AnimatePresence>
        {showStickerPanel && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="sticky top-0 z-30 px-8 py-4"
            style={{
              background: "rgba(12,12,12,0.95)",
              backdropFilter: "blur(12px)",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
              <p
                className="text-[11px] mb-3"
                style={{
                  color: "#888",
                  fontFamily: "'Noto Sans KR', sans-serif",
                }}
              >
                {selectedSticker
                  ? `${selectedSticker} 선택됨 — 보드에서 클릭해서 붙이기`
                  : "스티커를 선택하고 보드에 붙여보세요"}
              </p>
              <div className="flex gap-2 flex-wrap">
                {STICKER_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() =>
                      setSelectedSticker(
                        selectedSticker === emoji ? null : emoji,
                      )
                    }
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
                    style={{
                      fontSize: "22px",
                      background:
                        selectedSticker === emoji
                          ? "rgba(230,0,126,0.2)"
                          : "rgba(255,255,255,0.05)",
                      border: `1px solid ${selectedSticker === emoji ? "#E6007E" : "rgba(255,255,255,0.08)"}`,
                      transform:
                        selectedSticker === emoji ? "scale(1.15)" : "scale(1)",
                    }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Canvas board */}
      <div
        ref={boardRef}
        onClick={handleBoardClick}
        className="relative w-full"
        style={{
          minHeight: filtered.length === 0 ? "400px" : "auto",
          padding: "48px 32px 80px",
          cursor: selectedSticker ? "crosshair" : "default",
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      >
        <div
          style={{ maxWidth: "1400px", margin: "0 auto", position: "relative" }}
        >
          {/* Stickers layer */}
          {stickers.map((sticker) => {
            const isOwn = sticker.sessionId === sessionId;
            return (
              <div
                key={sticker.id}
                className="absolute group"
                style={{
                  left: `${sticker.x}%`,
                  top: `${sticker.y}%`,
                  transform: `rotate(${sticker.rotation}deg) scale(${sticker.scale ?? 1})`,
                  fontSize: "32px",
                  cursor: isOwn ? "pointer" : "default",
                  zIndex: 5,
                  lineHeight: 1,
                }}
                onClick={(e) => {
                  if (isOwn && !selectedSticker) {
                    e.stopPropagation();
                    onDeleteSticker(sticker.id);
                  }
                }}
              >
                {sticker.emoji}
                {isOwn && (
                  <span
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
                    style={{ fontSize: "9px", lineHeight: 1 }}
                  >
                    ×
                  </span>
                )}
              </div>
            );
          })}

          {/* Notes grid */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <p
                style={{
                  color: "#555",
                  fontFamily: "'Noto Sans KR', sans-serif",
                  fontSize: "15px",
                }}
              >
                아직 편지가 없어요. 첫 번째로 마음을 전해보세요!
              </p>
            </div>
          ) : (
            <div
              style={{
                columns: "220px",
                columnGap: "20px",
              }}
            >
              <AnimatePresence>
                {filtered.map((memo, index) => (
                  <div
                    key={memo.id}
                    style={{
                      breakInside: "avoid",
                      marginBottom: "20px",
                      display: "inline-block",
                      width: "100%",
                    }}
                  >
                    <MemoCard
                      memo={memo}
                      canDelete={memo.sessionId === sessionId}
                      onDelete={onDeleteMemo}
                      index={index}
                    />
                  </div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

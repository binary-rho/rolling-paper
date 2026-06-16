import { useState, useRef } from "react";
import { X } from "lucide-react";
import type { Memo, NoteColor } from "../App";

const NOTE_STYLES: Record<NoteColor, { bg: string; tape: string }> = {
  yellow:   { bg: "#FFF176", tape: "#FFEE58" },
  pink:     { bg: "#FFB3C6", tape: "#FF80AB" },
  mint:     { bg: "#B2F2BB", tape: "#69DB7C" },
  sky:      { bg: "#BAE3FF", tape: "#74C0FC" },
  lavender: { bg: "#D8B4FE", tape: "#C084FC" },
};

interface MemoCardProps {
  memo: Memo;
  canDelete: boolean;
  onDelete: (id: string) => void;
  onDragStart: (id: string, e: React.MouseEvent) => void;
  isDragging: boolean;
  zIndex: number;
}

export function MemoCard({ memo, canDelete, onDelete, onDragStart, isDragging, zIndex }: MemoCardProps) {
  const [hovered, setHovered] = useState(false);
  const style = NOTE_STYLES[memo.color] ?? NOTE_STYLES.yellow;
  const date = new Date(memo.createdAt);
  const dateStr = `${date.getMonth() + 1}.${date.getDate()}`;

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDragStart(memo.id, e);
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseDown={handleMouseDown}
      className="group"
      style={{
        position: "absolute",
        left: `${memo.x}%`,
        top: `${memo.y}%`,
        width: "200px",
        background: style.bg,
        borderRadius: "3px",
        padding: "28px 16px 16px",
        boxShadow: isDragging
          ? "0 20px 60px rgba(0,0,0,0.2), 0 4px 12px rgba(0,0,0,0.15)"
          : hovered
          ? "0 12px 32px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.1)"
          : "0 4px 16px rgba(0,0,0,0.1), 0 1px 4px rgba(0,0,0,0.06)",
        transform: `rotate(${isDragging ? 0 : memo.rotation}deg) scale(${isDragging ? 1.04 : hovered ? 1.02 : 1})`,
        transition: isDragging
          ? "box-shadow 0.15s, transform 0.1s"
          : "box-shadow 0.2s, transform 0.2s ease",
        cursor: isDragging ? "grabbing" : "grab",
        zIndex: isDragging ? 200 : zIndex,
        userSelect: "none",
      }}
    >
      {/* Tape */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "44px",
          height: "18px",
          background: style.tape,
          borderRadius: "2px",
          opacity: 0.75,
        }}
      />

      {/* Delete button */}
      {canDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(memo.id);
          }}
          onMouseDown={(e) => e.stopPropagation()}
          style={{
            position: "absolute",
            top: "6px",
            right: "6px",
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            background: "rgba(0,0,0,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: hovered ? 1 : 0,
            transition: "opacity 0.15s",
            cursor: "pointer",
            border: "none",
          }}
        >
          <X size={10} color="#1A1A1A" strokeWidth={3} />
        </button>
      )}

      {/* Team + date */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
        <span
          style={{
            fontSize: "10px",
            padding: "2px 8px",
            background: "rgba(0,0,0,0.12)",
            borderRadius: "100px",
            color: "#1A1A1A",
            fontFamily: "'Noto Sans KR', sans-serif",
          }}
        >
          {memo.team}
        </span>
        <span
          style={{
            fontSize: "10px",
            color: "rgba(0,0,0,0.4)",
            fontFamily: "'Noto Sans KR', sans-serif",
          }}
        >
          {dateStr}
        </span>
      </div>

      {/* Message */}
      <p
        style={{
          fontFamily: "'Noto Sans KR', sans-serif",
          fontSize: "13px",
          color: "#1A1A1A",
          lineHeight: 1.65,
          wordBreak: "keep-all",
          whiteSpace: "pre-wrap",
          marginBottom: "10px",
        }}
      >
        {memo.message}
      </p>

      {/* Author */}
      <p
        style={{
          fontFamily: "'Noto Sans KR', sans-serif",
          fontSize: "11px",
          color: "rgba(0,0,0,0.5)",
          textAlign: "right",
        }}
      >
        — {memo.authorName}
      </p>
    </div>
  );
}

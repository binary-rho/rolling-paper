import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import type { Memo } from "../App";

// "전체"는 필터 전용 옵션이고, 나머지는 편지쓰기(WriteMemoModal)의 TEAMS와 일치해야 한다.
const ALL_TEAMS = [
  "전체",
  "디지털FE팀",
  "디지털코어FE팀",
  "디지털커머스BE팀",
  "디지털코어BE팀",
  "디지털CS BE팀",
  "디지털제휴플랫폼BE팀",
  "디지털플랫폼Ops팀",
  "기획",
  "기타",
];

const NOTE_BG: Record<string, string> = {
  yellow: "#FFF176",
  pink: "#FFB3C6",
  mint: "#B2F2BB",
  sky: "#BAE3FF",
  lavender: "#D8B4FE",
};

interface FilterPopupProps {
  open: boolean;
  onClose: () => void;
  memos: Memo[];
  /** 모바일이면 전체화면으로 고정하고 닫기 UI(핸들바·X·배경)를 숨긴다. */
  isMobile?: boolean;
}

export function FilterPopup({
  open,
  onClose,
  memos,
  isMobile = false,
}: FilterPopupProps) {
  const [selectedTeam, setSelectedTeam] = useState("전체");

  const teamsWithMemos = ALL_TEAMS.filter(
    (t) => t === "전체" || memos.some((m) => m.team === t),
  );

  const filtered =
    selectedTeam === "전체"
      ? memos
      : memos.filter((m) => m.team === selectedTeam);

  const teamCount = (team: string) =>
    team === "전체"
      ? memos.length
      : memos.filter((m) => m.team === team).length;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* 딤드 배경 — 모바일에선 전체화면이라 띄우지 않는다(닫기도 불가). */}
          {!isMobile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.35)",
                backdropFilter: "blur(6px)",
                zIndex: 80,
              }}
            />
          )}
          <motion.div
            initial={isMobile ? { opacity: 0 } : { opacity: 0, y: 40 }}
            animate={isMobile ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={isMobile ? { opacity: 0 } : { opacity: 0, y: 40 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "fixed",
              top: isMobile ? 0 : "auto",
              bottom: 0,
              left: 0,
              right: 0,
              height: isMobile ? "100dvh" : "82vh",
              background: "#FAFAFA",
              borderRadius: isMobile ? 0 : "24px 24px 0 0",
              zIndex: 90,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle bar — 모바일에선 숨김(닫기 제스처 없음) */}
            {!isMobile && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  paddingTop: "12px",
                  paddingBottom: "4px",
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "4px",
                    background: "#DDDDDD",
                    borderRadius: "2px",
                  }}
                />
              </div>
            )}

            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 28px 0",
              }}
            >
              <div>
                <p
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 900,
                    fontSize: "11px",
                    color: "#E6007E",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    marginBottom: "4px",
                  }}
                >
                  Messages
                </p>
                <h2
                  style={{
                    fontFamily: "'Noto Sans KR', sans-serif",
                    fontSize: "clamp(20px, 3vw, 26px)",
                    fontWeight: 800,
                    color: "#1A1A1A",
                    lineHeight: 1.2,
                  }}
                >
                  모두의 한 마디
                </h2>
                {/* 모바일 안내 — 꾸미기는 큰 화면(PC)에서만 가능 */}
                {isMobile && (
                  <p
                    style={{
                      marginTop: "8px",
                      fontFamily: "'Noto Sans KR', sans-serif",
                      fontSize: "12px",
                      lineHeight: 1.5,
                      color: "#888",
                      wordBreak: "keep-all",
                    }}
                  >
                    • 편지 작성과 스티커 꾸미기는 PC(넓은 화면)에서 할 수
                    있어요.
                  </p>
                )}
              </div>
              {/* 닫기 버튼 — 모바일에선 숨김(항상 열린 전체화면) */}
              {!isMobile && (
                <button
                  onClick={onClose}
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: "#F0F0F0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    border: "none",
                  }}
                >
                  <X size={16} color="#666" />
                </button>
              )}
            </div>

            {/* Team filter chips */}
            <div
              style={{
                display: "flex",
                gap: "8px",
                padding: "16px 28px 12px",
                overflowX: "auto",
                scrollbarWidth: "none",
                flexShrink: 0,
              }}
            >
              {teamsWithMemos.map((team) => (
                <button
                  key={team}
                  onClick={() => setSelectedTeam(team)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    padding: "7px 16px",
                    borderRadius: "100px",
                    background: selectedTeam === team ? "#E6007E" : "#EEEEEE",
                    color: selectedTeam === team ? "#FFF" : "#666",
                    fontFamily: "'Noto Sans KR', sans-serif",
                    fontSize: "13px",
                    fontWeight: selectedTeam === team ? 700 : 400,
                    border: "none",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    transition: "all 0.15s",
                  }}
                >
                  <span>{team}</span>
                  <span style={{ fontSize: "11px", opacity: 0.7 }}>
                    {teamCount(team)}
                  </span>
                </button>
              ))}
            </div>

            {/* Memo grid */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "4px 24px 32px",
                scrollbarWidth: "none",
              }}
            >
              {filtered.length === 0 ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "200px",
                    gap: "12px",
                  }}
                >
                  <p
                    style={{
                      fontFamily: "'Noto Sans KR', sans-serif",
                      fontSize: "14px",
                      color: "#AAA",
                    }}
                  >
                    아직 편지가 없어요!
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    columns: "200px",
                    columnGap: "14px",
                  }}
                >
                  {filtered.map((memo) => {
                    const date = new Date(memo.createdAt);
                    const dateStr = `${date.getMonth() + 1}.${date.getDate()}`;
                    return (
                      <div
                        key={memo.id}
                        style={{
                          breakInside: "avoid",
                          marginBottom: "14px",
                          display: "inline-block",
                          width: "100%",
                          background: NOTE_BG[memo.color] || "#FFF176",
                          borderRadius: "4px",
                          padding: "16px",
                          transform: `rotate(${memo.rotation * 0.4}deg)`,
                          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                          position: "relative",
                        }}
                      >
                        {/* Tape */}
                        <div
                          style={{
                            position: "absolute",
                            top: 0,
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            width: "36px",
                            height: "14px",
                            background: "rgba(255,255,255,0.5)",
                            borderRadius: "2px",
                          }}
                        />
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            marginBottom: "8px",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "10px",
                              padding: "2px 8px",
                              background: "rgba(0,0,0,0.1)",
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
                        <p
                          style={{
                            fontFamily: "'Noto Sans KR', sans-serif",
                            fontSize: "13px",
                            color: "#1A1A1A",
                            lineHeight: 1.65,
                            wordBreak: "keep-all",
                            whiteSpace: "pre-wrap",
                            marginBottom: "8px",
                          }}
                        >
                          {memo.message}
                        </p>
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
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

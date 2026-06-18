import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ChevronDown } from "lucide-react";
import type { NoteColor } from "../App";

const TEAMS = [
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

/** 실시간 미리보기 영역의 최대 높이(px). 넘으면 내부 스크롤이 생깁니다. */
const PREVIEW_MAX_HEIGHT_PX = 260;

const COLOR_OPTIONS: { value: NoteColor; bg: string; label: string }[] = [
  { value: "yellow", bg: "#FFF176", label: "옐로우" },
  { value: "pink", bg: "#FFB3C6", label: "핑크" },
  { value: "mint", bg: "#B2F2BB", label: "민트" },
  { value: "sky", bg: "#BAE3FF", label: "스카이" },
  { value: "lavender", bg: "#D8B4FE", label: "라벤더" },
];

interface WriteMemoModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    authorName: string;
    team: string;
    message: string;
    color: NoteColor;
  }) => void;
}

export function WriteMemoModal({
  open,
  onClose,
  onSubmit,
}: WriteMemoModalProps) {
  const [authorName, setAuthorName] = useState("");
  const [team, setTeam] = useState("");
  const [message, setMessage] = useState("");
  const [color, setColor] = useState<NoteColor>("yellow");
  const previewRef = useRef<HTMLDivElement>(null);

  // 메시지를 입력할 때마다 미리보기를 맨 아래로 스크롤해 방금 친 줄이 보이게 합니다.
  useEffect(() => {
    const preview = previewRef.current;
    if (preview) {
      preview.scrollTop = preview.scrollHeight;
    }
  }, [message]);

  const resetForm = () => {
    setAuthorName("");
    setTeam("");
    setMessage("");
    setColor("yellow");
  };

  // 작성 중이던 내용을 비우고 모달을 닫습니다(제출·X·배경 클릭 공통).
  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = () => {
    if (!authorName.trim() || !team || !message.trim()) return;
    onSubmit({
      authorName: authorName.trim(),
      team,
      message: message.trim(),
      color,
    });
    handleClose();
  };

  const isValid = authorName.trim() && team && message.trim();
  const selectedBg =
    COLOR_OPTIONS.find((c) => c.value === color)?.bg ?? "#FFF176";

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.25)",
              backdropFilter: "blur(4px)",
              zIndex: 100,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "16px",
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "min(440px, 100%)",
              }}
            >
              <div
                style={{
                  background: "#FFFFFF",
                  borderRadius: "20px",
                  padding: "32px",
                  boxShadow:
                    "0 32px 80px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                }}
              >
                {/* Header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
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
                        marginBottom: "6px",
                      }}
                    >
                      Rolling Paper
                    </p>
                    <h2
                      style={{
                        fontFamily: "'Black Han Sans', sans-serif",
                        fontSize: "22px",
                        color: "#1A1A1A",
                      }}
                    >
                      마음을 전해보세요
                    </h2>
                  </div>
                  <button
                    onClick={handleClose}
                    style={{
                      width: "34px",
                      height: "34px",
                      borderRadius: "50%",
                      background: "#F0F0F0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      border: "none",
                    }}
                  >
                    <X size={15} color="#888" />
                  </button>
                </div>

                {/* Live preview */}
                <div
                  ref={previewRef}
                  className="no-scrollbar"
                  style={{
                    background: selectedBg,
                    borderRadius: "6px",
                    padding: "20px 16px 16px",
                    minHeight: "80px",
                    maxHeight: `${PREVIEW_MAX_HEIGHT_PX}px`,
                    overflowY: "auto",
                    transition: "background 0.3s",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: "6px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: "36px",
                      height: "14px",
                      background: "rgba(255,255,255,0.5)",
                      borderRadius: "2px",
                    }}
                  />
                  <p
                    style={{
                      fontFamily: "'Noto Sans KR', sans-serif",
                      fontSize: "13px",
                      color: "#1A1A1A",
                      lineHeight: 1.6,
                      minHeight: "32px",
                      wordBreak: "keep-all",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {message || "메시지를 입력하면 여기에 보여요"}
                  </p>
                  {authorName && (
                    <p
                      style={{
                        fontFamily: "'Noto Sans KR', sans-serif",
                        fontSize: "11px",
                        color: "rgba(0,0,0,0.5)",
                        textAlign: "right",
                        marginTop: "8px",
                      }}
                    >
                      — {authorName}
                    </p>
                  )}
                </div>

                {/* Color picker */}
                <div
                  style={{ display: "flex", gap: "8px", alignItems: "center" }}
                >
                  <span
                    style={{
                      fontSize: "11px",
                      color: "#AAAAAA",
                      fontFamily: "'Noto Sans KR', sans-serif",
                      marginRight: "4px",
                    }}
                  >
                    색상
                  </span>
                  {COLOR_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setColor(opt.value)}
                      title={opt.label}
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        background: opt.bg,
                        border: "none",
                        cursor: "pointer",
                        outline:
                          color === opt.value
                            ? "3px solid #E6007E"
                            : "3px solid transparent",
                        outlineOffset: "2px",
                        transform:
                          color === opt.value ? "scale(1.2)" : "scale(1)",
                        transition: "all 0.15s",
                      }}
                    />
                  ))}
                </div>

                {/* Fields */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  <div style={{ display: "flex", gap: "10px" }}>
                    <div
                      style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        gap: "5px",
                      }}
                    >
                      <label
                        style={{
                          fontSize: "11px",
                          color: "#AAA",
                          fontFamily: "'Noto Sans KR', sans-serif",
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                        }}
                      >
                        닉네임
                      </label>
                      <input
                        value={authorName}
                        onChange={(e) => setAuthorName(e.target.value)}
                        placeholder="이름 또는 닉네임"
                        maxLength={12}
                        style={{
                          background: "#F5F5F5",
                          border: "1.5px solid transparent",
                          borderRadius: "10px",
                          padding: "10px 12px",
                          fontSize: "14px",
                          color: "#1A1A1A",
                          fontFamily: "'Noto Sans KR', sans-serif",
                          outline: "none",
                          transition: "border-color 0.15s",
                          width: "100%",
                          boxSizing: "border-box",
                        }}
                        onFocus={(e) =>
                          (e.target.style.borderColor = "#E6007E")
                        }
                        onBlur={(e) =>
                          (e.target.style.borderColor = "transparent")
                        }
                      />
                    </div>
                    <div
                      style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        gap: "5px",
                      }}
                    >
                      <label
                        style={{
                          fontSize: "11px",
                          color: "#AAA",
                          fontFamily: "'Noto Sans KR', sans-serif",
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                        }}
                      >
                        소속팀
                      </label>
                      <div style={{ position: "relative" }}>
                        <select
                          value={team}
                          onChange={(e) => setTeam(e.target.value)}
                          style={{
                            background: "#F5F5F5",
                            border: "1.5px solid transparent",
                            borderRadius: "10px",
                            padding: "10px 36px 10px 12px",
                            fontSize: "14px",
                            color: team ? "#1A1A1A" : "#AAA",
                            fontFamily: "'Noto Sans KR', sans-serif",
                            outline: "none",
                            cursor: "pointer",
                            appearance: "none",
                            transition: "border-color 0.15s",
                            width: "100%",
                            boxSizing: "border-box",
                          }}
                          onFocus={(e) =>
                            (e.target.style.borderColor = "#E6007E")
                          }
                          onBlur={(e) =>
                            (e.target.style.borderColor = "transparent")
                          }
                        >
                          <option value="" disabled>
                            팀 선택
                          </option>
                          {TEAMS.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          size={16}
                          color="#AAA"
                          style={{
                            position: "absolute",
                            right: "12px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            pointerEvents: "none",
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "5px",
                    }}
                  >
                    <label
                      style={{
                        fontSize: "11px",
                        color: "#AAA",
                        fontFamily: "'Noto Sans KR', sans-serif",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                      }}
                    >
                      메시지
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="형윤님께 전하고 싶은 마음을 담아보세요"
                      maxLength={500}
                      rows={4}
                      style={{
                        background: "#F5F5F5",
                        border: "1.5px solid transparent",
                        borderRadius: "10px",
                        padding: "10px 12px",
                        fontSize: "14px",
                        color: "#1A1A1A",
                        fontFamily: "'Noto Sans KR', sans-serif",
                        outline: "none",
                        resize: "none",
                        lineHeight: 1.7,
                        transition: "border-color 0.15s",
                        width: "100%",
                        boxSizing: "border-box",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "#E6007E")}
                      onBlur={(e) =>
                        (e.target.style.borderColor = "transparent")
                      }
                    />
                    <p
                      style={{
                        textAlign: "right",
                        fontSize: "11px",
                        color: "#CCC",
                        fontFamily: "'Noto Sans KR', sans-serif",
                      }}
                    >
                      {message.length} / 500
                    </p>
                  </div>
                </div>

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  disabled={!isValid}
                  style={{
                    width: "100%",
                    padding: "14px",
                    borderRadius: "12px",
                    border: "none",
                    background: isValid ? "#E6007E" : "#EEEEEE",
                    color: isValid ? "#FFF" : "#BBB",
                    fontFamily: "'Noto Sans KR', sans-serif",
                    fontSize: "15px",
                    fontWeight: 700,
                    cursor: isValid ? "pointer" : "not-allowed",
                    transition: "all 0.2s",
                    letterSpacing: "0.02em",
                  }}
                  onMouseEnter={(e) => {
                    if (isValid)
                      (e.currentTarget as HTMLButtonElement).style.boxShadow =
                        "0 0 24px rgba(230,0,126,0.4)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.boxShadow =
                      "none";
                  }}
                >
                  메모 붙이기 ✦
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

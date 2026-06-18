import { useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export interface ImageLightboxProps {
  /** 확대해 보여줄 이미지 URL. null이면 닫힌 상태입니다. */
  src: string | null;
  /** 닫기 요청(배경 클릭 / 닫기 버튼 / ESC). */
  onClose: () => void;
  /** 이미지 대체 텍스트. */
  alt?: string;
  /** 사진 아래에 표시할 작은 라벨(예: 연도). */
  eyebrow?: string;
  /** 사진 아래에 표시할 제목. */
  caption?: string;
}

/**
 * 전체화면 이미지 확대 보기(라이트박스).
 *
 * 특정 데이터 모델에 의존하지 않고 src/캡션만 받는 순수 컴포넌트라,
 * 어느 화면에서든 재사용할 수 있습니다. 배경(어두운 영역) 클릭·닫기 버튼·ESC로
 * 닫고, 사진 자체 클릭은 닫지 않습니다. 열려 있는 동안 배경 스크롤을 잠급니다.
 */
export function ImageLightbox({
  src,
  onClose,
  alt = "",
  eyebrow,
  caption,
}: ImageLightboxProps) {
  const handleClose = useCallback(() => onClose(), [onClose]);

  // 열려 있는 동안 ESC로 닫고, 배경 스크롤을 잠급니다.
  useEffect(() => {
    if (!src) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [src, handleClose]);

  // 부모의 stacking context(캐러셀이 App의 zIndex:6 컨테이너 안에 있음)에 갇히지
  // 않도록 body에 포털로 렌더링합니다. 그래야 zIndex:200이 상장·다른 오버레이보다
  // 확실히 위에 옵니다.
  return createPortal(
    <AnimatePresence>
      {src && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={handleClose}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 200,
            background: "rgba(0,0,0,0.82)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "32px",
            cursor: "zoom-out",
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            // 사진 영역 클릭은 배경으로 전파되지 않게 해서 닫히지 않도록 합니다.
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              maxWidth: "min(92vw, 1100px)",
              maxHeight: "86vh",
              cursor: "default",
            }}
          >
            <ImageWithFallback
              src={src}
              alt={alt}
              style={{
                display: "block",
                maxWidth: "min(92vw, 1100px)",
                maxHeight: "78vh",
                width: "auto",
                height: "auto",
                objectFit: "contain",
                borderRadius: "16px",
                boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
              }}
            />
            {(eyebrow || caption) && (
              <div
                style={{
                  marginTop: "16px",
                  textAlign: "center",
                  fontFamily: "'Noto Sans KR', sans-serif",
                }}
              >
                {eyebrow && (
                  <p
                    style={{
                      fontSize: "14px",
                      fontWeight: 800,
                      color: "#FF66B2",
                      marginBottom: "4px",
                      letterSpacing: "0.02em",
                    }}
                  >
                    {eyebrow}
                  </p>
                )}
                {caption && (
                  <p
                    style={{
                      fontSize: "16px",
                      fontWeight: 700,
                      color: "#FFFFFF",
                    }}
                  >
                    {caption}
                  </p>
                )}
              </div>
            )}

            {/* 닫기 버튼 — 사진 우상단 */}
            <button
              onClick={handleClose}
              title="닫기"
              style={{
                position: "absolute",
                top: "-14px",
                right: "-14px",
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "#FFFFFF",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 4px 16px rgba(0,0,0,0.35)",
              }}
            >
              <X size={18} color="#1A1A1A" strokeWidth={2.5} />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

import {
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
  useRef,
} from "react";
import { motion, AnimatePresence } from "motion/react";
import { Filter, Sticker, ChevronDown, X, Download, Plus } from "lucide-react";
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
import { fileToStickerDataUrl } from "../lib/stickerImage";

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
  scale: number;
  sessionId: string;
}

const CANVAS_HEIGHT = 1000;
const BOARD_TOP_SPACE = "clamp(72px, 9vh, 120px)";
const BOARD_BOTTOM_SPACE = "1600px";

/**
 * 보드 배경: 파스텔 그라데이션 + 도트(피그잼 느낌의 땡땡이).
 * 도트는 색이 다른 두 레이어(진한 분홍 / 연한 분홍)를 겹쳐서,
 * 위(진한 분홍) → 아래(연한 분홍)로 색만 옅어지고 도트 자체는 끝까지 보입니다.
 */
const BOARD_GRADIENT =
  "linear-gradient(180deg, #FFFFFF 0%, #FFF6FB 60%, #FDEFF7 100%)";

/** 배경 도트 간격. */
const BOARD_DOT_SIZE = "36px 36px";

/** 진한 분홍 도트 — 위쪽에서 진하고 아래로 갈수록 사라짐. */
const BOARD_DOT_STRONG =
  "radial-gradient(circle, rgba(230,0,126,0.42) 1.4px, transparent 1.4px)";
const BOARD_DOT_STRONG_MASK =
  "linear-gradient(180deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)";

/** 연한 분홍 도트 — 위쪽에서 옅고 아래로 갈수록 진해짐(진한 도트가 사라진 자리를 채움). */
const BOARD_DOT_SOFT =
  "radial-gradient(circle, rgba(230,0,126,0.12) 1.4px, transparent 1.4px)";
const BOARD_DOT_SOFT_MASK =
  "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 100%)";

/** 배경 LG U+ 워드마크 윤곽선 색 — 메모를 가리지 않게 아주 연한 핑크. */
const WORDMARK_STROKE = "rgba(230,0,126, 0.5)";
/**
 * 이미지 스티커 토큰은 `img:` 접두사로 식별합니다. 이모지와 한 필드(`emoji`)에
 * 함께 저장되므로, DB 스키마를 바꾸지 않고 이미지 스티커를 표현할 수 있습니다.
 */
const IMAGE_STICKER_PREFIX = "img:";

/**
 * 이미지 스티커 공통 크기(px). 라이언과 사용자가 업로드한 이미지가 이 크기를 공유합니다.
 * 이 숫자 하나만 바꾸면 보드에 붙는 이미지 스티커 크기가 일괄로 조절됩니다.
 */
const IMAGE_STICKER_SIZE_PX = 48;

/** 이미지 스티커 토큰 → public 경로 + 보드 표시 크기(px) 매핑. */
const STICKER_IMAGES: Record<string, { src: string; size: number }> = {
  "img:lion": { src: "/lion.png", size: IMAGE_STICKER_SIZE_PX },
  "img:balloon": { src: "/balloon.png", size: 240 }, // 말풍선만 예외로 크게
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

/** 사용자가 업로드한 이미지는 base64 data URL로 저장됩니다. */
const DATA_URL_PREFIX = "data:image/";

const isImageSticker = (value: string | undefined | null): value is string =>
  typeof value === "string" &&
  (value.startsWith(IMAGE_STICKER_PREFIX) || value.startsWith(DATA_URL_PREFIX));

/** 보드에 표시되는 이모지 스티커 기본 크기(px). */
const EMOJI_STICKER_SIZE_PX = 32;

/**
 * 스티커가 이미지(미리 정의된 토큰 또는 업로드한 data URL)면 <img>,
 * 아니면 이모지 텍스트를 렌더링합니다. size를 주면 그 크기로, 없으면
 * 등록된 이미지의 기본 크기 → 공통 이미지 크기 순으로 폴백합니다.
 */
function StickerContent({
  value,
  size,
  scale = 1,
}: {
  value: string;
  size?: number;
  scale?: number;
}) {
  if (isImageSticker(value)) {
    const registered = STICKER_IMAGES[value]; // 토큰이면 존재, 업로드 data URL이면 undefined
    const px = (size ?? registered?.size ?? IMAGE_STICKER_SIZE_PX) * scale;
    const src = registered ? registered.src : value;
    return (
      <img
        src={src}
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
  const px = (size ?? EMOJI_STICKER_SIZE_PX) * scale;
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

/**
 * 보드 요소 z-index 체계. 오버레이(인트로 봉투 55 / 필터 80 / 모달 100)보다
 * 항상 아래에 있도록, 메모·스티커는 50 이하 구간으로 가둔다.
 *  - 메모: 20 ~ MEMO_Z_MAX(45), 드래그 시 MEMO_DRAG_Z(48)
 *  - 스티커: STICKER_Z(50) — 메모 위, 드래그/리사이즈 시 STICKER_ACTIVE_Z(52)
 */
const MEMO_Z_BASE = 20;
const MEMO_Z_MAX = 44;
const MEMO_TOP_Z = 46; // 마지막으로 만진 메모
const MEMO_DRAG_Z = 48; // 드래그 중인 메모
const STICKER_Z = 50;
const STICKER_TOP_Z = 53; // 마지막으로 만진 스티커(인트로 봉투 55보다는 아래)
const STICKER_ACTIVE_Z = 54; // 드래그·리사이즈 중

type StickerResizeState = {
  stickerId: string;
  startPageX: number;
  startPageY: number;
  origScale: number;
};

/** 스티커 크기 조절 한계와 민감도(드래그 픽셀당 scale 변화량 기준). */
const STICKER_MIN_SCALE = 0.4;
const STICKER_MAX_SCALE = 4;
const STICKER_RESIZE_SENSITIVITY = 200; // 이 픽셀만큼 끌면 scale 1 변화

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
    resizeSticker,
    deleteSticker,
    stickerAssets,
    addStickerAsset,
  } = useBoard(sessionId);
  const [introOpen, setIntroOpen] = useState(shouldShowIntro);
  const [modalOpen, setModalOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [stickerPanelOpen, setStickerPanelOpen] = useState(false);
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
  const [stickerResize, setStickerResize] =
    useState<StickerResizeState | null>(null);
  const [draggingScale, setDraggingScale] = useState<number | null>(null);
  // 마지막으로 만진 스티커 — 다른 스티커들 위로 올려준다.
  const [topStickerId, setTopStickerId] = useState<string | null>(null);
  // 마지막으로 만진 메모 — 다른 메모들 위로 올려준다.
  const [topMemoId, setTopMemoId] = useState<string | null>(null);
  const [canvasHeight, setCanvasHeight] = useState(CANVAS_HEIGHT);
  const canvasRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const wasDragging = useRef(false);
  const stickerWasDragging = useRef(false);
  const stickerFileInputRef = useRef<HTMLInputElement>(null);

  // 업로드한 이미지를 정사각 data URL로 변환해 공유 스티커 목록에 추가합니다.
  // 추가된 스티커는 패널에서 골라 보드 가운데에 붙일 수 있습니다.
  const handleStickerFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = ""; // 같은 파일을 다시 골라도 onChange가 발생하도록 초기화
      if (!file) return;
      try {
        const dataUrl = await fileToStickerDataUrl(file);
        addStickerAsset(dataUrl);
        toast.success("스티커가 목록에 추가됐어요 — 골라서 붙여보세요!");
      } catch {
        toast.error("이미지를 불러오지 못했어요. 다른 파일로 시도해 주세요.");
      }
    },
    [addStickerAsset],
  );

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
      // 마지막으로 만진 메모를 맨 위로 올린다(클릭만 해도 적용).
      setTopMemoId(memoId);
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

  // Mouse move & up for resizing stickers (모서리 핸들 드래그)
  useEffect(() => {
    if (!stickerResize) return;

    const handleMove = (e: MouseEvent) => {
      // 오른쪽 아래로 끌면 커지고, 왼쪽 위로 끌면 작아진다.
      const delta =
        (e.pageX - stickerResize.startPageX + e.pageY - stickerResize.startPageY) /
        STICKER_RESIZE_SENSITIVITY;
      const next = Math.max(
        STICKER_MIN_SCALE,
        Math.min(STICKER_MAX_SCALE, stickerResize.origScale + delta),
      );
      setDraggingScale(next);
    };

    const handleUp = () => {
      if (draggingScale != null) {
        resizeSticker(stickerResize.stickerId, draggingScale);
      }
      setStickerResize(null);
      setDraggingScale(null);
      // 리사이즈 직후 발생하는 보드 클릭(편지쓰기 모달)을 무시한다.
      wasDragging.current = true;
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
  }, [stickerResize, draggingScale, resizeSticker]);

  const handleStickerResizeStart = useCallback(
    (stickerId: string, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation(); // 위치 드래그와 분리
      const sticker = stickers.find((s) => s.id === stickerId);
      if (!sticker) return;
      setStickerResize({
        stickerId,
        startPageX: e.pageX,
        startPageY: e.pageY,
        origScale: sticker.scale ?? 1,
      });
    },
    [stickers],
  );

  // 현재 화면(viewport) 한가운데가 보드 좌표계에서 몇 %인지 계산합니다.
  // 메모·스티커를 "항상 화면 가운데"에 추가할 때 사용합니다.
  const viewportCenterOnBoard = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 50, y: 50 };
    const rect = canvas.getBoundingClientRect();
    const x = ((window.innerWidth / 2 - rect.left) / canvas.offsetWidth) * 100;
    const y = ((window.innerHeight / 2 - rect.top) / canvas.offsetHeight) * 100;
    return {
      x: Math.max(2, Math.min(90, x)),
      y: Math.max(2, Math.min(96, y)),
    };
  }, []);

  // 보드 빈 곳을 클릭하면 메모 쓰기를 엽니다. 위치는 항상 화면 가운데로 통일합니다.
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    if (wasDragging.current) return;
    setPendingPos(viewportCenterOnBoard());
    setModalOpen(true);
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
    // 봉투를 열 때 페이지 최상단으로 올려 상장이 화면 가운데 보이게 한다.
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  // 인트로가 열려 있는 동안에는 최상단에서 배경 스크롤을 막는다.
  // useLayoutEffect로 페인트 전에 최상단으로 올려 봉투가 튀는 현상을 막는다.
  useLayoutEffect(() => {
    if (!introOpen) return;
    window.scrollTo({ top: 0, behavior: "auto" });
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
      toast.error("PDF 저장에 실패했어요. 다시 시도해 주세요.", {
        id: toastId,
      });
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
          cursor: "default",
          backgroundImage: BOARD_GRADIENT,
          overflow: "hidden",
        }}
      >
        {/* 도트 레이어 — 진한 분홍(위) + 연한 분홍(아래)을 겹쳐
            위→아래로 색만 옅어지고 도트는 끝까지 보이게 한다. */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            pointerEvents: "none",
            backgroundImage: BOARD_DOT_STRONG,
            backgroundSize: BOARD_DOT_SIZE,
            WebkitMaskImage: BOARD_DOT_STRONG_MASK,
            maskImage: BOARD_DOT_STRONG_MASK,
          }}
        />
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            pointerEvents: "none",
            backgroundImage: BOARD_DOT_SOFT,
            backgroundSize: BOARD_DOT_SIZE,
            WebkitMaskImage: BOARD_DOT_SOFT_MASK,
            maskImage: BOARD_DOT_SOFT_MASK,
          }}
        />
        {/* <div
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
        </div> */}

        {/* Main letter — centered.
            인트로(봉투) 동안에는 아래에 작게 숨어 있다가, 입장하면
            봉투에서 편지지가 빠져나오듯 아래에서 위로 슬쩍 올라오며 등장한다. */}
        <div style={{ pointerEvents: "none" }}>
          <motion.div
            initial={false}
            animate={
              introOpen
                ? { opacity: 0, y: 80, scale: 0.82 }
                : { opacity: 1, y: 0, scale: 1 }
            }
            transition={{
              duration: 0.7,
              ease: [0.16, 1, 0.3, 1],
              opacity: { duration: 0.5 },
            }}
            style={{
              transformOrigin: "center bottom",
              // 래퍼는 항상 클릭을 통과시키고, 상장 카드(LetterCard)만 클릭을 받는다.
              // (LetterCard 자체가 pointerEvents:auto를 가짐) → 상장 주변 빈 공간
              // 클릭이 보드 캔버스로 전달되어 스티커를 붙일 수 있다.
              pointerEvents: "none",
            }}
          >
            <LetterCard memoCount={memos.length} />
          </motion.div>
        </div>

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
          const isThisResizing = stickerResize?.stickerId === sticker.id;
          // 드래그 중인 동안에는 임시 좌표로 따라오게 합니다.
          const pos =
            isThisDragging && draggingStickerPos
              ? draggingStickerPos
              : { x: sticker.x, y: sticker.y };
          // 리사이즈 중에는 임시 scale로 즉시 반영합니다.
          const scale =
            isThisResizing && draggingScale != null
              ? draggingScale
              : sticker.scale ?? 1;
          // 이미지 스티커(말풍선 등)는 기울이지 않고 똑바로 붙입니다.
          const rotation = isImageSticker(sticker.emoji) ? 0 : sticker.rotation;
          return (
            <div
              key={sticker.id}
              onMouseDown={(e) => {
                // 마지막으로 만진 스티커를 맨 위로 올린다.
                setTopStickerId(sticker.id);
                // 누구나 스티커 위치를 옮길 수 있습니다(삭제는 자기 것만).
                handleStickerDragStart(sticker.id, e);
              }}
              className="group"
              style={{
                position: "absolute",
                left: `${pos.x}%`,
                top: `${(pos.y / 100) * canvasHeight}px`,
                transform: `rotate(${rotation}deg)`,
                lineHeight: 1,
                // 스티커는 메모(편지)보다 위에 떠서 꾸밀 수 있게 한다.
                // 단, 인트로 봉투(55)·필터(80)·모달(100) 같은 오버레이보다는 아래.
                // 드래그/리사이즈 중 > 마지막으로 만진 것 > 기본 순으로 쌓인다.
                zIndex:
                  isThisDragging || isThisResizing
                    ? STICKER_ACTIVE_Z
                    : topStickerId === sticker.id
                      ? STICKER_TOP_Z
                      : STICKER_Z,
                cursor: isThisDragging ? "grabbing" : "grab",
                userSelect: "none",
                pointerEvents: "auto",
              }}
            >
              <StickerContent value={sticker.emoji} scale={scale} />
              {isOwn && (
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

              {/* 크기 조절 핸들 — 우하단, 드래그로 확대/축소 (누구나) */}
              <span
                data-export-hide
                onMouseDown={(e) => {
                  setTopStickerId(sticker.id);
                  handleStickerResizeStart(sticker.id, e);
                }}
                title="드래그해서 크기 조절"
                style={{
                  position: "absolute",
                  bottom: "0px",
                  right: "0px",
                  width: "11px",
                  height: "11px",
                  borderRadius: "50%",
                  background: "#E6007E",
                  border: "1.5px solid #FFF",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                  opacity: isThisResizing ? 1 : 0,
                  transition: "opacity 0.15s",
                  cursor: "nwse-resize",
                  zIndex: 2,
                }}
                className="sticker-resize-btn"
              />
            </div>
          );
        })}

        {/* Memos */}
        {memos.map((memo, index) => {
          const pos = draggingMemos[memo.id] ?? { x: memo.x, y: memo.y };
          // 우선순위: 드래그 중 > 마지막으로 만진 메모 > 최신순(최신이 위).
          // memos는 최신이 index 0이므로 (MAX - index)로 최신일수록 높게 둔다.
          let memoZ: number;
          if (dragging?.memoId === memo.id) {
            memoZ = MEMO_DRAG_Z;
          } else if (topMemoId === memo.id) {
            memoZ = MEMO_TOP_Z;
          } else {
            memoZ = Math.max(MEMO_Z_BASE, MEMO_Z_MAX - index);
          }
          return (
            <div
              key={memo.id}
              style={{
                position: "absolute",
                left: `${pos.x}%`,
                top: `${(pos.y / 100) * canvasHeight}px`,
                zIndex: memoZ,
                pointerEvents: "auto",
              }}
            >
              <MemoCard
                memo={{ ...memo, x: pos.x, y: pos.y }}
                canDelete={memo.sessionId === sessionId}
                onDelete={deleteMemo}
                onDragStart={handleDragStart}
                isDragging={dragging?.memoId === memo.id}
                zIndex={memoZ}
              />
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <SiteFooter />

      {/* PDF export — bottom left, separated from the action buttons */}
      <div
        data-export-hide
        style={{
          position: "fixed",
          bottom: "28px",
          left: "28px",
          zIndex: 50,
        }}
      >
        <span className="tooltip-wrap">
          <span className="tooltip-label">PDF로 편지 저장</span>
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
              boxShadow:
                "0 4px 16px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.06)",
              opacity: exporting ? 0.55 : 1,
              transition: "opacity 0.2s",
            }}
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
        </span>
      </div>

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
                  color: "#AAA",
                  fontFamily: "'Noto Sans KR', sans-serif",
                  marginBottom: "4px",
                }}
              >
                스티커를 고르면 화면 가운데에 붙어요
              </p>
              {[...STICKER_OPTIONS, ...stickerAssets.map((a) => a.dataUrl)].map(
                (emoji, i) => (
                  <button
                    key={`${i}-${emoji.slice(0, 24)}`}
                    onClick={() => {
                      // 고르는 즉시 화면 가운데에 붙이고, 이후 드래그로 옮깁니다.
                      const center = viewportCenterOnBoard();
                      addSticker({ emoji, x: center.x, y: center.y });
                      setStickerPanelOpen(false);
                    }}
                    style={{
                      width: "100%",
                      aspectRatio: "1 / 1",
                      borderRadius: "8px",
                      background: "#F5F5F5",
                      border: "1.5px solid transparent",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.transform = "scale(1.15)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.transform = "scale(1)")
                    }
                  >
                    <StickerContent value={emoji} size={20} />
                  </button>
                ),
              )}

              {/* 직접 이미지 첨부해 스티커 추가 */}
              <button
                onClick={() => stickerFileInputRef.current?.click()}
                title="이미지 첨부해서 스티커 추가"
                style={{
                  width: "100%",
                  aspectRatio: "1 / 1",
                  borderRadius: "8px",
                  background: "transparent",
                  border: "1.5px dashed #CCC",
                  color: "#AAA",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#E6007E";
                  e.currentTarget.style.color = "#E6007E";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#CCC";
                  e.currentTarget.style.color = "#AAA";
                }}
              >
                <Plus size={18} />
              </button>

              <input
                ref={stickerFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleStickerFileChange}
                style={{ display: "none" }}
              />
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
          <span className="tooltip-wrap">
            <span className="tooltip-label">메모 보기</span>
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
            >
              <Filter size={18} color="#FFF" />
            </motion.button>
          </span>

          {/* Sticker button */}
          <span className="tooltip-wrap">
            <span className="tooltip-label">스티커 붙이기</span>
            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => {
                setStickerPanelOpen(!stickerPanelOpen);
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
            >
              <Sticker
                size={20}
                color={stickerPanelOpen ? "#FFFFFF" : "#1A1A1A"}
              />
            </motion.button>
          </span>

          {/* Write button */}
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => {
              setPendingPos(viewportCenterOnBoard());
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

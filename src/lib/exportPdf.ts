import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";

/**
 * 롤링페이퍼를 화면 그대로 고해상도로 캡처해 PDF(`rollingpaper.pdf`)로 저장한다.
 *
 * 설계 메모:
 * - 텍스트를 벡터로 다시 그리지 않고, DOM을 고해상도 캔버스로 떠서 이미지로 넣는다.
 *   자유 배치·회전·그림자·스티커 등 보드의 분위기를 100% 보존하기 위함이다.
 * - 보드(`data-export="board"`)를 통째로 한 번 캡처한다. 상장·편지·스티커가 모두
 *   보드 안에 있으므로 화면에 보이는 그대로 들어간다.
 * - 캡처에서 빼야 할 인터랙션 UI(삭제 버튼·플로팅 버튼·힌트 등)는
 *   `data-export-hide` 속성으로 표시하고, 캡처 직전 일시적으로 숨긴다.
 */

/** A4 세로 크기(mm). jsPDF 기본 단위 mm 기준. */
const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;

/** 캡처 배율. 높을수록 선명하지만 메모리를 더 쓴다. 모바일은 낮춘다. */
function captureScale(): number {
  const isMobile =
    typeof navigator !== "undefined" &&
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  return isMobile ? 2 : 3;
}

/** 웹폰트가 모두 로드될 때까지 기다린다(미로딩 시 캡처에 폰트가 빠질 수 있음). */
async function waitForAssets(root: HTMLElement): Promise<void> {
  // 1) 폰트
  if (document.fonts?.ready) {
    try {
      await document.fonts.ready;
    } catch {
      /* 폰트 API 미지원/실패는 무시하고 진행 */
    }
  }
  // 2) 이미지 — root 내부의 <img>가 디코드 완료될 때까지 대기
  const imgs = Array.from(root.querySelectorAll("img"));
  await Promise.all(
    imgs.map((img) => {
      if (img.complete && img.naturalWidth > 0) return Promise.resolve();
      return new Promise<void>((resolve) => {
        const done = () => resolve();
        img.addEventListener("load", done, { once: true });
        img.addEventListener("error", done, { once: true });
      });
    }),
  );
}

/** 캡처 중 숨길 요소들을 잠시 display:none 처리하고, 복원 함수를 돌려준다. */
function hideExportHidden(): () => void {
  const nodes = Array.from(
    document.querySelectorAll<HTMLElement>("[data-export-hide]"),
  );
  const prev = nodes.map((n) => n.style.display);
  nodes.forEach((n) => {
    n.style.display = "none";
  });
  return () => {
    nodes.forEach((n, i) => {
      n.style.display = prev[i];
    });
  };
}

async function captureElement(el: HTMLElement): Promise<HTMLCanvasElement> {
  return html2canvas(el, {
    scale: captureScale(),
    useCORS: true,
    backgroundColor: "#FFFFFF",
    logging: false,
  });
}

/**
 * 캔버스 한 장을 A4 페이지(들)에 채워 넣는다.
 * 가로폭을 A4에 맞추고, 세로가 한 페이지를 넘으면 잘라서 여러 페이지로 나눈다.
 * 첫 조각은 doc의 기본 페이지에, 이후 조각은 새 페이지에 그린다.
 */
function addCanvasAsPages(doc: jsPDF, canvas: HTMLCanvasElement): void {
  // A4 가로폭에 맞췄을 때, 캔버스 1픽셀이 차지하는 mm
  const pxPerMm = canvas.width / A4_WIDTH_MM;
  // 한 페이지에 들어갈 수 있는 캔버스 픽셀 높이
  const pageHeightPx = Math.floor(A4_HEIGHT_MM * pxPerMm);

  let renderedPx = 0;
  let firstSlice = true;

  while (renderedPx < canvas.height) {
    const sliceHeightPx = Math.min(pageHeightPx, canvas.height - renderedPx);

    // 이 조각만 떼어낼 임시 캔버스
    const slice = document.createElement("canvas");
    slice.width = canvas.width;
    slice.height = sliceHeightPx;
    const ctx = slice.getContext("2d");
    if (!ctx) break;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, slice.width, slice.height);
    ctx.drawImage(
      canvas,
      0,
      renderedPx,
      canvas.width,
      sliceHeightPx,
      0,
      0,
      canvas.width,
      sliceHeightPx,
    );

    if (!firstSlice) {
      doc.addPage();
    }
    const sliceHeightMm = sliceHeightPx / pxPerMm;
    doc.addImage(
      slice.toDataURL("image/jpeg", 0.92),
      "JPEG",
      0,
      0,
      A4_WIDTH_MM,
      sliceHeightMm,
    );

    renderedPx += sliceHeightPx;
    firstSlice = false;
  }
}

/**
 * 편지 보드를 통째로 캡처해 `rollingpaper.pdf`로 저장한다.
 * 캡처 대상 요소가 없으면 throw 한다(호출부에서 토스트로 안내).
 */
export async function exportRollingPaperPdf(): Promise<void> {
  const boardEl = document.querySelector<HTMLElement>('[data-export="board"]');

  if (!boardEl) {
    throw new Error("캡처할 보드를 찾지 못했습니다.");
  }

  const restore = hideExportHidden();
  try {
    await waitForAssets(boardEl);

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const boardCanvas = await captureElement(boardEl);
    addCanvasAsPages(doc, boardCanvas);

    doc.save("rollingpaper.pdf");
  } finally {
    restore();
  }
}


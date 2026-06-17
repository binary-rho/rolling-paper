/**
 * 사용자가 업로드한 이미지를 스티커용 정사각 base64 data URL로 변환합니다.
 *
 * 원본 그대로 저장하면 base64 문자열이 너무 커져 DB·네트워크에 부담이 되므로,
 * 한 변을 STICKER_UPLOAD_MAX_PX로 맞춰 정사각(cover) 크롭·리사이즈한 뒤
 * PNG data URL로 인코딩합니다.
 */

/** 업로드 이미지를 저장하기 전 줄일 한 변의 최대 픽셀. 보드 표시 크기(48px)의 고해상도 여유. */
const STICKER_UPLOAD_MAX_PX = 256;

export async function fileToStickerDataUrl(file: File): Promise<string> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await loadImage(objectUrl);
    const canvas = document.createElement("canvas");
    canvas.width = STICKER_UPLOAD_MAX_PX;
    canvas.height = STICKER_UPLOAD_MAX_PX;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas context를 가져오지 못했습니다.");

    // 정사각으로 cover 크롭: 짧은 변 기준으로 가운데를 잘라 채웁니다.
    const side = Math.min(img.naturalWidth, img.naturalHeight);
    const sx = (img.naturalWidth - side) / 2;
    const sy = (img.naturalHeight - side) / 2;
    ctx.drawImage(
      img,
      sx,
      sy,
      side,
      side,
      0,
      0,
      STICKER_UPLOAD_MAX_PX,
      STICKER_UPLOAD_MAX_PX,
    );

    return canvas.toDataURL("image/png");
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("이미지를 불러오지 못했습니다."));
    img.src = src;
  });
}

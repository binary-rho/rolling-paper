const FONT = "'Noto Sans KR', sans-serif";

export function SiteFooter() {
  return (
    <footer
      style={{
        width: "100%",
        background: "#0F0F0F",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        padding: "44px clamp(32px, 6vw, 72px) 52px",
      }}
    >
      <div
        style={{
          maxWidth: "1120px",
          margin: "0 auto",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "20px",
        }}
      >
        <div>
          <p
            style={{
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: "14px",
              letterSpacing: "0.04em",
              color: "#FFFFFF",
              marginBottom: "8px",
            }}
          >
            LG U+ <span style={{ color: "#E6007E" }}>·</span> 디지털플랫폼개발랩
          </p>
          <p
            style={{
              fontFamily: FONT,
              fontWeight: 300,
              fontSize: "13px",
              color: "rgba(255,255,255,0.55)",
            }}
          >
            형윤님의 새로운 시작을 진심으로 응원합니다.
          </p>
        </div>

        <p
          style={{
            fontFamily: FONT,
            fontWeight: 400,
            fontSize: "12px",
            letterSpacing: "0.03em",
            color: "rgba(255,255,255,0.4)",
          }}
        >
          © 2026 디지털플랫폼개발랩 · 디지털FE팀
        </p>
      </div>
    </footer>
  );
}

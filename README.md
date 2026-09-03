# Rolling Paper

팀원에게 다같이 마음을 전하는 롤링페이퍼. **계속 재사용하는 템플릿**입니다.

- 첫 방문에 봉투 인트로 → 가운데 카드(축하장/상장 등) → 아래로 자유 배치 편지 보드
- 편지·스티커를 원하는 자리에 끌어다 붙이고, 크기도 조절
- Supabase로 실시간 동기화 (환경변수 없으면 `localStorage` 폴백)
- 보드 전체를 화면 그대로 PDF로 저장
- 모바일에서는 꾸미기 대신 전체화면 편지 목록으로 전환

원본 디자인: [Figma](https://www.figma.com/design/CwceRaHgva4veBac1MyDHT/%ED%8C%80%EC%9E%A5%EB%8B%98-%EB%A1%A4%EB%A7%81%ED%8E%98%EC%9D%B4%ED%8D%BC-%EB%94%94%EC%9E%90%EC%9D%B8)

---

## 버전 관리

`main`은 **가장 최근 대상**의 상태를 담습니다. 새 대상으로 갈아끼우기 전에, 지금 올라가 있는 버전을 브랜치로 남겨 두세요.

```bash
# 1. 현재 버전 보존 (예: archive/2026-10-출산휴가)
git switch -c archive/<yyyy-mm>-<대상>-<사유>
git push -u origin archive/<yyyy-mm>-<대상>-<사유>

# 2. main으로 돌아와 새 대상 작업 시작
git switch main
```

지난 롤링페이퍼도 그대로 열어볼 수 있어야 하니, 브랜치는 지우지 마세요. **Supabase 프로젝트도 대상마다 새로 파는 것을 권합니다** — 그러면 지난 편지들이 그 프로젝트에 온전히 남습니다.

---

## 실행

```bash
pnpm i      # 의존성 설치
pnpm dev    # 개발 서버
pnpm build  # 프로덕션 빌드 → dist/
```

---

## Supabase 연동

편지·스티커와 좌표가 Supabase에 저장됩니다. 환경변수가 없으면 자동으로 `localStorage` 폴백으로 동작합니다.

### 1. 프로젝트 만들고 스키마 실행

대상마다 새 프로젝트를 파세요. Supabase 대시보드 → **SQL Editor** → New query → `supabase/schema.sql` **전체를 붙여넣고 Run**.

한 번에 세 가지가 만들어집니다.

| 항목 | 내용 |
|---|---|
| 테이블 | `memos`, `stickers`, `sticker_assets` |
| RLS 정책 | 익명 사용자 읽기/쓰기 허용 (`using(true) with check(true)`) |
| Realtime | 세 테이블을 `supabase_realtime` publication에 등록 |

`IF NOT EXISTS` / `drop policy if exists` / `duplicate_object` 예외 처리가 되어 있어 여러 번 실행해도 안전합니다.

### 2. 환경변수를 두 곳에 넣기

Project Settings → API에서 **Project URL**과 **`anon public`** 키를 받아옵니다.

| 위치 | 용도 | 반영 방법 |
|---|---|---|
| `.env.local` | 로컬 개발 | **`pnpm dev` 재시작** — Vite는 시작할 때만 env를 읽습니다 |
| Vercel → Config | 배포 | **Redeploy** — 빌드 시점에 번들로 인라인됩니다 |

`.env.example`을 복사해 `.env.local`을 만드세요.

```bash
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon public key>
```

### 3. 연결됐는지 반드시 확인

**env가 틀려도 에러가 나지 않습니다.** `src/lib/supabase.ts`에서 클라이언트가 `null`이 되고 조용히 `localStorage` 폴백으로 빠지기 때문에, 화면은 완전히 정상으로 보입니다. 접속한 사람마다 자기 편지만 보이는 상태로 행사를 치를 수 있으니 꼭 확인하세요.

1. 사이트에서 편지를 하나 쓰고 → Supabase **Table Editor → `memos`** 에 행이 생겼는지 확인
2. 시크릿 창으로 같은 URL을 열어 그 편지가 보이는지 확인 (보이면 연결됨)

### `VITE_` 접두사 경고

Vercel에 넣으면 *"Remove the public framework prefix to keep this value private"* 경고가 뜹니다. **접두사를 그대로 두고 Config로 등록하세요.**

- Vite는 `VITE_`로 시작하는 변수만 `import.meta.env`에 넣어줍니다. 접두사를 떼면 앱이 위 3번의 조용한 폴백 상태가 됩니다.
- 이 두 값은 브라우저에 노출되는 것이 정상입니다. `anon public` 키는 이름 그대로 공개용이고, 접근 제어는 키를 숨기는 게 아니라 RLS로 겁니다.
- 어떤 이름을 쓰든 브라우저가 Supabase에 직접 붙어야 하므로 값은 번들에 들어갑니다. 이름 변경은 표기상의 변경일 뿐입니다.

> 현재 RLS는 누구나 모든 편지를 읽고 쓰고 **지울 수** 있게 열려 있습니다. UI는 자기 편지만 지우도록 막지만 DB는 막지 않습니다. 사내 공유용(`noindex`)이라 그대로 두고 있으니, 더 엄격히 가려면 `supabase/schema.sql`의 정책을 조정하세요.

---

## Vercel 배포

1. GitHub에 올리고 Vercel에서 Import (Framework Preset: **Vite**)
2. Build Command `pnpm build`, Output Directory `dist` (Vite 기본값으로 자동 감지)
3. **Config**에 `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` 추가
4. Deploy

---

## 새 대상으로 갈아끼우기

체크리스트 순서대로 훑으면 빠지는 곳이 없습니다.

### 1. 이름과 문구

| 파일 | 무엇 |
|---|---|
| `src/app/App.tsx` | `<IntroEnvelope to="○○님께" />` — 봉투에 적히는 받는이 |
| `src/app/components/LetterCard.tsx` | 카드 제목·부제·받는이·본문·`GRANTED_AT`(날짜)·보내는이 |
| `src/app/components/SiteFooter.tsx` | 하단 응원 문구, 소속 표기, 저작권 연도 |
| `src/app/components/WriteMemoModal.tsx` | 편지 입력창 placeholder |
| `index.html` | `<title>`, `<meta name="description">` |

빠진 곳이 없는지 이름으로 훑어보세요.

```bash
grep -rn "이전대상이름" --include="*.tsx" --include="*.html" src index.html
```

### 2. 인트로 플래그 (놓치기 쉬움)

`src/app/App.tsx`의 `INTRO_SEEN_KEY`를 **대상이 바뀔 때마다 함께 올려야** 합니다.

```ts
const INTRO_SEEN_KEY = "rp_intro_seen_<대상>";
```

같은 도메인에 배포하므로 `localStorage`가 공유됩니다. 키를 그대로 두면 지난 롤링페이퍼를 봤던 사람들은 플래그가 남아 **새 봉투 연출을 아예 보지 못합니다.**

### 3. 가운데 카드

`src/app/components/LetterCard.tsx` 하나만 고치면 됩니다. 톤은 상수로 모여 있습니다.

| 상수 | 역할 |
|---|---|
| `TITLE_FONT` / `BODY_FONT` | 제목·본문 서체 |
| `FRAME_GRADIENT` | 바깥 프레임 그라데이션 |
| `BORDER_PINK` `ACCENT_PINK` `STRONG_PINK` `SOFT_PINK` | 테두리·부제·강조·구분선 |
| `TITLE_COLOR` `BODY_COLOR` | 제목·본문 글자색 |
| `GRANTED_AT` | 하단 날짜 |

사유에 따라 성격을 바꿔 쓰세요 — 퇴사는 상장, 출산·육아휴직은 축하장처럼요.

### 4. 팀 목록 — **두 곳을 같이** 고치기

| 파일 | 상수 |
|---|---|
| `src/app/components/WriteMemoModal.tsx` | `TEAMS` (편지쓰기 드롭다운) |
| `src/app/components/FilterPopup.tsx` | `ALL_TEAMS` (필터 칩, `"전체"` 옵션 포함) |

**두 목록은 반드시 일치해야 합니다.** 한쪽만 고치면 그 팀으로 쓴 편지가 필터에서 사라집니다. 참여 범위(팀 단위 / 랩 단위)에 맞춰 함께 조정하세요.

### 5. 캐릭터와 스티커

`src/app/App.tsx`의 `STICKER_IMAGES`(토큰 → 경로·크기)와 `STICKER_OPTIONS`(패널 노출 순서)에 등록합니다.

```ts
const STICKER_IMAGES = {
  "img:<이름>": { src: "/<파일>.png", size: 88 },
};
```

- 파일은 `public/`에 두고, **배경이 투명한 PNG**를 쓰세요
- 카드를 꾸미는 캐릭터는 `LetterCard.tsx`의 `PERCHED_CHARACTERS`(테두리에 걸터앉는 둘)와 푸터 이미지에서 지정합니다
- 크기는 `CHARACTER_SIZE`, `FOOTER_CHARACTER_SIZE` 두 상수로 조절합니다
- 사용자는 패널의 `+` 버튼으로 직접 이미지를 올릴 수도 있습니다 (base64로 `sticker_assets`에 공유 저장)

### 6. 파비콘은 정사각형으로

`index.html`의 `<link rel="icon">`. **원본이 정사각형이 아니면 브라우저가 눌러서 그립니다.** CSS로는 못 고치니 이미지 자체를 정사각형으로 만들어야 합니다.

투명 여백을 넣어 정사각형으로 맞추는 방법 (ImageMagick 등이 없어도 됨):

```python
# 표준 라이브러리만으로 PNG를 패딩. zlib + struct로 디코딩 → 중앙 배치 → 재인코딩
# macOS의 sips는 --padColor가 RGB만 받아 투명 패딩이 안 됩니다.
```

### 7. 사진 캐러셀 (현재 비활성)

`AchievementCarousel`은 지금 **화면에 렌더되지 않습니다.** 컴포넌트 파일은 남아 있으니, 쓰려면 `src/app/App.tsx`의 주석 자리에 되살리세요.

```tsx
<div style={{ position: "relative", zIndex: 6 }}>
  <AchievementCarousel />
</div>
```

사진은 `public/`에 넣고 `AchievementCarousel.tsx`의 `MILESTONES` 배열에서 `image` 경로를 지정합니다. `image`를 비우면 연도만 크게 보이는 플레이스홀더가 뜹니다.

> 되살릴 때 `contentRef`(스크롤 다운 버튼의 목적지)를 캐러셀 쪽으로 옮길지 결정하세요. 지금은 아래 편지 영역을 가리키고 있습니다.

### 8. 서체

**폰트 로딩이 두 곳에 나뉘어 있습니다.** 새 폰트를 쓸 때 둘 다 확인하세요.

| 위치 | 담당 |
|---|---|
| `index.html`의 `<link>` | Gaegu, Gowun Dodum, Nanum Myeongjo, Noto Sans KR |
| `src/styles/fonts.css`의 `@import` | Black Han Sans, Montserrat, Noto Sans KR |

성능상 `index.html`의 `<link>` 쪽에 추가하는 편이 낫습니다 (`@import`는 로딩이 한 단계 늦어짐).

### 9. 배경

`src/app/App.tsx`에서 조절합니다.

| 상수 | 역할 |
|---|---|
| `BOARD_GRADIENT` | 보드 그라데이션 + 카드 뒤 후광 |
| `BOARD_CONFETTI` | 파스텔 도트 레이어 (색·크기·간격·오프셋) |
| `BOARD_BOTTOM_*` | 편지 수에 따라 늘어나는 하단 여백 |

`BOARD_CONFETTI` 배열 하나에서 `backgroundImage`/`Size`/`Position` 세 값을 만들어 쓰므로, 색을 더하거나 빼려면 배열만 고치면 됩니다.

> **긴 보드에서 `filter: blur`와 `mask` 그라데이션은 쓰지 마세요.** 보드는 편지 수에 따라 최대 8000px까지 늘어나는데, 이 두 속성이 스크롤 성능을 크게 해칩니다. 타일링되는 `radial-gradient`로 대체하세요.

---

## 함정 모음

작업하다 실제로 밟았던 것들입니다.

- **env는 빌드 시점에 인라인됩니다.** Vercel에서 저장만 하면 반영되지 않고 Redeploy가 필요합니다. 로컬은 `pnpm dev` 재시작.
- **Supabase 미연결이 조용히 넘어갑니다.** 위 "연결됐는지 반드시 확인" 절차를 꼭 밟으세요.
- **`motion`은 `transform`을 직접 만들어 씁니다.** `motion.div`/`motion.img`에 `style={{ transform: "rotate(...)" }}`를 주면 덮어써져 사라집니다. 회전은 `animate={{ rotate }}`로 주세요.
- **`localStorage` 키는 도메인 단위로 공유됩니다.** 대상이 바뀌면 `INTRO_SEEN_KEY`를 올리세요.
- **팀 목록은 두 파일에 있습니다.** 한쪽만 고치면 편지가 필터에서 사라집니다.
- **파비콘 비율은 이미지로만 고칩니다.** CSS로는 손댈 수 없습니다.
- PDF로 빼고 싶지 않은 UI에는 `data-export-hide` 속성을 붙이세요. 캡처 직전 숨겨집니다 (`src/lib/exportPdf.ts`).
- 보드 위 요소의 z-index는 `src/app/App.tsx` 상단에 체계가 정리돼 있습니다. 오버레이(봉투 55 / 필터 80 / 모달 100)보다 아래를 유지하세요.

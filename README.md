
  # 팀장님 롤링페이퍼 디자인

  This is a code bundle for 팀장님 롤링페이퍼 디자인. The original project is available at https://www.figma.com/design/CwceRaHgva4veBac1MyDHT/%ED%8C%80%EC%9E%A5%EB%8B%98-%EB%A1%A4%EB%A7%81%ED%8E%98%EC%9D%B4%ED%8D%BC-%EB%94%94%EC%9E%90%EC%9D%B8.

  ## Running the code

  Run `pnpm i` (또는 `npm i`) to install the dependencies.

  Run `pnpm dev` to start the development server.

  ## Supabase 연동

  메모/스티커와 위치 데이터는 Supabase에 저장됩니다. 환경변수가 없으면 자동으로 `localStorage` 폴백으로 동작합니다.

  1. **DB 준비**: Supabase Dashboard > SQL Editor에서 `supabase/schema.sql`을 실행합니다. (테이블 + RLS 정책 + Realtime publication 생성)
  2. **환경변수 설정**: `.env.example`을 참고해 `.env.local`을 만들고 값을 채웁니다.
     - `VITE_SUPABASE_URL` — 예: `https://orwaliidjjinjntrbpts.supabase.co`
     - `VITE_SUPABASE_ANON_KEY` — Project Settings > API 의 `anon public` 키
  3. `pnpm dev`로 재시작하면 Supabase 연동 + 실시간 동기화가 활성화됩니다.

  > anon key는 클라이언트에 노출되는 공개 키입니다. 데이터 접근 제어는 RLS 정책으로 관리됩니다(`schema.sql` 참고).

  ## Vercel 배포

  1. 이 저장소를 GitHub에 올리고 Vercel에서 Import 합니다. (Framework Preset: **Vite**)
  2. Build Command `pnpm build`, Output Directory `dist` (Vite 기본값으로 자동 감지됩니다).
  3. Project Settings > **Environment Variables** 에 `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` 를 추가합니다.
  4. Deploy.
  
import { useCallback, useEffect, useState } from "react";
import { supabase, isSupabaseEnabled } from "../../lib/supabase";
import type { Memo, Sticker, NoteColor } from "../App";

const MEMOS_KEY = "rp_memos";
const STICKERS_KEY = "rp_stickers";
const STICKER_ASSETS_KEY = "rp_sticker_assets";
const MEMO_ROTATION_RANGE_DEG = 7;
const STICKER_ROTATION_RANGE_DEG = 30;

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function randomRotation(rangeDeg: number) {
  return (Math.random() - 0.5) * rangeDeg;
}

type MemoRow = {
  id: string;
  author_name: string;
  team: string;
  message: string;
  color: string;
  rotation: number;
  x: number;
  y: number;
  created_at: string;
  session_id: string;
};

type StickerRow = {
  id: string;
  emoji: string;
  x: number;
  y: number;
  rotation: number;
  session_id: string;
};

/** 모두가 공유하는 업로드 이미지 스티커 카탈로그의 한 항목. */
export interface StickerAsset {
  id: string;
  dataUrl: string;
}

type StickerAssetRow = {
  id: string;
  data_url: string;
  session_id: string;
  created_at: string;
};

const rowToStickerAsset = (r: StickerAssetRow): StickerAsset => ({
  id: r.id,
  dataUrl: r.data_url,
});

const rowToMemo = (r: MemoRow): Memo => ({
  id: r.id,
  authorName: r.author_name,
  team: r.team,
  message: r.message,
  color: r.color as NoteColor,
  rotation: r.rotation,
  x: r.x,
  y: r.y,
  createdAt: r.created_at,
  sessionId: r.session_id,
});

const memoToRow = (m: Memo): MemoRow => ({
  id: m.id,
  author_name: m.authorName,
  team: m.team,
  message: m.message,
  color: m.color,
  rotation: m.rotation,
  x: m.x,
  y: m.y,
  created_at: m.createdAt,
  session_id: m.sessionId,
});

const rowToSticker = (r: StickerRow): Sticker => ({
  id: r.id,
  emoji: r.emoji,
  x: r.x,
  y: r.y,
  rotation: r.rotation,
  sessionId: r.session_id,
});

const stickerToRow = (s: Sticker): StickerRow => ({
  id: s.id,
  emoji: s.emoji,
  x: s.x,
  y: s.y,
  rotation: s.rotation,
  session_id: s.sessionId,
});

export interface AddMemoInput {
  authorName: string;
  team: string;
  message: string;
  color: NoteColor;
  x: number;
  y: number;
}

export interface AddStickerInput {
  emoji: string;
  x: number;
  y: number;
}

export interface UseBoardResult {
  memos: Memo[];
  stickers: Sticker[];
  addMemo: (input: AddMemoInput) => void;
  moveMemo: (id: string, x: number, y: number) => void;
  deleteMemo: (id: string) => void;
  addSticker: (input: AddStickerInput) => void;
  moveSticker: (id: string, x: number, y: number) => void;
  deleteSticker: (id: string) => void;
  stickerAssets: StickerAsset[];
  /** 업로드한 이미지를 카탈로그에 추가하고, 생성된 항목을 반환합니다. */
  addStickerAsset: (dataUrl: string) => StickerAsset;
}

export function useBoard(sessionId: string, fallbackSeed: Memo[] = []): UseBoardResult {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [stickerAssets, setStickerAssets] = useState<StickerAsset[]>([]);

  // Initial load
  useEffect(() => {
    if (!isSupabaseEnabled || !supabase) {
      try {
        const stored = localStorage.getItem(MEMOS_KEY);
        setMemos(stored ? (JSON.parse(stored) as Memo[]) : fallbackSeed);
      } catch {
        setMemos(fallbackSeed);
      }
      try {
        const stored = localStorage.getItem(STICKERS_KEY);
        setStickers(stored ? (JSON.parse(stored) as Sticker[]) : []);
      } catch {
        setStickers([]);
      }
      try {
        const stored = localStorage.getItem(STICKER_ASSETS_KEY);
        setStickerAssets(stored ? (JSON.parse(stored) as StickerAsset[]) : []);
      } catch {
        setStickerAssets([]);
      }
      return;
    }

    let active = true;
    (async () => {
      const [memoRes, stickerRes, assetRes] = await Promise.all([
        supabase.from("memos").select("*").order("created_at", { ascending: false }),
        supabase.from("stickers").select("*"),
        supabase
          .from("sticker_assets")
          .select("*")
          .order("created_at", { ascending: true }),
      ]);
      if (!active) return;
      if (memoRes.error) console.error("memos load failed", memoRes.error);
      else setMemos((memoRes.data as MemoRow[]).map(rowToMemo));
      if (stickerRes.error) console.error("stickers load failed", stickerRes.error);
      else setStickers((stickerRes.data as StickerRow[]).map(rowToSticker));
      if (assetRes.error) console.error("sticker_assets load failed", assetRes.error);
      else setStickerAssets((assetRes.data as StickerAssetRow[]).map(rowToStickerAsset));
    })();

    return () => {
      active = false;
    };
    // 초기 1회만 로드한다. fallbackSeed는 의도적으로 의존성에서 제외.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Realtime sync (Supabase only)
  useEffect(() => {
    if (!isSupabaseEnabled || !supabase) return;

    const channel = supabase
      .channel("rolling-paper-board")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "memos" },
        (payload) => {
          if (payload.eventType === "DELETE") {
            const { id } = payload.old as { id: string };
            setMemos((prev) => prev.filter((m) => m.id !== id));
            return;
          }
          const memo = rowToMemo(payload.new as MemoRow);
          setMemos((prev) =>
            prev.some((m) => m.id === memo.id)
              ? prev.map((m) => (m.id === memo.id ? memo : m))
              : [memo, ...prev]
          );
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "stickers" },
        (payload) => {
          if (payload.eventType === "DELETE") {
            const { id } = payload.old as { id: string };
            setStickers((prev) => prev.filter((s) => s.id !== id));
            return;
          }
          const sticker = rowToSticker(payload.new as StickerRow);
          setStickers((prev) =>
            prev.some((s) => s.id === sticker.id)
              ? prev.map((s) => (s.id === sticker.id ? sticker : s))
              : [...prev, sticker]
          );
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "sticker_assets" },
        (payload) => {
          if (payload.eventType === "DELETE") {
            const { id } = payload.old as { id: string };
            setStickerAssets((prev) => prev.filter((a) => a.id !== id));
            return;
          }
          const asset = rowToStickerAsset(payload.new as StickerAssetRow);
          setStickerAssets((prev) =>
            prev.some((a) => a.id === asset.id) ? prev : [...prev, asset]
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // localStorage persistence (fallback only)
  useEffect(() => {
    if (isSupabaseEnabled) return;
    localStorage.setItem(MEMOS_KEY, JSON.stringify(memos));
  }, [memos]);

  useEffect(() => {
    if (isSupabaseEnabled) return;
    localStorage.setItem(STICKERS_KEY, JSON.stringify(stickers));
  }, [stickers]);

  useEffect(() => {
    if (isSupabaseEnabled) return;
    localStorage.setItem(STICKER_ASSETS_KEY, JSON.stringify(stickerAssets));
  }, [stickerAssets]);

  const addMemo = useCallback(
    (input: AddMemoInput) => {
      const memo: Memo = {
        id: uid(),
        ...input,
        rotation: randomRotation(MEMO_ROTATION_RANGE_DEG),
        createdAt: new Date().toISOString(),
        sessionId,
      };
      setMemos((prev) => [memo, ...prev]);
      if (isSupabaseEnabled && supabase) {
        supabase
          .from("memos")
          .insert(memoToRow(memo))
          .then(({ error }) => error && console.error("memo insert failed", error));
      }
    },
    [sessionId]
  );

  const moveMemo = useCallback((id: string, x: number, y: number) => {
    setMemos((prev) => prev.map((m) => (m.id === id ? { ...m, x, y } : m)));
    if (isSupabaseEnabled && supabase) {
      supabase
        .from("memos")
        .update({ x, y })
        .eq("id", id)
        .then(({ error }) => error && console.error("memo move failed", error));
    }
  }, []);

  const deleteMemo = useCallback((id: string) => {
    setMemos((prev) => prev.filter((m) => m.id !== id));
    if (isSupabaseEnabled && supabase) {
      supabase
        .from("memos")
        .delete()
        .eq("id", id)
        .then(({ error }) => error && console.error("memo delete failed", error));
    }
  }, []);

  const addSticker = useCallback(
    (input: AddStickerInput) => {
      const sticker: Sticker = {
        id: uid(),
        ...input,
        rotation: randomRotation(STICKER_ROTATION_RANGE_DEG),
        sessionId,
      };
      setStickers((prev) => [...prev, sticker]);
      if (isSupabaseEnabled && supabase) {
        supabase
          .from("stickers")
          .insert(stickerToRow(sticker))
          .then(({ error }) => error && console.error("sticker insert failed", error));
      }
    },
    [sessionId]
  );

  const moveSticker = useCallback((id: string, x: number, y: number) => {
    setStickers((prev) => prev.map((s) => (s.id === id ? { ...s, x, y } : s)));
    if (isSupabaseEnabled && supabase) {
      supabase
        .from("stickers")
        .update({ x, y })
        .eq("id", id)
        .then(({ error }) => error && console.error("sticker move failed", error));
    }
  }, []);

  const deleteSticker = useCallback((id: string) => {
    setStickers((prev) => prev.filter((s) => s.id !== id));
    if (isSupabaseEnabled && supabase) {
      supabase
        .from("stickers")
        .delete()
        .eq("id", id)
        .then(({ error }) => error && console.error("sticker delete failed", error));
    }
  }, []);

  const addStickerAsset = useCallback(
    (dataUrl: string): StickerAsset => {
      const asset: StickerAsset = { id: uid(), dataUrl };
      setStickerAssets((prev) => [...prev, asset]);
      if (isSupabaseEnabled && supabase) {
        supabase
          .from("sticker_assets")
          .insert({ id: asset.id, data_url: dataUrl, session_id: sessionId })
          .then(
            ({ error }) =>
              error && console.error("sticker asset insert failed", error)
          );
      }
      return asset;
    },
    [sessionId]
  );

  return {
    memos,
    stickers,
    addMemo,
    moveMemo,
    deleteMemo,
    addSticker,
    moveSticker,
    deleteSticker,
    stickerAssets,
    addStickerAsset,
  };
}

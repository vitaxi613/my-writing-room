import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

const ALLOWED_EXT = new Set([".png", ".jpg", ".jpeg", ".webp", ".svg"]);

function parseCardId(fileName: string): string | null {
  // oh-card-001.png -> "001"
  const m = /^oh-card-(\d+)\./i.exec(fileName);
  return m?.[1] ?? null;
}

export async function GET() {
  const dirPath = path.join(process.cwd(), "public", "oh-cards");
  const files = fs.readdirSync(dirPath);

  const cards = files
    .filter((f) => ALLOWED_EXT.has(path.extname(f).toLowerCase()))
    .map((f) => {
      const cardId = parseCardId(f);
      return {
        id: cardId ?? f,
        imageSrc: `/oh-cards/${f}`,
        title: `OH 卡${cardId ? ` ${cardId}` : ""}`.trim(),
      };
    })
    .sort((a, b) => {
      const an = Number(a.id);
      const bn = Number(b.id);
      if (Number.isFinite(an) && Number.isFinite(bn)) return an - bn;
      return a.id.localeCompare(b.id);
    });

  return NextResponse.json({ cards });
}


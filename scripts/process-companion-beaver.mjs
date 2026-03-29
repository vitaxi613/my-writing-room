/**
 * 一次性/按需：从原始河狸图生成「主体优先」的 UI 素材。
 * - trim 去掉边缘黑边（与顶栏同色）
 * - 将接近纯黑的背景像素设为透明
 * - 再 trim 透明边，并加少量透明内边距
 *
 * 运行：node scripts/process-companion-beaver.mjs
 */
import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const input = path.join(root, "public/mascot/companion-beaver.png");
const output = path.join(root, "public/mascot/companion-beaver-ui.png");

/** 仅去掉「接近纯黑」的底，避免误伤深色毛发 */
const BLACK_MAX = 14;

async function main() {
  const trimmed = await sharp(input).trim().toBuffer();
  const { data, info } = await sharp(trimmed)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  let out;
  if (channels === 3) {
    out = Buffer.alloc(width * height * 4);
    for (let i = 0, j = 0; i < data.length; i += 3, j += 4) {
      out[j] = data[i];
      out[j + 1] = data[i + 1];
      out[j + 2] = data[i + 2];
      out[j + 3] = 255;
    }
  } else if (channels === 4) {
    out = Buffer.from(data);
  } else {
    throw new Error(`Unsupported channels: ${channels}`);
  }

  for (let i = 0; i < out.length; i += 4) {
    const r = out[i];
    const g = out[i + 1];
    const b = out[i + 2];
    if (r <= BLACK_MAX && g <= BLACK_MAX && b <= BLACK_MAX) {
      out[i + 3] = 0;
    }
  }

  let img = sharp(out, {
    raw: { width, height, channels: 4 },
  }).ensureAlpha();

  img = sharp(await img.png().toBuffer()).trim();

  const meta = await img.metadata();
  const pad = Math.max(4, Math.round(Math.min(meta.width, meta.height) * 0.04));
  const padded = await img
    .extend({
      top: pad,
      bottom: pad,
      left: pad,
      right: pad,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  await sharp(padded).png({ compressionLevel: 9 }).toFile(output);

  const finalMeta = await sharp(output).metadata();
  console.log(
    `Wrote ${path.relative(root, output)} (${finalMeta.width}x${finalMeta.height})`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

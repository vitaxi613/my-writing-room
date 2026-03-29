# 首页河狸素材

## 路径与格式

- 当前默认：`beaver-edge.jpg`（若你提供的文件实为 JPEG，请保持扩展名为 `.jpg`）。
- **透明底 PNG**：将文件导出为 **`beaver-edge.png`**，并修改：

  1. `lib/beaverHomeAsset.ts` 中 `HOME_BEAVER_IMAGE_SRC` → `"/mascot/beaver-edge.png"`
  2. `HOME_BEAVER_IMAGE_USE_SCREEN_KNOCKOUT` → **`false`**（否则会洗亮角色）

## 文案

- 图内不要对白；陪写句在 `lib/beaverLines.ts`，由首页顶部一行网页文字显示。

## 版式

- 在 `lib/homeBeaverLayout.ts` 修改 `DEFAULT_HOME_BEAVER_VARIANT` 可切换三种方案（见 `HOME_BEAVER_VARIANT_LABEL`）。

// 独立渲染脚本：把精品课内容包直接渲染成 .pptx（无需启动 API/DB）
// 运行：node --experimental-strip-types scripts/render-quality-deck.ts
import { writeFileSync } from "node:fs";
import { buildQualityDeck, renderQualityPptx } from "../apps/api/src/lib/qualityDeck.ts";
import { equationLessonPack } from "../apps/api/src/lib/lessonPacks/equation.ts";

async function main() {
  const deck = buildQualityDeck(equationLessonPack);
  const buf = await renderQualityPptx(deck);
  const out = "一元一次方程（第一课时）.pptx";
  writeFileSync(out, Buffer.from(buf));
  console.log(`[render-quality-deck] 已生成 ${out}（${buf.byteLength} 字节，${deck.slides.length} 页）`);
}

main().catch((e) => {
  console.error("[render-quality-deck] 渲染失败：", e);
  process.exit(1);
});

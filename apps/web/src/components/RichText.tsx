import type { ReactNode } from "react";

/**
 * 富文本渲染：把题目文本中的 [IMG:filename.png] 占位符渲染为图片
 * 图片存放于 apps/web/public/question-imgs/，URL 为 /question-imgs/xxx.png
 */
export function renderRichText(text: string): ReactNode[] {
  const parts = text.split(/\[IMG:([^\]]+)\]/g);
  const nodes: ReactNode[] = [];
  for (let i = 0; i < parts.length; i++) {
    if (i % 2 === 1) {
      // 奇数位 = 图片文件名
      nodes.push(
        <img
          key={i}
          src={`/question-imgs/${parts[i]}`}
          alt=""
          className="inline-block max-h-14 max-w-full align-middle"
        />
      );
    } else if (parts[i]) {
      nodes.push(parts[i]);
    }
  }
  return nodes;
}

export default function RichText({ text, className }: { text: string; className?: string }) {
  return <span className={className}>{renderRichText(text)}</span>;
}

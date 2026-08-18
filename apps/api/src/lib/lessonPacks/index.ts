// ============================================================
// 精品课内容包注册表 + 通用兜底生成器
// 知识点名称 → 内容包（有专属包用专属，否则用通用框架，保证任意知识点都能出课件）
// ============================================================
import type { Deck } from "../qualityDeck";
import { equationLessonPack } from "./equation";

export const lessonPacks: Record<string, Omit<Deck, "design">> = {
  "一元一次方程": equationLessonPack,
};

const SUBJECT_LABELS: Record<string, string> = { math: "数学", physics: "物理", chemistry: "化学" };

function gradeLabel(g: number) {
  return g <= 9 ? `初${g}` : `高${g - 9}`;
}

/** 名称匹配：先精确，再模糊（互为子串） */
export function resolveLessonPack(name: string): Omit<Deck, "design"> | null {
  if (lessonPacks[name]) return lessonPacks[name];
  const key = Object.keys(lessonPacks).find((k) => name.includes(k) || k.includes(name));
  return key ? lessonPacks[key] : null;
}

/**
 * 通用精品课（兜底）：框架完整、内容安全（不编造具体数学事实），
 * 用知识点名称 + 课标分支（children）作为真实结构，适合任意知识点。
 */
export function buildGenericDeck(input: {
  subject: string;
  grade: number;
  name: string;
  children: string[];
}): Omit<Deck, "design"> {
  const { subject, grade, name, children } = input;
  const branches = children?.length ? children : [name];
  const subjectLabel = SUBJECT_LABELS[subject] ?? subject;
  const gradeStr = gradeLabel(grade);

  return {
    title: `${name}（第一课时）`,
    subject,
    grade: String(grade),
    author: "AI 老师",
    school: "AI 老师平台",
    slides: [
      {
        layout: "cover",
        title: `${name}（第一课时）`,
        subtitle: "完整教学大纲 · 重点知识点精讲",
        meta: [`年级：${gradeStr}`, `学科：${subjectLabel}（人教版）`, "主讲人：AI 老师", "校：AI 老师平台"],
        notes: `同学们好！这节课我们聚焦「${name}」这个重点知识点，先建立整体框架，再抓住核心概念，最后通过例题巩固。`,
      },
      {
        layout: "content",
        section: "回顾引入",
        title: "进入新知",
        blocks: [
          { type: "text", content: `这节课，我们聚焦「${name}」这个重点知识点。` },
          { type: "text", content: `思考：${name} 的核心概念是什么？它在后续学习中扮演什么角色？`, bold: true, color: "993C1D" },
        ],
        notes: `先想一个问题：${name} 的核心概念是什么？它和我们已经学过的知识有什么联系？带着这个问题进入今天的学习。`,
      },
      {
        layout: "content",
        section: "探究",
        title: "建立知识框架",
        blocks: [
          { type: "text", content: `「${name}」包含以下核心分支，我们先建立整体框架：` },
          { type: "list", items: branches },
          { type: "def", title: "本章主线", content: "先掌握基本概念 → 理解性质与规律 → 通过例题与练习巩固应用" },
        ],
        notes: `我们来看「${name}」的整体框架，它包含这些核心分支。学习一条主线是：先掌握基本概念，再理解性质规律，最后通过例题练习巩固。`,
      },
      {
        layout: "content",
        section: "归纳",
        title: "学习方法",
        blocks: [
          { type: "def", title: "学习要点", content: "结合旧知，理清概念；紧扣定义，规范表达。" },
          { type: "mnemonic", title: "方法口诀", content: "先概念、再性质、后应用；联系旧知，织成网络。" },
        ],
        notes: `归纳一下学习方法：先概念、再性质、后应用，把新知识和旧知识联系起来，织成知识网络。`,
      },
      {
        layout: "content",
        section: "应用",
        title: "学以致用",
        blocks: [
          {
            type: "example",
            question: `请你结合生活或已学内容，举一个能体现「${name}」的例子，并用一句话说明它的作用。`,
            solution: "（开放思考）先用自己的话复述概念，再举一个贴近生活的例子，最后说出它解决了什么问题。",
            tip: "理解比记忆更重要：能用自己的话讲出来，才算真正掌握。",
          },
          { type: "practice", question: `尝试用一句话总结「${name}」的核心，并写出它与你已学知识的联系。` },
        ],
        notes: `来学以致用：请你举一个能体现「${name}」的例子，再说说它解决了什么问题。记住，理解比记忆更重要，能用自己的话讲出来，才算真正掌握。`,
      },
      {
        layout: "content",
        section: "小结",
        title: "谈谈你的收获",
        blocks: [
          {
            type: "summary",
            points: [
              `理解了「${name}」的整体框架与核心分支`,
              "能用自己的话概括核心概念",
              "知道它在知识网络中的位置",
              "明确了后续学习的重点方向",
            ],
          },
          { type: "text", content: "你还有哪些困惑？你还想知道什么？", bold: true, color: "993C1D" },
        ],
        notes: `小结一下：这节课我们建立了「${name}」的整体框架，抓住了核心概念。想一想，你还有哪些困惑？关于它，你还想知道什么？`,
      },
    ],
  };
}

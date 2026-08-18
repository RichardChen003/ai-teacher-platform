// ============================================================
// @aiteacher/shared —— 前后端共享类型与 DTO（Zod Schema 同源）
// 约定：后端 Hono 路由用 zodValidator 校验；前端 API client 复用类型
// ============================================================
import { z } from "zod";

// ---------- 基础枚举 ----------
export const ROLES = ["student", "parent", "admin"] as const;
export const STAGES = ["初中", "高中"] as const;
export const QUESTION_TYPES = [
  "single_choice",
  "multi_choice",
  "blank",
  "short_answer",
] as const;
export const ASSESSMENT_KINDS = ["diagnosis", "quiz", "midterm"] as const;
export const ASSET_KINDS = ["ppt", "pptx", "audio", "avatar_video", "image"] as const;

export type Role = (typeof ROLES)[number];
export type Stage = (typeof STAGES)[number];
export type QuestionType = (typeof QUESTION_TYPES)[number];
export type AssessmentKind = (typeof ASSESSMENT_KINDS)[number];
export type AssetKind = (typeof ASSET_KINDS)[number];

// ---------- 地区 → 教材版本映射 ----------
// 按省份给出该地区初中主流教材版本；未列出的省份默认"人教版"。
// 说明：同一省份不同地市/科目可能存在差异，此处取主流值，诊断时可按需放宽。
export const REGION_TEXTBOOKS: Record<string, string> = {
  北京: "人教版",
  天津: "人教版",
  河北: "人教版",
  山西: "人教版",
  内蒙古: "人教版",
  辽宁: "北师大版",
  吉林: "人教版",
  黑龙江: "人教版",
  上海: "沪教版",
  江苏: "苏教版",
  浙江: "浙教版",
  安徽: "人教版",
  福建: "人教版",
  江西: "人教版",
  山东: "人教版",
  河南: "人教版",
  湖北: "人教版",
  湖南: "湘教版",
  广东: "人教版",
  广西: "人教版",
  海南: "人教版",
  重庆: "人教版",
  四川: "北师大版",
  贵州: "人教版",
  云南: "人教版",
  西藏: "人教版",
  陕西: "北师大版",
  甘肃: "人教版",
  青海: "人教版",
  宁夏: "人教版",
  新疆: "人教版",
  台湾: "通用",
  香港: "通用",
  澳门: "通用",
};

export const REGIONS = Object.keys(REGION_TEXTBOOKS);

// ---------- 省份 → 城市（地级市）映射 ----------
// 中考为市一级考核，诊断地区需明确到市；直辖市城市即本市。
export const REGION_CITIES: Record<string, string[]> = {
  北京: ["北京市"],
  天津: ["天津市"],
  河北: ["石家庄市", "唐山市", "秦皇岛市", "邯郸市", "保定市", "张家口市", "承德市", "沧州市", "廊坊市", "衡水市"],
  山西: ["太原市", "大同市", "阳泉市", "长治市", "晋城市", "朔州市", "晋中市", "运城市", "忻州市", "临汾市", "吕梁市"],
  内蒙古: ["呼和浩特市", "包头市", "乌海市", "赤峰市", "通辽市", "鄂尔多斯市", "呼伦贝尔市", "巴彦淖尔市", "乌兰察布市"],
  辽宁: ["沈阳市", "大连市", "鞍山市", "抚顺市", "本溪市", "丹东市", "锦州市", "营口市", "阜新市", "辽阳市", "盘锦市", "铁岭市", "朝阳市", "葫芦岛市"],
  吉林: ["长春市", "吉林市", "四平市", "辽源市", "通化市", "白山市", "松原市", "白城市", "延边朝鲜族自治州"],
  黑龙江: ["哈尔滨市", "齐齐哈尔市", "鸡西市", "鹤岗市", "双鸭山市", "大庆市", "伊春市", "佳木斯市", "七台河市", "牡丹江市", "黑河市", "绥化市"],
  上海: ["上海市"],
  江苏: ["南京市", "无锡市", "徐州市", "常州市", "苏州市", "南通市", "连云港市", "淮安市", "盐城市", "扬州市", "镇江市", "泰州市", "宿迁市"],
  浙江: ["杭州市", "宁波市", "温州市", "嘉兴市", "湖州市", "绍兴市", "金华市", "衢州市", "舟山市", "台州市", "丽水市"],
  安徽: ["合肥市", "芜湖市", "蚌埠市", "淮南市", "马鞍山市", "淮北市", "铜陵市", "安庆市", "黄山市", "滁州市", "阜阳市", "宿州市", "六安市", "亳州市", "池州市", "宣城市"],
  福建: ["福州市", "厦门市", "莆田市", "三明市", "泉州市", "漳州市", "南平市", "龙岩市", "宁德市"],
  江西: ["南昌市", "景德镇市", "萍乡市", "九江市", "新余市", "鹰潭市", "赣州市", "吉安市", "宜春市", "抚州市", "上饶市"],
  山东: ["济南市", "青岛市", "淄博市", "枣庄市", "东营市", "烟台市", "潍坊市", "济宁市", "泰安市", "威海市", "日照市", "临沂市", "德州市", "聊城市", "滨州市", "菏泽市"],
  河南: ["郑州市", "开封市", "洛阳市", "平顶山市", "安阳市", "鹤壁市", "新乡市", "焦作市", "濮阳市", "许昌市", "漯河市", "三门峡市", "南阳市", "商丘市", "信阳市", "周口市", "驻马店市"],
  湖北: ["武汉市", "黄石市", "十堰市", "宜昌市", "襄阳市", "鄂州市", "荆门市", "孝感市", "荆州市", "黄冈市", "咸宁市", "随州市"],
  湖南: ["长沙市", "株洲市", "湘潭市", "衡阳市", "邵阳市", "岳阳市", "常德市", "张家界市", "益阳市", "郴州市", "永州市", "怀化市", "娄底市", "湘西土家族苗族自治州"],
  广东: ["广州市", "深圳市", "珠海市", "汕头市", "佛山市", "韶关市", "湛江市", "肇庆市", "江门市", "茂名市", "惠州市", "梅州市", "汕尾市", "河源市", "阳江市", "清远市", "东莞市", "中山市", "潮州市", "揭阳市", "云浮市"],
  广西: ["南宁市", "柳州市", "桂林市", "梧州市", "北海市", "防城港市", "钦州市", "贵港市", "玉林市", "百色市", "贺州市", "河池市", "来宾市", "崇左市"],
  海南: ["海口市", "三亚市", "三沙市", "儋州市"],
  重庆: ["重庆市"],
  四川: ["成都市", "自贡市", "攀枝花市", "泸州市", "德阳市", "绵阳市", "广元市", "遂宁市", "内江市", "乐山市", "南充市", "眉山市", "宜宾市", "广安市", "达州市", "雅安市", "巴中市", "资阳市", "凉山彝族自治州"],
  贵州: ["贵阳市", "六盘水市", "遵义市", "安顺市", "毕节市", "铜仁市", "黔西南布依族苗族自治州", "黔东南苗族侗族自治州", "黔南布依族苗族自治州"],
  云南: ["昆明市", "曲靖市", "玉溪市", "保山市", "昭通市", "丽江市", "普洱市", "临沧市", "楚雄彝族自治州", "红河哈尼族彝族自治州", "文山壮族苗族自治州", "西双版纳傣族自治州", "大理白族自治州", "德宏傣族景颇族自治州", "怒江傈僳族自治州", "迪庆藏族自治州"],
  西藏: ["拉萨市", "日喀则市", "昌都市", "林芝市", "山南市", "那曲市", "阿里地区"],
  陕西: ["西安市", "铜川市", "宝鸡市", "咸阳市", "渭南市", "延安市", "汉中市", "榆林市", "安康市", "商洛市"],
  甘肃: ["兰州市", "嘉峪关市", "金昌市", "白银市", "天水市", "武威市", "张掖市", "平凉市", "酒泉市", "庆阳市", "定西市", "陇南市", "临夏回族自治州", "甘南藏族自治州"],
  青海: ["西宁市", "海东市", "海北藏族自治州", "黄南藏族自治州", "海南藏族自治州", "果洛藏族自治州", "玉树藏族自治州", "海西蒙古族藏族自治州"],
  宁夏: ["银川市", "石嘴山市", "吴忠市", "固原市", "中卫市"],
  新疆: ["乌鲁木齐市", "克拉玛依市", "吐鲁番市", "哈密市", "昌吉回族自治州", "博尔塔拉蒙古自治州", "巴音郭楞蒙古自治州", "阿克苏地区", "克孜勒苏柯尔克孜自治州", "喀什地区", "和田地区", "伊犁哈萨克自治州", "塔城地区", "阿勒泰地区"],
  台湾: ["台北市", "高雄市", "台中市", "台南市", "新北市"],
  香港: ["香港特别行政区"],
  澳门: ["澳门特别行政区"],
};

/** 教材版本集合（含"通用"：不限教材，出题时忽略版本过滤） */
export const TEXTBOOKS = Array.from(
  new Set([...Object.values(REGION_TEXTBOOKS), "通用"])
);

/** 根据地区（支持"省"或"省-市"）获取教材版本；未知地区返回"人教版"（全国最普及） */
export function textbookOfRegion(region: string): string {
  // 兼容 "江苏-南京市" 格式：取省名
  const province = region.split("-")[0];
  return REGION_TEXTBOOKS[province] ?? "人教版";
}

/** 从"省-市"组合值中拆分（region 可能为空/仅省/省市） */
export function splitRegion(region: string): { province: string; city: string } {
  if (!region) return { province: "", city: "" };
  const [province, ...rest] = region.split("-");
  return { province, city: rest.join("-") };
}

// ---------- 用户 ----------
export const UserProfileSchema = z.object({
  id: z.string(),
  email: z.string().email().optional(),
  name: z.string(),
  role: z.enum(ROLES),
  grade: z.number().int().min(7).max(18).nullable(), // 学期粒度：7=初一上 … 18=高三下
  subject: z.string().nullable(),
  textbookVersion: z.string().nullable(),
  goalDate: z.string().nullable(),
  weeklyHours: z.number().min(0.5).max(20).optional(),
  createdAt: z.string(),
});
export type UserProfile = z.infer<typeof UserProfileSchema>;

export const UpdateProfileSchema = UserProfileSchema.partial().omit({
  id: true,
  email: true,
  role: true,
  createdAt: true,
});
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;

// ---------- 知识点 ----------
export const KnowledgePointSchema = z.object({
  id: z.string(),
  subject: z.string(),
  stage: z.enum(STAGES),
  gradeLevel: z.number().int().min(7).max(12),
  name: z.string(),
  code: z.string().optional(),
  parentId: z.string().nullable(),
  depth: z.number().int(),
  difficultyBase: z.number().min(0).max(1),
  orderIndex: z.number().int(),
});
export type KnowledgePoint = z.infer<typeof KnowledgePointSchema>;
export type KnowledgeTree = KnowledgePoint[]; // 客户端按 parentId 组树

// ---------- 题目 ----------
export const QuestionSchema = z.object({
  id: z.string(),
  subject: z.string(),
  stage: z.enum(STAGES),
  gradeLevel: z.number().int().min(7).max(12),
  knowledgePointId: z.string(),
  type: z.enum(QUESTION_TYPES),
  difficulty: z.number().min(0).max(1),
  content: z.string(), // 题干，支持 LaTeX
  options: z
    .array(z.object({ key: z.string(), text: z.string() }))
    .optional(),
  answer: z.string(),
  analysis: z.string().optional(),
  source: z.string(),
});
export type Question = z.infer<typeof QuestionSchema>;

// 学生端看到的题（不含答案/解析）
export const QuestionViewSchema = QuestionSchema.omit({ answer: true, analysis: true });
export type QuestionView = z.infer<typeof QuestionViewSchema>;

// ---------- 测评 ----------
export const AssessmentSchema = z.object({
  id: z.string(),
  userId: z.string(),
  kind: z.enum(ASSESSMENT_KINDS),
  subject: z.string(),
  stage: z.enum(STAGES).optional(),
  gradeLevel: z.number().int().min(7).max(12),
  status: z.enum(["in_progress", "completed", "scored"]),
  score: z.number().nullable(),
  maxScore: z.number().nullable(),
  createdAt: z.string(),
});
export type Assessment = z.infer<typeof AssessmentSchema>;

// 入测发起
export const CreateDiagnosisSchema = z.object({
  subject: z.string().min(1),
  grade: z.number().int().min(7).max(18), // 学期粒度：7=初一上 … 18=高三下
  region: z.string().optional(),          // 就读地区（省/市），用于匹配教材版本
  textbookVersion: z.string().optional(), // 教材版本（如 人教版）；未传时由 region 推断
  questionCount: z.number().int().min(5).max(30).default(18), // 与前端 slider（5~20）一致，支持快速测试
});
export type CreateDiagnosisInput = z.infer<typeof CreateDiagnosisSchema>;

// 交卷
export const SubmitAssessmentSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string(),
      answer: z.string(),
      timeSpentSec: z.number().int().optional(),
    })
  ),
});
export type SubmitAssessmentInput = z.infer<typeof SubmitAssessmentSchema>;

// 诊断报告（掌握度画像）
export const MasteryItemSchema = z.object({
  knowledgePointId: z.string(),
  knowledgePointName: z.string(),
  level: z.number().min(0).max(1),
  confidence: z.number().min(0).max(1),
  attempts: z.number().int(),
  status: z.enum(["weak", "medium", "good"]), // level < 0.4 / < 0.7 / else
});
export const DiagnosisReportSchema = z.object({
  assessmentId: z.string(),
  subject: z.string(),
  overallLevel: z.number().min(0).max(1),
  items: z.array(MasteryItemSchema),
  weakPoints: z.array(z.string()), // 短板知识点 id（按 level 升序 TopN）
  summary: z.string(), // 学习建议（LLM 生成）
  suggestedWeeks: z.number().int(),
});
export type DiagnosisReport = z.infer<typeof DiagnosisReportSchema>;
export type MasteryItem = z.infer<typeof MasteryItemSchema>;

// ---------- 大纲 ----------
export const LessonOutlineSchema = z.object({
  seq: z.number().int(),
  title: z.string(),
  objectives: z.array(z.string()),
  knowledgePointIds: z.array(z.string()),
  durationMin: z.number().int().default(45),
});
export const UnitOutlineSchema = z.object({
  title: z.string(),
  lessons: z.array(LessonOutlineSchema),
});
export const SyllabusStructureSchema = z.object({
  goal: z.string(),
  units: z.array(UnitOutlineSchema),
});
export type SyllabusStructure = z.infer<typeof SyllabusStructureSchema>;

export const GenerateSyllabusSchema = z.object({
  assessmentId: z.string(),
  subject: z.string(),
  targetDate: z.string().optional(), // 目标日期（中考/期末）
  weeklyHours: z.number().min(0.5).max(20).optional(),
});
export type GenerateSyllabusInput = z.infer<typeof GenerateSyllabusSchema>;

export const SyllabusSchema = z.object({
  id: z.string(),
  userId: z.string(),
  subject: z.string(),
  title: z.string(),
  goal: z.string().optional(),
  structure: SyllabusStructureSchema,
  version: z.number().int(),
  status: z.enum(["active", "archived"]),
  sourceAssessmentId: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Syllabus = z.infer<typeof SyllabusSchema>;

// ---------- 课时与资产 ----------
export const LessonSchema = z.object({
  id: z.string(),
  syllabusId: z.string(),
  seq: z.number().int(),
  title: z.string(),
  objectives: z.array(z.string()).optional(),
  knowledgePointIds: z.array(z.string()).optional(),
  status: z.enum(["pending", "prepared", "delivered", "reviewed"]),
  pptAssetId: z.string().nullable(),
  quizAssessmentId: z.string().nullable(),
});
export type Lesson = z.infer<typeof LessonSchema>;

export const AssetSchema = z.object({
  id: z.string(),
  kind: z.enum(ASSET_KINDS),
  status: z.enum(["processing", "ready", "failed"]),
  meta: z.record(z.string(), z.any()).optional(),
  error: z.string().optional(),
  downloadUrl: z.string().optional(), // 签名 URL（ready 后）
});
export type Asset = z.infer<typeof AssetSchema>;

// ---------- 课件 JSON（PPT 生成 Schema） ----------
export const SlideBlockSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("text"), content: z.string() }),
  z.object({ type: z.literal("formula"), latex: z.string() }),
  z.object({ type: z.literal("list"), items: z.array(z.string()) }),
  z.object({
    type: z.literal("table"),
    header: z.array(z.string()),
    rows: z.array(z.array(z.string())),
  }),
  z.object({ type: z.literal("example"), question: z.string(), solution: z.string().optional() }),
  z.object({ type: z.literal("practice"), question: z.string(), answer: z.string().optional() }),
  z.object({ type: z.literal("summary"), points: z.array(z.string()) }),
]);
export const SlideSchema = z.object({
  layout: z.enum(["cover", "content", "example", "practice", "summary"]),
  title: z.string(),
  blocks: z.array(SlideBlockSchema),
  notes: z.string(), // 口语化讲稿（数字人使用）
});
export const DeckSchema = z.object({
  lessonId: z.string(),
  subject: z.string(),
  title: z.string(),
  slides: z.array(SlideSchema),
});
export type Deck = z.infer<typeof DeckSchema>;
export type Slide = z.infer<typeof SlideSchema>;
export type SlideBlock = z.infer<typeof SlideBlockSchema>;

// ---------- 通用响应 ----------
export const ApiOkSchema = z.object({ ok: z.literal(true) });
export const ApiErrorSchema = z.object({
  ok: z.literal(false),
  code: z.string(),
  message: z.string(),
});
export type ApiError = z.infer<typeof ApiErrorSchema>;

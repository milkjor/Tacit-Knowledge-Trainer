const ARK_ENDPOINT = "https://ark.cn-beijing.volces.com/api/v3/chat/completions";
const MODEL_ID = "deepseek-v4-flash-260425";

function buildPrompt(question) {
  return [
    "你是一个隐性知识训练路径设计器。请根据用户的问题，生成一条 K-R-R-S 训练路径。",
    "K-R-R-S 含义：故事=Knowledge，追问=Rule，练习=Rule，迁移=Skill。",
    "只返回严格 JSON，不要 Markdown，不要解释，不要代码块。",
    "JSON 必须包含这些字段：",
    "title, short, headline, story, question, signals, examples, practiceTitle, practice, options, rule, transfer。",
    "signals 是 3 个对象，每个对象包含 text 和 insight。",
    "examples 是 3 个字符串。",
    "options 是 3 个对象，每个对象包含 text, feedback, correct，其中 correct 是布尔值，必须且只能有一个 true。",
    "内容必须具体、生活化、可演示，避免空泛理论。",
    `用户问题：${question}`
  ].join("\n");
}

function extractJson(text) {
  const trimmed = String(text || "").trim();
  if (!trimmed) throw new Error("模型返回为空");
  try {
    return JSON.parse(trimmed);
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("模型没有返回 JSON");
    return JSON.parse(match[0]);
  }
}

function validateGeneratedCase(value) {
  if (!value || typeof value !== "object") throw new Error("生成结果不是对象");
  const requiredStrings = ["title", "short", "headline", "story", "question", "practiceTitle", "practice", "rule", "transfer"];
  for (const key of requiredStrings) {
    if (typeof value[key] !== "string" || !value[key].trim()) {
      throw new Error(`生成结果缺少字段：${key}`);
    }
  }
  if (!Array.isArray(value.signals) || value.signals.length < 3) throw new Error("signals 不完整");
  if (!Array.isArray(value.examples) || value.examples.length < 3) throw new Error("examples 不完整");
  if (!Array.isArray(value.options) || value.options.length < 3) throw new Error("options 不完整");
  const trueCount = value.options.filter((option) => option && option.correct === true).length;
  if (trueCount !== 1) value.options[0].correct = true;
  return value;
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Only POST is allowed" });
  }

  const apiKey = process.env.ARK_API_KEY;
  if (!apiKey) {
    return response.status(500).json({ error: "缺少 ARK_API_KEY 环境变量" });
  }

  const question = String(request.body?.question || "").trim();
  if (!question) {
    return response.status(400).json({ error: "请输入隐性知识相关问题" });
  }
  if (question.length > 600) {
    return response.status(400).json({ error: "问题过长，请控制在 600 字以内" });
  }

  try {
    const arkResponse = await fetch(ARK_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: MODEL_ID,
        messages: [
          {
            role: "system",
            content: "你只输出可被 JSON.parse 解析的 JSON 对象。"
          },
          {
            role: "user",
            content: buildPrompt(question)
          }
        ],
        temperature: 0.6
      })
    });

    const arkPayload = await arkResponse.json().catch(() => ({}));
    if (!arkResponse.ok) {
      return response.status(arkResponse.status).json({
        error: arkPayload.error?.message || "火山方舟接口调用失败"
      });
    }

    const content = arkPayload.choices?.[0]?.message?.content;
    const generatedCase = validateGeneratedCase(extractJson(content));
    return response.status(200).json({ case: generatedCase });
  } catch (error) {
    return response.status(500).json({ error: error.message || "生成失败" });
  }
}

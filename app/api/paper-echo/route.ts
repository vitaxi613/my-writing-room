import { NextResponse } from "next/server";

const DASHSCOPE_URL =
  "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions";

const MAX_CONTENT = 16_000;

const SYSTEM_PROMPT = `你是一位理性、克制的共读者。用户刚写下一段私密日记，你需要帮他把思绪「收紧」一点。
写作要求：
- 用 2～4 个短句写成一段（不要用序号、不要分条、不要Markdown），总长度控制在 130 个汉字以内。
- 先基于原文，用一两句简练点出他真正在应对的核心处境或矛盾；不要臆测文中没有的信息，不要编造情节。
- 接着用清晰、有分量的语气给出视角：可以是边界、因果、选择中的一环，或一句站得住的判断；避免空洞安慰（如「加油」「会好的」）和滥情修辞。
- 收束用一句有推进感的话：可以是下一步极小的行动、一个值得自检的问题，或一句短而有力的收束；不必讨好对方。
- 整体语气冷静、坦诚、有力量，像信任对方能承受真话的成年读者。
不要自称人工智能或模型。`;

export async function POST(request: Request) {
  const apiKey = process.env.DASHSCOPE_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      { error: "服务器未配置 DASHSCOPE_API_KEY，无法生成回响。" },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "请求格式无效" }, { status: 400 });
  }

  const rec = body as Record<string, unknown>;
  const content =
    typeof rec.content === "string" ? rec.content.trim().slice(0, MAX_CONTENT) : "";
  const title =
    typeof rec.title === "string" ? rec.title.trim().slice(0, 500) : "";

  if (!content) {
    return NextResponse.json({ error: "正文不能为空" }, { status: 400 });
  }

  const userBlock = title
    ? `【标题】\n${title}\n\n【正文】\n${content}`
    : `【正文】\n${content}`;

  const model = process.env.DASHSCOPE_MODEL?.trim() || "qwen-turbo";

  const res = await fetch(DASHSCOPE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: 280,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userBlock },
      ],
    }),
  });

  const data = (await res.json()) as Record<string, unknown>;

  if (!res.ok) {
    const msg =
      typeof data.error === "object" &&
      data.error !== null &&
      "message" in data.error
        ? String((data.error as { message?: string }).message)
        : JSON.stringify(data);
    return NextResponse.json(
      { error: `通义请求失败：${msg}` },
      { status: res.status >= 400 && res.status < 600 ? res.status : 502 },
    );
  }

  const choices = data.choices as
    | Array<{ message?: { content?: string } }>
    | undefined;
  const text = choices?.[0]?.message?.content?.trim();
  if (!text) {
    return NextResponse.json({ error: "模型未返回有效内容" }, { status: 502 });
  }

  return NextResponse.json({ echo: text });
}

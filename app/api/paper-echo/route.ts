import { NextResponse } from "next/server";

const DASHSCOPE_URL =
  "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions";

const MAX_CONTENT = 16_000;

const SYSTEM_PROMPT = `你是温柔的共读伙伴。用户刚写下一段私密日记。
请用一段连贯的话回应（不要用序号、不要分条），总长度严格控制在 90 个汉字以内，减轻阅读负担。
内容包含：轻轻点出文中可感知的一丝情绪或画面（勿编造事实）；末尾带一句很轻、开放式的小问题即可。
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
      max_tokens: 220,
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

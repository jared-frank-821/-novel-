import { streamText, convertToModelMessages, type UIMessage } from 'ai';
import { createDeepSeek } from '@ai-sdk/deepseek';

export const maxDuration = 30; // 设置请求超时时间

const deepseek = createDeepSeek({
  apiKey: process.env.DEEPSEEK_API_KEY || '',
  baseURL: process.env.BASE_URL || 'https://api.deepseek.com',
});

// AI 对话 API（支持 useChat：接收 messages，返回 UI 消息流）
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages } = body as { messages?: UIMessage[] };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ message: '消息不能为空' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const modelMessages = await convertToModelMessages(messages);

    const result = streamText({
      model: deepseek('deepseek-chat'),
      system: '你是一个智能写作助手，用户可能会和你聊天或询问关于写小说的事情，请根据用户的问题友好回答。',
      messages: modelMessages,
    });

    return result.toUIMessageStreamResponse();
  } catch (error: unknown) {
    console.error('API Error:', error);
    const message = error instanceof Error ? error.message : '服务器错误';
    return new Response(JSON.stringify({ message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

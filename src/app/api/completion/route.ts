import { streamText } from 'ai';
import { createDeepSeek } from '@ai-sdk/deepseek';

export const maxDuration = 30;
// 创建 DeepSeek 模型实例，读取环境变量中的 API Key
const deepseek = createDeepSeek({
  apiKey: process.env.DEEPSEEK_API_KEY || '',
  baseURL: process.env.BASE_URL || 'https://api.deepseek.com'
});
// 5. POST 请求处理函数（当有人调用 /api/completion 时执行）
export async function POST(req: Request) {
  try {
     // 6. 解析前端传来的 JSON 数据，取出 prompt
    const { prompt }: { prompt: string } = await req.json();
  // 7. 简单校验prompt不能为空
    if (!prompt || prompt.trim() === '') {
      return new Response(JSON.stringify({ message: 'Prompt不能为空' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
 // 8. 调用 AI 模型生成续写内容（流式）
    const result = streamText({
      model: deepseek('deepseek-chat'), // 使用 deepseek-chat 模型
      messages: [
        {
          role: 'system',
          content: '你是一个文章续写助手，请紧接用户的文字逻辑继续写下去，不要重复用户已有的内容。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
    });
// 9. 以流式方式返回结果给前端（实现打字机效果）
    return result.toTextStreamResponse();
  } catch (error: any) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ message: error.message || '服务器错误' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

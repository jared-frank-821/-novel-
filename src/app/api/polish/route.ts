import { generateText } from 'ai';
import { createDeepSeek } from '@ai-sdk/deepseek';

export const maxDuration = 30;//设置请求超时时间

const deepseek = createDeepSeek({
  apiKey: process.env.DEEPSEEK_API_KEY || '',
  baseURL: process.env.BASE_URL || 'https://api.deepseek.com'
});

// AI 润色/改写 API
export async function POST(req: Request) {//这是 POST 请求的处理函数,当前端调用 /api/polish 时，会触发这个函数
//1. 解析前端传来的 JSON 数据，取出 text 和 mode
  try {
    const { text, mode }: { text: string; mode: string } = await req.json();//从请求体中解析 JSON 数据

    if (!text || text.trim() === '') {
      return new Response(JSON.stringify({ message: '文本不能为空' }), {//如果 text 为空或只有空格,返回400状态码和错误信息
        status: 400,
        headers: { 'Content-Type': 'application/json' }//告诉浏览器/前端返回的数据是什么格式。"这个包裹里装的是 JSON 数据"。如果没有这个标签，前端收到数据后不知道该怎么解析，可能会出错。
      });
    }

    // 根据不同模式设置不同的 prompt
    const systemPrompts: Record<string, string> = {//定义一个 Prompt 字典，用于根据不同模式设置不同的 Prompt,Record - TypeScript 的类型工具,<string, string> - "键是 string 类型，值也是 string 类型"
      polish: '你是一个文字润色助手，请对用户提供的文字进行润色，使其更加通顺、优美、自然。只返回润色后的内容，不要有任何解释。',//polish是键，后面是值
      simplify: '你是一个文字精简助手，请对用户提供的文字进行精简，去除冗余内容，只保留核心信息。只返回精简后的内容，不要有任何解释。',
      expand: '你是一个文字扩展助手，请对用户提供的文字进行适当扩展，使内容更加丰富详细。只返回扩展后的内容，不要有任何解释。',
      rewrite: '你是一个文字改写助手，请用不同的表达方式重新改写用户提供的文字，保持相同的意思但改变句式。只返回改写后的内容，不要有任何解释。'
    };

    const prompt = systemPrompts[mode] || systemPrompts.polish;//根据前端传进来的 mode 选择对应的 Prompt，如果 mode 不存在，则使用默认的 polish 模式

    const result = await generateText({//调用 AI 模型生成润色后的内容，调用 generateText 函数
      model: deepseek('deepseek-chat'),
      messages: [//messages - 消息数组，包含：system 消息 - 系统提示词（就是第 31 行的 prompt）,user 消息 - 用户输入的文本（就是第 29 行的 text）
        { role: 'system', content: prompt },
        { role: 'user', content: text }
      ],
    });

    return new Response(JSON.stringify({ 
      result: result.text //result.text 是 AI 生成的内容，通过 JSON.stringify 转换为字符串并返回给前端
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {//如果发生任何错误（比如 API 调用失败、网络问题）,记录错误信息并返回500状态码和错误信息
    console.error('API Error:', error);
    return new Response(JSON.stringify({ message: error.message || '服务器错误' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

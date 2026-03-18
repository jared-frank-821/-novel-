import { generateText } from 'ai';
import { createDeepSeek } from '@ai-sdk/deepseek';

export const maxDuration = 30;

const deepseek = createDeepSeek({
  apiKey: process.env.DEEPSEEK_API_KEY || '',
  baseURL: process.env.BASE_URL || 'https://api.deepseek.com'
});

// AI 润色/改写 API
export async function POST(req: Request) {
  try {
    const { text, mode }: { text: string; mode: string } = await req.json();

    if (!text || text.trim() === '') {
      return new Response(JSON.stringify({ message: '文本不能为空' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 根据不同模式设置不同的 prompt
    const systemPrompts: Record<string, string> = {
      polish: '你是一个文字润色助手，请对用户提供的文字进行润色，使其更加通顺、优美、自然。只返回润色后的内容，不要有任何解释。',
      simplify: '你是一个文字精简助手，请对用户提供的文字进行精简，去除冗余内容，只保留核心信息。只返回精简后的内容，不要有任何解释。',
      expand: '你是一个文字扩展助手，请对用户提供的文字进行适当扩展，使内容更加丰富详细。只返回扩展后的内容，不要有任何解释。',
      rewrite: '你是一个文字改写助手，请用不同的表达方式重新改写用户提供的文字，保持相同的意思但改变句式。只返回改写后的内容，不要有任何解释。'
    };

    const prompt = systemPrompts[mode] || systemPrompts.polish;

    const result = await generateText({
      model: deepseek('deepseek-chat'),
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: text }
      ],
    });

    return new Response(JSON.stringify({ 
      result: result.text 
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ message: error.message || '服务器错误' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

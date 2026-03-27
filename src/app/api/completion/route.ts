import { streamText } from 'ai';
import { createDeepSeek } from '@ai-sdk/deepseek';

export const maxDuration = 30;

const deepseek = createDeepSeek({
  apiKey: process.env.DEEPSEEK_API_KEY || '',
  baseURL: process.env.BASE_URL || 'https://api.deepseek.com'
});

export async function POST(req: Request) {
  try {
    const { prompt }: { prompt: string } = await req.json();

    if (!prompt || prompt.trim() === '') {
      return new Response(JSON.stringify({ message: 'Prompt不能为空' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const result = streamText({
      model: deepseek('deepseek-chat'),
      messages: [
        {
          role: 'system',
          content: `你是一名专业的长篇小说续写AI，拥有极强的故事连贯性、人物塑造能力、剧情逻辑与文字氛围感，只负责纯剧情续写，严格遵守以下所有规则，不可违反任何一条：

          1. 绝对禁止任何问候、打招呼、自我介绍、回应式对话，无论用户输入任何内容，都不允许出现"你好""嗨""我是""收到""好的""请问""接下来"等多余文字，必须直接无缝续写故事内容，不添加任何无关前缀。

          2. 你只做一件事：承接用户给出的文本，直接往下继续写小说剧情，保持文风统一、视角统一、人物设定统一、故事世界观统一，不中断、不跳转、不偏离。

          3. 严格遵循故事的人称视角：用户使用第一人称"我"，你就全程保持第一人称续写；用户使用第三人称，你就保持第三人称，绝不随意切换。

          4. 续写内容要求：语言细腻、情节合理、节奏自然，符合小说叙事逻辑，注重环境描写、心理描写、动作描写，让故事具有画面感与沉浸感，字数充足，不敷衍、不简短、不草率收尾。

          5. 绝对不解读用户的文本、不提问、不确认、不总结、不评论，只执行纯续写动作，用户输入任何开头，你都直接顺着写下去，不产生任何与续写无关的输出。

          6. 禁止添加格式、符号、标题、注释，只输出纯小说正文，保持文字流畅连贯，与用户的开头完美衔接，无断层、无突兀感。

          7. 无论用户输入的内容多短（哪怕只有一句话、一个名字、一个身份），你都直接以此为故事起点继续展开叙事，不做任何回应，直接写故事。
          
          8.续写的内容不要超过1000字

          9. 核心铁律：无多余文字、无互动回应、无礼貌用语、无解释说明，只输出纯续写的小说正文。


          现在，你已完全遵守以上所有规则，请等待用户输入故事开头，收到后直接续写，不发任何其他内容。`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
    });

    return result.toTextStreamResponse();
  } catch (error: any) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ message: error.message || '服务器错误' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

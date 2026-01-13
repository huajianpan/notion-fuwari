import type { Env } from '../types';

interface AISearchRequest {
  query: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    const { query } = await request.json() as AISearchRequest;

    if (!query || !query.trim()) {
      return new Response(JSON.stringify({ error: 'Query is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 调用 Cloudflare AI Search (AutoRAG) - 使用官方 API
    const result = await env.AI.autorag("my-autorag").aiSearch({
      query: query.trim(),
      model: "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
      rewrite_query: true,        // 优化查询
      max_num_results: 5,         // 最多返回5个相关结果
      ranking_options: {
        score_threshold: 0.3      // 相关性阈值
      },
      reranking: {
        enabled: true,            // 启用重排序
        model: "@cf/baai/bge-reranker-base"
      },
      stream: true,               // 启用流式响应
    });

    // 转换为 SSE 格式流式传输
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          // 处理流式响应
          const reader = result.getReader();

          while (true) {
            const { done, value } = await reader.read();

            if (done) {
              break;
            }

            // value 应该是官方返回的数据块
            // 官方格式: { response: "...", data: [...] }
            // 需要转换为前端期望的格式: { result: { response: "...", data: [...] } }
            const wrapped = `data: ${JSON.stringify({ result: value })}\n\n`;
            controller.enqueue(encoder.encode(wrapped));
          }

        } catch (error) {
          console.error('Stream error:', error);
          // 发送错误信息
          const errorMsg = `data: ${JSON.stringify({
            error: error instanceof Error ? error.message : 'Stream error'
          })}\n\n`;
          controller.enqueue(encoder.encode(errorMsg));
        } finally {
          controller.close();
        }
      }
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('AI Search error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
        details: 'Failed to process AI search request'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
};

// 处理 CORS 预检请求
export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
};

// Cloudflare Worker - AI 聊天代理
// 用于将博客前端的请求转发到 Cloudflare Auto RAG API

export default {
	async fetch(request, env) {
		// 处理 CORS 预检请求
		if (request.method === 'OPTIONS') {
			return new Response(null, {
				headers: {
					'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN || '*',
					'Access-Control-Allow-Methods': 'POST, OPTIONS',
					'Access-Control-Allow-Headers': 'Content-Type',
					'Access-Control-Max-Age': '86400',
				},
			});
		}

		// 只允许 POST 请求
		if (request.method !== 'POST') {
			return new Response('Method not allowed', {
				status: 405,
				headers: {
					'Content-Type': 'text/plain',
					'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN || '*',
				},
			});
		}

		try {
			// 简单的 Rate Limit（可选）
			const clientIP = request.headers.get('CF-Connecting-IP');
			if (clientIP && !checkRateLimit(clientIP, env)) {
				return new Response(JSON.stringify({ error: '请求过于频繁，请稍后再试' }), {
					status: 429,
					headers: {
						'Content-Type': 'application/json',
						'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN || '*',
					},
				});
			}

			// 解析请求
			const { query } = await request.json();

			if (!query || typeof query !== 'string') {
				return new Response(JSON.stringify({ error: '无效的请求参数' }), {
					status: 400,
					headers: {
						'Content-Type': 'application/json',
						'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN || '*',
					},
				});
			}

			// 调用 Cloudflare Auto RAG API
			const apiUrl = `https://api.cloudflare.com/client/v4/accounts/${env.ACCOUNT_ID}/autorag/rags/${env.AUTORAG_NAME}/ai-search`;

			const response = await fetch(apiUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${env.API_TOKEN}`,
				},
				body: JSON.stringify({
					query,
					model: '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
					rewrite_query: false,
					max_num_results: 10,
					ranking_options: {
						score_threshold: 0.3,
					},
					reranking: {
						enabled: true,
						model: '@cf/baai/bge-reranker-base',
					},
					stream: true,
				}),
			});

			if (!response.ok) {
				throw new Error(`API 错误: ${response.status} ${response.statusText}`);
			}

			// 转发流式响应
			return new Response(response.body, {
				headers: {
					'Content-Type': 'text/event-stream',
					'Cache-Control': 'no-cache',
					'Connection': 'keep-alive',
					'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN || '*',
				},
			});

		} catch (error) {
			console.error('Worker 错误:', error);

			return new Response(JSON.stringify({
				error: '服务暂时不可用，请稍后再试',
				details: error.message
			}), {
				status: 500,
				headers: {
					'Content-Type': 'application/json',
					'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN || '*',
				},
			});
		}
	},
};

// 简单的内存 Rate Limit（仅作演示，生产环境建议使用 Durable Objects 或 KV）
const rateLimitMap = new Map();

function checkRateLimit(ip, env) {
	const now = Date.now();
	const windowMs = 60000; // 1 分钟
	const maxRequests = env.RATE_LIMIT || 20; // 默认每分钟 20 次

	const record = rateLimitMap.get(ip);

	if (!record || now > record.resetTime) {
		rateLimitMap.set(ip, {
			count: 1,
			resetTime: now + windowMs,
		});
		return true;
	}

	if (record.count >= maxRequests) {
		return false;
	}

	record.count++;
	return true;
}

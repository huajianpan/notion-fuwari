# AI 聊天功能配置指南

## 功能说明

博客集成了 AI 聊天功能，使用 Cloudflare Auto RAG 为访客提供智能问答服务。聊天窗口会出现在页面右下角。

## 配置步骤

### 1. 创建 Cloudflare Worker 代理

由于 Cloudflare Auto RAG API 需要 Authorization token，不能直接在前端调用。需要创建一个 Worker 作为代理。

在 `workers/ai-chat-proxy.js` 创建以下代码：

```javascript
export default {
  async fetch(request, env) {
    // 处理 CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': 'https://你的博客域名.com',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    try {
      const { query } = await request.json();

      // 调用 Cloudflare Auto RAG API
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${env.ACCOUNT_ID}/autorag/rags/${env.AUTORAG_NAME}/ai-search`,
        {
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
        }
      );

      // 转发流式响应
      return new Response(response.body, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Access-Control-Allow-Origin': 'https://你的博客域名.com',
        },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'https://你的博客域名.com',
        },
      });
    }
  },
};
```

### 2. 部署 Worker

```bash
# 登录 Cloudflare
npx wrangler login

# 创建 Worker
npx wrangler deploy workers/ai-chat-proxy.js

# 设置环境变量
npx wrangler secret put ACCOUNT_ID
npx wrangler secret put AUTORAG_NAME
npx wrangler secret put API_TOKEN
```

或者在 Cloudflare Dashboard 手动配置：
1. Workers & Pages → Create Worker
2. 粘贴代码
3. Settings → Variables → Add variable
   - `ACCOUNT_ID`: 你的 Cloudflare Account ID
   - `AUTORAG_NAME`: 你的 Auto RAG 名称
   - `API_TOKEN`: 你的 API Token

### 3. 配置博客

编辑 `src/config.ts`，启用 AI 聊天功能：

```typescript
export const aiChatConfig = {
  enable: true, // 启用 AI 聊天
  apiEndpoint: "https://your-worker.your-subdomain.workers.dev", // Worker URL
  welcomeMessage: "你好！我是 AI 助手，可以帮你检索博客内容。有什么问题吗？",
};
```

### 4. 测试

1. 启动开发服务器：`pnpm dev`
2. 访问任意页面
3. 右下角应该出现聊天按钮
4. 点击测试对话功能

## 功能特性

- ✅ 流式响应，实时显示 AI 回答
- ✅ 显示来源引用和相关度评分
- ✅ 响应式设计，支持移动端
- ✅ 自动匹配博客主题配色
- ✅ 加载状态和错误处理
- ✅ 纯客户端运行，不影响静态构建

## 安全注意事项

1. **不要在前端代码中硬编码 API Token**
2. **Worker 中配置 CORS** 只允许你的博客域名访问
3. **建议添加 Rate Limit** 防止滥用：

```javascript
// 在 Worker 中添加简单的 Rate Limit
const rateLimit = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  const limit = rateLimit.get(ip) || { count: 0, resetTime: now + 60000 };

  if (now > limit.resetTime) {
    limit.count = 0;
    limit.resetTime = now + 60000;
  }

  limit.count++;
  rateLimit.set(ip, limit);

  return limit.count <= 10; // 每分钟最多 10 次请求
}
```

## 成本估算

- Cloudflare Workers: 免费额度 100,000 请求/天
- Cloudflare Auto RAG: 按使用量计费
- 建议监控使用量，避免意外费用

## 故障排查

### 聊天按钮不显示

1. 检查 `aiChatConfig.enable` 是否为 `true`
2. 检查 `apiEndpoint` 是否正确配置
3. 确保在生产构建中（组件只在 `import.meta.env.PROD` 时加载）

### API 请求失败

1. 检查 Worker URL 是否可访问
2. 检查 CORS 配置
3. 查看浏览器控制台错误信息
4. 检查 Worker 日志

### 流式响应不工作

1. 确保 Worker 正确转发 `text/event-stream` 响应
2. 检查网络是否支持 SSE
3. 尝试禁用浏览器扩展（如广告拦截器）

## 自定义样式

组件使用 CSS 变量，自动匹配博客主题：

- `--primary`: 主题色
- `--card-bg`: 卡片背景
- `--text-primary`: 主文本颜色
- `--text-secondary`: 次要文本颜色
- `--line-divider`: 分隔线颜色

如需自定义，修改 `src/components/AIChatWidget.svelte` 中的样式。

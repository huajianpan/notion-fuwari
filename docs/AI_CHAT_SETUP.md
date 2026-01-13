# AI 聊天功能配置指南

本博客已集成 Cloudflare AI Search（AutoRAG）功能，可以智能检索博客内容并回答问题。

## 📋 前置条件

- Cloudflare 账号
- 已部署到 Cloudflare Pages 的博客

## 🚀 配置步骤

### 1️⃣ 创建 AI Search (AutoRAG)

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **AI** → **AI Search**
3. 点击 **Create AI Search**
4. 输入名称：`my-autorag`（与 `functions/api/ai-search.ts` 中的名称一致）
5. 选择生成模型（推荐）：`@cf/meta/llama-3.3-70b-instruct-fp8-fast`
6. 点击 **Create**

### 2️⃣ 上传博客内容

有两种方式上传内容：

#### 方式一：通过 Dashboard 手动上传

1. 在 AI Search 详情页，点击 **Upload Files**
2. 上传你的博客文章（支持 Markdown、TXT、PDF 等格式）
3. 等待索引完成

#### 方式二：通过 API 批量上传（推荐）

创建脚本 `scripts/upload-to-ai-search.js`：

```javascript
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

const ACCOUNT_ID = 'your-account-id';
const AI_SEARCH_ID = 'my-autorag';
const API_TOKEN = 'your-api-token';

async function uploadFiles() {
  const postsDir = './src/content/posts';
  const files = await readdir(postsDir);

  for (const file of files) {
    if (!file.endsWith('.md')) continue;

    const filePath = join(postsDir, file);
    const content = await readFile(filePath, 'utf-8');

    // 上传到 AI Search
    await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/ai/vectorize/${AI_SEARCH_ID}/insert`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: file,
          content: content,
          metadata: {
            folder: 'posts',
            modified_date: Date.now(),
          },
        }),
      }
    );

    console.log(`✅ Uploaded: ${file}`);
  }
}

uploadFiles();
```

### 3️⃣ 配置 Pages 绑定

在 Cloudflare Pages 项目设置中：

1. 进入你的 Pages 项目
2. 点击 **Settings** → **Functions**
3. 在 **AI Bindings** 区域，点击 **Add binding**
4. Variable name: `AI`
5. AI Search: 选择 `my-autorag`
6. 点击 **Save**

**或者**使用 wrangler.jsonc 配置（已配置）：

```jsonc
{
  "name": "notion-fuwari",
  "compatibility_date": "2025-08-11",
  "assets": {
    "directory": "./dist"
  },
  "ai": {
    "binding": "AI"  // AI binding 已配置
  }
}
```

### 4️⃣ 部署

```bash
# 1. 构建静态文件
pnpm build

# 2. 部署到 Cloudflare Pages
npx wrangler pages deploy dist

# 或者如果使用 Git 集成，直接 push 即可
git add .
git commit -m "feat: 添加 AI 聊天功能"
git push
```

### 5️⃣ 测试

部署完成后，访问你的博客：

1. 右下角会出现 AI 聊天按钮
2. 点击打开聊天窗口
3. 输入问题，例如："博客中有哪些关于 Serverless 的文章？"
4. AI 会检索相关内容并流式回答

## 🎯 功能特性

根据官方文档配置，本实现包含：

- ✅ **流式响应**：实时显示 AI 生成的内容
- ✅ **查询重写**（`rewrite_query: true`）：自动优化用户查询
- ✅ **智能重排序**（`reranking`）：提升检索结果相关性
- ✅ **相关性过滤**（`score_threshold: 0.3`）：只返回高质量结果
- ✅ **来源引用**：显示回答的来源文章
- ✅ **最多 5 个结果**（`max_num_results: 5`）

## 📊 API 端点详情

**路径：** `/api/ai-search`

**请求格式：**
```json
{
  "query": "你的问题"
}
```

**响应格式（SSE 流）：**
```
data: {"result":{"response":"AI回答内容...","data":[{"filename":"post.md","score":0.45}]}}
```

## ⚙️ 自定义配置

如果需要调整 AI Search 参数，编辑 `functions/api/ai-search.ts`：

```typescript
const result = await env.AI.autorag("my-autorag").aiSearch({
  query: query.trim(),
  model: "@cf/meta/llama-3.3-70b-instruct-fp8-fast", // 更换模型
  rewrite_query: true,        // 查询优化
  max_num_results: 5,         // 调整结果数量
  ranking_options: {
    score_threshold: 0.3      // 调整相关性阈值（0-1）
  },
  reranking: {
    enabled: true,            // 启用/禁用重排序
    model: "@cf/baai/bge-reranker-base"
  },
  stream: true,
});
```

## 🔧 故障排查

### 问题 1：聊天按钮不显示

**原因：** `aiChatConfig.enable` 未启用

**解决：** 检查 `src/config.ts`：
```typescript
export const aiChatConfig = {
  enable: true,  // 确保为 true
  apiEndpoint: "/api/ai-search",
  // ...
};
```

### 问题 2：API 返回 500 错误

**原因：** AI binding 未配置或 AI Search 不存在

**解决：**
1. 检查 Cloudflare Dashboard 中是否存在名为 `my-autorag` 的 AI Search
2. 检查 Pages 项目的 Functions 设置中是否添加了 AI binding
3. 查看部署日志获取详细错误信息

### 问题 3：回答不准确

**原因：** 文档未上传或索引不完整

**解决：**
1. 确认所有博客文章已上传到 AI Search
2. 等待索引完成（大约几分钟）
3. 调整 `score_threshold` 参数提高准确性

### 问题 4：流式响应不工作

**原因：** 浏览器不支持或网络问题

**解决：**
1. 使用现代浏览器（Chrome、Firefox、Safari）
2. 检查浏览器控制台的网络请求
3. 确认 API 返回 `Content-Type: text/event-stream`

## 📚 参考资料

- [Cloudflare AI Search 官方文档](https://developers.cloudflare.com/workers-ai/ai-search/)
- [Workers AI 模型列表](https://developers.cloudflare.com/workers-ai/models/)
- [Pages Functions 文档](https://developers.cloudflare.com/pages/functions/)

## 🎨 自定义 UI

AI 聊天组件位于 `src/components/AIChatWidget.svelte`，可以自定义：

- 颜色主题（使用 CSS 变量）
- 欢迎消息（`src/config.ts`）
- 浮动按钮位置
- 窗口大小

---

**配置完成后，你的博客就拥有了智能问答功能！** 🎉

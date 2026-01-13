#!/usr/bin/env node

/**
 * AI Search API 测试脚本
 *
 * 使用方法：
 * node scripts/test-ai-search.js "你的问题"
 *
 * 示例：
 * node scripts/test-ai-search.js "博客中有哪些关于 Serverless 的文章？"
 */

const API_ENDPOINT = process.env.API_ENDPOINT || 'http://localhost:8788/api/ai-search';

async function testAISearch(query) {
  if (!query) {
    console.error('❌ 请提供查询问题');
    console.log('使用方法: node scripts/test-ai-search.js "你的问题"');
    process.exit(1);
  }

  console.log('🔍 查询:', query);
  console.log('📍 API:', API_ENDPOINT);
  console.log('⏳ 发送请求...\n');

  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ API 错误:', response.status);
      console.error(error);
      process.exit(1);
    }

    console.log('✅ 连接成功！\n');
    console.log('📨 开始接收流式响应:\n');
    console.log('─'.repeat(60));

    // 处理流式响应
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let lastResponse = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim() || !line.startsWith('data: ')) continue;

        try {
          const data = JSON.parse(line.slice(6));

          if (data.result?.response) {
            // 清除上一行并打印新内容
            if (lastResponse) {
              process.stdout.write('\r\x1b[K');
            }
            lastResponse = data.result.response;
            process.stdout.write(data.result.response);
          } else if (data.error) {
            console.error('\n\n❌ 错误:', data.error);
          }
        } catch (e) {
          // 忽略解析错误
        }
      }
    }

    console.log('\n' + '─'.repeat(60));
    console.log('\n✅ 响应完成！\n');

  } catch (error) {
    console.error('\n❌ 请求失败:', error.message);
    console.error('\n提示：');
    console.error('1. 确保 API 端点正确');
    console.error('2. 如果测试本地开发环境，先运行: npx wrangler pages dev dist');
    console.error('3. 如果测试生产环境，设置环境变量: API_ENDPOINT=https://your-domain.com/api/ai-search');
    process.exit(1);
  }
}

// 获取命令行参数
const query = process.argv.slice(2).join(' ');
testAISearch(query);

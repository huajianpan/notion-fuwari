# GitHub Actions 自动同步配置指南

## 功能说明

这个 GitHub Actions 工作流会：
- ⏰ 每天北京时间 0 点自动运行
- 📥 从 Notion 同步最新文章
- 💾 自动提交到 Git 仓库
- 🚀 触发 Vercel 自动部署

## 配置步骤

### 1️⃣ 添加 GitHub Secrets

访问你的 GitHub 仓库设置页面：
```
https://github.com/你的用户名/你的仓库名/settings/secrets/actions
```

点击 **"New repository secret"**，添加以下两个密钥：

#### Secret 1: NOTION_TOKEN
- **Name**: `NOTION_TOKEN`
- **Value**: 你的 Notion Integration Token
- 获取方式：
  1. 访问 https://www.notion.so/my-integrations
  2. 点击 "New integration"
  3. 复制 "Internal Integration Token"

#### Secret 2: NOTION_DATABASE_ID
- **Name**: `NOTION_DATABASE_ID`
- **Value**: 你的 Notion 数据库 ID
- 获取方式：
  1. 打开你的 Notion 博客数据库
  2. 查看浏览器地址栏 URL
  3. 格式：`https://notion.so/workspace/DATABASE_ID?v=...`
  4. 复制其中的 `DATABASE_ID`（32位字符串）

### 2️⃣ 提交 Workflow 文件

```bash
# 1. 查看创建的文件
git status

# 2. 添加到 Git
git add .github/workflows/sync-notion.yml

# 3. 提交
git commit -m "ci: 添加 Notion 自动同步工作流

✨ 每天北京时间 0 点自动同步
📝 支持手动触发"

# 4. 推送到 GitHub
git push
```

### 3️⃣ 验证配置

1. **查看 Actions**
   访问：`https://github.com/你的用户名/你的仓库名/actions`

2. **手动测试运行**
   - 点击左侧的 "定时同步 Notion 文章"
   - 点击右侧的 "Run workflow"
   - 选择 branch: `master`
   - 点击绿色的 "Run workflow" 按钮

3. **查看运行日志**
   - 等待几秒钟
   - 点击新出现的运行记录
   - 查看详细日志，确认是否成功

## 使用说明

### 自动运行
- ⏰ 每天北京时间 0:00 自动运行
- 📝 如果有新文章会自动提交
- 🚀 Vercel 检测到提交会自动部署

### 手动运行
1. 访问 Actions 页面
2. 点击 "定时同步 Notion 文章"
3. 点击 "Run workflow"
4. 选择分支并运行

### 查看同步记录
在 GitHub 仓库的提交历史中，可以看到：
```
chore: 自动同步 Notion 文章

📝 文章已从 Notion 自动同步
🕐 同步时间: 2025-11-12 00:00:00
🤖 由 GitHub Actions 自动提交
```

## 常见问题

### Q1: 为什么是 16:00 而不是 0:00？
A: GitHub Actions 使用 UTC 时间，北京时间 = UTC + 8 小时
- 北京时间 0:00 = UTC 16:00（前一天）

### Q2: 如何修改同步时间？
编辑 `.github/workflows/sync-notion.yml` 中的 cron 表达式：

```yaml
schedule:
  # 每天北京时间 8:00 (UTC 0:00)
  - cron: '0 0 * * *'

  # 每天北京时间 12:00 (UTC 4:00)
  - cron: '0 4 * * *'

  # 每 6 小时一次
  - cron: '0 */6 * * *'

  # 每周一北京时间 9:00 (UTC 1:00)
  - cron: '0 1 * * 1'
```

### Q3: Secrets 配置错误怎么办？
1. 访问仓库的 Settings → Secrets → Actions
2. 找到对应的 Secret
3. 点击 "Update" 修改
4. 重新运行 workflow

### Q4: 如何禁用自动同步？
两种方法：

**方法 1**: 删除定时触发（保留手动触发）
```yaml
on:
  # schedule:  # 注释掉这一行
  #   - cron: '0 16 * * *'
  workflow_dispatch:  # 保留手动触发
```

**方法 2**: 删除整个 workflow 文件
```bash
git rm .github/workflows/sync-notion.yml
git commit -m "ci: 禁用自动同步"
git push
```

### Q5: 没有新文章时会提交吗？
不会！脚本会检查是否有更改：
- ✅ 有新文章 → 提交并推送
- ⏭️ 没有更改 → 跳过提交

### Q6: 会不会消耗 GitHub Actions 配额？
- GitHub 免费账号：每月 2000 分钟
- 每次运行约 1-2 分钟
- 每天 1 次 × 30 天 = 30-60 分钟/月
- 完全够用！

## 工作流程图

```
┌─────────────────┐
│  每天 0:00      │
│  (北京时间)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ GitHub Actions  │
│   自动触发      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 从 Notion 同步  │
│   最新文章      │
└────────┬────────┘
         │
         ▼
    ┌────┴────┐
    │ 有更改？ │
    └────┬────┘
         │
    ┌────┴────┐
    │         │
   是        否
    │         │
    ▼         ▼
┌───────┐  ┌───────┐
│ 提交  │  │ 跳过  │
│ 推送  │  └───────┘
└───┬───┘
    │
    ▼
┌───────────┐
│  Vercel   │
│ 自动部署  │
└───────────┘
```

## 监控和调试

### 查看运行历史
访问：`https://github.com/你的用户名/你的仓库名/actions`

### 查看详细日志
1. 点击某次运行记录
2. 点击 "sync-and-deploy" 任务
3. 展开各个步骤查看详细输出

### 常见日志信息
```bash
# 成功同步
✅ 找到 5 篇已发布文章
✅ 成功同步并推送新文章

# 没有新内容
📭 没有新文章需要同步

# 同步失败
❌ 错误: 缺少必要的环境变量
```

## 下一步

配置完成后，你的博客工作流将是：

1. 📝 在 Notion 中写文章
2. ✅ 设置状态为 "Published"
3. 😴 睡觉（什么都不用做）
4. 🌅 第二天早上醒来，文章已经发布！

完全自动化，无需手动操作！🎉

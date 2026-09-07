# Wordcraft

一个用于背单词的 React + Vite 网站初版。它提供英文单词搜索、英式／美式浏览器语音朗读、英文释义、词性、词形变化、例句与本地收藏词库。

## 本地运行

```bash
npm install
npm run dev
```

打开终端显示的本地地址（一般为 `http://localhost:5173`）。

## 构建生产版本

```bash
npm run build
```

构建后的静态网站位于 `dist/` 目录，可部署到 GitHub Pages、Netlify 或 Vercel。

## GitHub 项目管理（首次使用）

> 前提：已安装 Git，并已在 GitHub 创建一个空仓库，例如 `wordcraft`。

在此项目目录打开终端后，依次执行：

```bash
git init
git add .
git commit -m "Initial Wordcraft MVP"
git branch -M main
git remote add origin https://github.com/你的用户名/wordcraft.git
git push -u origin main
```

之后每次完成一轮改动，使用：

```bash
git status
git add .
git commit -m "简短描述本次改动"
git push
```

`git status` 用来检查有哪些文件改动；不确定时先运行它，再继续操作。不要把 `.env`、密码、令牌或私钥提交到仓库。

## 下一步建议

- 以公开词典 API 或你自己的 JSON/数据库扩展词库。
- 增加登录和跨设备同步。
- 增加间隔重复（SRS）复习、例句测验和学习统计。

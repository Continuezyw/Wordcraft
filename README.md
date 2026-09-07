# Wordcraft

一个用于背单词的 React + Vite 网站。它支持内置词条、任意英文单词的在线词典查询、英式／美式发音、英文释义、词性、词形变化、例句与临时词表导入。

## 本地运行

```bash
npm install
npm run dev
```

打开终端显示的本地地址（一般为 `http://localhost:5173`）。

## 搜索与在线词典

- 内置词条会直接显示完整内容。
- 搜索其他英文单词时，网站调用 [Free Dictionary API](https://dictionaryapi.dev/) 获取英文释义、词性、音标、可用音频和例句。
- 该 API 是第三方公共服务，网络不可用、服务未收录词条或字段不完整时，页面会显示提示而不会中断使用。

## 导入 CSV 词库

点击导航中的“导入词库”，上传 UTF-8 编码的 `.csv` 文件。

支持格式：第一列是单词，第二列可选标签。第一行可以是表头。

```csv
word,tag
abandon,CET-4
beneficial,CET-6
```

导入的单词只保存在**当前页面会话**；刷新网页后会清空。后续可以在 [importers.js](src/lib/importers.js) 按相同接口增加 JSON、纯文本粘贴或其他词库格式。

## 构建生产版本

```bash
npm run build
```

构建后的静态网站位于 `dist/` 目录，可部署到 GitHub Pages、Netlify 或 Vercel。

## GitHub 项目管理

在 VS Code 左侧“源代码管理”中：检查变更 → 点击 `+` 暂存 → 输入提交说明 → 点击“提交” → 点击“同步更改”。

提交不等于推送：提交只保存到本地；“同步更改”才会上传 GitHub。不要提交 `.env`、密码、令牌或私钥。

## 下一步建议

- 使用 IndexedDB 或账户系统保存导入词库和学习记录。
- 加入 CET-4 / CET-6 预置词库与词库筛选。
- 增加间隔重复（SRS）复习、例句测验和学习统计。

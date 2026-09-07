# Wordcraft · 查询数据增强方案

## 已确认

- 你的当前目录结构是 `Vocabulary/wordcraft/`，因此在外层 `Vocabulary` 文件夹运行：

  ```powershell
  npm --prefix ".\wordcraft" run dev
  ```

  是正确的，也会作为后续 README 的标准运行命令；不需要改变文件夹结构。
- Datamuse 响应快，但它本身只稳定提供英文释义、词性缩写和音节数，不能满足 IPA、音频、词形与例句需求。
- 重新验证后，Free Dictionary API 目前可返回 `hello` 的 IPA、音频、多个词性和例句。因此改为“Free Dictionary 为主、Datamuse 为快速备用”的双来源策略。

## 实施内容

1. 把词典模块拆成两个 provider：
   - **主 provider：Free Dictionary API**，负责 IPA、音频、词性、释义、例句、同义/反义词、词源；使用严格的 5 秒 `AbortController` 超时。
   - **备用 provider：Datamuse**，仅在主 provider 网络失败或超时时使用；提供最基本的英文释义、词性与音节数。
2. 所有请求使用 `Promise.race` 与实际的 `AbortController` 信号，保证包含 DNS/连接/响应等待在内的单次主请求最多 5 秒；主查询失败后才开始备用请求，备用也有独立 3 秒上限。页面会正确结束 loading 状态。
3. 主 provider 成功时恢复并扩展详情：
   - 英／美 IPA 与 API 音频；
   - 词性与多个释义；
   - 尽可能呈现例句、词源和相关词；
   - 基于 API 返回的词性/词条信息生成“词形/词汇信息”区，缺失项目明确显示“在线词典未提供”。
4. 详情页适配多个词性/释义，首个释义作为主定义，其余释义以可阅读的列表展现，避免只显示一个不完整定义。
5. 更新 README：固定外层目录运行方式；说明双 API 及信息完整度取决于词条收录；重新构建验证。

# Thai Legal Watch CN / 泰国法律观察中文版

[中文网站（Pages 部署后）](https://zvbo.github.io/thai-legal-watch-cn/) · [关于与授权](https://zvbo.github.io/thai-legal-watch-cn/about.html)

本项目是**独立开发的静态中文阅读界面**。浏览器直接读取 Thai Legal Watch 上游最新《皇家公报》JSON 数据，仅翻译法律文件的标题，不提供正文译本，也不自建法规数据库或后端 API。每条记录保留泰文原标题、文件 ID 及可用的官方公报链接。上游网站链接见站内「关于与授权」。

> **非官方项目：** 与泰国政府、泰国《皇家公报》发布机关、Open Law Data Thailand 没有官方隶属或授权关系。中文标题仅供检索参考；正式法律引用以官方泰文文件为准。

## 数据来源与许可

| 内容 | 原始来源 / 许可 |
| --- | --- |
| 官方文件 | [泰国《皇家公报》](https://ratchakitcha.soc.go.th/) |
| 开放数据 | [Open Law Data Thailand](https://www.openlawdatathailand.org/) / [Thai Legal Watch](https://thai-legal-watch.openlawdatathailand.org/) |
| 数据集 | [soc-ratchakitcha](https://huggingface.co/datasets/open-law-data-thailand/soc-ratchakitcha) · [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| 上游源代码 | [open-law-data-thailand/thai-legal-watch](https://github.com/open-law-data-thailand/thai-legal-watch) · MIT |
| 本站独立开发代码 | [MIT](./LICENSE) |

**本项目对数据所作修改**：增补简体中文标题参考译名、中文分类、检索和筛选界面。不修改泰文标题，不声称译名得到上游或政府认可。完整说明见 [ATTRIBUTION.md](./ATTRIBUTION.md) 与站内 [about.html](./about.html)。

## 更新机制

ChatGPT 定时任务「泰国法律公报中文标题同步」计划每天晚上约 21:00（Asia/Bangkok）检查新增标题，对照文件 ID 与泰文原标题后增量写入 `data/translations.json`，避免覆盖人工修订。GitHub Actions 监听该文件提交并发布 GitHub Pages；无需在公开站点或 GitHub Actions 中储存付费翻译 API 密钥。

首次执行及完整发布链路是否正常，仍须通过实际 GitHub 提交与 Actions 结果验证。若无可靠译文则展示泰文标题，不编造中文内容。

### 翻译候选队列

维护和同步时应按 [翻译范围规则](./assets/translation-policy.js) 选取最近 90 天的候选标题。人事任免及授衔授勋、个案裁判、破产和清算个案公告排除在自动翻译范围之外。宪法法院裁判及结果公告进入人工审核，审核人可在对应的缓存条目中增填 `"reviewed": true`。中文译名仍须与文件 ID 和泰文原题一致。历史缓存保留，前台按上述范围决定是否展示。

运行 `node scripts/translation-queue.mjs 40` 可列出下一批候选，优先法律、规章和一般规则。若已下载上游 JSON，可用 `node scripts/translation-queue.mjs 40 /path/to/latest.json`。脚本只输出候选标题。

## 手动部署

1. 由仓库所有者自行将仓库设为 Public（需要公开共享时）。
2. GitHub `Settings → Pages → Build and deployment → Source` 选择 `GitHub Actions`。
3. 打开 `Actions → Deploy Chinese Reader` 确认部署成功。预计地址 `https://zvbo.github.io/thai-legal-watch-cn/`。

Pages 可用性以账户计划和实际设置为准。

## 技术与法律边界

- 不需要法规数据库或运行时后端；静态网页读取上游 JSON。
- PDF 链接仅在上游提供可核对官方标识或完整 URL 时显示，不凭 ID 推定。
- 本项目代码 MIT 不改变上游数据适用的 CC BY 4.0 和署名要求。
- OCR、主题分类和中文标题参考译名可能存在错误，不构成法律意见。

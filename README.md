# Thai Legal Watch CN

独立中文静态阅读器：直接读取 Thai Legal Watch 上游最新皇家公报 JSON，仅翻译文件标题；保留泰文标题、原站详情和官方 PDF 入口。

## 自动更新

ChatGPT 定时任务「泰国法律公报中文标题同步」每天晚上约 21:00（Asia/Bangkok）读取最新数据，将新增标题的中文参考译文提交到 `data/translations.json`。GitHub Actions 收到更新后负责发布 GitHub Pages，部署流程不需要 OpenAI API Key。

## 部署

1. 在 GitHub 仓库的 Settings → Pages 中选择 GitHub Actions 作为发布方式。
2. 在 Actions 中查看 `Deploy Chinese Reader` 的运行结果；也可以手动执行。
3. 网站默认路径：`https://zvbo.github.io/thai-legal-watch-cn/`（仅在 Pages 启用且部署成功后才存在）。

注意：仓库当前是 Private；GitHub Free 使用 Pages 通常要求 Public 仓库，或者使用满足条件的付费方案。未经用户批准，不改变仓库可见性。

中文标题为非官方参考译名。法律引用须以 [泰国皇家公报](https://ratchakitcha.soc.go.th/) 的泰文原文为准。

来源：[Thai Legal Watch](https://thai-legal-watch.openlawdatathailand.org/) / [OpenLawData Thailand](https://github.com/open-law-data-thailand/thai-legal-watch)。

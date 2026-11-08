# 来源与许可 / Attribution

## 项目定位

**Thai Legal Watch CN** 是独立的中文静态阅读器，并非泰国政府或 Open Law Data Thailand 提供的官方中文版。中文标题为参考译名；法律引用须核对《皇家公报》泰文原文。

## 来源说明

- **官方发布者**：泰国《皇家公报》（ราชกิจจานุเบกษา），https://ratchakitcha.soc.go.th/
- **开放数据整理者**：Open Law Data Thailand，https://www.openlawdatathailand.org/
- **上游展示项目**：Thai Legal Watch，https://thai-legal-watch.openlawdatathailand.org/
- **上游项目代码**：https://github.com/open-law-data-thailand/thai-legal-watch
- **上游数据集**：soc-ratchakitcha，https://huggingface.co/datasets/open-law-data-thailand/soc-ratchakitcha
- **上游数据许可**：Creative Commons Attribution 4.0 International（CC BY 4.0），https://creativecommons.org/licenses/by/4.0/
- **上游代码许可**：MIT License，见上游源代码仓库。

## 本项目对原始数据做出的修改

1. 浏览器直接读取上游 Thai Legal Watch 的公开 JSON 元数据；
2. 将部分泰文文件标题翻译为简体中文参考译名，保留泰文原名及文件 ID；
3. 添加中文分类、检索、日期过滤与标题缓存；
4. 保留上游详情页面入口；仅在具备可信官方 PDF 入口时提供官方文档链接。

**不翻译法规全文**，不代表政府、上游项目或官方机构审核和认可任何中文译名。上游数据可能包含 OCR 或分类误差。

## 许可边界

- 本项目独立编写的程序代码：MIT License，见 [LICENSE](./LICENSE)。
- 通过上游数据来源提供的记录、元数据：遵守其适用的 CC BY 4.0 许可与署名义务。
- 中文标题翻译是基于原始标题的参考性改编，不能因为本站代码采用 MIT 就将原始数据视为 MIT 授权。
- 官方法律文本及第三方素材的权利与使用条件不因本站的许可证而改变。

如需正式法律解释或法律依据，请以泰国《皇家公报》官方发布文件为准。

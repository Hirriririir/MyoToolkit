# 更新日志

MyoToolkit 的所有重要更新将记录在此页面。

## 2026.04 — MyoScore 在线计算器

- 新增浏览器端 [MyoScore 在线计算器](/zh/myoscore/calculator)，无需安装
- 支持上传或粘贴 bulk RNA-seq 原始 count 矩阵，计算全程在浏览器本地完成（数据不上传服务器）
- 自动识别 Gene Symbol / Ensembl ID，按需加载 GTEx 注释字典（约 5.6 万条）完成转换
- 四种 ECharts 可视化：雷达图、MyoScore 条形图、各维度箱线图、结果表（支持 CSV 下载）
- 全屏模式便于大批量队列查看
- 内置 Symbol / Ensembl 两种格式示例数据（5 Healthy + 5 Unhealthy）

---

## 2026.03 — MyoPath

- 开源发布 MyoPath 流水线（[GitHub](https://github.com/Hirriririir/MyoPath)）
- H&E 全切片图像四层组织分割：肌纤维（Cellpose-SAM）、脂肪（像素分类器）、细胞核（watershed）、结缔组织（布尔减法）
- 37 个形态学特征，涵盖五个生物学类别
- 七项病理指标，以 NCI 和 Fiber CV 作为主要生物标志物
- MyoPath Score 复合严重程度评分（外部验证 AUC = 0.873）
- 在两个独立队列的 478 张 WSI 上验证（GTEx n=399，华山队列 n=79）
- QuPath + Python 流水线，支持批处理和命令行操作

---

## 2026.03 — MyoToolkit 网站

- 首次发布统一的 MyoToolkit 文档网站
- 整合 MyoScore、MyoPath、MyoSpectrum 和 ThighMRIseg 至同一平台

---

## 2024.04 — MyoSpectrum

- 发表于 *Communications Biology*, 2024, 7(1):438
- 1,221 块人源骨骼肌的整合性转录组图谱（9,231 基因）
- 从健康到重度肌病的连续肌病谱系
- 新型特征基因：*MGST1*、*AOX1*、*FASN*、*PRKCD*、*CHRNA1*
- CDM、LGMD R12 和 FSHD 队列的临床验证

---

## 2023.06 — ThighMRIseg

- 基于 SegResNet 的 11 块大腿肌肉分割
- 多模态支持（IDEAL、T1、T2、STIR）
- 多种族训练数据（354 例 MRI：中国、芬兰、德国）
- MONAI Label 部署，集成 OHIF 和 3D Slicer

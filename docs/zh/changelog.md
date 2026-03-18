# 更新日志

MyoToolkit 的所有重要更新将记录在此页面。

## [未发布]

### MyoToolkit 网站
- 首次发布统一的 MyoToolkit 文档网站
- 整合 MyoScore、MyoPath 和 ThighMRIseg 至同一平台

---

## MyoScore

### v3.3 (2024)
- 新增 **Youth** 维度，基于端粒长度 TWAS（81 个基因）
- 修正 GTEx 对照分组排序：意外死亡/事故死亡排名高于慢性死亡
- 提升跨队列泛化能力（4 个队列 AUC 均 > 0.75）

### v3.2
- 五维度评分系统（Strength、Mass、LeanMuscle、Youth、Resilience）
- GWAS-TWAS 整合 28 个表型和 GTEx v8 eQTL 权重
- 识别 1,116 个肌肉健康基因

---

## MyoPath

### v1.0 (2024)
- HE 染色全切片图像自动分析
- 脂肪浸润和纤维化定量
- 肌纤维形态测量（直径、横截面积、变异系数）

---

## ThighMRIseg

### v1.0 (2024)
- 基于 SegResNet 的 11 块大腿肌肉分割
- 多模态支持（IDEAL、T1、T2、STIR）
- 多种族训练数据（354 例 MRI：中国、芬兰、德国）
- MONAI Label 部署，集成 OHIF 和 3D Slicer

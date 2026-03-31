# MyoPath

::: danger 正在开发中

MyoPath 目前正在积极开发中，尚未公开发布。

:::

**MyoPath** 是一个基于深度学习的骨骼肌活检客观形态学评估流水线，分析常规 HE 染色全切片图像（WSI）。

<MyoPathDemo />

## 概述

MyoPath 实现了四层组织分割流水线 — Cellpose-SAM 用于肌纤维实例分割、像素分类器用于脂肪浸润识别、Watershed 用于细胞核检测、布尔减法用于结缔组织 — 每个样本提取 **37 个形态学特征**。从中推导出**七项临床可解释的病理指标**，以**核中心化指数 (NCI)** 和**纤维大小变异系数 (Fiber CV)** 作为主要生物标志物。

![MyoPath 流水线架构图](/myopath/flowchart-01-01.png)

该工具集已在两个独立队列的 478 张 H&E 全切片图像上验证（华山队列 n = 79；GTEx 队列 n = 399）。

## 主要功能

- **四层组织分割**：从单张 H&E 切片中分割肌纤维、脂肪、细胞核和结缔组织
- **37 个形态学特征**，涵盖五个生物学类别（[详情](/zh/myopath/metrics)）
- **七项病理指标**：核定位、纤维大小、形状、组织成分和细胞反应
- **MyoPath Score**：复合严重程度评分（外部验证 AUC = 0.873）
- **主要生物标志物**：NCI (p = 1.3 x 10⁻⁵) 和 Fiber CV (p = 2.9 x 10⁻⁴)

## 分割流水线

| 层 | 组织 | 方法 | Dice |
|---|---|---|---|
| 1 | 肌纤维实例 | Cellpose-SAM | 0.92 |
| 2 | 脂肪浸润 | 像素分类器 | 0.95 |
| 3 | 细胞核 | Watershed 检测 | 0.87 |
| 4 | 结缔组织 | 布尔减法 | 0.88 |

## 引用

> Zhong H\*, Gao M\*, et al. **MyoPath: A Deep Learning Pipeline for Objective Morphometric Assessment of Skeletal Muscle Biopsies.** *投稿准备中。*

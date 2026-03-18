# ThighMRIseg

::: warning

此项目 V1.0 已存档，不再更新。

:::

**ThighMRIseg** 是一个基于深度学习的大腿肌肉 MRI 分割工具，使用多模态、多种族数据集训练。

## 概述

ThighMRIseg 使用 SegResNet 架构，通过 MONAI Label 部署，自动从 MRI 扫描中分割 11 块大腿肌肉。支持多种 MRI 模态，训练数据来自三个种族人群。

![工作流程图](/thighmriseg/Flowchart.png)

## 分割效果展示

![分割效果](/thighmriseg/demo.png)

## 目标肌肉（11 块）

| 肌肉 | 区域 |
|------|------|
| **股二头肌（长头）** | 后侧 |
| **股二头肌（短头）** | 后侧 |
| **半腱肌** | 后侧 |
| **半膜肌** | 后侧 |
| **大收肌** | 内侧 |
| **股中间肌** | 前侧 |
| **股外侧肌** | 前侧 |
| **股内侧肌** | 前侧 |
| **股直肌** | 前侧 |
| **股薄肌** | 内侧 |
| **缝匠肌** | 前侧 |

## 支持的 MRI 模态

- IDEAL 脂水分离
- T1 加权
- T2 加权
- STIR（短时反转恢复）

## 集成平台

- **MONAI Label** 服务器部署
- 兼容 **OHIF Viewer** 和 **3D Slicer**
- 临床工作流中一键"自动分割"

### OHIF Viewer

![OHIF Viewer 演示](/thighmriseg/OHIF.gif)

### 3D Slicer

![3D Slicer 演示](/thighmriseg/3D_slicer.gif)

## 引用

> Multimodal Multiethnic Thigh Muscle MRI Analysis. GitHub: [Hirriririir/Multimodal-Multiethnic-Thigh-Muscle-MRI-analysis](https://github.com/Hirriririir/Multimodal-Multiethnic-Thigh-Muscle-MRI-analysis)

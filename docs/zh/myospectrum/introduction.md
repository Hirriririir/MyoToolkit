# MyoSpectrum

**MyoSpectrum** 是一个整合性的人类骨骼肌转录组图谱，涵盖健康和肌病状态。

## 概述

MyoSpectrum 整合了 1,221 例人类骨骼肌样本的 bulk RNA-seq 数据，覆盖 9,231 个基因，提供健康与疾病状态下的全面转录组景观。

![流程图](/myospectrum/Flowchart.png)

## 肌病谱系

![肌病谱系](/myospectrum/Myopathy_specturm.png)

## 数据集

| 来源 | 样本数 | 描述 |
|------|--------|------|
| **GTEx** | 803 | 健康对照（尸检） |
| **GEO** | 291 | 多个肌病研究 |
| **Helsinki** | 127 | Titinopathy、IBM 队列 |
| **合计** | **1,221** | 929 对照 + 292 肌病 |

## 肌病类型（20+种）

FSHD、DM1、LGMD R12、CDM、Titinopathy、IBM、DMD、BMD、HNRNPA1、OBSCN、TNPO3 及其他罕见突变，以及未确诊病例。

## 主要功能

- **批次校正整合**多来源 RNA-seq 数据
- **UMAP 可视化**肌病谱系
- **差异表达分析**跨疾病比较
- **细胞类型反卷积**（TAPE）
- **通路富集分析**
- **统计趋势检验**（Jonckheere 检验）

## 发表论文

> Zhong H, et al. Revealing myopathy spectrum: integrating transcriptional and clinical features of human skeletal muscles with varying health conditions. *Communications Biology*, 2024, 7(1):438. [DOI](https://www.nature.com/articles/s42003-024-06143-3)

## 源代码

GitHub: [Hirriririir/MyoSpectrum](https://github.com/Hirriririir/MyoSpectrum)

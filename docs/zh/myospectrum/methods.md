# 方法

## 分析流程

```
原始 RNA-seq 计数 → ComBat-seq 批次校正 → EdgeR 差异表达分析
                                        → Scanpy 整合 & UMAP
                                        → TAPE 反卷积
                                        → gseapy 通路富集
                                        → Jonckheere 趋势检验
```

## 批次效应校正

- **方法：** ComBat-seq（sva 包）
- **批次变量：** 测序平台（mRNA polyA vs. total RNA ribosomal）
- **样本：** 930 例 mRNA polyA + 291 例 total RNA ribosomal

## 差异表达

- **工具：** EdgeR
- **设计：** 各肌病类型与对照的配对比较
- **阈值：** FDR < 0.05，|log2FC| > 1

## 整合与可视化

- **工具：** Scanpy
- **方法：** UMAP 降维
- **特征：** 1,221 例样本 × 9,231 个基因

## 细胞类型反卷积

- **工具：** TAPE
- **目的：** 估计肌病组织中的细胞类型组成变化

## 通路富集

- **工具：** gseapy
- **数据库：** GO、KEGG、Reactome
- **方法：** 预排序基因集富集分析（GSEA）

## 统计检验

- **Jonckheere 趋势检验**（DescTools 包）用于有序疾病严重程度趋势
- Benjamini-Hochberg FDR 多重检验校正

# R 包

## 概述

`MyoScore` R 包提供了从 bulk RNA-seq 原始 count 数据计算 MyoScore 的完整接口，内置基因权重、预处理、评分和可视化功能。

::: info
**包名**: MyoScore v1.0.0 | **许可证**: MIT | **R**: >= 4.0.0
:::

## 安装

```r
# 从 GitHub 安装
devtools::install_github("Hirriririir/MyoScore")
```

## 快速开始

```r
library(MyoScore)

# 从 CSV 文件计算 MyoScore（基因为行，样本为列）
scores <- myoscore_score("path/to/raw_counts.csv")

# 或从 R 中的矩阵计算
scores <- myoscore_score(count_matrix)

# 制表符分隔文件
scores <- myoscore_score("counts.tsv", sep = "\t")

# 查看结果
head(scores)
#>     Strength_score Mass_score LeanMuscle_score Youth_score Resilience_score MyoScore
#> S1          72.3       65.1             80.2        55.8             68.4     69.2
#> S2          45.1       38.7             42.3        61.2             35.6     44.1
```

## 输入要求

- **格式**: 原始 count 矩阵（**非** TPM、FPKM 或归一化值）
- **基因**: Gene Symbol 作为行名（非 Ensembl ID）
- **样本**: 至少 2 个样本（建议 >= 20 个以确保归一化可靠性）
- **覆盖率**: 典型 bulk RNA-seq 数据集包含 ~417 个评分基因（每个维度约 50%），足以进行可靠评分

## 函数参考

### `myoscore_score()` — 主评分函数 {#myoscore-score}

主入口函数。接受文件路径或 count 矩阵，返回每个样本的评分。

```r
myoscore_score(
  input,               # 文件路径（CSV/TSV）或 count 矩阵/data.frame
  gene_weights = NULL, # 自定义基因权重（默认使用内置数据）
  sep = ",",           # 文件分隔符
  min_coverage = 0.1,  # 每个维度的最低基因覆盖率
  verbose = TRUE       # 打印进度信息
)
```

**返回值**: `data.frame`，包含列: `Strength_score`、`Mass_score`、`LeanMuscle_score`、`Youth_score`、`Resilience_score`、`MyoScore`（均为 0-100）。

**评分流程**:
1. 原始 count 归一化为 log2(CPM+1)
2. 基因级 z-score 标准化（跨所有输入样本）
3. Z-score 乘以基因方向和权重，取加权平均
4. 每个维度进行 min-max 归一化至 0-100
5. 复合评分 = 五个维度的加权和

### `myoscore_preprocess()` — 归一化 {#myoscore-preprocess}

将原始 count 归一化为 log2(CPM+1)。

```r
log2cpm <- myoscore_preprocess(count_matrix, verbose = TRUE)
```

### `myoscore_score_dimension()` — 单维度评分 {#myoscore-score-dimension}

计算单个维度的评分。

```r
log2cpm <- myoscore_preprocess(count_matrix)
youth <- myoscore_score_dimension(log2cpm, dimension = "Youth")
```

可用维度: `"Strength"`、`"Mass"`、`"LeanMuscle"`、`"Youth"`、`"Resilience"`。

### `myoscore_weights()` — 维度权重 {#myoscore-weights}

返回维度权重的命名数值向量。

```r
myoscore_weights()
#> Strength       Mass LeanMuscle      Youth Resilience
#>    0.252      0.177      0.243      0.242      0.087
```

### `myoscore_dimensions()` — 维度名称 {#myoscore-dimensions}

```r
myoscore_dimensions()
#> [1] "Strength"   "Mass"       "LeanMuscle" "Youth"      "Resilience"
```

### `myoscore_colors()` — 配色方案 {#myoscore-colors}

```r
# 五维度颜色
myoscore_colors("dimensions")
#>   Strength       Mass LeanMuscle      Youth Resilience
#>  "#50327b"  "#46508b"  "#f4e030"  "#72c95e"  "#31848f"

# 不健康到健康的渐变色
myoscore_colors("spectrum")
#> unhealthy      mild   neutral  positive   healthy
#> "#50327b" "#46508b" "#31848f" "#72c95e" "#f4e030"
```

## 可视化

### 雷达图

需要安装 `fmsb` 包。

```r
# install.packages("fmsb")

# 整体均值雷达图
myoscore_plot_radar(scores)

# 按条件分组（分面面板）
myoscore_plot_radar(scores, groups = metadata$condition)

# 叠加在同一图上
myoscore_plot_radar(scores, groups = metadata$condition, facet = FALSE)

# 单个样本，按维度着色
myoscore_plot_radar(c(72.3, 65.1, 80.2, 55.8, 68.4), title = "Patient A")
```

**参数**:

| 参数 | 默认值 | 描述 |
|------|--------|------|
| `scores` | — | `myoscore_score()` 的输出 data.frame，或长度为 5 的命名数值向量 |
| `groups` | `NULL` | 用于分组比较的因子/字符向量 |
| `colors` | 自动 | 颜色向量（每组一个） |
| `facet` | `TRUE` | 每组单独一个面板 |
| `title` | `NULL` | 主标题 |
| `show_values` | `TRUE` | 在顶点显示分数值 |

### 分组箱线图

优先使用 `ggplot2`，如不可用则使用 base R。

```r
# install.packages("ggplot2")

# 按组比较 MyoScore
myoscore_plot_boxplot(scores, groups = metadata$condition)

# 显示所有维度
myoscore_plot_boxplot(scores, groups = metadata$condition, which = "all")

# 单个维度
myoscore_plot_boxplot(scores, groups = metadata$condition, which = "Youth")
```

**参数**:

| 参数 | 默认值 | 描述 |
|------|--------|------|
| `scores` | — | `myoscore_score()` 的输出 data.frame |
| `groups` | — | 分组标签的因子/字符向量 |
| `which` | `"MyoScore"` | `"MyoScore"`、任意维度名称或 `"all"` |
| `colors` | 自动 | 颜色向量 |
| `use_ggplot` | `TRUE` | 可用时使用 ggplot2 |
| `title` | `NULL` | 主标题 |

## 内置数据

### `myoscore_genes`

包含 591 条基因-维度记录（417 个唯一基因）的 data.frame，用于评分计算。

```r
data(myoscore_genes)
head(myoscore_genes)

# 每个维度的基因数
table(myoscore_genes$dimension)
```

| 列名 | 描述 |
|------|------|
| `ID` | 基因符号 (HGNC) |
| `weight` | 来自 TWAS Z-score 的基因权重 |
| `direction_v3` | +1 = 高表达代表健康；-1 = 高表达代表不健康 |
| `dimension` | 五个 MyoScore 维度之一 |

## 依赖

| 包 | 类型 | 用途 |
|----|------|------|
| `stats`、`utils`、`graphics`、`grDevices` | 必需 | R 基础功能 |
| `ggplot2` (>= 3.4.0) | 建议 | 增强版箱线图 |
| `fmsb` | 建议 | 雷达图 |
| `patchwork` | 建议 | 多面板布局 |
| `testthat` (>= 3.0.0) | 建议 | 单元测试 |
| `knitr`、`rmarkdown` | 建议 | Vignettes |

## 完整工作流示例

```r
library(MyoScore)

# 1. 加载并评分
scores <- myoscore_score("my_cohort_counts.csv")

# 2. 关联元数据
metadata <- read.csv("my_cohort_metadata.csv")

# 3. 可视化
# 雷达图对比疾病与对照
myoscore_plot_radar(scores, groups = metadata$condition)

# 所有维度箱线图
myoscore_plot_boxplot(scores, groups = metadata$condition, which = "all")

# 4. 导出结果
results <- cbind(metadata, scores)
write.csv(results, "my_cohort_myoscores.csv", row.names = FALSE)
```

## 引用

## 源代码

- GitHub: [https://github.com/Hirriririir/MyoScore](https://github.com/Hirriririir/MyoScore)
- 问题反馈: [https://github.com/Hirriririir/MyoScore/issues](https://github.com/Hirriririir/MyoScore/issues)

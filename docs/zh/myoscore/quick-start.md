# 快速开始

## 计算 MyoScore

### 输入格式

- 原始 count 矩阵（Gene Symbol × Samples）
- CSV 格式，基因为行，样本为列

### R 包（推荐）

```r
# 从 CRAN 安装
install.packages("MyoScore")

# 或从 Github 安装
devtools::install_github("Hirriririir/MyoScore")

# 计算评分
library(MyoScore)
scores <- myoscore_score("your_counts.csv")
head(scores)
```

完整用法和可视化请参阅 [R 包文档](/zh/myoscore/r-package)。

### Python 脚本

```python
python calculate_myoscore.py \
    --input your_counts.csv \
    --output your_scores.csv
```

### 输出

- 5 个维度评分（各 0–100）：Strength、Mass、LeanMuscle、Youth、Resilience
- MyoScore 复合评分（0–100）

### 复合评分公式

$$
\text{MyoScore} = 0.252 \times \text{Strength} + 0.177 \times \text{Mass} + 0.243 \times \text{LeanMuscle} + 0.242 \times \text{Youth} + 0.087 \times \text{Resilience}
$$

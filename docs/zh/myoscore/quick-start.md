# 快速开始

## 安装

```bash
# 克隆仓库
git clone https://github.com/Hirriririir/MyoToolkit.git
cd MyoToolkit
```

## 计算 GMHS 评分

### Python

```python
python calculate_gmhs_v33.py \
    --input your_counts.csv \
    --output your_scores.csv
```

### R

```r
source("calculate_gmhs_v33.R")
```

## 输入格式

- 原始 count 矩阵（Gene Symbol × Samples）
- CSV 格式，基因为行，样本为列

## 输出

- 5 个维度评分（各 0-100）
- GMHS_v33 复合评分（0-100）

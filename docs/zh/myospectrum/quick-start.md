# 快速开始

## 环境要求

- Python 3.8+
- R 4.2+

## 安装

```bash
git clone https://github.com/Hirriririir/MyoSpectrum.git
cd MyoSpectrum
```

## Python 依赖

```bash
pip install scanpy gseapy tape-cell conorm
```

## R 依赖

```r
install.packages(c("edgeR", "sva", "DescTools"))
```

## 数据结构

```
MyoSpectrum/
├── 1_raw_data/              # 原始输入数据
├── 2_integration/           # 批次校正整合数据
├── 3_deconvolution/         # TAPE 细胞类型反卷积结果
├── 4_differential/          # 差异表达分析输出
├── 5_figures/               # 生成的图表
└── 6_validation/            # 验证数据集
```

## 运行流程

1. **批次校正**：ComBat-seq 调整测序平台差异
2. **整合与可视化**：基于 Scanpy 的 UMAP 嵌入
3. **差异表达**：EdgeR 跨疾病比较
4. **反卷积**：TAPE 细胞类型组成
5. **通路分析**：gseapy 基因集富集分析

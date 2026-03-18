# 快速开始

> 使用类单细胞分析方法（Scanpy）分析 Bulk RNA-seq 数据，实现批量转录组的整合、可视化与轨迹分析。

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

## 数据下载

### Release 数据

以下整合数据文件可从 [GitHub Release v1.0](https://github.com/Hirriririir/MyoSpectrum/releases/tag/1.0) 下载：

| 文件 | 大小 | 说明 |
|------|------|------|
| `adata_all_muscle.h5ad` | ~261 MB | 包含所有整合肌肉数据的 AnnData 对象 |
| `All_muscle.batch_adjusted.count.data.csv` | ~49 MB | 批次校正后的计数矩阵 |
| `All_muscle.original.count.data.csv` | ~49 MB | 批次校正前的原始计数矩阵 |
| `All_muscle_L_combatseq_tmm.csv` | ~197 MB | ComBat-seq + TMM 标准化的表达矩阵 |

### 仓库数据

[GitHub 仓库](https://github.com/Hirriririir/MyoSpectrum)包含以下数据文件夹：

- **DEG**：edgeR 导出的差异表达分析（DEG）结果。
- **Meta**：整合数据集的元数据（Data_source / Geo_accession / Author_Date / PMID / Sample_id / Gsm_accession / Casual_gene / Phenotype / Biopsy site / sequencing method / sequencing platform / Sex / Age range）。
- **TAPE**：基于两个人类骨骼肌单细胞数据集（[Tabula Sapiens](https://tabula-sapiens-portal.ds.czbiohub.org/) 和 [GSE143704](https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE143704)）注释的组织反卷积结果。
- **Helsinki data**：127 例来自赫尔辛基的骨骼肌 Bulk RNA-seq 数据（[Group Udd](https://www.folkhalsan.fi/en/knowledge/research/genetics/group-udd/)，Folkhälsan 研究中心，赫尔辛基大学）。其中 39 例同时发表为 [GSE151757](https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE151757)。
- **GEO data**：291 例从 GEO 数据库下载的骨骼肌 Bulk RNA-seq 数据（[GSE115650](https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE115650)、[GSE140261](https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE140261)、[GSE175861](https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE175861)、[GSE184951](https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE184951)、[GSE201255](https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE201255)、[GSE202745](https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE202745)）。
- **GTEx data**：803 例从 GTEx Analysis V8 下载的骨骼肌 Bulk RNA-seq 数据（[dbGaP Accession phs000424.v8.p2](https://gtexportal.org/home/datasets#datasetDiv1)）。主要活检部位为腓肠肌，髌骨下方 2 cm。
- **Integration data**：整合过程中生成的中间数据。
- **Validation**：从所使用 GEO 数据集的补充文件中下载或从整合数据集生成的验证数据。

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

### 第 1 步：加载数据与环境配置

```python
import numpy as np
import pandas as pd
import scanpy as sc

sc.set_figure_params(dpi=100, color_map='viridis_r',
                     transparent=False, frameon=False)
sc.settings.verbosity = 1
```

### 第 2 步：读取整合数据

直接加载预构建的 AnnData 对象，或从标准化 CSV 读取：

```python
# 方式 A：加载预构建 h5ad
adata = sc.read('Integration data/adata_all_muscle.h5ad')

# 方式 B：从 ComBat-seq + TMM 标准化 CSV 读取
adata = sc.read_csv(
    "Integration data/All_muscle_H_combatseq_tmm.csv",
    first_column_names='Sample_id'
)
```

### 第 3 步：加载元数据

```python
Meta_GEO = pd.read_excel('Meta/RNA-seq integration meta.xlsx', sheet_name='GEO')
Meta_GTEx = pd.read_excel('Meta/RNA-seq integration meta.xlsx', sheet_name='GTEx')
Meta_Helsinki = pd.read_excel('Meta/RNA-seq integration meta.xlsx', sheet_name='Helsinki')

Meta_all = pd.concat([Meta_GEO, Meta_GTEx, Meta_Helsinki], axis=0)
Meta_all.set_index('Sample_id', inplace=True)
Meta_all = Meta_all.drop(['Age'], axis=1)

# 映射表型分类
Phenotype_34 = pd.read_excel('Meta/Phenotype_3_4.xlsx')
for col in ['Phenotype_3', 'Phenotype_4', 'Phenotype_5', 'Phenotype_6']:
    mapping = dict(zip(Phenotype_34.Phenotype_2, Phenotype_34[col]))
    Meta_all[col] = Meta_all.Phenotype_2.map(mapping)

adata.obs = Meta_all
```

### 第 4 步：PCA 降维

```python
sc.pp.pca(adata)
sc.pl.pca_variance_ratio(adata, log=True)
sc.pl.pca(adata, color=['Data_source', 'Method', 'Phenotype_1'])
```

### 第 5 步：UMAP 嵌入

```python
sc.pp.neighbors(adata, n_neighbors=20, n_pcs=50)
sc.tl.umap(adata)
sc.pl.umap(adata, color=['Phenotype_3'], size=80, palette='viridis_r')
```

### 第 6 步：可视化肌病谱系

```python
# 定义谱系顺序分类
category_order = [
    'Control (unexpected death)', 'Control (accident death)',
    'Control (intermediate death)', 'Control (others)',
    'Control (hyperkalemia)', 'Control (ventilator case)',
    'Control (amputee)', 'Control (pediatric)',
    'Control (slow death)', 'Myopathy'
]
adata.obs['Phenotype_3'] = (
    adata.obs['Phenotype_3'].astype('category')
    .cat.set_categories(category_order, ordered=True)
)

# 高亮肌病 vs. 对照
sc.pl.umap(adata, color='Phenotype_3', palette={
    "Control (unexpected death)": "#f5e634",
    "Control (accident death)": "#f5e634",
    "Control (intermediate death)": "#9c9c9b",
    "Control (ventilator case)": "#9c9c9b",
    "Control (slow death)": "#9c9c9b",
    "Control (amputee)": "#70584770",
    "Control (hyperkalemia)": "#70584770",
    "Control (pediatric)": "#7A5847",
    "Control (others)": "#7A5847",
    "Myopathy": "#390153",
}, legend_loc='right margin')
```

### 第 7 步：下游分析

生成 UMAP 嵌入后，继续进行：

1. **差异表达**：EdgeR 跨疾病比较
2. **反卷积**：TAPE 细胞类型组成
3. **通路分析**：gseapy 基因集富集分析

完整分析 Notebook 请参阅仓库中的 [`P3 Integration Umap.ipynb`](https://github.com/Hirriririir/MyoSpectrum/blob/main/P3%20Integration%20Umap.ipynb)。

# Quick Start

> Analyze bulk RNA-seq data using single-cell-like approaches (Scanpy), enabling integration, visualization, and trajectory analysis on bulk transcriptomes.

## Prerequisites

- Python 3.8+
- R 4.2+

## Installation

```bash
git clone https://github.com/Hirriririir/MyoSpectrum.git
cd MyoSpectrum
```

## Python Dependencies

```bash
pip install scanpy gseapy tape-cell conorm
```

## R Dependencies

```r
install.packages(c("edgeR", "sva", "DescTools"))
```

## Data Download

### Release Data

The following integrated data files are available on the [GitHub Release v1.0](https://github.com/Hirriririir/MyoSpectrum/releases/tag/1.0):

| File | Size | Description |
|------|------|-------------|
| `adata_all_muscle.h5ad` | ~261 MB | AnnData object with all integrated muscle data |
| `All_muscle.batch_adjusted.count.data.csv` | ~49 MB | Batch-adjusted count matrix |
| `All_muscle.original.count.data.csv` | ~49 MB | Original count matrix before batch correction |
| `All_muscle_L_combatseq_tmm.csv` | ~197 MB | ComBat-seq + TMM normalized expression matrix |

### Repository Data

The [GitHub repository](https://github.com/Hirriririir/MyoSpectrum) contains the following data folders:

- **DEG**: Differential expression analysis (DEG) results exported from edgeR.
- **Meta**: Metadata (Data_source / Geo_accession / Author_Date / PMID / Sample_id / Gsm_accession / Casual_gene / Phenotype / Biopsy site / sequencing method / sequencing platform / Sex / Age range) for the integration dataset.
- **TAPE**: Tissue deconvolution results annotated with two human skeletal muscle single-cell datasets ([Tabula Sapiens](https://tabula-sapiens-portal.ds.czbiohub.org/) and [GSE143704](https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE143704)).
- **Helsinki data**: 127 skeletal muscle bulk RNA-seq data from Helsinki ([Group Udd](https://www.folkhalsan.fi/en/knowledge/research/genetics/group-udd/), Folkhälsan Research Center, University of Helsinki). Among these samples, 39 have also been reported as [GSE151757](https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE151757).
- **GEO data**: 291 skeletal muscle bulk RNA-seq data downloaded from the GEO database ([GSE115650](https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE115650), [GSE140261](https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE140261), [GSE175861](https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE175861), [GSE184951](https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE184951), [GSE201255](https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE201255), [GSE202745](https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE202745)).
- **GTEx data**: 803 skeletal muscle bulk RNA-seq data downloaded from the GTEx Analysis V8 ([dbGaP Accession phs000424.v8.p2](https://gtexportal.org/home/datasets#datasetDiv1)). The main biopsy site is the gastrocnemius muscle, 2 cm below the patella.
- **Integration data**: Processed data during the integration process.
- **Validation**: Validation data downloaded from the supplementary files from the used GEO datasets or generated from the integration dataset.

## Data Structure

```
MyoSpectrum/
├── 1_raw_data/              # Raw input data
├── 2_integration/           # Batch-corrected integrated data
├── 3_deconvolution/         # TAPE cell-type deconvolution results
├── 4_differential/          # DEG analysis outputs
├── 5_figures/               # Generated figures
└── 6_validation/            # Validation datasets
```

## Running the Pipeline

### Step 1: Load Data & Setup

```python
import numpy as np
import pandas as pd
import scanpy as sc

sc.set_figure_params(dpi=100, color_map='viridis_r',
                     transparent=False, frameon=False)
sc.settings.verbosity = 1
```

### Step 2: Read Integrated Data

Load the pre-built AnnData object directly, or read from the normalized CSV:

```python
# Option A: Load pre-built h5ad
adata = sc.read('Integration data/adata_all_muscle.h5ad')

# Option B: Read from ComBat-seq + TMM normalized CSV
adata = sc.read_csv(
    "Integration data/All_muscle_H_combatseq_tmm.csv",
    first_column_names='Sample_id'
)
```

### Step 3: Load Metadata

```python
Meta_GEO = pd.read_excel('Meta/RNA-seq integration meta.xlsx', sheet_name='GEO')
Meta_GTEx = pd.read_excel('Meta/RNA-seq integration meta.xlsx', sheet_name='GTEx')
Meta_Helsinki = pd.read_excel('Meta/RNA-seq integration meta.xlsx', sheet_name='Helsinki')

Meta_all = pd.concat([Meta_GEO, Meta_GTEx, Meta_Helsinki], axis=0)
Meta_all.set_index('Sample_id', inplace=True)
Meta_all = Meta_all.drop(['Age'], axis=1)

# Map phenotype classifications
Phenotype_34 = pd.read_excel('Meta/Phenotype_3_4.xlsx')
for col in ['Phenotype_3', 'Phenotype_4', 'Phenotype_5', 'Phenotype_6']:
    mapping = dict(zip(Phenotype_34.Phenotype_2, Phenotype_34[col]))
    Meta_all[col] = Meta_all.Phenotype_2.map(mapping)

adata.obs = Meta_all
```

### Step 4: PCA

```python
sc.pp.pca(adata)
sc.pl.pca_variance_ratio(adata, log=True)
sc.pl.pca(adata, color=['Data_source', 'Method', 'Phenotype_1'])
```

### Step 5: UMAP Embedding

```python
sc.pp.neighbors(adata, n_neighbors=20, n_pcs=50)
sc.tl.umap(adata)
sc.pl.umap(adata, color=['Phenotype_3'], size=80, palette='viridis_r')
```

### Step 6: Visualize the Myopathy Spectrum

```python
# Define spectrum-order categories
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

# Highlight myopathy vs. controls
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

### Step 7: Downstream Analysis

After generating the UMAP embedding, proceed with:

1. **Differential expression**: EdgeR across conditions
2. **Deconvolution**: TAPE for cell-type composition
3. **Pathway analysis**: GSEA via gseapy

For the full analysis notebook, see [`P3 Integration Umap.ipynb`](https://github.com/Hirriririir/MyoSpectrum/blob/main/P3%20Integration%20Umap.ipynb) in the repository.

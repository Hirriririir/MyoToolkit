# Quick Start

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

1. **Batch correction**: ComBat-seq adjustment for sequencing platform differences
2. **Integration & visualization**: Scanpy-based UMAP embedding
3. **Differential expression**: EdgeR across conditions
4. **Deconvolution**: TAPE for cell-type composition
5. **Pathway analysis**: GSEA via gseapy

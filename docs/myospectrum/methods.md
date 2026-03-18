# Methods

## Analysis Pipeline

```
Raw RNA-seq counts → ComBat-seq batch adjustment → EdgeR DEG analysis
                                                 → Scanpy integration & UMAP
                                                 → TAPE deconvolution
                                                 → gseapy pathway enrichment
                                                 → Jonckheere trend test
```

## Batch Effect Correction

- **Method:** ComBat-seq (sva package)
- **Batch variables:** Sequencing platform (mRNA polyA vs. total RNA ribosomal)
- **Samples:** 930 mRNA polyA + 291 total RNA ribosomal

## Differential Expression

- **Tool:** EdgeR
- **Design:** Pairwise comparisons across myopathy conditions vs. controls
- **Thresholds:** FDR < 0.05, |log2FC| > 1

## Integration & Visualization

- **Tool:** Scanpy
- **Method:** UMAP dimensionality reduction
- **Features:** 9,231 genes across 1,221 samples

## Cell-Type Deconvolution

- **Tool:** TAPE (Tissue-Adaptive Phenotype Estimation)
- **Purpose:** Estimate cell-type composition changes in myopathic tissues

## Pathway Enrichment

- **Tool:** gseapy
- **Databases:** GO, KEGG, Reactome
- **Method:** Pre-ranked Gene Set Enrichment Analysis

## Statistical Testing

- **Jonckheere trend test** (DescTools package) for ordered disease severity trends
- Multiple testing correction via Benjamini-Hochberg FDR

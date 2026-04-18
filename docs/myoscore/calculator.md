---
aside: false
outline: [2, 3]
---

# MyoScore Calculator

Run MyoScore directly in your browser — no server, no installation.
Upload or paste a bulk RNA-seq raw count matrix and compute per-sample
scores across five genetically-driven muscle-health dimensions.

<ClientOnly>
  <MyoScoreCalculator />
</ClientOnly>

## Input format

- **First column**: gene identifier (Gene Symbol or Ensembl ID)
- **First row**: sample names
- **Body**: raw counts (not TPM/FPKM)
- **Separator**: CSV or TSV (auto-detected)

```csv
gene_symbol,Healthy_01,Healthy_02,Myopathy_01,Myopathy_02
NFS1,530,621,410,380
NEK4,812,904,650,702
RFT1,443,510,298,315
...
```

For Ensembl IDs (e.g. `ENSG00000100300`), the calculator lazy-loads a
GTEx-derived annotation dictionary (~56 000 entries, 1.5 MB) and converts
them to Gene Symbols automatically. Version suffixes like `.15` are stripped
before lookup.

## How it works

The calculation mirrors the [MyoScore R package](./r-package):

1. **Normalization** — raw counts are scaled to log₂(CPM + 1).
2. **Gene selection** — expression vectors are subset to the 591 weighted
   gene-dimension entries (417 unique Gene Symbols).
3. **Z-score standardization** — each gene is centered and scaled across
   all input samples.
4. **Weighted aggregation** — z-scores are multiplied by GWAS/TWAS direction
   (±1) and TWAS-derived weight, then averaged per dimension.
5. **Min-max scaling** — raw dimension scores are rescaled to 0–100.
6. **Composite score** — the five dimensions are combined via a
   GWAS-derived weighted mean:

$$
\text{MyoScore} = 0.252 \cdot \text{Strength} + 0.177 \cdot \text{Mass}
+ 0.243 \cdot \text{LeanMuscle} + 0.242 \cdot \text{Youth}
+ 0.087 \cdot \text{Resilience}
$$

All computation happens client-side — your count matrix never leaves the
browser.

## Recommended cohort size

Min-max scaling is **cohort-relative**, so results depend on the
distribution of your input samples:

| Samples | Behavior |
| ------- | -------- |
| 1       | Not supported (at least 2 required). |
| 2–19    | Scores are produced but unstable — a warning is displayed. |
| ≥ 20    | Recommended. |

For benchmarking an individual against a reference, pool your sample with
a healthy cohort before scoring, or use the R package with the reference
transform.

## Privacy

- No data is uploaded to any server.
- The calculator runs entirely as static JavaScript hosted on
  Cloudflare Pages.
- The gene weight table and annotation dictionary are static assets
  fetched directly by your browser.

## See also

- [Methods](./methods) — full derivation of weights and directions
- [R package](./r-package) — command-line & batch workflow
- [Validation](./validation) — MRI, single-cell, and clinical benchmarks

# R Package

## Overview

The `MyoScore` R package provides a streamlined interface for calculating MyoScore from bulk RNA-seq raw count data. It includes built-in gene weights, preprocessing, scoring, and visualization functions.

::: info
**Package**: MyoScore v1.0.0 | **License**: MIT | **R**: >= 4.0.0
:::

## Installation

```r
# Install from GitHub
devtools::install_github("Hirriririir/MyoScore")
```

## Quick Start

```r
library(MyoScore)

# Calculate MyoScore from a CSV file (genes as rows, samples as columns)
scores <- myoscore_score("path/to/raw_counts.csv")

# Or from a matrix already in R
scores <- myoscore_score(count_matrix)

# For tab-separated files
scores <- myoscore_score("counts.tsv", sep = "\t")

# View results
head(scores)
#>     Strength_score Mass_score LeanMuscle_score Youth_score Resilience_score MyoScore
#> S1          72.3       65.1             80.2        55.8             68.4     69.2
#> S2          45.1       38.7             42.3        61.2             35.6     44.1
```

## Input Requirements

- **Format**: Raw count matrix (**not** TPM, FPKM, or normalized values)
- **Genes**: Gene Symbols as row names (not Ensembl IDs)
- **Samples**: At least 2 samples (recommend >= 20 for reliable normalization)
- **Coverage**: Typical bulk RNA-seq datasets contain ~417 of the 1,116 scoring genes (~50% per dimension), which is sufficient for reliable scoring

## Functions Reference

### `myoscore_score()` — Main Scoring Function {#myoscore-score}

The primary entry point. Accepts a file path or count matrix and returns per-sample scores.

```r
myoscore_score(
  input,               # File path (CSV/TSV) or count matrix/data.frame
  gene_weights = NULL, # Custom gene weights (default: built-in)
  sep = ",",           # File separator
  min_coverage = 0.1,  # Minimum gene coverage fraction per dimension
  verbose = TRUE       # Print progress messages
)
```

**Returns**: A `data.frame` with columns: `Strength_score`, `Mass_score`, `LeanMuscle_score`, `Youth_score`, `Resilience_score`, `MyoScore` (all 0-100).

**Scoring Pipeline**:
1. Raw counts normalized to log2(CPM+1)
2. Gene-wise z-score standardization across all input samples
3. Z-scores multiplied by gene direction and weight, then averaged (weighted mean)
4. Min-max normalization to 0-100 per dimension
5. Composite score = weighted sum of five dimensions

### `myoscore_preprocess()` — Normalization {#myoscore-preprocess}

Normalize raw counts to log2(CPM+1).

```r
log2cpm <- myoscore_preprocess(count_matrix, verbose = TRUE)
```

### `myoscore_score_dimension()` — Single Dimension {#myoscore-score-dimension}

Calculate the score for a single dimension.

```r
log2cpm <- myoscore_preprocess(count_matrix)
youth <- myoscore_score_dimension(log2cpm, dimension = "Youth")
```

Available dimensions: `"Strength"`, `"Mass"`, `"LeanMuscle"`, `"Youth"`, `"Resilience"`.

### `myoscore_weights()` — Dimension Weights {#myoscore-weights}

Returns the named numeric vector of dimension weights.

```r
myoscore_weights()
#> Strength       Mass LeanMuscle      Youth Resilience
#>    0.252      0.177      0.243      0.242      0.087
```

### `myoscore_dimensions()` — Dimension Names {#myoscore-dimensions}

```r
myoscore_dimensions()
#> [1] "Strength"   "Mass"       "LeanMuscle" "Youth"      "Resilience"
```

### `myoscore_colors()` — Color Palettes {#myoscore-colors}

```r
# Five dimension colors
myoscore_colors("dimensions")
#>   Strength       Mass LeanMuscle      Youth Resilience
#>  "#50327b"  "#46508b"  "#f4e030"  "#72c95e"  "#31848f"

# Unhealthy-to-healthy spectrum
myoscore_colors("spectrum")
#> unhealthy      mild   neutral  positive   healthy
#> "#50327b" "#46508b" "#31848f" "#72c95e" "#f4e030"
```

## Visualization

### Radar Chart

Requires the `fmsb` package.

```r
# install.packages("fmsb")

# Overall mean radar
myoscore_plot_radar(scores)

# Grouped by condition (faceted panels)
myoscore_plot_radar(scores, groups = metadata$condition)

# Overlaid on single chart
myoscore_plot_radar(scores, groups = metadata$condition, facet = FALSE)

# Single sample with per-dimension colored segments
myoscore_plot_radar(c(72.3, 65.1, 80.2, 55.8, 68.4), title = "Patient A")
```

**Parameters**:

| Parameter | Default | Description |
|-----------|---------|-------------|
| `scores` | — | Data.frame from `myoscore_score()`, or a named numeric vector of 5 values |
| `groups` | `NULL` | Factor/character vector for group comparison |
| `colors` | auto | Color vector (one per group) |
| `facet` | `TRUE` | Separate panel per group |
| `title` | `NULL` | Main title |
| `show_values` | `TRUE` | Show score values at vertices |

### Grouped Boxplot

Uses `ggplot2` if available, otherwise falls back to base R.

```r
# install.packages("ggplot2")

# Compare MyoScore across groups
myoscore_plot_boxplot(scores, groups = metadata$condition)

# Plot all dimensions
myoscore_plot_boxplot(scores, groups = metadata$condition, which = "all")

# Single dimension
myoscore_plot_boxplot(scores, groups = metadata$condition, which = "Youth")
```

**Parameters**:

| Parameter | Default | Description |
|-----------|---------|-------------|
| `scores` | — | Data.frame from `myoscore_score()` |
| `groups` | — | Factor/character vector of group labels |
| `which` | `"MyoScore"` | `"MyoScore"`, any dimension name, or `"all"` |
| `colors` | auto | Color vector |
| `use_ggplot` | `TRUE` | Use ggplot2 if available |
| `title` | `NULL` | Main title |

## Built-in Data

### `myoscore_genes`

A data.frame with 591 gene-dimension entries (417 unique genes) used in scoring.

```r
data(myoscore_genes)
head(myoscore_genes)

# Genes per dimension
table(myoscore_genes$dimension)
```

| Column | Description |
|--------|-------------|
| `ID` | Gene symbol (HGNC) |
| `weight` | Gene weight from TWAS Z-scores |
| `direction_v3` | +1 = high expression is healthy; -1 = high expression is unhealthy |
| `dimension` | One of the five MyoScore dimensions |

## Dependencies

| Package | Type | Purpose |
|---------|------|---------|
| `stats`, `utils`, `graphics`, `grDevices` | Required | Base R functionality |
| `ggplot2` (>= 3.4.0) | Suggested | Enhanced boxplots |
| `fmsb` | Suggested | Radar charts |
| `patchwork` | Suggested | Multi-panel layouts |
| `testthat` (>= 3.0.0) | Suggested | Unit testing |
| `knitr`, `rmarkdown` | Suggested | Vignettes |

## Example Workflow

```r
library(MyoScore)

# 1. Load and score
scores <- myoscore_score("my_cohort_counts.csv")

# 2. Attach metadata
metadata <- read.csv("my_cohort_metadata.csv")

# 3. Visualize
# Radar chart comparing disease vs control
myoscore_plot_radar(scores, groups = metadata$condition)

# Boxplot of all dimensions
myoscore_plot_boxplot(scores, groups = metadata$condition, which = "all")

# 4. Export results
results <- cbind(metadata, scores)
write.csv(results, "my_cohort_myoscores.csv", row.names = FALSE)
```

## Citation

## Source Code

- GitHub: [https://github.com/Hirriririir/MyoScore](https://github.com/Hirriririir/MyoScore)
- Bug Reports: [https://github.com/Hirriririir/MyoScore/issues](https://github.com/Hirriririir/MyoScore/issues)

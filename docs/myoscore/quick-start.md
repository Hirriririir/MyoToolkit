# Quick Start

## Calculate GMHS for Your Samples

### Input Format

- Raw count matrix (Gene Symbol x Samples)
- CSV format, genes as rows, samples as columns

### R Package (Recommended)

```r
# Install
devtools::install_github("Hirriririir/MyoScore")

# Calculate scores
library(MyoScore)
scores <- myoscore_score("your_counts.csv")
head(scores)
```

See the full [R Package documentation](/myoscore/r-package) for visualization and advanced usage.

### Python Script

```python
python calculate_gmhs_v33.py \
    --input your_counts.csv \
    --output your_scores.csv
```

### Output

- 5 dimension scores (each 0-100)
- GMHS_v33 composite score (0-100)

### Composite Score Formula

```
GMHS_v33 = 0.252 × Strength + 0.177 × Mass + 0.243 × LeanMuscle + 0.242 × Youth + 0.087 × Resilience
```

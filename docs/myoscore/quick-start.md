# Quick Start

## Calculate MyoScore for Your Samples

### Input Format

- Raw count matrix (Gene Symbol × Samples)
- CSV format, genes as rows, samples as columns

### R Package (Recommended)

```r
# Install from CRAN
install.packages("MyoScore")

# or Install from Github
devtools::install_github("Hirriririir/MyoScore")

# Calculate scores
library(MyoScore)
scores <- myoscore_score("your_counts.csv")
head(scores)
```

See the full [R Package documentation](/myoscore/r-package) for visualization and advanced usage.

### Python Script

```python
python calculate_myoscore.py \
    --input your_counts.csv \
    --output your_scores.csv
```

### Output

- 5 dimension scores (each 0–100): Strength, Mass, LeanMuscle, Youth, Resilience
- MyoScore composite score (0–100)

### Composite Score Formula

$$
\text{MyoScore} = 0.252 \times \text{Strength} + 0.177 \times \text{Mass} + 0.243 \times \text{LeanMuscle} + 0.242 \times \text{Youth} + 0.087 \times \text{Resilience}
$$

# Validation

## GMHS V3.3 Performance

| Data Source | Samples | AUC | 95% CI | Brier Score |
|-------------|---------|-----|--------|-------------|
| HuashanMuscle | 97 | **0.873** | 0.787-0.946 | 0.130 |
| GTEx | 803 | **0.818** | 0.786-0.850 | 0.267 |
| GEO | 644 | **0.786** | 0.742-0.822 | 0.221 |
| Myofin | 154 | **0.751** | 0.586-0.897 | 0.460 |

## Key Findings

1. **Youth Dimension (V3.3):** Based on telomere length TWAS (81 genes), negatively correlated with age (rho = -0.39)

2. **GTEx Control Ranking Fix:**
   - V3.2: slow death > unexpected death (incorrect)
   - V3.3: accident/unexpected death > slow death (correct)

3. **HE Pathology Validation:**
   - GMHS negatively correlated with fat infiltration, fibrosis, and fiber coefficient of variation
   - LeanMuscle and Youth: 4/4 pathology indicators in correct direction

4. **Cross-Cohort Generalization:** All 4 independent data sources achieved AUC > 0.75

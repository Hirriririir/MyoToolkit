# Validation

## Study Cohorts

MyoPath was validated on 478 H&E whole slide images from two independent cohorts:

| Cohort | n | Source | Composition |
|--------|---|--------|-------------|
| GTEx | 399 | Genotype-Tissue Expression Project | Autopsy skeletal muscle; healthy controls and subclinical wasting spectrum |
| HuashanMuscle | 79 | Huashan Hospital, Fudan University | Clinical muscle biopsies; DM1, LGMD, inflammatory myopathy, and healthy controls |

The GTEx cohort served as the training set; HuashanMuscle served as the independent external validation set. No retraining was performed on HuashanMuscle data.

## Segmentation Performance

Segmentation accuracy was assessed by Dice coefficient and Intersection-over-Union (IoU) against manual expert annotations:

| Tissue Layer | Method | Dice | IoU |
|---|---|---|---|
| Myofiber | Cellpose-SAM | 0.92 ± 0.03 | 0.85 ± 0.06 |
| Fat | Pixel classifier | 0.95 ± 0.02 | 0.91 ± 0.03 |
| Nucleus | Watershed | 0.87 ± 0.04 | 0.78 ± 0.06 |
| Connective tissue | Boolean subtraction | 0.88 ± 0.04 | 0.78 ± 0.06 |

### Reproducibility

Intraclass correlation coefficients (ICC) for all seven pathology indicators exceeded **0.88**, indicating high inter-rater and intra-rater reproducibility of the automated pipeline.

## MyoPath Score Performance

### Discrimination

| Dataset | AUC | Metric |
|---------|-----|--------|
| GTEx (LOO-CV) | 0.735 | Leave-one-out cross-validation |
| GTEx (full model) | 0.788 | Training set AUC |
| HuashanMuscle | **0.873** | External validation (no retraining) |

The higher AUC on the external validation set suggests that clinically diagnosed myopathy (HuashanMuscle) produces more separable morphometric changes than subclinical wasting (GTEx).

### Primary Biomarkers

Two indicators emerged as the strongest individual discriminators:

| Biomarker | p-value | Effect size (rank-biserial r) |
|-----------|---------|-------------------------------|
| NCI | $1.3 \times 10^{-5}$ | 0.69 |
| Fiber CV | $2.9 \times 10^{-4}$ | 0.58 |

Both carry the largest standardized regression coefficients in the MyoPath Score model ($\beta_{\text{NCI}} = 0.57$, $\beta_{\text{CV}} = 0.53$).

## Clinical Correlations

### Disease-Specific Findings

**Myotonic dystrophy type 1 (DM1):**
- NCI was highest in DM1 (median 0.121), consistent with centronuclear pathology
- NCI correlated with CTG repeat count: Spearman $\rho = 0.46$, $p = 0.042$
- Fiber CV inversely correlated with grip strength: $\rho = -0.61$, $p = 0.031$

**Limb-girdle muscular dystrophy (LGMD):**
- Fiber CV showed a dose-response with mutation severity:
  - 2× Missense: CV = 0.44
  - LoF + Missense: CV = 0.49
  - 2× LoF: CV = 0.65

**GTEx wasting spectrum:**
- NCI showed a significant dose-response trend across wasting severity grades (Jonckheere-Terpstra $p < 10^{-4}$)

### Cross-Modal Validation with MyoScore

MyoPath pathology metrics correlate with MyoScore's transcriptomic dimensions, demonstrating cross-modal consistency:

| MyoScore Dimension | MyoPath Indicator | Direction |
|--------------------|-------------------|-----------|
| LeanMuscle | Fat infiltration | Negative correlation |
| Youth | Fibrosis extent | Negative correlation |
| GMHS composite | Fiber CV | Negative correlation |

This convergence between transcriptomic and morphometric assessments supports the biological validity of both tools.

## Limitations

- **ROI dependency**: Tissue composition metrics (fat, fibrosis) vary with ROI placement. NCI and Fiber CV are more robust.
- **H&E only**: The pipeline is optimized for H&E stains. Special stains (ATPase, NADH) and immunohistochemistry are not supported.
- **Single ROI**: Current validation used one ROI per slide. Multi-ROI strategies may improve representativeness for heterogeneous biopsies.
- **Connective tissue estimation**: Boolean subtraction inherits errors from muscle and fat segmentation layers.
- **Population scope**: Training was performed on GTEx (predominantly European ancestry). Performance on other populations requires further validation.

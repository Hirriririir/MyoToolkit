# Morphometric Features

MyoPath extracts **37 unique morphometric features** per sample from routine H&E-stained skeletal muscle sections. These features are organized into five biological categories and distilled into **seven clinically interpretable pathology indicators**.

::: tip Reference
> Zhong H\*, Gao M\*, Ma S, Zhang W, Chen N, Jiao K, Zhu B, Song J, Yan C, Yue D, Xi J, Zhu W, Zhao C\#, Luo S\#. **MyoPath: A Deep Learning Pipeline for Objective Morphometric Assessment of Skeletal Muscle Biopsies.** *Manuscript in preparation.*
:::

## Seven Pathology Indicators

These seven features correspond to **five pathological axes** routinely assessed during muscle biopsy evaluation:

| Pathological Axis | Indicator | Clinical Significance |
|---|---|---|
| Nuclear positioning | NCI | Centronuclear myopathy, DM1 |
| Fiber size dysregulation | Fiber CV | Dystrophic & neurogenic processes |
| Fiber morphology distortion | Shape regularity | Fiber splitting, angular atrophy |
| Tissue replacement | Fat infiltration, Fibrosis | Late-stage dystrophy, denervation |
| Cellular reaction | Nuclear/muscle ratio, Inflammatory infiltration | Regeneration, inflammation |

### 1. Nuclear Centralization Index (NCI) {#nci}

**Primary biomarker.** Quantifies the average radial position of nuclei within muscle fibers.

$$
\rho_k = \min\!\left(\frac{d_k^{\text{boundary}}}{r_i^{\text{eq}}},\; 1.0\right), \quad
\text{NCI} = \frac{1}{N_{\text{analyzed}}} \sum_{k=1}^{N_{\text{analyzed}}} \rho_k
$$

where $d_k^{\text{boundary}}$ is the distance from the nucleus centroid to the nearest fiber boundary, and $r_i^{\text{eq}} = \sqrt{a_i / \pi}$ is the equivalent circle radius.

| NCI Range | Interpretation |
|---|---|
| < 0.03 | Normal (subsarcolemmal nuclei) |
| 0.03 -- 0.10 | Mild centralization |
| 0.10 -- 0.20 | Moderate centralization |
| > 0.20 | Severe centralization |

**Clinical evidence:**
- Discriminated myopathy from controls: $p = 1.3 \times 10^{-5}$, rank-biserial $r = 0.69$
- DM1 showed the highest NCI (median 0.121), consistent with centronuclear pathology
- Correlated with CTG repeat count in DM1: Spearman $\rho = 0.46$, $p = 0.042$
- Significant dose-response trend across the GTEx myopathy spectrum (Jonckheere-Terpstra $p < 10^{-4}$)

Nuclei are further classified into three radial zones:

| Zone | Criterion | Metric |
|---|---|---|
| Peripheral | $\rho_k \leq 0.3$ | `peripheral_ratio` (normal ~ 1.0) |
| Intermediate | $0.3 < \rho_k < 0.7$ | — |
| Central | $\rho_k \geq 0.7$ | `central_ratio` (abnormal if > 0.05) |

### 2. Fiber Size Variability Coefficient (Fiber CV) {#fiber-cv}

**Primary biomarker.** The coefficient of variation of myofiber cross-sectional areas.

$$
\text{Fiber CV} = \frac{\sigma_a}{\bar{a}}
$$

| Fiber CV Range | Interpretation |
|---|---|
| < 0.25 | Normal |
| 0.25 -- 0.40 | Mild variability |
| 0.40 -- 0.60 | Moderate variability |
| > 0.60 | Severe variability |

**Clinical evidence:**
- Discriminated myopathy from controls: $p = 2.9 \times 10^{-4}$, $r = 0.58$
- Inversely correlated with grip strength in DM1: $\rho = -0.61$, $p = 0.031$
- Increased with mutation severity in LGMD: 2x Missense (0.44) → LoF + Missense (0.49) → 2x LoF (0.65)
- Dimensionless and comparable across samples with different fiber calibers

### 3. Fiber Shape Regularity {#shape-regularity}

Mean circularity (shape factor) of fiber cross-sections.

$$
\text{Shape Factor}_i = \frac{4\pi \, a_i}{p_i^2}, \quad
\text{Mean Shape Factor} = \frac{1}{N_f} \sum_{i=1}^{N_f} \text{Shape Factor}_i
$$

- **1.0** = perfect circle
- **< 0.6** = irregular fiber morphology (splitting, angular atrophy, chronic remodeling)
- **Normal range** > 0.7

### 4. Fat Infiltration (%) {#fat-infiltration}

Percentage of the ROI occupied by adipose tissue.

$$
\texttt{fat\_infiltration\_pct} = \frac{A_{\text{fat}}}{A_{\text{ROI}}} \times 100\%
$$

- **Normal range:** < 5%
- A late-stage marker of dystrophic or denervation injury
- ROI-dependent: values vary with the location selected for analysis

::: warning
Fat and fibrotic replacement are nonspecific, late-stage changes that also occur with aging, disuse, and obesity. They are inherently ROI-dependent, making them less robust than NCI and fiber CV.
:::

### 5. Fibrosis (%) {#fibrosis}

Connective tissue as a percentage of ROI area, computed by Boolean subtraction.

$$
A_{\text{connective}} = A_{\text{ROI}} - A_{\text{muscle}} - A_{\text{fat}}
$$

$$
\texttt{fibrosis\_pct} = \frac{A_{\text{connective}}}{A_{\text{ROI}}} \times 100\%
$$

- **Normal range:** < 10%
- Reflects endomysial and perimysial fibrotic proliferation
- ROI-dependent

### 6. Nuclear/Muscle Ratio {#nuclear-muscle-ratio}

Ratio of nuclei located within myofibers to total fiber count.

$$
\texttt{nuclear\_muscle\_ratio} = \frac{N_{\text{nuc}}^{\text{muscle}}}{N_f}
$$

- **Normal range:** 1 -- 3
- Elevated values reflect nuclear proliferation, regeneration, or increased satellite cell activity
- Significant in HuashanMuscle cohort ($p = 3.4 \times 10^{-5}$) but not in GTEx wasting spectrum

### 7. Inflammatory Infiltration {#inflammatory-infiltration}

Nuclear density in connective tissue regions.

$$
\texttt{density} = \frac{N_{\text{nuc}}^{\text{conn}}}{A_{\text{connective}} \,/\, 10^6} \quad (\text{nuclei/mm}^2)
$$

- **Normal range:** < 2,000 nuclei/mm²
- High values suggest inflammatory cell infiltration or active fibroblast proliferation

---

## Underlying Descriptive Features

The 37 features include the 7 pathology indicators above plus 30 underlying descriptive features.

### Tissue Composition (10 features)

| Feature | Unit | Description |
|---|---|---|
| `roi_area_um2` | µm² | Total area of the analyzed region of interest |
| `muscle_fibers_count` | count | Number of individual myofibers detected by Cellpose-SAM |
| `muscle_area_um2` | µm² | Sum of cross-sectional areas of all detected myofibers |
| `muscle_area_pct` | % | Myofiber area as fraction of ROI. Decreases with wasting, fat replacement, or fibrosis |
| `fat_regions_count` | count | Number of discrete adipose regions identified |
| `fat_area_um2` | µm² | Total adipose tissue area, excluding overlap with muscle annotations |
| `connective_area_um2` | µm² | Connective tissue area (ROI minus muscle minus fat) |
| `connective_area_pct` | % | Connective tissue as fraction of ROI |
| `nucleus_area_um2` | µm² | Total area occupied by all detected nuclei |
| `nucleus_area_pct` | % | Nuclear area as fraction of ROI. Elevated with increased cellularity |

### Fiber Size (7 features)

| Feature | Unit | Description |
|---|---|---|
| `fiber_mean_area_um2` | µm² | Average cross-sectional area. Decreased in atrophy, increased in hypertrophy |
| `fiber_median_um2` | µm² | Median fiber area. Less sensitive to outliers |
| `fiber_std_um2` | µm² | Standard deviation of fiber areas |
| `fiber_min_um2` | µm² | Smallest detected fiber area |
| `fiber_max_um2` | µm² | Largest detected fiber area |
| `fiber_q1_um2` | µm² | 25th percentile. Sensitive to grouped atrophy |
| `fiber_q3_um2` | µm² | 75th percentile |

### Fiber Shape (3 features)

| Feature | Unit | Description |
|---|---|---|
| `shape_factor_std` | dimensionless | Standard deviation of circularity across fibers |
| `aspect_ratio_mean` | dimensionless | Mean bounding-box elongation (1.0 = circular, > 2.0 = elongated) |
| `aspect_ratio_std` | dimensionless | Standard deviation of aspect ratio |

### Nuclear Distribution (7 features)

| Feature | Unit | Description |
|---|---|---|
| `nuclei_total_count` | count | Total nuclei detected within the ROI |
| `nuclei_in_muscle` | count | Nuclei whose centroids fall within myofiber polygons |
| `nuclei_in_connective` | count | Nuclei in connective tissue regions |
| `nuclei_unassigned` | count | Nuclei not assigned to muscle or connective tissue |
| `nuclei_per_fiber_mean` | count/fiber | Average nuclei per myofiber (healthy: 1--3) |
| `nuclei_per_fiber_std` | count/fiber | Standard deviation of nuclei per fiber |
| `nuclei_per_fiber_max` | count | Maximum nuclei in any single fiber |

### Nuclear Localization (3 features)

| Feature | Unit | Description |
|---|---|---|
| `peripheral_ratio` | 0--1 | Fraction of nuclei in the outer 30% of fiber radius (healthy ~ 1.0) |
| `central_ratio` | 0--1 | Fraction of nuclei in the inner 30% of fiber radius (abnormal if > 0.05) |
| `multinucleated_fiber_count` | count | Fibers containing more than one nucleus in cross-section |

---

## MyoPath Score

The **MyoPath Score** is a logistic regression composite of all seven pathology indicators:

$$
\text{MyoPath Score} = \frac{1}{1 + e^{-z}}
$$

$$
z = -9.17 + 27.11 \times \text{NCI} + 3.96 \times \text{Fiber CV} + 8.22 \times \text{Shape} + 0.017 \times \text{Fat\%} + 0.043 \times \text{Fibrosis\%} + 0.123 \times \text{NMR} + 0.000001 \times \text{Inflammation}
$$

**Performance:**
- Training (GTEx): AUC = 0.788 (LOO-CV = 0.735)
- External validation (HuashanMuscle): AUC = 0.873 (without retraining)
- NCI and Fiber CV carry the largest standardized coefficients ($\beta = 0.57$ and $0.53$)

## Segmentation Performance

| Tissue Layer | Method | Dice | IoU |
|---|---|---|---|
| Myofiber | Cellpose-SAM | 0.92 ± 0.03 | 0.85 ± 0.06 |
| Fat | Pixel classifier | 0.95 ± 0.02 | 0.91 ± 0.03 |
| Nucleus | Watershed | 0.87 ± 0.04 | 0.78 ± 0.06 |
| Connective tissue | Boolean subtract | 0.88 ± 0.04 | 0.78 ± 0.06 |

Intraclass correlation coefficients exceed 0.88 for all seven pathology indicators.

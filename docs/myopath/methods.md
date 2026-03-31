# Methods

## Segmentation Pipeline Architecture

MyoPath implements a four-layer tissue segmentation pipeline on H&E-stained skeletal muscle whole slide images (WSI). Each layer uses a method suited to its biological target.

```
WSI (H&E) → ROI Selection (1500 µm²)
                 │
                 ├─→ Layer 1: Cellpose-SAM → Myofiber instances
                 ├─→ Layer 2: Pixel classifier → Fat regions
                 ├─→ Layer 3: Watershed → Nuclei
                 └─→ Layer 4: Boolean subtraction → Connective tissue
                 │
                 ▼
         37 morphometric features → 7 pathology indicators → MyoPath Score
```

## Layer 1: Myofiber Instance Segmentation

**Method:** Cellpose-SAM (Cellpose with Segment Anything Model)

Cellpose is a generalist deep learning model for cellular segmentation that uses gradient flow tracking. In MyoPath, the Cellpose model segments individual myofibers as polygon instances rather than semantic masks, enabling per-fiber morphometric analysis.

**Key parameters:**
- `downsample: 10.0` — controls tile size to prevent memory overflow
- `cellprobThreshold: 0` — probability threshold for cell detection
- GPU acceleration recommended (~30–60 s per ROI)

**Output:** Individual myofiber polygons with cross-sectional area, perimeter, shape factor, and aspect ratio computed per fiber.

## Layer 2: Fat Infiltration Detection

**Method:** Pixel classifier (trained in QuPath)

A random-forest pixel classifier named `"fat in muscle"` is trained on representative H&E patches to distinguish adipose tissue from background and other tissue types. The classifier operates at the pixel level, producing smooth fat region boundaries.

**Training:**
- Annotate fat vs. non-fat regions in 10–20 representative slides
- Train via `Classify → Pixel classifiers → Train pixel classifier` in QuPath
- Save the classifier as `"fat in muscle"` for pipeline compatibility

**Output:** Fat region polygons with area measurements. Fat-muscle overlapping regions are excluded.

## Layer 3: Nuclear Detection

**Method:** Watershed segmentation

A watershed algorithm detects individual nuclei within the ROI. Detected nuclei are then spatially assigned to tissue compartments (muscle, connective, or unassigned) based on their centroid location relative to myofiber and fat polygons.

**Nuclear classification:**
- **Muscle nuclei** — centroid falls within a myofiber polygon
- **Connective nuclei** — centroid falls within the connective tissue region
- **Unassigned nuclei** — centroid falls within fat or on annotation boundaries

**Nuclear localization:** For each muscle nucleus, a normalized radial position $\rho_k$ is computed (see [NCI definition](/myopath/metrics#nci)), classifying nuclei into peripheral ($\rho_k \leq 0.3$), intermediate ($0.3 < \rho_k < 0.7$), or central ($\rho_k \geq 0.7$) zones.

## Layer 4: Connective Tissue Estimation

**Method:** Boolean subtraction

Connective tissue is not directly segmented. Instead, it is estimated as the residual area after subtracting muscle and fat from the ROI:

$$
A_{\text{connective}} = A_{\text{ROI}} - A_{\text{muscle}} - A_{\text{fat}}
$$

This approach avoids the difficulty of training a dedicated connective tissue classifier on H&E stains, where endomysial and perimysial collagen has variable appearance. The trade-off is that any segmentation errors in muscle or fat propagate into the connective tissue estimate.

## Feature Extraction

From the four tissue layers, MyoPath computes **37 morphometric features** organized into five categories:

| Category | Features | Key indicators |
|----------|----------|----------------|
| Tissue composition | 10 | Areas and percentages of muscle, fat, connective tissue, nuclei |
| Fiber size | 7 | Mean, median, std, min, max, Q1, Q3 of fiber cross-sectional area |
| Fiber shape | 3 | Shape factor (circularity), aspect ratio and their variability |
| Nuclear distribution | 7 | Nuclei counts per compartment, nuclei per fiber statistics |
| Nuclear localization | 3 | Peripheral ratio, central ratio, multinucleated fiber count |

See [Morphometric Features](/myopath/metrics) for the complete feature catalog.

## MyoPath Score

Seven clinically interpretable **pathology indicators** are derived from the 37 features. These are combined via logistic regression into a composite **MyoPath Score**:

$$
\text{MyoPath Score} = \frac{1}{1 + e^{-z}}
$$

$$
z = \beta_0 + \beta_1 \cdot \text{NCI} + \beta_2 \cdot \text{Fiber CV} + \beta_3 \cdot \text{Shape} + \beta_4 \cdot \text{Fat\%} + \beta_5 \cdot \text{Fibrosis\%} + \beta_6 \cdot \text{NMR} + \beta_7 \cdot \text{Inflammation}
$$

The model was trained on the GTEx cohort (n = 399) with leave-one-out cross-validation and validated on the independent HuashanMuscle cohort (n = 79) without retraining.

::: info
NCI and Fiber CV carry the largest standardized regression coefficients ($\beta = 0.57$ and $0.53$), confirming their role as primary biomarkers.
:::

## ROI Selection Strategy

MyoPath uses a standardized 1500 µm × 1500 µm ROI to ensure:

- **Sufficient sampling**: ~200–600 myofibers per ROI (median ~400)
- **Computational feasibility**: single-ROI processing in < 2 min
- **Cross-study comparability**: fixed area eliminates scaling confounds

The ROI is positioned manually by the operator at the region of interest. For clinical validation, we recommend analyzing at least one ROI per biopsy section, positioned over the most representative (or most affected) area.

::: warning
Tissue composition metrics (fat infiltration, fibrosis) are inherently ROI-dependent. NCI and Fiber CV are more robust to ROI placement because they are computed per-fiber and normalized.
:::

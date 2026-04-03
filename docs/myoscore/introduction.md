# MyoScore

**MyoScore** is a genetically informed transcriptomic scoring system for quantifying human skeletal muscle health. It integrates transcriptome-wide association studies (TWAS) of 27 muscle-related phenotypes from over one million participants to provide an objective, continuous measure of muscle health on a 0–100 scale.

## Overview

Muscle health varies continuously from optimal function to severe pathology, yet no unified genetic framework previously quantified this spectrum objectively. MyoScore bridges this gap by leveraging GWAS summary statistics integrated with GTEx v8 skeletal muscle eQTL weights (n = 803) through the FUSION TWAS framework.

From 1,116 TWAS-significant genes, **417 are expressed in skeletal muscle** and form the basis of the scoring system. These genes are organized into five biologically interpretable dimensions of muscle biology, each scored from 0 to 100.

## Five Dimensions

| Dimension | Weight | GWAS Source | Biological Programme |
|-----------|--------|-------------|---------------------|
| **Strength** | 25.2% | Grip strength, walking pace, muscle weakness | Acetyl-CoA metabolism, energy substrate utilization |
| **Mass** | 17.7% | Fat-free mass (whole body, appendicular, trunk/limb) | Golgi-to-plasma membrane transport, secretory dynamics |
| **LeanMuscle** | 24.3% | Thigh fat infiltration MRI (direction reversed) | Centrosomal proteins, intracellular trafficking |
| **Youth** | 24.2% | Telomere length | Epitranscriptomic regulation (m6A), MHC class I |
| **Resilience** | 8.7% | Myopathy diagnoses, creatine kinase (direction reversed) | Iron–sulfur cluster binding, mitochondrial homeostasis |

**Score interpretation:** Higher score = Healthier muscle

## Composite Score

$$
\text{MyoScore} = 0.252 \times \text{Strength} + 0.177 \times \text{Mass} + 0.243 \times \text{LeanMuscle} + 0.242 \times \text{Youth} + 0.087 \times \text{Resilience}
$$

## Four-Stage Muscle Health Spectrum

MyoScore defines a continuous four-stage spectrum rather than discrete disease categories:

| Stage | Description | MyoScore (mean) | n |
|-------|-------------|-----------------|---|
| I | Healthy | 51.4 | 234 |
| II | Mild Disease | 49.3 | 173 |
| III | Moderate Wasting | 46.8 | 595 |
| IV | Severe Muscle Disease | 44.6 | 267 |

## Disease Discrimination

| Cohort | AUC | 95% CI | n |
|--------|-----|--------|---|
| GTEx | 0.825 | 0.793–0.855 | 803 |
| GEO | 0.786 | 0.749–0.822 | 668 |
| Helsinki Myofin | 0.751 | 0.588–0.886 | 154 |
| HuashanMuscle | 0.873 | 0.786–0.948 | 97 |

## Key Validations

- **Histopathological**: LeanMuscle correlates with fat infiltration (r = −0.50), fibrosis (r = −0.44), and fiber variability (r = −0.57) in disease cohorts
- **MRI**: LeanMuscle correlates with muscle fat fraction (r = −0.35 to −0.62); Mass correlates with muscle volume (r = 0.31 to 0.49)
- **Clinical**: Inversely correlates with CTG repeat length in DM1 (r = −0.41), 10-metre walk time (r = −0.42), and Mercuri MRI score in LGMD R12 (r = −0.57)
- **Causal**: Two-sample Mendelian randomization confirms causal directionality for 78% of gene–outcome pairs using tissue-matched skeletal muscle cis-eQTL
- **Single-cell**: Validated across 475,584 cells from two independent muscle ageing atlases; pseudobulk MyoScore declines with age (combined ρ = −0.39, P = 0.014)
- **Functional**: iPSC-to-myotube differentiation confirms predicted expression changes for novel MyoScore genes

## Citation

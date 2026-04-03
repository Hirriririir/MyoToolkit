# Validation

## Study Cohorts

MyoScore was validated across 1,722 human skeletal muscle RNA-seq transcriptomes from four independent cohorts:

| Cohort | n | Source | Composition |
|--------|---|--------|-------------|
| GTEx v8 | 803 | Genotype-Tissue Expression Project | Autopsy skeletal muscle; four-stage wasting spectrum |
| GEO | 668 | NCBI GEO (15 studies) | Multiple myopathy studies (FSHD, DM1, CDM, DMD, cancer cachexia) |
| Helsinki Myofin | 154 | University of Helsinki | Titinopathy, IBM, control |
| HuashanMuscle | 97 | Huashan Hospital, Fudan University | DM1, LGMD, control |

## Disease Discrimination

ROC analysis demonstrated consistent discrimination across all four cohorts:

| Cohort | AUC | 95% CI |
|--------|-----|--------|
| GTEx | 0.825 | 0.793–0.855 |
| GEO | 0.786 | 0.749–0.822 |
| Helsinki Myofin | 0.751 | 0.588–0.886 |
| HuashanMuscle | 0.873 | 0.786–0.948 |

## Continuous Muscle Health Spectrum

UMAP dimensionality reduction of all 1,722 samples revealed a continuous gradient from healthy to severely diseased muscle. Diffusion component 1 correlated strongly with MyoScore (r = 0.417, P = 1.37 × 10⁻⁷³), confirming that the scoring system captures the primary biological axis of muscle health variation.

| Stage | Description | MyoScore (mean, 95% CI) | n |
|-------|-------------|------------------------|---|
| I | Healthy (accidental/unexpected death) | 51.4 (50.9–51.8) | 234 |
| II | Mild Disease (intermediate death, overweight, sleep restriction) | 49.3 (48.7–49.8) | 173 |
| III | Moderate Wasting (ventilator/slow death, cancer cachexia) | 46.8 (46.5–47.2) | 595 |
| IV | Severe Muscle Disease (sIBM, TMD, FSHD, LGMD, DM1, CDM, DMD) | 44.6 | 267 |

## Clinical Correlations

### DM1 (n = 27)
- CTG repeat length: r = −0.41, P = 0.034
- 10-metre walk time: r = −0.42, P = 0.029
- Grip strength: r = 0.37, P = 0.058

### CDM (n = 29)
- CTG repeats: r = −0.35, P = 0.060

### FSHD (n = 32)
- Histological inflammation score: r = −0.45, P = 0.024

### LGMD R12 (n = 41)
- Mercuri MRI score: r = −0.57, P < 0.001
- Selective muscle involvement: semimembranosus most affected (P = 0.009), vastus lateralis intermediate (P = 0.037), rectus femoris preserved (P = 0.567)

## Histopathological Validation

Automated quantification of H&E-stained whole slide images (same biopsy specimen as RNA-seq) using [MyoPath](/myopath/introduction):

### GTEx cohort (n = 399 slides)
- LeanMuscle vs fat infiltration: r = −0.12, P = 0.019
- LeanMuscle vs fibrosis: r = −0.20, P < 0.001
- LeanMuscle vs fiber variability: r = −0.24, P < 0.001

### HuashanMuscle disease cohort (n = 74 slides)
- LeanMuscle vs fat infiltration: r = −0.50, P < 0.001
- LeanMuscle vs fibrosis: r = −0.44, P < 0.001
- LeanMuscle vs fiber variability: r = −0.57, P < 0.001
- Resilience vs nuclear centralization: r = −0.25, P = 0.032

## MRI Validation

Within-individual comparison of transcriptomic MyoScore with quantitative thigh MRI:

### HuashanMuscle (n = 46)
- LeanMuscle vs fat fraction: r = −0.35, P = 0.018
- Mass vs muscle volume: r = 0.31, P = 0.037

### Helsinki Myofin (n = 13)
- LeanMuscle vs fat fraction: r = −0.62, P = 0.023
- Mass vs muscle volume: r = 0.49, P = 0.087

## Novel Gene Validation

### iPSC-to-Myotube Differentiation
Five novel MyoScore genes tracked across 4 healthy donors, 6 time points:

| Gene | Direction | Fold Change (D20/D0) | P value | Concordant |
|------|-----------|---------------------|---------|------------|
| TMEM52 | Positive | 1.73 | 3.6 × 10⁻⁴ | Yes |
| CEP250 | Negative | 0.20 | 2.3 × 10⁻⁷ | Yes |
| YWHAB | Negative | 0.51 | 7.8 × 10⁻⁷ | Yes |
| SNRPC | Negative | 0.33 | 7.4 × 10⁻⁷ | Yes |
| RSRC2 | Negative | 0.80 | 0.60 | Yes (trend) |

### Mendelian Randomization
28/36 gene–outcome pairs (78%) showed MR effect directions concordant with MyoScore predictions. Tissue-matched skeletal muscle cis-eQTL were essential — blood eQTL gave discordant results for ACSS2 and GGT7.

## Single-Cell Validation

Across 475,584 cells from two independent muscle ageing atlases (HLMA, 292,423 cells; Sanger, 183,161 cells):

- Combined pseudobulk correlation with age: ρ = −0.39, P = 0.014 (n = 40 donors)
- Type II myofiber nuclei showed the largest age-related decline (Cohen's d = 0.19)
- Youth dimension declined in all 13 cell types examined

## Stability

MyoScore showed no significant change after a 16-week lifestyle intervention in overweight individuals (n = 54, P = 0.567), consistent with its design as a measure of genetically regulated expression driven by germline variants rather than acute environmental stimuli.

## Limitations

- GWAS data derive predominantly from European ancestry populations
- Primarily cross-sectional validation; longitudinal studies needed
- Captures 417 of 1,116 identified genes due to bulk RNA-seq detection limits
- Blood biomarker proxies may not directly reflect tissue-specific gene expression
- iPSC validation used a limited sample (n = 4 donors)

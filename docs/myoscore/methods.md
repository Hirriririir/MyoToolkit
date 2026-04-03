# Methods

## TWAS Pipeline

MyoScore is constructed by integrating genome-wide association studies (GWAS) with tissue-specific gene expression through transcriptome-wide association studies (TWAS).

```
27 muscle-related GWAS (>1M participants)
                │
                ▼
    FUSION TWAS (v1.1.0)
                │
    GTEx v8 skeletal muscle eQTL weights (n = 803)
    1000 Genomes Phase 3 EUR LD reference (n = 503)
                │
                ▼
    1,116 TWAS-significant genes (Bonferroni P < 1.68 × 10⁻⁵)
                │
    417 detectable in bulk RNA-seq (591 gene-dimension entries)
                │
                ▼
    5 dimensions → MyoScore (0–100)
```

## GWAS Phenotypes (27 total)

| Dimension | Phenotypes | Count | Direction |
|-----------|-----------|-------|-----------|
| **Strength** | Grip strength, walking pace, muscle weakness, grip cross-sectional area | 5 | Direct |
| **Mass** | Whole body FFM, appendicular lean mass, leg/arm/trunk FFM, etc. | 15 | Direct |
| **LeanMuscle** | Anterior/posterior thigh fat infiltration | 2 | Reversed (less fat = higher score) |
| **Youth** | Telomere length | 1 | Direct |
| **Resilience** | Muscular dystrophy, other myopathies, myopathy phecode, creatine kinase | 5 | Reversed (less disease = higher score) |

GWAS summary statistics were obtained from OpenGWAS (IEU), UK Biobank (Neale Lab) and FinnGen release 9. All were harmonized to GRCh37/hg19 and filtered for MAF > 1% and imputation quality > 0.8.

## Gene Weight and Direction Assignment

- **Gene weights**: $-\log_{10}(P_{\text{TWAS}})$
- **Effect direction**: Determined from TWAS Z-scores, with reversals applied to negative phenotypes (fat infiltration, myopathy diagnoses, CK) so that higher expression of positively weighted genes consistently indicates better muscle health

## MyoScore Calculation

1. **Normalization**: Raw counts → TMM normalization (edgeR) → log₂(CPM + 1)
2. **Standardization**: Gene-wise Z-score across all input samples
3. **Dimension scoring**: Weighted average within each dimension:
$$
\text{Dimension score} = \frac{\sum (z_i \times d_i \times w_i)}{\sum w_i}
$$
   where $z_i$ = Z-score, $d_i$ = direction (+1 or −1), $w_i$ = gene weight
4. **Scaling**: Min–max normalization to 0–100 per dimension
5. **Composite**: $\text{MyoScore} = 0.252 \times \text{Strength} + 0.177 \times \text{Mass} + 0.243 \times \text{LeanMuscle} + 0.242 \times \text{Youth} + 0.087 \times \text{Resilience}$

## Mathematical Framework

### Gene Weight

The weight of gene $g$ in dimension $d$:

$$
w_{g,d} = -\log_{10}(P_{g,d})
$$

where $P_{g,d}$ is the minimum TWAS P value for gene $g$ across all phenotypes assigned to dimension $d$.

### Direction Assignment

The effect direction from TWAS Z-scores:

$$
\delta_{g} = \begin{cases}
+1 & \text{if } Z_{g} > 0 \text{ for positive phenotypes (e.g., grip strength)} \\
-1 & \text{if } Z_{g} < 0 \text{ for positive phenotypes}
\end{cases}
$$

For negative phenotypes (fat infiltration, CK, myopathy diagnoses), direction is inverted: $\delta_{g}^{\text{final}} = -\delta_{g}$, ensuring $+1$ always means higher expression → better muscle health.

### Expression Preprocessing

Given raw count matrix $\mathbf{X} \in \mathbb{R}^{G \times N}$:

$$
\text{CPM}_{g,s} = \frac{X_{g,s}}{\sum_{g'=1}^{G} X_{g',s}} \times 10^6, \quad E_{g,s} = \log_2(\text{CPM}_{g,s} + 1)
$$

### Gene-wise Z-score

$$
z_{g,s} = \frac{E_{g,s} - \bar{E}_g}{\sigma_g}
$$

### Dimension Sub-score

$$
S_{d,s}^{\text{raw}} = \frac{\sum_{g \in \mathcal{G}_d} z_{g,s} \cdot \delta_g \cdot w_{g,d}}{\sum_{g \in \mathcal{G}_d} w_{g,d}}
$$

Rescaled to [0, 100] via min–max normalization:

$$
S_{d,s} = \frac{S_{d,s}^{\text{raw}} - \min_s(S_{d,s}^{\text{raw}})}{\max_s(S_{d,s}^{\text{raw}}) - \min_s(S_{d,s}^{\text{raw}})} \times 100
$$

### Composite MyoScore

$$
\text{MyoScore}_s = \sum_{d=1}^{5} \alpha_d \cdot S_{d,s}
$$

### Data-Driven Weights

Dimension weights derived from absolute Spearman correlation with binary disease severity:

$$
\alpha_d = \frac{|\rho_d|}{\sum_{d'=1}^{5} |\rho_{d'}|}
$$

| Dimension | Weight ($\alpha_d$) | Spearman $\lvert\rho\rvert$ |
|-----------|---------------------|------|
| Strength | 0.252 | 0.482 |
| Mass | 0.177 | 0.338 |
| LeanMuscle | 0.243 | 0.465 |
| Youth | 0.242 | 0.462 |
| Resilience | 0.087 | 0.166 |

### Gene Counts by Dimension

| Dimension | Total TWAS genes | Detectable in bulk RNA-seq | Source phenotypes |
|-----------|-----------------|---------------------------|-------------------|
| Strength | 67 | 31 | 5 |
| Mass | 382 | 219 | 15 |
| LeanMuscle | 272 | 147 | 2 |
| Youth | 81 | 37 | 1 |
| Resilience | 314 | 157 | 5 |
| **Total** | **1,116** | **591 entries (417 unique genes)** | **28** |

### Key Notation

| Symbol | Definition |
|--------|-----------|
| $g$, $s$, $d$ | Gene, sample, dimension index |
| $P_{g,d}$ | TWAS P value |
| $w_{g,d}$ | Gene weight: $-\log_{10}(P_{g,d})$ |
| $\delta_g$ | Direction (+1 = healthy, −1 = disease) |
| $z_{g,s}$ | Z-score-normalized expression |
| $S_{d,s}$ | Dimension sub-score (0–100) |
| $\alpha_d$ | Dimension weight (data-driven) |
| $\mathcal{G}_d$ | Set of detectable genes in dimension $d$ |

## Pathway Enrichment by Dimension

| Dimension | Key Enriched Pathways | Representative Genes |
|-----------|----------------------|---------------------|
| Strength | Acetyl-CoA metabolism, ethanol metabolism, propanoate metabolism | ACSS2, ACSS3, SULT1A1 |
| Mass | Golgi-to-plasma membrane transport | — |
| LeanMuscle | Protein localization to centrosome; vesicular transport (unhealthy direction) | NUDCD3, DCTN2, CEP250 |
| Youth | mRNA methyltransferase activity, MHC class I protein binding | METTL16, TRMT61B, PILRA |
| Resilience | Iron–sulfur cluster binding (disease direction) | CISD1, CISD2, ISCU |

## Data Sources

| Cohort | n | Source | Description |
|--------|---|--------|-------------|
| GTEx v8 | 803 | Genotype-Tissue Expression Project | Autopsy skeletal muscle |
| GEO | 668 | NCBI GEO (15 studies) | Multiple myopathy and muscle studies |
| Helsinki Myofin | 154 | University of Helsinki | Titinopathy, IBM, control |
| HuashanMuscle | 97 | Huashan Hospital, Fudan University | DM1, LGMD, control |

Total: **1,722 human skeletal muscle RNA-seq transcriptomes** across four independent cohorts.

## Technical Robustness

- **Cross-platform**: No significant difference between DNBSEQ-T7 and NovaSeq 6000 (P = 0.37)
- **Library prep**: Concordant scores between polyA selection and ribosomal depletion (P = 0.29)
- **Within-individual**: Rectus femoris vs vastus lateralis correlation r = 0.60 (P = 0.032)
- **Ischemic time**: Apparent correlation (r = 0.40) is Simpson's paradox; partial r = 0.14 after controlling for death type

## Mendelian Randomization

Two-sample MR using skeletal muscle cis-eQTL (GTEx v8, n = 803) as instruments and UK Biobank GWAS as outcomes:

- 28/36 gene–outcome pairs (78%) showed directions concordant with MyoScore predictions
- Tissue specificity proved critical: blood eQTL (eQTLGen) gave discordant directions for ACSS2 and GGT7, resolved to 4/4 concordance with muscle eQTL

## UK Biobank Biomarker Proxies

| Biomarker | Gene proxy | n | Key finding |
|-----------|-----------|---|-------------|
| Plasma acetate | ACSS2 | 272,474 | 100% direction concordance across all muscle phenotypes |
| Serum GGT | GGT7 | 467,123 | 75% direction concordance |

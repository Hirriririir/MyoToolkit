# Changelog

All notable changes to MyoToolkit will be documented on this page.

## [Unreleased]

### MyoToolkit Website
- Initial release of the unified MyoToolkit documentation site
- Integrated MyoScore, MyoPath, and ThighMRIseg under one platform

---

## MyoScore

### v3.3 (2024)
- Added **Youth** dimension based on telomere length TWAS (81 genes)
- Fixed GTEx control ranking: accident/unexpected death now ranks higher than slow death
- Improved cross-cohort generalization (AUC > 0.75 across all 4 cohorts)

### v3.2
- Five-dimensional scoring system (Strength, Mass, LeanMuscle, Youth, Resilience)
- GWAS-TWAS integration with 28 phenotypes and GTEx v8 eQTL weights
- Identified 1,116 muscle health genes

---

## MyoPath

### v1.0 (2024)
- Automated HE-stained WSI analysis
- Fat infiltration and fibrosis quantification
- Muscle fiber morphometry (diameter, CSA, coefficient of variation)

---

## ThighMRIseg

### v1.0 (2024)
- SegResNet-based 11-muscle thigh segmentation
- Multimodal support (IDEAL, T1, T2, STIR)
- Multiethnic training data (354 MRIs: Chinese, Finnish, German)
- MONAI Label deployment with OHIF and 3D Slicer integration

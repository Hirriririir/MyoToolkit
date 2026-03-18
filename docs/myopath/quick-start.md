# Quick Start

## Input Format

- HE-stained skeletal muscle biopsy whole slide images
- Supported formats: SVS, NDPI, TIFF, or other common WSI formats

## Usage

```python
# Analyze a single slide
python myopath_analyze.py \
    --input slide.svs \
    --output results/
```

## Output

The analysis generates:

- **Fat infiltration ratio** — percentage of adipose tissue area
- **Fibrosis ratio** — percentage of fibrotic tissue area
- **Fiber statistics** — mean diameter, cross-sectional area, coefficient of variation
- **Segmentation mask** — color-coded overlay of detected tissue types
- **Summary report** — CSV with all quantitative metrics

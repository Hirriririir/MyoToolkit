# Methods

## Model Architecture

ThighMRIseg uses **SegResNet**, a 3D encoder-decoder segmentation network from the MONAI framework.

```
3D MRI Input → SegResNet Encoder → Decoder → 11-class Segmentation Map
```

### Key Features

- Residual connections for stable training
- 3D convolutions capturing volumetric context
- Multi-scale feature aggregation

## Training Strategy

- **Framework:** MONAI Label
- **Loss function:** Dice + Cross-Entropy
- **Data augmentation:** Random flipping, rotation, intensity scaling
- **Modalities:** Trained jointly on IDEAL fat/water, T1, T2, and STIR sequences

## Deployment

The model is served via MONAI Label, enabling:

- REST API for automated inference
- Integration with OHIF Viewer (web-based)
- Integration with 3D Slicer (desktop)
- Batch processing for research studies

## Post-Processing

- Connected component analysis for noise removal
- Morphological operations for boundary refinement
- Per-muscle volume and cross-sectional area computation

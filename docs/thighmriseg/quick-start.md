# Quick Start

## Prerequisites

- Python 3.8+
- MONAI Label
- 3D Slicer or OHIF Viewer

## Installation

```bash
# Install MONAI Label
pip install monailabel-weekly

# Clone the model repository
git clone https://github.com/Hirriririir/Multimodal-Multiethnic-Thigh-Muscle-MRI-analysis.git
cd Multimodal-Multiethnic-Thigh-Muscle-MRI-analysis
```

## Start MONAI Label Server

```bash
monailabel start_server \
    --app . \
    --studies /path/to/your/mri/data \
    --conf models segresnet
```

## Segmentation Workflow

1. Open **3D Slicer** and connect to the MONAI Label server
2. Load a thigh MRI scan from the server
3. Click **Auto Segmentation** to run the model
4. Review and refine the 11-muscle segmentation result
5. Export segmentation masks for downstream analysis

## Data Download

### Release Data

The following files are available on the [GitHub Release v1.0](https://github.com/Hirriririir/Multimodal-Multiethnic-Thigh-Muscle-MRI-analysis/releases/tag/1.0):

| File | Size | Description |
|------|------|-------------|
| `pretrained_segmentation_muscle.pt` | ~329 MB | Pretrained SegResNet model weights |
| `HuashanMyo.zip` | ~746 MB | Huashan Hospital multimodal thigh MRI dataset |
| `Folkhalsan.zip` | ~150 MB | Folkhälsan Research Center thigh MRI dataset |
| `Dataset.json` | ~42 KB | MONAI Label dataset configuration |

### ITK-SNAP Label File

Download the ITK-SNAP label file for 11-muscle annotation:

<a href="/thighmriseg/ThighMuscle.label" download>ThighMuscle.label</a>

Load in ITK-SNAP via **Segmentation → Import Label Descriptions**.

## Analysis

The repository includes Jupyter notebooks for:

- **Radiomics feature extraction** and correlation analysis
- **Fat fraction quantification** from IDEAL sequences
- **Multi-ethnic metric comparison** across cohorts
- **Statistical analysis** scripts (R-based correlation matrices)

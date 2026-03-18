# ThighMRIseg

**ThighMRIseg** is a deep learning-based thigh muscle MRI segmentation tool trained on a multimodal, multiethnic dataset.

## Overview

ThighMRIseg automatically segments 11 individual thigh muscles from MRI scans using a SegResNet architecture deployed via MONAI Label. It supports multiple MRI modalities and has been trained on data from three ethnic populations.

![Workflow Flowchart](/thighmriseg/Flowchart.png)

## Segmentation Demo

![Segmentation Demo](/thighmriseg/demo.png)

## Target Muscles (11 muscles)

| Muscle | Compartment |
|--------|-------------|
| **Biceps Femoris (long head)** | Posterior |
| **Biceps Femoris (short head)** | Posterior |
| **Semitendinosus** | Posterior |
| **Semimembranosus** | Posterior |
| **Adductor Magnus** | Medial |
| **Vastus Intermedius** | Anterior |
| **Vastus Lateralis** | Anterior |
| **Vastus Medialis** | Anterior |
| **Rectus Femoris** | Anterior |
| **Gracilis** | Medial |
| **Sartorius** | Anterior |

## Supported MRI Modalities

- IDEAL fat/water separation
- T1-weighted
- T2-weighted
- STIR (Short Tau Inversion Recovery)

## Integration

- **MONAI Label** server deployment
- Compatible with **OHIF Viewer** and **3D Slicer**
- One-click "Auto Segmentation" in clinical workflows

### OHIF Viewer

![OHIF Viewer Demo](/thighmriseg/OHIF.gif)

### 3D Slicer

![3D Slicer Demo](/thighmriseg/3D_slicer.gif)

## Citation

> Multimodal Multiethnic Thigh Muscle MRI Analysis. GitHub: [Hirriririir/Multimodal-Multiethnic-Thigh-Muscle-MRI-analysis](https://github.com/Hirriririir/Multimodal-Multiethnic-Thigh-Muscle-MRI-analysis)

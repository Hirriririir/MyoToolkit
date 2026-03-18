# 快速开始

## 环境要求

- Python 3.8+
- MONAI Label
- 3D Slicer 或 OHIF Viewer

## 安装

```bash
# 安装 MONAI Label
pip install monailabel-weekly

# 克隆模型仓库
git clone https://github.com/Hirriririir/Multimodal-Multiethnic-Thigh-Muscle-MRI-analysis.git
cd Multimodal-Multiethnic-Thigh-Muscle-MRI-analysis
```

## 启动 MONAI Label 服务器

```bash
monailabel start_server \
    --app . \
    --studies /path/to/your/mri/data \
    --conf models segresnet
```

## 分割流程

1. 打开 **3D Slicer** 并连接 MONAI Label 服务器
2. 从服务器加载大腿 MRI 扫描
3. 点击 **Auto Segmentation** 运行模型
4. 查看并修正 11 块肌肉的分割结果
5. 导出分割掩膜用于下游分析

## 数据下载

### Release 数据

以下文件可从 [GitHub Release v1.0](https://github.com/Hirriririir/Multimodal-Multiethnic-Thigh-Muscle-MRI-analysis/releases/tag/1.0) 下载：

| 文件 | 大小 | 说明 |
|------|------|------|
| `pretrained_segmentation_muscle.pt` | ~329 MB | 预训练 SegResNet 模型权重 |
| `HuashanMyo.zip` | ~746 MB | 华山医院多模态大腿 MRI 数据集 |
| `Folkhalsan.zip` | ~150 MB | Folkhälsan 研究中心大腿 MRI 数据集 |
| `Dataset.json` | ~42 KB | MONAI Label 数据集配置文件 |

### ITK-SNAP 标签文件

下载 11 块肌肉标注的 ITK-SNAP 标签文件：

<a href="/thighmriseg/ThighMuscle.label" download>ThighMuscle.label</a>

在 ITK-SNAP 中通过 **Segmentation → Import Label Descriptions** 加载。

## 分析功能

仓库包含 Jupyter Notebook 用于：

- **影像组学特征提取**与相关性分析
- **脂肪分数定量**（IDEAL 序列）
- **多种族指标比较**
- **统计分析**脚本（R 语言相关矩阵）

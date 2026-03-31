# 运行

## 步骤 1 — 创建 ROI（QuPath）
![步骤 1 — 在 QuPath 中创建 ROI](/myopath/step1-roi.png)

1. 在 QuPath 中打开 `.vsi` 切片
2. 导航至感兴趣区域
3. 在 QuPath 脚本编辑器中运行 `MyoPath1_roi.groovy`（`Automate → Show script editor`）
4. 视图中心将出现 1500 µm × 1500 µm 的方形 ROI

::: tip
ROI 大小经过标准化，确保不同切片间组织取样的一致性。
:::

## 步骤 2 — 组织分割（QuPath）

![步骤 2 — QuPath 中的分割结果](/myopath/step2-segment.png)

1. **选中步骤 1 创建的 ROI**（点击选中）
2. 运行 `MyoPath2_segment.groovy`
3. 等待三层分割完成：
   - 肌纤维：Cellpose-SAM（GPU 约 30–60 秒）
   - 脂肪区域：像素分类器（约 5 秒）
   - 细胞核：watershed（约 10 秒）
4. 所有注释以独立对象显示，颜色编码如下：

| 颜色 | 组织 |
|------|------|
| 红色 | 肌纤维 |
| 黄色 | 脂肪 |
| 蓝色 | 细胞核 |

### 关键参数

脚本提供了若干可调参数，以适应不同组织：

**肌纤维分割**（`muscleFiberParams`）：

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `expectedDiameterMicrons` | 80 | 预期肌纤维直径（µm）。如果纤维持续漏检或过度合并，请调整为样本中典型纤维口径 |
| `downsample` | 10.0 | 控制分割精细度。值越低细节越好但内存占用和处理时间增加；值越高速度越快但越粗糙 |

**脂肪检测**（`fatParams`）：

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `splitThreshold` | 0.1 | 像素分类器的脂肪区域分割阈值。默认值适用于内置的 `Fat in muscle` 分类器；如果您在 QuPath 中自行训练分类器，可能需要调整此值 |

**细胞核检测**（`nucleusParams`）：

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `threshold` | — | Hematoxylin 通道信号强度的检测阈值。增大则检出更少但更可靠的核；减小则检出更多但可能出现假阳性。最佳值取决于染色强度 |

::: warning
第四层组织——结缔组织——在步骤 4 中通过布尔减法计算得出，不在 QuPath 中直接标注。
:::

## 步骤 3 — 导出数据（QuPath）

![步骤 3 — 导出的文件](/myopath/step3-export.png)

1. **再次选中 ROI**
2. 运行 `MyoPath3_export.groovy`
3. 输出保存至 `exports/{图像名称}/`：

```
exports/HE_M3669/
├── HE_M3669_ROI.tiff             # 全分辨率 ROI 图像
├── HE_M3669_ROI.jpg              # JPEG 预览
├── HE_M3669_annotations.geojson  # 所有注释
└── HE_M3669_summary.txt          # 导出摘要
```

## 步骤 4 — 批量分析（Python）

![步骤 4 — 三视图对比输出](/myopath/step4-analysis.png)

```bash
cd MyoPath

# 测试单个样本
python MyoPath4_analysis.py --test HE_M3669

# 处理所有样本
python MyoPath4_analysis.py --all --cores 16

# 处理指定样本
python MyoPath4_analysis.py --samples HE_M1600,HE_M2806

# 自定义输入/输出目录
python MyoPath4_analysis.py --all --input /data/exports --output /data/results

# 调试模式（单进程）
python MyoPath4_analysis.py --test HE_M3669 --sequential --verbose
```

### 命令行参数

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `--test NAME` | — | 测试单个样本 |
| `--samples A,B` | — | 处理指定样本（逗号分隔） |
| `--all` | — | 处理 exports/ 下所有样本 |
| `--input DIR` | `../exports` | 导出目录路径 |
| `--output DIR` | `../results` | 结果目录路径 |
| `--cores N` | 10 | 并行处理 CPU 核心数 |
| `--sequential` | 关闭 | 单进程模式（用于调试） |
| `--verbose` | 关闭 | 详细日志 |

## 输出结构

每个处理后的样本会在导出目录生成单样本结果，另有汇总结果：

```
exports/{样本名称}/                        # 单样本结果
├── {样本}_statistics.json               # 组织面积统计
├── {样本}_dystrophy_report.json         # 完整病理报告
├── original_image.png                   # H&E 图像
├── standard_segmentation.png            # 四层组织叠加图
├── muscle_fiber_colormap.png            # 单纤维着色图
└── three_view_comparison.png            # 三视图对比

results/                                  # 汇总结果
└── batch_analysis_summary.json          # 批处理分析摘要
```

### 可视化输出

| 文件 | 说明 |
|------|------|
| `original_image.png` | 原始 H&E 染色组织图像 |
| `standard_segmentation.png` | 四种组织类型的彩色编码叠加图 |
| `muscle_fiber_colormap.png` | 每根肌纤维以独特颜色渲染，便于实例级检查 |
| `three_view_comparison.png` | 并排面板：原始图、分割图、纤维着色图 |

### 肌营养不良报告

JSON 报告（`*_dystrophy_report.json`）包含全部 [7 项病理指标](/zh/myopath/metrics)和综合 **MyoPath Score**（0–100）：

| 评分范围 | 严重程度 |
|----------|----------|
| 0–20 | 正常 / 轻微 |
| 20–40 | 轻度 |
| 40–60 | 中度 |
| 60–100 | 重度 |

各指标的详细定义和临床解释请参阅[形态学特征](/zh/myopath/metrics)。

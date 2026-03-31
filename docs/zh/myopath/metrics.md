# 形态学特征

MyoPath 从常规 H&E 染色骨骼肌切片中提取 **37 个独特的形态学特征**，按五个生物学类别组织，并精炼为 **七个临床可解释的病理指标**。

::: tip 参考文献
> Zhong H\*, Gao M\*, Ma S, Zhang W, Chen N, Jiao K, Zhu B, Song J, Yan C, Yue D, Xi J, Zhu W, Zhao C\#, Luo S\#. **MyoPath: A Deep Learning Pipeline for Objective Morphometric Assessment of Skeletal Muscle Biopsies.** *投稿准备中。*
:::

## 七项病理指标

这七项特征对应肌肉活检评估中常规检查的**五个病理轴**：

| 病理轴 | 指标 | 临床意义 |
|---|---|---|
| 核位置异常 | NCI（核中心化指数） | 中央核肌病、DM1 |
| 纤维大小失调 | Fiber CV（纤维变异系数） | 肌营养不良和神经源性病变 |
| 纤维形态畸变 | 形状规则度 | 纤维分裂、角状萎缩 |
| 组织替代 | 脂肪浸润、纤维化 | 晚期肌营养不良、去神经损伤 |
| 细胞反应 | 核/肌纤维比、炎性浸润 | 再生、炎症 |

### 1. 核中心化指数 (NCI) {#nci}

**主要生物标志物。** 量化肌纤维内细胞核的平均径向位置。

$$
\rho_k = \min\!\left(\frac{d_k^{\text{boundary}}}{r_i^{\text{eq}}},\; 1.0\right), \quad
\text{NCI} = \frac{1}{N_{\text{analyzed}}} \sum_{k=1}^{N_{\text{analyzed}}} \rho_k
$$

其中 $d_k^{\text{boundary}}$ 为核中心到最近纤维边界的距离，$r_i^{\text{eq}} = \sqrt{a_i / \pi}$ 为等效圆半径。

| NCI 范围 | 解释 |
|---|---|
| < 0.03 | 正常（肌膜下核） |
| 0.03 -- 0.10 | 轻度中心化 |
| 0.10 -- 0.20 | 中度中心化 |
| > 0.20 | 重度中心化 |

**临床证据：**
- 区分肌病与对照：$p = 1.3 \times 10^{-5}$，秩二列相关 $r = 0.69$
- DM1 的 NCI 最高（中位数 0.121），与中央核病理一致
- 与 DM1 CTG 重复数相关：Spearman $\rho = 0.46$，$p = 0.042$
- GTEx 肌病谱系中显著剂量-反应趋势（Jonckheere-Terpstra $p < 10^{-4}$）

核按径向位置分为三个区域：

| 区域 | 标准 | 指标 |
|---|---|---|
| 外周区 | $\rho_k \leq 0.3$ | `peripheral_ratio`（正常 ~ 1.0） |
| 中间区 | $0.3 < \rho_k < 0.7$ | — |
| 中央区 | $\rho_k \geq 0.7$ | `central_ratio`（> 0.05 异常） |

### 2. 纤维大小变异系数 (Fiber CV) {#fiber-cv}

**主要生物标志物。** 肌纤维横截面积的变异系数。

$$
\text{Fiber CV} = \frac{\sigma_a}{\bar{a}}
$$

| Fiber CV 范围 | 解释 |
|---|---|
| < 0.25 | 正常 |
| 0.25 -- 0.40 | 轻度变异 |
| 0.40 -- 0.60 | 中度变异 |
| > 0.60 | 重度变异 |

**临床证据：**
- 区分肌病与对照：$p = 2.9 \times 10^{-4}$，$r = 0.58$
- 与 DM1 握力负相关：$\rho = -0.61$，$p = 0.031$
- 随 LGMD 突变严重度递增：2x 错义（0.44）→ LoF + 错义（0.49）→ 2x LoF（0.65）
- 无量纲，可在不同纤维口径的样本间直接比较

### 3. 纤维形状规则度 {#shape-regularity}

纤维横截面的平均圆度（形状因子）。

$$
\text{Shape Factor}_i = \frac{4\pi \, a_i}{p_i^2}, \quad
\text{Mean Shape Factor} = \frac{1}{N_f} \sum_{i=1}^{N_f} \text{Shape Factor}_i
$$

- **1.0** = 完美圆形
- **< 0.6** = 不规则纤维形态（分裂、角状萎缩、慢性重塑）
- **正常范围** > 0.7

### 4. 脂肪浸润 (%) {#fat-infiltration}

ROI 中脂肪组织所占百分比。

$$
\texttt{fat\_infiltration\_pct} = \frac{A_{\text{fat}}}{A_{\text{ROI}}} \times 100\%
$$

- **正常范围：** < 5%
- 肌营养不良或去神经损伤的晚期标志物
- 依赖 ROI 选取位置

::: warning
脂肪和纤维化替代是非特异性的晚期变化，也见于衰老、废用和肥胖。它们固有地依赖 ROI，因此不如 NCI 和 Fiber CV 稳健。
:::

### 5. 纤维化 (%) {#fibrosis}

结缔组织占 ROI 面积的百分比，通过布尔减法计算。

$$
A_{\text{connective}} = A_{\text{ROI}} - A_{\text{muscle}} - A_{\text{fat}}
$$

$$
\texttt{fibrosis\_pct} = \frac{A_{\text{connective}}}{A_{\text{ROI}}} \times 100\%
$$

- **正常范围：** < 10%
- 反映内膜和束膜纤维化增生
- 依赖 ROI 选取位置

### 6. 核/肌纤维比 {#nuclear-muscle-ratio}

肌纤维内核数与纤维总数之比。

$$
\texttt{nuclear\_muscle\_ratio} = \frac{N_{\text{nuc}}^{\text{muscle}}}{N_f}
$$

- **正常范围：** 1 -- 3
- 升高提示核增殖、再生或卫星细胞活化
- 在华山队列中显著（$p = 3.4 \times 10^{-5}$），但在 GTEx 消耗性疾病谱系中不显著

### 7. 炎性浸润 {#inflammatory-infiltration}

结缔组织区域的核密度。

$$
\texttt{density} = \frac{N_{\text{nuc}}^{\text{conn}}}{A_{\text{connective}} \,/\, 10^6} \quad (\text{nuclei/mm}^2)
$$

- **正常范围：** < 2,000 nuclei/mm²
- 高值提示炎性细胞浸润或活跃的成纤维细胞增殖

---

## 基础描述性特征

37 个特征包括上述 7 项病理指标和 30 个基础描述性特征。

### 组织成分（10 个特征）

| 特征 | 单位 | 描述 |
|---|---|---|
| `roi_area_um2` | µm² | 分析 ROI 总面积 |
| `muscle_fibers_count` | 计数 | Cellpose-SAM 检测到的肌纤维数量 |
| `muscle_area_um2` | µm² | 所有检测到的肌纤维横截面积之和 |
| `muscle_area_pct` | % | 肌纤维占 ROI 面积比例。随萎缩、脂肪替代或纤维化而降低 |
| `fat_regions_count` | 计数 | 识别的离散脂肪区域数 |
| `fat_area_um2` | µm² | 脂肪组织总面积，排除与肌纤维注释的重叠 |
| `connective_area_um2` | µm² | 结缔组织面积（ROI 减去肌纤维减去脂肪） |
| `connective_area_pct` | % | 结缔组织占 ROI 面积比例 |
| `nucleus_area_um2` | µm² | 所有检测到的细胞核总面积 |
| `nucleus_area_pct` | % | 核面积占 ROI 比例。细胞增多时升高 |

### 纤维大小（7 个特征）

| 特征 | 单位 | 描述 |
|---|---|---|
| `fiber_mean_area_um2` | µm² | 平均横截面积。萎缩时减小，肥大时增大 |
| `fiber_median_um2` | µm² | 中位纤维面积。对异常值不敏感 |
| `fiber_std_um2` | µm² | 纤维面积标准差 |
| `fiber_min_um2` | µm² | 最小检测纤维面积 |
| `fiber_max_um2` | µm² | 最大检测纤维面积 |
| `fiber_q1_um2` | µm² | 25 百分位。对群组性萎缩敏感 |
| `fiber_q3_um2` | µm² | 75 百分位 |

### 纤维形状（3 个特征）

| 特征 | 单位 | 描述 |
|---|---|---|
| `shape_factor_std` | 无量纲 | 纤维间圆度标准差 |
| `aspect_ratio_mean` | 无量纲 | 平均长宽比（1.0 = 圆形，> 2.0 = 细长） |
| `aspect_ratio_std` | 无量纲 | 长宽比标准差 |

### 核分布（7 个特征）

| 特征 | 单位 | 描述 |
|---|---|---|
| `nuclei_total_count` | 计数 | ROI 内检测到的总核数 |
| `nuclei_in_muscle` | 计数 | 中心落在肌纤维多边形内的核 |
| `nuclei_in_connective` | 计数 | 结缔组织区域中的核 |
| `nuclei_unassigned` | 计数 | 未分配到肌纤维或结缔组织的核 |
| `nuclei_per_fiber_mean` | 计数/纤维 | 每根肌纤维平均核数（健康：1--3） |
| `nuclei_per_fiber_std` | 计数/纤维 | 每根纤维核数的标准差 |
| `nuclei_per_fiber_max` | 计数 | 单根纤维中的最大核数 |

### 核定位（3 个特征）

| 特征 | 单位 | 描述 |
|---|---|---|
| `peripheral_ratio` | 0--1 | 纤维半径外 30% 区域核的比例（健康 ~ 1.0） |
| `central_ratio` | 0--1 | 纤维半径内 30% 区域核的比例（> 0.05 异常） |
| `multinucleated_fiber_count` | 计数 | 含多于一个核的纤维数。再生肌肉和某些先天性肌病中升高 |

---

## MyoPath Score

**MyoPath Score** 是七项病理指标的 logistic 回归复合评分：

$$
\text{MyoPath Score} = \frac{1}{1 + e^{-z}}
$$

$$
z = -9.17 + 27.11 \times \text{NCI} + 3.96 \times \text{Fiber CV} + 8.22 \times \text{Shape} + 0.017 \times \text{Fat\%} + 0.043 \times \text{Fibrosis\%} + 0.123 \times \text{NMR} + 0.000001 \times \text{Inflammation}
$$

**性能：**
- 训练集（GTEx）：AUC = 0.788（LOO-CV = 0.735）
- 外部验证（华山队列）：AUC = 0.873（无需重新训练）
- NCI 和 Fiber CV 的标准化回归系数最大（$\beta = 0.57$ 和 $0.53$）

## 分割性能

| 组织层 | 方法 | Dice | IoU |
|---|---|---|---|
| 肌纤维 | Cellpose-SAM | 0.92 ± 0.03 | 0.85 ± 0.06 |
| 脂肪 | 像素分类器 | 0.95 ± 0.02 | 0.91 ± 0.03 |
| 细胞核 | Watershed | 0.87 ± 0.04 | 0.78 ± 0.06 |
| 结缔组织 | 布尔减法 | 0.88 ± 0.04 | 0.78 ± 0.06 |

所有七项病理指标的组内相关系数 (ICC) 均超过 0.88。

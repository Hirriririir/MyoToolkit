# 方法

## TWAS 流水线

MyoScore 通过将全基因组关联研究（GWAS）与组织特异性基因表达的全转录组关联研究（TWAS）整合构建。

```
27 个肌肉相关 GWAS（>100 万参与者）
                │
                ▼
    FUSION TWAS (v1.1.0)
                │
    GTEx v8 骨骼肌 eQTL 权重 (n = 803)
    1000 Genomes Phase 3 EUR LD 参考面板 (n = 503)
                │
                ▼
    1,116 个 TWAS 显著基因 (Bonferroni P < 1.68 × 10⁻⁵)
                │
    417 个在 bulk RNA-seq 中可检测（591 条基因-维度记录）
                │
                ▼
    5 个维度 → MyoScore (0–100)
```

## GWAS 表型（共 27 个）

| 维度 | 表型 | 数量 | 方向 |
|------|------|------|------|
| **Strength** | 握力、步速、肌肉无力、握力横截面积 | 5 | 直接 |
| **Mass** | 全身去脂体重、四肢瘦体重、躯干/腿/臂去脂体重等 | 15 | 直接 |
| **LeanMuscle** | 大腿前/后脂肪浸润 | 2 | 反转（脂肪越少分越高） |
| **Youth** | 端粒长度 | 1 | 直接 |
| **Resilience** | 肌营养不良、其他肌病、肌病 phecode、肌酸激酶 | 5 | 反转（疾病越少分越高） |

GWAS 汇总统计数据来自 OpenGWAS（IEU）、UK Biobank（Neale Lab）和 FinnGen release 9。均统一至 GRCh37/hg19，过滤 MAF > 1% 和插补质量 > 0.8。

## 基因权重和方向赋值

- **基因权重**：$-\log_{10}(P_{\text{TWAS}})$
- **效应方向**：由 TWAS Z-score 确定，对负向表型（脂肪浸润、肌病诊断、CK）进行反转，确保正向权重基因的高表达一致指向更好的肌肉健康

## MyoScore 计算

1. **归一化**：原始 count → TMM 归一化 (edgeR) → log₂(CPM + 1)
2. **标准化**：基因级 Z-score（跨所有输入样本）
3. **维度评分**：各维度内加权平均：
$$
\text{维度评分} = \frac{\sum (z_i \times d_i \times w_i)}{\sum w_i}
$$
   其中 $z_i$ = Z-score，$d_i$ = 方向（+1 或 −1），$w_i$ = 基因权重
4. **缩放**：每个维度 min-max 归一化至 0–100
5. **复合评分**：$\text{MyoScore} = 0.252 \times \text{Strength} + 0.177 \times \text{Mass} + 0.243 \times \text{LeanMuscle} + 0.242 \times \text{Youth} + 0.087 \times \text{Resilience}$

## 数学框架

### 基因权重

基因 $g$ 在维度 $d$ 中的权重：

$$
w_{g,d} = -\log_{10}(P_{g,d})
$$

其中 $P_{g,d}$ 为基因 $g$ 在维度 $d$ 所有表型中的最小 TWAS P 值。

### 方向赋值

由 TWAS Z-score 确定效应方向：

$$
\delta_{g} = \begin{cases}
+1 & \text{若 } Z_{g} > 0 \text{（正向表型，如握力）} \\
-1 & \text{若 } Z_{g} < 0 \text{（正向表型）}
\end{cases}
$$

对于负向表型（脂肪浸润、CK、肌病诊断），方向反转：$\delta_{g}^{\text{final}} = -\delta_{g}$，确保 $+1$ 始终表示高表达 → 更好的肌肉健康。

### 表达预处理

给定原始 count 矩阵 $\mathbf{X} \in \mathbb{R}^{G \times N}$：

$$
\text{CPM}_{g,s} = \frac{X_{g,s}}{\sum_{g'=1}^{G} X_{g',s}} \times 10^6, \quad E_{g,s} = \log_2(\text{CPM}_{g,s} + 1)
$$

### 基因级 Z-score

$$
z_{g,s} = \frac{E_{g,s} - \bar{E}_g}{\sigma_g}
$$

### 维度子评分

$$
S_{d,s}^{\text{raw}} = \frac{\sum_{g \in \mathcal{G}_d} z_{g,s} \cdot \delta_g \cdot w_{g,d}}{\sum_{g \in \mathcal{G}_d} w_{g,d}}
$$

通过 min–max 归一化缩放至 [0, 100]：

$$
S_{d,s} = \frac{S_{d,s}^{\text{raw}} - \min_s(S_{d,s}^{\text{raw}})}{\max_s(S_{d,s}^{\text{raw}}) - \min_s(S_{d,s}^{\text{raw}})} \times 100
$$

### 复合 MyoScore

$$
\text{MyoScore}_s = \sum_{d=1}^{5} \alpha_d \cdot S_{d,s}
$$

### 数据驱动权重

维度权重由与二元疾病严重度的绝对 Spearman 相关性推导：

$$
\alpha_d = \frac{|\rho_d|}{\sum_{d'=1}^{5} |\rho_{d'}|}
$$

| 维度 | 权重 ($\alpha_d$) | Spearman $\lvert\rho\rvert$ |
|------|-------------------|------|
| Strength | 0.252 | 0.482 |
| Mass | 0.177 | 0.338 |
| LeanMuscle | 0.243 | 0.465 |
| Youth | 0.242 | 0.462 |
| Resilience | 0.087 | 0.166 |

### 各维度基因数

| 维度 | TWAS 总基因数 | Bulk RNA-seq 可检测 | 来源表型数 |
|------|-------------|-------------------|-----------|
| Strength | 67 | 31 | 5 |
| Mass | 382 | 219 | 15 |
| LeanMuscle | 272 | 147 | 2 |
| Youth | 81 | 37 | 1 |
| Resilience | 314 | 157 | 5 |
| **合计** | **1,116** | **591 条记录（417 个唯一基因）** | **28** |

### 关键符号

| 符号 | 定义 |
|------|------|
| $g$、$s$、$d$ | 基因、样本、维度索引 |
| $P_{g,d}$ | TWAS P 值 |
| $w_{g,d}$ | 基因权重：$-\log_{10}(P_{g,d})$ |
| $\delta_g$ | 方向（+1 = 健康，−1 = 疾病） |
| $z_{g,s}$ | Z-score 标准化表达 |
| $S_{d,s}$ | 维度子评分（0–100） |
| $\alpha_d$ | 维度权重（数据驱动） |
| $\mathcal{G}_d$ | 维度 $d$ 中可检测基因集合 |

## 各维度通路富集

| 维度 | 关键富集通路 | 代表基因 |
|------|------------|---------|
| Strength | 乙酰辅酶 A 代谢、乙醇代谢、丙酸代谢 | ACSS2、ACSS3、SULT1A1 |
| Mass | 高尔基体-质膜转运 | — |
| LeanMuscle | 蛋白定位至中心体；囊泡转运（不健康方向） | NUDCD3、DCTN2、CEP250 |
| Youth | mRNA 甲基转移酶活性、MHC I 类蛋白结合 | METTL16、TRMT61B、PILRA |
| Resilience | 铁硫簇结合（疾病方向） | CISD1、CISD2、ISCU |

## 数据来源

| 队列 | n | 来源 | 描述 |
|------|---|------|------|
| GTEx v8 | 803 | 基因型-组织表达计划 | 尸检骨骼肌 |
| GEO | 668 | NCBI GEO（15 项研究） | 多种肌病和肌肉研究 |
| Helsinki Myofin | 154 | 赫尔辛基大学 | Titinopathy、IBM、对照 |
| 华山队列 | 97 | 复旦大学附属华山医院 | DM1、LGMD、对照 |

总计：来自四个独立队列的 **1,722 个人类骨骼肌 RNA-seq 转录组**。

## 技术稳健性

- **跨平台**：DNBSEQ-T7 和 NovaSeq 6000 之间无显著差异（P = 0.37）
- **文库制备**：polyA 选择与核糖体去除评分一致（P = 0.29）
- **个体内**：股直肌 vs 股外侧肌相关性 r = 0.60（P = 0.032）
- **缺血时间**：表观相关性（r = 0.40）为 Simpson 悖论；控制死亡类型后偏相关 r = 0.14

## 孟德尔随机化

以骨骼肌 cis-eQTL（GTEx v8，n = 803）为工具变量、UK Biobank GWAS 为结局的双样本 MR：

- 28/36 基因-结局对（78%）方向与 MyoScore 预测一致
- 组织特异性至关重要：血液 eQTL（eQTLGen）对 ACSS2 和 GGT7 给出相反方向，使用肌肉 eQTL 后恢复为 4/4 一致

## UK Biobank 血液生物标志物替代

| 生物标志物 | 基因替代 | n | 关键发现 |
|-----------|---------|---|---------|
| 血浆乙酸 | ACSS2 | 272,474 | 所有肌肉表型方向 100% 一致 |
| 血清 GGT | GGT7 | 467,123 | 方向 75% 一致 |

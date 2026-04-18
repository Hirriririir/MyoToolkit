---
aside: false
outline: [2, 3]
---

# MyoScore 在线计算器

直接在浏览器中计算 MyoScore — 无需服务器、无需安装。
上传或粘贴 bulk RNA-seq 原始 count 矩阵，即可得到每个样本在五个遗传驱动
肌肉健康维度上的评分。

<ClientOnly>
  <MyoScoreCalculator />
</ClientOnly>

## 输入格式

- **首列**：基因标识符（Gene Symbol 或 Ensembl ID）
- **首行**：样本名
- **数据**：raw counts（不要 TPM/FPKM）
- **分隔符**：CSV 或 TSV（自动识别）

```csv
gene_symbol,Healthy_01,Healthy_02,Myopathy_01,Myopathy_02
NFS1,530,621,410,380
NEK4,812,904,650,702
RFT1,443,510,298,315
...
```

若首列为 Ensembl ID（如 `ENSG00000100300`），计算器会按需加载一份
GTEx 衍生的注释字典（约 56 000 条，1.5 MB），自动转为 Gene Symbol。
`.15` 之类的版本号会在查询前被自动剥离。

## 计算流程

与 [MyoScore R 包](./r-package)保持一致：

1. **归一化** — raw counts → log₂(CPM + 1)。
2. **基因筛选** — 仅保留 591 条权重表条目（417 个唯一 Gene Symbol）。
3. **Z-score 标准化** — 每个基因在全部输入样本上中心化、标准化。
4. **加权求和** — z-score 乘以 GWAS/TWAS 的方向（±1）和 TWAS 权重，
   按维度求加权均值。
5. **Min-max 归一化** — 各维度的原始分重标到 0–100。
6. **综合评分** — 五维加权求和：

$$
\text{MyoScore} = 0.252 \cdot \text{Strength} + 0.177 \cdot \text{Mass}
+ 0.243 \cdot \text{LeanMuscle} + 0.242 \cdot \text{Youth}
+ 0.087 \cdot \text{Resilience}
$$

全部计算在浏览器本地完成，count 矩阵不会离开你的电脑。

## 推荐样本量

Min-max 归一化是**相对于 cohort 的**，结果受输入样本分布影响：

| 样本数 | 行为 |
| ------ | ---- |
| 1      | 不支持（至少 2 个）。 |
| 2–19   | 可计算但结果不稳定 — 会给出警告。 |
| ≥ 20   | 推荐。 |

若要对个体与参考人群比较，建议先将样本与健康 cohort 合并再评分，
或使用 R 包中的参考 transform 模式。

## 隐私

- 任何数据不会上传到服务器。
- 整个计算器是托管在 Cloudflare Pages 上的纯静态 JavaScript。
- 基因权重表与注释字典都是浏览器直接拉取的静态资源。

## 相关链接

- [方法](./methods) — 权重和方向的完整推导
- [R 包](./r-package) — 命令行 / 批量工作流
- [验证结果](./validation) — MRI、单细胞、临床验证

# 验证结果

## GMHS V3.3 验证

| 数据来源 | 样本数 | AUC | 95% CI | Brier Score |
|----------|--------|-----|--------|-------------|
| HuashanMuscle | 97 | **0.873** | 0.787-0.946 | 0.130 |
| GTEx | 803 | **0.818** | 0.786-0.850 | 0.267 |
| GEO | 644 | **0.786** | 0.742-0.822 | 0.221 |
| Myofin | 154 | **0.751** | 0.586-0.897 | 0.460 |

## GTEx 分组标准

- **健康** = 意外死亡 + 事故死亡（unexpected death + accident death）
- **不健康** = 呼吸机病例 + 慢性死亡 + 中间死亡（ventilator case + slow death + intermediate death）

## HE 病理验证

- GMHS 与脂肪浸润、纤维化、肌纤维变异系数负相关
- LeanMuscle 和 Youth：4/4 病理指标方向正确

## 跨队列泛化

4 个独立数据源 AUC 均 > 0.75

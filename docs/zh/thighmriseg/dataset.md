# 数据集

## 多种族训练数据

ThighMRIseg 使用来自三个地区的 MRI 数据训练，涵盖多样化人群和肌病类型。

| 队列 | 来源 | 样本数 | 疾病类型 |
|------|------|--------|----------|
| **HuashanMyo** | 中国汉族 | 262 | 肌病患者和健康对照 |
| **Folkhälsan** | 芬兰 | 54 | LGMDR1/2、TMD、DM1、DM2、HMERF、健康对照 |
| **MyoSegmenTUM** | 德国 | 38 | BMD、IBM、ALS、多种肌病 |

**总计：354 例 MRI 扫描**

## 涵盖疾病

- **LGMDR1/2** — 肢带型肌营养不良
- **BMD** — Becker 肌营养不良
- **DM1/DM2** — 强直性肌营养不良 1/2 型
- **TMD** — 胫骨肌营养不良
- **IBM** — 包涵体肌炎
- **ALS** — 肌萎缩侧索硬化
- **HMERF** — 伴早期呼吸衰竭的遗传性肌病
- 健康对照

## 数据获取

| 队列 | 获取方式 |
|------|----------|
| HuashanMyo（中国） | [GitHub Releases](https://github.com/Hirriririir/Multimodal-Multiethnic-Thigh-Muscle-MRI-analysis/releases) |
| Folkhälsan（芬兰） | [GitHub Releases](https://github.com/Hirriririir/Multimodal-Multiethnic-Thigh-Muscle-MRI-analysis/releases) |
| MyoSegmenTUM（德国） | OSF 仓库 |

## 标注规范

- 由受训放射科医师进行人工分割
- 每例扫描标注 11 块大腿肌肉
- 由高级神经肌肉专家质量审核

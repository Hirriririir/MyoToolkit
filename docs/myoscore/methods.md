# Methods

## TWAS Pipeline

```
GWAS Summary Statistics → FUSION TWAS → Gene-level Associations
                              ↑
                     eQTL Weights (GTEx v8 Skeletal Muscle, n=803)
```

## GWAS Phenotypes (28 total)

- **Strength (5):** grip strength, walking pace, muscle weakness, grip CSA
- **Mass (15):** whole body FFM, appendicular lean mass, leg/arm/trunk FFM, etc.
- **LeanMuscle (2):** anterior/posterior thigh fat infiltration (direction reversed)
- **Youth (1):** telomere length (direction reversed)
- **Resilience (5):** muscular dystrophy, other myopathies, myopathy phecode, creatine kinase (direction reversed)

## Direction Definition

- `direction = +1`: High expression → Healthy
- `direction = -1`: High expression → Unhealthy (reversed in scoring)

## Data Sources

| Source | Samples | Description |
|--------|---------|-------------|
| GTEx | 803 | Healthy controls (autopsy) |
| GEO | 668 | Multiple myopathy studies |
| Myofin (Helsinki) | 154 | Titinopathy, IBM cohort |
| HuashanMuscle | 97 | DM1, LGMD Chinese cohort |

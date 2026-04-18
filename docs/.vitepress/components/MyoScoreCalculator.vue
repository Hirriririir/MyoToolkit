<script setup lang="ts">
import { ref, shallowRef, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import Papa from 'papaparse'
import * as echarts from 'echarts/core'
import {
  RadarChart, BoxplotChart, BarChart, CustomChart, ScatterChart
} from 'echarts/charts'
import {
  GridComponent, TooltipComponent, LegendComponent, TitleComponent,
  DataZoomComponent, ToolboxComponent, MarkLineComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([
  RadarChart, BoxplotChart, BarChart, CustomChart, ScatterChart,
  GridComponent, TooltipComponent, LegendComponent, TitleComponent,
  DataZoomComponent, ToolboxComponent, MarkLineComponent,
  CanvasRenderer,
])

type IdType = 'auto' | 'symbol' | 'ensembl'
type SepType = 'auto' | ',' | '\t'

interface GeneWeight {
  ID: string
  weight: number
  direction: number
  dimension: string
}

interface DimScoreRow {
  sample: string
  Strength: number | null
  Mass: number | null
  LeanMuscle: number | null
  Youth: number | null
  Resilience: number | null
  MyoScore: number | null
  group?: string
}

interface ComputeResult {
  rows: DimScoreRow[]
  sampleCount: number
  geneCount: number
  coverage: Record<string, { used: number; total: number }>
  warning: string[]
}

const DIMS = ['Strength', 'Mass', 'LeanMuscle', 'Youth', 'Resilience'] as const
type Dim = typeof DIMS[number]

const DIM_WEIGHTS: Record<Dim, number> = {
  Strength: 0.252, Mass: 0.177, LeanMuscle: 0.243, Youth: 0.242, Resilience: 0.087,
}
const DIM_COLORS: Record<Dim, string> = {
  Strength: '#50327b', Mass: '#46508b', LeanMuscle: '#d4b82a',
  Youth: '#72c95e', Resilience: '#31848f',
}

const rawText = ref('')
const fileName = ref('')
const separator = ref<SepType>('auto')
const idType = ref<IdType>('auto')
const minCoverage = ref(0.1)
const isComputing = ref(false)
const errorMsg = ref('')
const warnings = ref<string[]>([])
const result = shallowRef<ComputeResult | null>(null)
const activeTab = ref<'radar' | 'bar' | 'box' | 'table'>('radar')
const selectedSamples = ref<string[]>([])
const groupAssignMode = ref<'auto' | 'manual'>('auto')
const isFullscreen = ref(false)
const demoRef = ref<HTMLElement | null>(null)

let geneWeights: GeneWeight[] = []
let annotationDict: Map<string, string> | null = null
let geneWeightsLoaded = false

const radarRef = ref<HTMLElement | null>(null)
const barRef = ref<HTMLElement | null>(null)
const boxRef = ref<HTMLElement | null>(null)
let radarChart: echarts.ECharts | null = null
let barChart: echarts.ECharts | null = null
let boxChart: echarts.ECharts | null = null
let chartResizeObserver: ResizeObserver | null = null

const detectedIdKind = ref<'symbol' | 'ensembl' | 'unknown'>('unknown')
const needDictConversion = computed(() =>
  idType.value === 'ensembl' ||
  (idType.value === 'auto' && detectedIdKind.value === 'ensembl'),
)

async function loadGeneWeights() {
  if (geneWeightsLoaded) return
  const res = await fetch('/myoscore/myoscore_genes.csv')
  if (!res.ok) throw new Error('Failed to load gene weights table.')
  const text = await res.text()
  const parsed = Papa.parse<Record<string, string>>(text, { header: true, skipEmptyLines: true })
  geneWeights = parsed.data
    .filter(r => r.ID && r.dimension)
    .map(r => ({
      ID: r.ID,
      weight: Number(r.weight),
      direction: Number(r.direction_v3),
      dimension: r.dimension,
    }))
  geneWeightsLoaded = true
}

async function ensureAnnotationDict() {
  if (annotationDict) return
  const res = await fetch('/myoscore/annotation_dict.csv')
  if (!res.ok) throw new Error('Failed to load annotation dictionary.')
  const text = await res.text()
  const map = new Map<string, string>()
  const parsed = Papa.parse<Record<string, string>>(text, { header: true, skipEmptyLines: true })
  for (const r of parsed.data) {
    const gid = r.GeneID?.trim()
    const sym = r.GeneSymbol?.trim()
    if (gid && sym) map.set(gid.split('.')[0], sym)
  }
  annotationDict = map
}

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const f = input.files?.[0]
  if (!f) return
  fileName.value = f.name
  const reader = new FileReader()
  reader.onload = () => {
    rawText.value = String(reader.result ?? '')
  }
  reader.readAsText(f)
}

async function loadSample(kind: 'symbol' | 'ensembl' = 'symbol') {
  errorMsg.value = ''
  const filename = kind === 'symbol' ? 'sample_counts_symbol.csv' : 'sample_counts_ensembl.csv'
  fileName.value = filename
  const res = await fetch('/myoscore/' + filename)
  rawText.value = await res.text()
  idType.value = kind
}

function resetInput() {
  rawText.value = ''
  fileName.value = ''
  result.value = null
  errorMsg.value = ''
  warnings.value = []
  selectedSamples.value = []
  detectedIdKind.value = 'unknown'
}

function detectSeparator(text: string): ',' | '\t' {
  const first = text.split(/\r?\n/, 1)[0] ?? ''
  const commas = (first.match(/,/g) || []).length
  const tabs = (first.match(/\t/g) || []).length
  return tabs > commas ? '\t' : ','
}

function parseCountMatrix(text: string): {
  ids: string[]
  samples: string[]
  matrix: Float64Array[]
} {
  const sep = separator.value === 'auto' ? detectSeparator(text) : separator.value
  const parsed = Papa.parse<string[]>(text.trim(), {
    delimiter: sep,
    skipEmptyLines: true,
  })
  if (parsed.errors.length) {
    const e = parsed.errors[0]
    throw new Error(`Parse error at row ${e.row}: ${e.message}`)
  }
  const rows = parsed.data as string[][]
  if (rows.length < 2) throw new Error('Need at least 1 header row + 1 gene row.')
  const header = rows[0]
  const samples = header.slice(1)
  if (samples.length < 2) throw new Error('At least 2 sample columns required.')
  const ids: string[] = []
  const matrix: Float64Array[] = []
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i]
    if (!r[0]) continue
    const vals = new Float64Array(samples.length)
    for (let j = 0; j < samples.length; j++) {
      const v = r[j + 1]
      const n = v === undefined || v === '' ? NaN : Number(v)
      if (!Number.isFinite(n) || n < 0) {
        throw new Error(`Non-numeric or negative value at row ${i + 1}, col ${j + 2}: "${v}".`)
      }
      vals[j] = n
    }
    ids.push(r[0].trim())
    matrix.push(vals)
  }
  return { ids, samples, matrix }
}

function detectIdKind(ids: string[]): 'symbol' | 'ensembl' {
  const sample = ids.slice(0, Math.min(50, ids.length))
  const ensgCount = sample.filter(x => /^ENSG\d+/.test(x)).length
  return ensgCount / sample.length >= 0.5 ? 'ensembl' : 'symbol'
}

async function convertEnsemblToSymbol(ids: string[]): Promise<string[]> {
  await ensureAnnotationDict()
  return ids.map(id => {
    const key = id.split('.')[0]
    return annotationDict!.get(key) ?? ''
  })
}

function computeMyoScore(
  ids: string[],
  samples: string[],
  matrix: Float64Array[],
): ComputeResult {
  const ws: string[] = []
  if (samples.length < 20) {
    ws.push(`Only ${samples.length} samples. Min-max scaling is unstable; results are cohort-relative. Recommend ≥ 20 samples.`)
  }

  const symbolToRows = new Map<string, number[]>()
  ids.forEach((sym, idx) => {
    if (!sym) return
    const arr = symbolToRows.get(sym)
    if (arr) arr.push(idx)
    else symbolToRows.set(sym, [idx])
  })

  const totals = new Float64Array(samples.length)
  for (const row of matrix) {
    for (let j = 0; j < samples.length; j++) totals[j] += row[j]
  }
  for (let j = 0; j < samples.length; j++) {
    if (totals[j] <= 0) ws.push(`Sample "${samples[j]}" has zero total counts; scores will be NaN.`)
  }

  const log2cpm = new Map<string, Float64Array>()
  for (const [sym, idxs] of symbolToRows) {
    const agg = new Float64Array(samples.length)
    for (const idx of idxs) {
      const row = matrix[idx]
      for (let j = 0; j < samples.length; j++) agg[j] += row[j]
    }
    const out = new Float64Array(samples.length)
    for (let j = 0; j < samples.length; j++) {
      const cpm = totals[j] > 0 ? (agg[j] / totals[j]) * 1e6 : 0
      out[j] = Math.log2(cpm + 1)
    }
    log2cpm.set(sym, out)
  }

  const coverage: Record<string, { used: number; total: number }> = {}
  const dimRaw: Record<Dim, Float64Array | null> = {
    Strength: null, Mass: null, LeanMuscle: null, Youth: null, Resilience: null,
  }

  for (const dim of DIMS) {
    const dimGenes = geneWeights.filter(g => g.dimension === dim)
    const available = dimGenes.filter(g => log2cpm.has(g.ID))
    coverage[dim] = { used: available.length, total: dimGenes.length }

    const frac = dimGenes.length > 0 ? available.length / dimGenes.length : 0
    if (available.length === 0 || frac < minCoverage.value) {
      if (available.length > 0) {
        ws.push(`${dim}: only ${available.length}/${dimGenes.length} genes (${(frac * 100).toFixed(1)}%) below min_coverage ${(minCoverage.value * 100).toFixed(0)}% — skipped.`)
      } else {
        ws.push(`${dim}: no matching genes found — skipped.`)
      }
      dimRaw[dim] = null
      continue
    }

    const n = samples.length
    const accum = new Float64Array(n)
    let weightSum = 0

    for (const g of available) {
      const row = log2cpm.get(g.ID)!
      let m = 0
      for (let j = 0; j < n; j++) m += row[j]
      m /= n
      let ss = 0
      for (let j = 0; j < n; j++) {
        const d = row[j] - m
        ss += d * d
      }
      const sd = n > 1 ? Math.sqrt(ss / (n - 1)) : 0
      const denom = sd === 0 ? 1 : sd
      const coef = g.direction * g.weight
      for (let j = 0; j < n; j++) accum[j] += ((row[j] - m) / denom) * coef
      weightSum += g.weight
    }

    const raw = new Float64Array(n)
    for (let j = 0; j < n; j++) raw[j] = accum[j] / weightSum

    let mn = Infinity, mx = -Infinity
    for (let j = 0; j < n; j++) {
      if (raw[j] < mn) mn = raw[j]
      if (raw[j] > mx) mx = raw[j]
    }
    const scaled = new Float64Array(n)
    if (mx === mn) {
      scaled.fill(50)
    } else {
      for (let j = 0; j < n; j++) scaled[j] = ((raw[j] - mn) / (mx - mn)) * 100
    }
    dimRaw[dim] = scaled
  }

  const rows: DimScoreRow[] = samples.map(s => ({
    sample: s, Strength: null, Mass: null, LeanMuscle: null,
    Youth: null, Resilience: null, MyoScore: null,
    group: groupAssignMode.value === 'auto' ? inferGroup(s) : undefined,
  }))
  for (let j = 0; j < samples.length; j++) {
    let composite = 0
    let wSum = 0
    for (const dim of DIMS) {
      const arr = dimRaw[dim]
      if (arr) {
        rows[j][dim] = arr[j]
        composite += DIM_WEIGHTS[dim] * arr[j]
        wSum += DIM_WEIGHTS[dim]
      }
    }
    rows[j].MyoScore = wSum > 0 ? composite / wSum : null
  }

  return {
    rows,
    sampleCount: samples.length,
    geneCount: ids.length,
    coverage,
    warning: ws,
  }
}

function inferGroup(sampleName: string): string {
  const s = sampleName.toLowerCase()
  if (/^healthy|_healthy|ctrl|ctl|normal|\bwt\b|control/i.test(s)) return 'Healthy'
  if (/unhealthy|myopathy|patient|case|disease|\bko\b|\bmut\b|dm1|dm2/i.test(s)) return 'Unhealthy'
  const m = s.split(/[_\-\s]/)[0]
  return m ? m[0].toUpperCase() + m.slice(1) : 'All'
}

async function runCompute() {
  errorMsg.value = ''
  warnings.value = []
  result.value = null
  if (!rawText.value.trim()) {
    errorMsg.value = 'Please upload or paste a count matrix first.'
    return
  }
  isComputing.value = true
  try {
    await loadGeneWeights()
    const parsed = parseCountMatrix(rawText.value)
    let { ids, samples, matrix } = parsed

    const kind = detectIdKind(ids)
    detectedIdKind.value = kind

    const shouldConvert =
      idType.value === 'ensembl' ||
      (idType.value === 'auto' && kind === 'ensembl')

    if (shouldConvert) {
      const converted = await convertEnsemblToSymbol(ids)
      const mapped = converted.filter(Boolean).length
      if (mapped === 0) {
        throw new Error('No Ensembl IDs could be mapped to Gene Symbols. Check ID format or switch to "Symbol".')
      }
      warnings.value.push(`Converted ${mapped}/${ids.length} Ensembl IDs to Gene Symbols via GTEx dictionary.`)
      ids = converted
    }

    const res = computeMyoScore(ids, samples, matrix)
    warnings.value.push(...res.warning)
    result.value = res
    selectedSamples.value = samples.slice(0, Math.min(10, samples.length))
    await nextTick()
    renderAll()
  } catch (e: any) {
    errorMsg.value = e?.message || String(e)
  } finally {
    isComputing.value = false
  }
}

function renderAll() {
  if (!result.value) return
  renderRadar()
  renderBar()
  renderBox()
}

const GROUP_COLORS: Record<string, string> = {
  Healthy: '#31848f',
  Unhealthy: '#50327b',
  Myopathy: '#50327b',
  Control: '#31848f',
  Patient: '#50327b',
  All: '#435ebe',
}
function colorForGroup(g: string): string {
  if (GROUP_COLORS[g]) return GROUP_COLORS[g]
  const palette = ['#31848f', '#50327b', '#72c95e', '#d4b82a', '#46508b', '#e76f51', '#264653']
  let h = 0
  for (let i = 0; i < g.length; i++) h = (h * 31 + g.charCodeAt(i)) >>> 0
  return palette[h % palette.length]
}

function ensureChart(
  ref: { value: HTMLElement | null },
  current: echarts.ECharts | null,
): echarts.ECharts | null {
  if (!ref.value) return null
  if (!current || current.isDisposed()) {
    return echarts.init(ref.value, undefined, { renderer: 'canvas' })
  }
  return current
}

function renderRadar() {
  if (!radarRef.value || !result.value) return
  // Clear any height override from previous small-multiples layout
  radarRef.value.style.height = ''
  radarChart = ensureChart(radarRef, radarChart)
  if (!radarChart) return
  radarChart.resize()

  const rows = result.value.rows.filter(r => selectedSamples.value.includes(r.sample))
  const data = rows.map(r => {
    const color = colorForGroup(r.group || r.sample)
    return {
      name: r.sample,
      value: DIMS.map(d => r[d] ?? 0),
      symbol: 'circle',
      symbolSize: 5,
      lineStyle: { width: 2, color, opacity: 0.85 },
      itemStyle: { color },
      areaStyle: { color, opacity: 0.05 },
    }
  })
  radarChart.setOption({
    color: rows.map(r => colorForGroup(r.group || r.sample)),
    tooltip: { trigger: 'item' },
    legend: {
      type: 'scroll', top: 0, textStyle: { fontSize: 11 },
    },
    radar: {
      indicator: DIMS.map(d => ({ name: d, max: 100, min: 0 })),
      splitNumber: 5,
      radius: '62%',
      center: ['50%', '58%'],
      axisName: { fontSize: 12, color: '#666' },
      splitArea: { areaStyle: { color: ['rgba(250,250,250,0.2)', 'rgba(235,235,235,0.3)'] } },
    },
    series: [{
      type: 'radar',
      emphasis: { focus: 'series', lineStyle: { width: 3 } },
      data,
    }],
  }, true)
}

function renderBar() {
  if (!barRef.value || !result.value) return
  barChart = ensureChart(barRef, barChart)
  if (!barChart) return
  barChart.resize()
  const rows = [...result.value.rows].filter(r => r.MyoScore != null)
    .sort((a, b) => (b.MyoScore ?? 0) - (a.MyoScore ?? 0))
  const groups = Array.from(new Set(rows.map(r => r.group || 'All')))
  const series = groups.map(g => ({
    name: g,
    type: 'bar',
    stack: 'score',
    barMaxWidth: 28,
    data: rows.map(r => (r.group || 'All') === g ? (r.MyoScore as number) : null),
    itemStyle: { color: colorForGroup(g), borderRadius: [3, 3, 0, 0] },
    emphasis: { focus: 'series' },
  }))
  const width = barRef.value.clientWidth || 600
  const labelMaxWidth = Math.max(40, (width - 80) / rows.length - 4)
  barChart.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { top: 0, left: 'center' },
    grid: { left: 50, right: 20, top: 40, bottom: 90, containLabel: true },
    dataZoom: rows.length > 40 ? [{ type: 'slider', bottom: 10, height: 14 }] : [],
    xAxis: {
      type: 'category',
      data: rows.map(r => r.sample),
      axisLabel: {
        rotate: 55, fontSize: 10,
        overflow: 'truncate', width: labelMaxWidth,
        hideOverlap: true,
      },
    },
    yAxis: { type: 'value', name: 'MyoScore', min: 0, max: 100, nameGap: 35 },
    series,
  }, true)
}

function renderBox() {
  if (!boxRef.value || !result.value) return
  boxChart = ensureChart(boxRef, boxChart)
  if (!boxChart) return
  boxChart.resize()
  const rows = result.value.rows
  const groups = Array.from(new Set(rows.map(r => r.group || 'All')))

  const series: any[] = []
  const xLabels: string[] = [...DIMS]

  for (const g of groups) {
    const boxData: (number[] | null)[] = []
    const scatterData: [number, number][] = []
    for (let i = 0; i < DIMS.length; i++) {
      const d = DIMS[i]
      const values = rows
        .filter(r => (r.group || 'All') === g)
        .map(r => r[d])
        .filter((v): v is number => v != null && Number.isFinite(v))
        .sort((a, b) => a - b)
      if (values.length === 0) { boxData.push(null); continue }
      const q = (p: number) => {
        const pos = (values.length - 1) * p
        const lo = Math.floor(pos), hi = Math.ceil(pos)
        return values[lo] + (values[hi] - values[lo]) * (pos - lo)
      }
      boxData.push([q(0), q(0.25), q(0.5), q(0.75), q(1)])
      values.forEach(v => scatterData.push([i, v]))
    }
    series.push({
      name: g, type: 'boxplot', data: boxData,
      itemStyle: { color: colorForGroup(g) + '40', borderColor: colorForGroup(g), borderWidth: 1.5 },
    })
    series.push({
      name: g + ' points', type: 'scatter', data: scatterData,
      symbolSize: 5, itemStyle: { color: colorForGroup(g), opacity: 0.7 },
      tooltip: { show: false }, legendHoverLink: false,
      silent: true,
    })
  }

  boxChart.setOption({
    tooltip: { trigger: 'item' },
    legend: {
      top: 0, data: groups,
    },
    grid: { left: 50, right: 20, top: 40, bottom: 40, containLabel: true },
    xAxis: { type: 'category', data: xLabels, axisLabel: { fontSize: 11 } },
    yAxis: { type: 'value', min: 0, max: 100, name: 'Score', nameGap: 35 },
    series,
  }, true)
}

function toggleSample(name: string) {
  const idx = selectedSamples.value.indexOf(name)
  if (idx >= 0) selectedSamples.value.splice(idx, 1)
  else selectedSamples.value.push(name)
  renderRadar()
}

function downloadCsv() {
  if (!result.value) return
  const headers = ['Sample', 'Group', ...DIMS.map(d => d + '_score'), 'MyoScore']
  const lines = [headers.join(',')]
  for (const r of result.value.rows) {
    lines.push([
      r.sample, r.group ?? '',
      ...DIMS.map(d => r[d] == null ? '' : (r[d] as number).toFixed(3)),
      r.MyoScore == null ? '' : r.MyoScore.toFixed(3),
    ].join(','))
  }
  const blob = new Blob([lines.join('\n')], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'myoscore_results.csv'
  a.click()
  URL.revokeObjectURL(url)
}

function onResize() {
  radarChart?.resize()
  barChart?.resize()
  boxChart?.resize()
}

function toggleFullscreen() {
  if (!demoRef.value) return
  if (!document.fullscreenElement) {
    demoRef.value.requestFullscreen()
  } else {
    document.exitFullscreen()
  }
}

function onFullscreenChange() {
  isFullscreen.value = !!document.fullscreenElement
  nextTick(() => {
    onResize()
    if (result.value) renderAll()
  })
}

watch(activeTab, () => nextTick(() => {
  onResize()
  renderAll()
}))
watch(selectedSamples, () => renderRadar())

onMounted(() => {
  window.addEventListener('resize', onResize)
  document.addEventListener('fullscreenchange', onFullscreenChange)
  if (demoRef.value) {
    chartResizeObserver = new ResizeObserver(() => onResize())
    chartResizeObserver.observe(demoRef.value)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  document.removeEventListener('fullscreenchange', onFullscreenChange)
  chartResizeObserver?.disconnect()
  radarChart?.dispose()
  barChart?.dispose()
  boxChart?.dispose()
})

const tableRows = computed(() => {
  if (!result.value) return []
  return [...result.value.rows].sort(
    (a, b) => (b.MyoScore ?? -1) - (a.MyoScore ?? -1),
  )
})
</script>

<template>
  <div class="msc" :class="{ 'is-fullscreen': isFullscreen }" ref="demoRef">
    <div class="msc-head">
      <span class="msc-badge">MyoScore Calculator</span>
      <span class="msc-sub">Bulk RNA-seq → 5-dimension muscle health score (browser-only)</span>
      <button class="fs-btn" @click="toggleFullscreen" :title="isFullscreen ? 'Exit fullscreen' : 'Fullscreen'">
        <svg v-if="!isFullscreen" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
      </button>
    </div>

    <div class="msc-grid">
      <!-- ===== Input panel ===== -->
      <section class="msc-card">
        <h3>1. Input count matrix</h3>
        <p class="hint">
          Genes × Samples, first column = gene ID, first row = sample names.
          Raw counts (not TPM/FPKM).
        </p>

        <div class="input-controls">
          <label class="upload-btn">
            <input type="file" accept=".csv,.tsv,.txt" @change="onFileChange" hidden />
            <span>Upload CSV/TSV</span>
          </label>
          <button class="btn-ghost" @click="loadSample('symbol')" title="24-sample demo with Gene Symbols">Sample (Symbol)</button>
          <button class="btn-ghost" @click="loadSample('ensembl')" title="Same data with Ensembl IDs">Sample (Ensembl)</button>
          <button class="btn-ghost" @click="resetInput">Reset</button>
          <span v-if="fileName" class="filename">{{ fileName }}</span>
        </div>

        <textarea
          v-model="rawText"
          class="paste-area"
          placeholder="Or paste CSV / TSV here…&#10;gene_symbol,Sample_01,Sample_02,…&#10;NFS1,530,621,…"
          spellcheck="false"
        ></textarea>

        <div class="options">
          <label>
            Separator
            <select v-model="separator">
              <option value="auto">Auto</option>
              <option value=",">Comma (,)</option>
              <option value="&#9;">Tab (\t)</option>
            </select>
          </label>
          <label>
            Gene ID
            <select v-model="idType">
              <option value="auto">Auto-detect</option>
              <option value="symbol">Gene Symbol</option>
              <option value="ensembl">Ensembl ID (ENSG…)</option>
            </select>
          </label>
          <label>
            Min coverage
            <input type="number" step="0.05" min="0" max="1" v-model.number="minCoverage" />
          </label>
        </div>

        <div v-if="needDictConversion" class="info-box">
          <strong>Ensembl → Symbol</strong> conversion will load the GTEx annotation
          dictionary (~1.5 MB) on first run.
        </div>

        <button
          class="btn-primary" :disabled="isComputing || !rawText.trim()"
          @click="runCompute"
        >
          <span v-if="isComputing">Computing…</span>
          <span v-else>Compute MyoScore</span>
        </button>

        <div v-if="errorMsg" class="error">{{ errorMsg }}</div>
        <div v-if="warnings.length" class="warning">
          <strong>Notes</strong>
          <ul><li v-for="w in warnings" :key="w">{{ w }}</li></ul>
        </div>
      </section>

      <!-- ===== Result panel ===== -->
      <section class="msc-card">
        <h3>2. Results</h3>

        <div v-if="!result" class="placeholder">
          Results will appear here after computation.
        </div>

        <template v-else>
          <div class="summary">
            <div><b>Samples:</b> {{ result.sampleCount }}</div>
            <div><b>Input genes:</b> {{ result.geneCount }}</div>
            <div v-for="(c, d) in result.coverage" :key="d">
              <b>{{ d }}:</b> {{ c.used }}/{{ c.total }}
              ({{ c.total ? ((c.used / c.total) * 100).toFixed(0) : 0 }}%)
            </div>
          </div>

          <div class="tabs">
            <button :class="{ active: activeTab === 'radar' }" @click="activeTab = 'radar'">Radar</button>
            <button :class="{ active: activeTab === 'bar' }" @click="activeTab = 'bar'">MyoScore Bar</button>
            <button :class="{ active: activeTab === 'box' }" @click="activeTab = 'box'">Dimension Box</button>
            <button :class="{ active: activeTab === 'table' }" @click="activeTab = 'table'">Table</button>
            <button class="download" @click="downloadCsv">⬇ CSV</button>
          </div>

          <!-- Radar -->
          <div v-show="activeTab === 'radar'" class="tab-body">
            <div class="sample-picker">
              <span class="picker-label">Show:</span>
              <button
                v-for="r in result.rows" :key="r.sample"
                :class="['chip', { on: selectedSamples.includes(r.sample) }]"
                :style="selectedSamples.includes(r.sample) ? { borderColor: colorForGroup(r.group || r.sample) } : {}"
                @click="toggleSample(r.sample)"
              >
                {{ r.sample }}
              </button>
            </div>
            <div ref="radarRef" class="chart"></div>
          </div>

          <!-- Bar -->
          <div v-show="activeTab === 'bar'" class="tab-body">
            <div ref="barRef" class="chart"></div>
          </div>

          <!-- Box -->
          <div v-show="activeTab === 'box'" class="tab-body">
            <div ref="boxRef" class="chart"></div>
          </div>

          <!-- Table -->
          <div v-show="activeTab === 'table'" class="tab-body tab-table">
            <table class="rs-table">
              <thead>
                <tr>
                  <th>Sample</th><th>Group</th>
                  <th v-for="d in DIMS" :key="d">{{ d }}</th>
                  <th>MyoScore</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in tableRows" :key="r.sample">
                  <td>{{ r.sample }}</td>
                  <td><span class="tag" :style="{ background: colorForGroup(r.group || 'All') }">{{ r.group || '—' }}</span></td>
                  <td v-for="d in DIMS" :key="d">{{ r[d] == null ? '—' : (r[d] as number).toFixed(2) }}</td>
                  <td><b>{{ r.MyoScore == null ? '—' : r.MyoScore.toFixed(2) }}</b></td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>
      </section>
    </div>
  </div>
</template>

<style scoped>
.msc {
  margin: 1.5rem 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  overflow: hidden;
  background: var(--vp-c-bg);
}

.msc-head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  background: linear-gradient(135deg, #435EBE 0%, #667eea 100%);
  color: white;
}
.msc-badge {
  background: rgba(255, 255, 255, 0.22);
  padding: 3px 12px;
  border-radius: 12px;
  font-size: 0.82rem;
  font-weight: 600;
  letter-spacing: 0.3px;
}
.msc-sub { font-size: 0.88rem; opacity: 0.9; flex: 1; }

.fs-btn {
  display: flex; align-items: center; justify-content: center;
  width: 32px; height: 32px; border: none; border-radius: 6px;
  background: rgba(255,255,255,0.2);
  color: white; cursor: pointer; transition: background 0.2s;
  flex-shrink: 0;
}
.fs-btn:hover { background: rgba(255,255,255,0.35); }

/* Fullscreen */
.msc.is-fullscreen {
  border-radius: 0;
  display: flex; flex-direction: column;
  height: 100vh; background: var(--vp-c-bg);
}
.msc.is-fullscreen .msc-grid {
  flex: 1; overflow: hidden; min-height: 0;
  grid-template-columns: 360px 1fr;
}
.msc.is-fullscreen .msc-card {
  display: flex; flex-direction: column;
  overflow: hidden; min-height: 0;
}
.msc.is-fullscreen .msc-card > .hint,
.msc.is-fullscreen .msc-card > .input-controls,
.msc.is-fullscreen .msc-card > .options,
.msc.is-fullscreen .msc-card > .info-box,
.msc.is-fullscreen .msc-card > .btn-primary,
.msc.is-fullscreen .msc-card > .error,
.msc.is-fullscreen .msc-card > .warning { flex-shrink: 0; }
.msc.is-fullscreen .paste-area { flex: 1; max-height: none; }
.msc.is-fullscreen .tab-body { flex: 1; min-height: 0; display: flex; flex-direction: column; }
.msc.is-fullscreen .chart { flex: 1; height: auto !important; min-height: 0; }
.msc.is-fullscreen .tab-table { flex: 1; overflow: auto; }

.msc-grid {
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 0;
  min-height: 0;
}
@media (max-width: 900px) {
  .msc-grid { grid-template-columns: 1fr; }
  .msc.is-fullscreen .msc-grid { grid-template-columns: 1fr; }
}
.msc-card {
  padding: 16px 18px;
  border-right: 1px solid var(--vp-c-divider);
  min-width: 0;
}
.msc-card:last-child { border-right: none; }
.msc-card h3 {
  margin: 0 0 6px 0;
  font-size: 1rem;
  color: #435ebe;
}
.dark .msc-card h3 { color: #7b91ff; }
.hint { font-size: 0.82rem; color: var(--vp-c-text-2); margin: 0 0 10px 0; }

.input-controls {
  display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-bottom: 10px;
}
.upload-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 6px 14px; border-radius: 6px; background: #435ebe; color: white;
  font-size: 0.85rem; cursor: pointer; font-weight: 600;
}
.upload-btn:hover { background: #3650a8; }
.btn-ghost {
  padding: 6px 12px; border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  font-size: 0.85rem; cursor: pointer;
}
.btn-ghost:hover { border-color: #435ebe; color: #435ebe; }
.filename {
  font-size: 0.78rem; color: var(--vp-c-text-2);
  background: var(--vp-c-bg-soft); padding: 2px 8px; border-radius: 4px;
}

.paste-area {
  width: 100%; min-height: 140px; max-height: 240px;
  padding: 8px 10px; font-family: var(--vp-font-family-mono);
  font-size: 0.78rem; line-height: 1.4;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  resize: vertical;
  box-sizing: border-box;
}
.paste-area:focus { outline: none; border-color: #435ebe; }

.options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px; margin: 10px 0;
}
.options label {
  display: flex; flex-direction: column; gap: 4px;
  font-size: 0.78rem; color: var(--vp-c-text-2);
}
.options select, .options input {
  padding: 5px 8px; border: 1px solid var(--vp-c-divider);
  border-radius: 4px; background: var(--vp-c-bg); color: var(--vp-c-text-1);
  font-size: 0.85rem;
}

.info-box {
  padding: 8px 10px; background: rgba(67, 94, 190, 0.1);
  border-left: 3px solid #435ebe;
  font-size: 0.8rem; border-radius: 4px; margin-bottom: 10px;
  color: var(--vp-c-text-1);
}

.btn-primary {
  width: 100%; padding: 10px; border: none; border-radius: 6px;
  background: linear-gradient(135deg, #435EBE 0%, #667eea 100%);
  color: white; font-weight: 600; font-size: 0.92rem; cursor: pointer;
}
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

.error {
  margin-top: 10px; padding: 8px 10px;
  background: rgba(220, 53, 69, 0.1); color: #c0392b;
  border-left: 3px solid #dc3545; border-radius: 4px;
  font-size: 0.82rem;
}
.warning {
  margin-top: 10px; padding: 8px 10px;
  background: rgba(255, 193, 7, 0.1); color: var(--vp-c-text-1);
  border-left: 3px solid #f1c40f; border-radius: 4px;
  font-size: 0.8rem;
}
.warning ul { margin: 4px 0 0 18px; padding: 0; }

.placeholder {
  padding: 40px 20px; text-align: center;
  color: var(--vp-c-text-3); font-style: italic;
  border: 1px dashed var(--vp-c-divider); border-radius: 8px;
}

.summary {
  display: flex; flex-wrap: wrap; gap: 6px 14px;
  padding: 8px 12px; margin-bottom: 10px;
  background: var(--vp-c-bg-soft); border-radius: 6px;
  font-size: 0.82rem;
}

.tabs {
  display: flex; gap: 4px; border-bottom: 1px solid var(--vp-c-divider);
  margin-bottom: 10px; flex-wrap: wrap;
}
.tabs button {
  padding: 6px 14px; border: none;
  background: transparent; color: var(--vp-c-text-2);
  cursor: pointer; font-size: 0.86rem; border-radius: 4px 4px 0 0;
  border-bottom: 2px solid transparent;
}
.tabs button:hover { color: #435ebe; }
.tabs button.active {
  color: #435ebe; border-bottom-color: #435ebe;
  background: var(--vp-c-bg-soft); font-weight: 600;
}
.tabs button.download {
  margin-left: auto; border: 1px solid var(--vp-c-divider);
  border-radius: 4px; border-bottom: 1px solid var(--vp-c-divider);
}

.tab-body { min-height: 460px; display: flex; flex-direction: column; }
.chart { width: 100%; height: 460px; min-width: 0; }

.sample-picker {
  display: flex; flex-wrap: wrap; gap: 4px 6px;
  margin-bottom: 8px; max-height: 80px; overflow-y: auto;
  padding: 4px; align-items: center;
}
.picker-label { font-size: 0.78rem; color: var(--vp-c-text-2); margin-right: 4px; }
.chip {
  padding: 2px 8px; font-size: 0.74rem;
  border: 1px solid var(--vp-c-divider); background: var(--vp-c-bg);
  color: var(--vp-c-text-2); border-radius: 10px; cursor: pointer;
  white-space: nowrap;
}
.chip.on {
  background: var(--vp-c-bg-soft); color: var(--vp-c-text-1);
  border-width: 2px; font-weight: 600;
}

.tab-table { overflow-x: auto; }
.rs-table {
  width: 100%; border-collapse: collapse; font-size: 0.82rem;
}
.rs-table th, .rs-table td {
  padding: 5px 10px; border-bottom: 1px solid var(--vp-c-divider);
  white-space: nowrap;
}
.rs-table th {
  background: var(--vp-c-bg-soft); font-weight: 600;
  position: sticky; top: 0; text-align: left;
}
.rs-table th:nth-child(n+3), .rs-table td:nth-child(n+3) {
  text-align: right;
  font-variant-numeric: tabular-nums;
}
.tag {
  display: inline-block; padding: 1px 8px; border-radius: 8px;
  font-size: 0.72rem; color: white; font-weight: 600;
}
</style>

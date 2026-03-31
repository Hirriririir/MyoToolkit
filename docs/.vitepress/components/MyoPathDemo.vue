<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'

// Fullscreen state
const isFullscreen = ref(false)
const demoRef = ref<HTMLElement | null>(null)

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
}

// Before-After slider state
const sliderPos = ref(50)
const isDragging = ref(false)
const sliderRef = ref<HTMLElement | null>(null)
const detailCardRef = ref<HTMLElement | null>(null)
const summaryCardRef = ref<HTMLElement | null>(null)

function syncHeight() {
  if (!detailCardRef.value || !summaryCardRef.value) return
  summaryCardRef.value.style.maxHeight = detailCardRef.value.offsetHeight + 'px'
}

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  nextTick(syncHeight)
  if (detailCardRef.value) {
    resizeObserver = new ResizeObserver(syncHeight)
    resizeObserver.observe(detailCardRef.value)
  }
  document.addEventListener('fullscreenchange', onFullscreenChange)
})

onUnmounted(() => {
  resizeObserver?.disconnect()
  document.removeEventListener('fullscreenchange', onFullscreenChange)
})

function onPointerDown(e: PointerEvent) {
  isDragging.value = true
  ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  updateSlider(e)
}

function onPointerMove(e: PointerEvent) {
  if (!isDragging.value) return
  updateSlider(e)
}

function onPointerUp() {
  isDragging.value = false
}

function updateSlider(e: PointerEvent) {
  if (!sliderRef.value) return
  const rect = sliderRef.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const pct = Math.max(0, Math.min(100, (x / rect.width) * 100))
  sliderPos.value = pct
}

// Sample analysis data
const analysisData = {
  sliceId: 'HE_M3405',
  specimenId: 'M3405',
  composition: {
    muscle: 48.95,
    fat: 2.24,
    connective: 48.81,
    nuclei: 8.45
  },
  roi: { area: '2.25 mm\u00B2' },
  muscleFibers: { count: 522, area: '1.10 mm\u00B2', pct: '48.95%' },
  fatRegions: { count: 61, area: '0.0504 mm\u00B2', pct: '2.24%' },
  connective: { area: '1.0982 mm\u00B2', pct: '48.81%' },
  fiberSize: { mean: '2109.9 \u03BCm\u00B2', median: '1860.1 \u03BCm\u00B2', std: '1469.4 \u03BCm\u00B2', cv: '0.696' },
  fiberShape: { shapeFactor: '0.561', shapeStd: '0.048', aspectRatio: '1.23' },
  nuclei: { total: 5412, inMuscle: 1272, inConnective: 4137, perFiber: '2.86', multinucleated: 330, centralization: '0.112' },
  pathology: {
    nuclearMuscleRatio: '2.44',
    inflammation: '3767 /mm\u00B2',
    fiberCV: '0.696',
    shapeCircularity: '0.561',
    fatInfiltration: '2.24%',
    fibrosis: '48.81%',
    nuclearCentralization: '0.112'
  }
}

</script>

<template>
  <div class="myopath-demo" :class="{ 'is-fullscreen': isFullscreen }" ref="demoRef">
    <div class="demo-header">
      <span class="demo-badge">Live Demo</span>
      <span class="demo-subtitle">Sample: {{ analysisData.sliceId }} | {{ analysisData.specimenId }}</span>
      <button class="fullscreen-btn" @click="toggleFullscreen" :title="isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'">
        <svg v-if="!isFullscreen" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
      </button>
    </div>

    <div class="demo-grid">
      <!-- Left: Analysis Summary -->
      <div class="demo-card summary-card" ref="summaryCardRef">
        <div class="card-title">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>
          Analysis Summary
        </div>
        <div class="card-content">
          <!-- Tissue Composition -->
          <div class="comp-section">
            <strong class="comp-title">Tissue Composition</strong>
            <small class="comp-sub">Percentage of ROI area</small>
            <div class="progress-bar-container">
              <div class="progress-bar">
                <div class="progress-segment muscle" :style="{ width: analysisData.composition.muscle + '%' }">
                  {{ analysisData.composition.muscle }}%
                </div>
                <div class="progress-segment fat" :style="{ width: analysisData.composition.fat + '%' }"></div>
                <div class="progress-segment connective" :style="{ width: analysisData.composition.connective + '%' }">
                  {{ analysisData.composition.connective }}%
                </div>
              </div>
              <div class="legend">
                <span class="legend-item"><span class="dot muscle"></span> Muscle: {{ analysisData.composition.muscle }}%</span>
                <span class="legend-item"><span class="dot fat"></span> Fat: {{ analysisData.composition.fat }}%</span>
                <span class="legend-item"><span class="dot connective"></span> Connective: {{ analysisData.composition.connective }}%</span>
                <span class="legend-item"><span class="dot nuclei-dot"></span> Nuclei: {{ analysisData.composition.nuclei }}%</span>
              </div>
            </div>
          </div>

          <!-- Data Groups -->
          <div class="data-group">
            <h6>ROI Region</h6>
            <div class="data-row"><span>Total Area:</span><span>{{ analysisData.roi.area }}</span></div>
          </div>

          <div class="data-group">
            <h6>Muscle Fibers</h6>
            <div class="data-row"><span>Count:</span><span>{{ analysisData.muscleFibers.count }}</span></div>
            <div class="data-row"><span>Area:</span><span>{{ analysisData.muscleFibers.area }}</span></div>
            <div class="data-row"><span>Percentage:</span><span class="val-muscle">{{ analysisData.muscleFibers.pct }}</span></div>
          </div>

          <div class="data-group">
            <h6>Fat Regions</h6>
            <div class="data-row"><span>Count:</span><span>{{ analysisData.fatRegions.count }}</span></div>
            <div class="data-row"><span>Area:</span><span>{{ analysisData.fatRegions.area }}</span></div>
            <div class="data-row"><span>Percentage:</span><span class="val-fat">{{ analysisData.fatRegions.pct }}</span></div>
          </div>

          <div class="data-group">
            <h6>Connective Tissue</h6>
            <div class="data-row"><span>Area:</span><span>{{ analysisData.connective.area }}</span></div>
            <div class="data-row"><span>Percentage:</span><span class="val-connective">{{ analysisData.connective.pct }}</span></div>
          </div>

          <div class="data-group">
            <h6>Fiber Size Distribution</h6>
            <div class="data-row"><span>Mean:</span><span>{{ analysisData.fiberSize.mean }}</span></div>
            <div class="data-row"><span>Median:</span><span>{{ analysisData.fiberSize.median }}</span></div>
            <div class="data-row"><span>Std:</span><span>{{ analysisData.fiberSize.std }}</span></div>
            <div class="data-row"><span>CV:</span><span>{{ analysisData.fiberSize.cv }}</span></div>
          </div>

          <div class="data-group">
            <h6>Fiber Shape</h6>
            <div class="data-row"><span>Shape Factor (mean):</span><span>{{ analysisData.fiberShape.shapeFactor }}</span></div>
            <div class="data-row"><span>Shape Factor (std):</span><span>{{ analysisData.fiberShape.shapeStd }}</span></div>
            <div class="data-row"><span>Aspect Ratio (mean):</span><span>{{ analysisData.fiberShape.aspectRatio }}</span></div>
          </div>

          <div class="data-group">
            <h6>Nuclei Analysis</h6>
            <div class="data-row"><span>Total Nuclei:</span><span>{{ analysisData.nuclei.total }}</span></div>
            <div class="data-row"><span>In Muscle:</span><span>{{ analysisData.nuclei.inMuscle }}</span></div>
            <div class="data-row"><span>In Connective:</span><span>{{ analysisData.nuclei.inConnective }}</span></div>
            <div class="data-row"><span>Per Fiber (mean):</span><span>{{ analysisData.nuclei.perFiber }}</span></div>
            <div class="data-row"><span>Multinucleated:</span><span>{{ analysisData.nuclei.multinucleated }}</span></div>
            <div class="data-row"><span>Centralization Index:</span><span class="val-danger">{{ analysisData.nuclei.centralization }}</span></div>
          </div>

          <div class="data-group">
            <h6>Pathology Indicators</h6>
            <div class="data-row">
              <span>Nuclear-Muscle Ratio:</span><span>{{ analysisData.pathology.nuclearMuscleRatio }}</span>
            </div>
            <div class="data-row">
              <span>Inflammatory Infiltration:</span><span>{{ analysisData.pathology.inflammation }}</span>
            </div>
            <div class="data-row">
              <span>Fiber Size Variability:</span><span>{{ analysisData.pathology.fiberCV }}</span>
            </div>
            <div class="data-row">
              <span>Shape Circularity:</span><span>{{ analysisData.pathology.shapeCircularity }}</span>
            </div>
            <div class="data-row">
              <span>Fat Infiltration:</span><span class="val-fat">{{ analysisData.pathology.fatInfiltration }}</span>
            </div>
            <div class="data-row">
              <span>Fibrosis:</span><span class="val-connective">{{ analysisData.pathology.fibrosis }}</span>
            </div>
            <div class="data-row">
              <span>Nuclear Centralization:</span><span class="val-danger">{{ analysisData.pathology.nuclearCentralization }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Analysis Detail -->
      <div class="demo-card detail-card" ref="detailCardRef">
        <div class="card-title">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
          Analysis Detail
        </div>

        <div class="card-content">
          <h6 class="section-label">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="12" y1="3" x2="12" y2="21"/></svg>
            Image Comparison
          </h6>

          <!-- Before-After Slider -->
          <div
            class="ba-slider"
            ref="sliderRef"
            @pointerdown="onPointerDown"
            @pointermove="onPointerMove"
            @pointerup="onPointerUp"
          >
            <img src="/myopath/sample-original.png" alt="Original" class="ba-img" draggable="false" />
            <div class="ba-overlay" :style="{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }">
              <img src="/myopath/sample-colormap.png" alt="Color Map" class="ba-img" draggable="false" />
            </div>
            <div class="ba-handle" :style="{ left: sliderPos + '%' }">
              <div class="ba-handle-line"></div>
              <div class="ba-handle-btn">&harr;</div>
            </div>
            <div class="ba-label-left">Original</div>
            <div class="ba-label-right">Color Map</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.myopath-demo {
  margin: 1.5rem 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  overflow: hidden;
  background: var(--vp-c-bg);
}

.demo-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  background: linear-gradient(135deg, #435EBE 0%, #667eea 100%);
  color: white;
}

.demo-badge {
  background: rgba(255,255,255,0.2);
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.demo-subtitle {
  font-size: 0.9rem;
  opacity: 0.9;
  flex: 1;
}

.fullscreen-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: rgba(255,255,255,0.2);
  color: white;
  cursor: pointer;
  transition: background 0.2s;
  flex-shrink: 0;
}

.fullscreen-btn:hover {
  background: rgba(255,255,255,0.35);
}

/* Fullscreen mode */
.myopath-demo.is-fullscreen {
  border-radius: 0;
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--vp-c-bg);
}

.myopath-demo.is-fullscreen .demo-grid {
  flex: 1;
  overflow: hidden;
}

.myopath-demo.is-fullscreen .summary-card {
  max-height: none !important;
}

.myopath-demo.is-fullscreen .summary-card .card-content {
  overflow-y: auto;
}

.myopath-demo.is-fullscreen .detail-card {
  display: flex;
  flex-direction: column;
}

.myopath-demo.is-fullscreen .detail-card .card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.myopath-demo.is-fullscreen .ba-slider {
  flex: 1;
}

.demo-grid {
  display: grid;
  grid-template-columns: 340px 1fr;
  gap: 0;
  align-items: start;
}

.summary-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.summary-card .card-content {
  flex: 1;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .demo-grid {
    grid-template-columns: 1fr;
  }
}

.demo-card {
  border-right: 1px solid var(--vp-c-divider);
}

.demo-card:last-child {
  border-right: none;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  font-weight: 600;
  font-size: 0.95rem;
  border-bottom: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-1);
}

.card-content {
  padding: 16px;
}


/* Tissue composition */
.comp-section {
  margin-bottom: 16px;
  padding: 12px;
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
}

.comp-title {
  display: block;
  text-align: center;
  margin-bottom: 2px;
  font-size: 0.9rem;
}

.comp-sub {
  display: block;
  text-align: center;
  color: var(--vp-c-text-3);
  font-size: 0.75rem;
  margin-bottom: 8px;
}

.progress-bar-container { margin-top: 4px; }

.progress-bar {
  display: flex;
  height: 24px;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-segment {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
}

.progress-segment.muscle { background: #28a745; }
.progress-segment.fat { background: #ffc107; }
.progress-segment.connective { background: #17a2b8; }

.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 12px;
  font-size: 0.78rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 2px;
  display: inline-block;
}

.dot.muscle { background: #28a745; }
.dot.fat { background: #ffc107; }
.dot.connective { background: #17a2b8; }
.dot.nuclei-dot { background: #6c757d; }

/* Data groups */
.data-group {
  margin-bottom: 12px;
}

.data-group h6 {
  font-size: 0.88rem;
  font-weight: 600;
  color: #435ebe;
  margin: 0 0 6px 0;
  padding-bottom: 4px;
  border-bottom: 2px solid var(--vp-c-divider);
}

.dark .data-group h6 {
  color: #7b91ff;
}

.data-row {
  display: flex;
  justify-content: space-between;
  padding: 3px 0;
  font-size: 0.84rem;
  border-bottom: 1px solid var(--vp-c-divider-light);
}

.data-row:last-child {
  border-bottom: none;
}

.data-row span:first-child {
  color: var(--vp-c-text-2);
}

.data-row span:last-child {
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.val-muscle { color: #28a745 !important; }
.val-fat { color: #e6a817 !important; }
.val-connective { color: #17a2b8 !important; }
.val-danger { color: #dc3545 !important; }

.section-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #435ebe;
  margin: 0;
}

/* Before-After slider */
.ba-slider {
  position: relative;
  width: 100%;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  cursor: ew-resize;
  user-select: none;
  touch-action: none;
}

.ba-img {
  display: block;
  width: 100%;
  height: auto;
  pointer-events: none;
}

.ba-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  will-change: clip-path;
}

.ba-handle {
  position: absolute;
  top: 0;
  width: 4px;
  height: 100%;
  background: white;
  transform: translateX(-50%);
  z-index: 10;
  box-shadow: 0 0 10px rgba(0,0,0,0.3);
  pointer-events: none;
}

.ba-handle-line {
  position: absolute;
  top: 0;
  left: 50%;
  width: 2px;
  height: 100%;
  background: white;
  transform: translateX(-50%);
}

.ba-handle-btn {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  background: #435EBE;
  border: 3px solid white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}

.ba-label-left, .ba-label-right {
  position: absolute;
  top: 12px;
  padding: 4px 10px;
  background: rgba(0,0,0,0.7);
  color: white;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
  z-index: 5;
  pointer-events: none;
}

.ba-label-left { left: 12px; }
.ba-label-right { right: 12px; }

</style>

<script setup>
import { ref, watchEffect, onMounted } from 'vue';
import { useUserMedia } from '@vueuse/core';

const videoRef = ref(null);
const canvasRef = ref(null);
const photos = ref([]);
const activeFilter = ref('none');
const showGallery = ref(false);
const showFilters = ref(false);

const { stream, start, enabled } = useUserMedia({
  constraints: {
    video: {
      facingMode: 'user',
      aspectRatio: 9 / 16
    },
    audio: false
  }
});

const filters = [
  { name: 'Normal', value: 'none' },
  { name: 'Grayscale', value: 'grayscale(100%)' },
  { name: 'Sepia', value: 'sepia(100%)' },
  { name: 'Invert', value: 'invert(100%)' },
  { name: 'Blur', value: 'blur(4px)' }
];

watchEffect(() => {
  if (videoRef.value && stream.value) {
    videoRef.value.srcObject = stream.value;
  }
});

onMounted(() => {
  start();
  fetchPhotos();
});

const fetchPhotos = async () => {
  try {
    const res = await fetch('/api/photos');
    if (res.ok) {
      photos.value = await res.json();
    }
  } catch (err) {
    console.error('Failed to fetch photos', err);
  }
};

const takePhoto = async () => {
  if (!videoRef.value || !canvasRef.value) return;
  
  const video = videoRef.value;
  const canvas = canvasRef.value;
  
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  
  // Draw video to an offscreen canvas first to avoid browser bugs with video + filter
  const offscreenCanvas = document.createElement('canvas');
  offscreenCanvas.width = canvas.width;
  offscreenCanvas.height = canvas.height;
  const offCtx = offscreenCanvas.getContext('2d');
  offCtx.drawImage(video, 0, 0, canvas.width, canvas.height);
  
  const ctx = canvas.getContext('2d');
  
  // Flip horizontally to match the mirrored video preview
  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);
  
  ctx.filter = activeFilter.value !== 'none' ? activeFilter.value : 'none';
  // Draw from offscreen canvas to apply the filter reliably
  ctx.drawImage(offscreenCanvas, 0, 0, canvas.width, canvas.height);
  
  // Reset transform
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  
  canvas.toBlob(async (blob) => {
    const formData = new FormData();
    formData.append('photo', blob, `snap-${Date.now()}.png`);
    formData.append('filter', activeFilter.value);
    
    try {
      const res = await fetch('/api/photos', {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        await fetchPhotos();
      }
    } catch (err) {
      console.error('Error saving photo:', err);
    }
  }, 'image/png');
};
</script>

<template>
  <div class="app-container">
    <!-- Fullscreen Video Background -->
    <div class="video-wrapper" :style="{ filter: activeFilter }">
      <video ref="videoRef" autoplay playsinline muted></video>
      <canvas ref="canvasRef" style="display: none;"></canvas>
    </div>
    
    <!-- UI Overlay -->
    <div class="overlay-ui">
      <!-- Top Controls -->
      <div class="controls-container">
        <!-- Action Row -->
        <div class="action-row">
          <!-- Filter Bubble -->
          <transition name="fade">
            <div class="filter-bubble" v-if="showFilters">
              <button 
                v-for="f in filters" 
                :key="f.value"
                :class="{ active: activeFilter === f.value }"
                @click="activeFilter = f.value; showFilters = false"
              >
                {{ f.name }}
              </button>
            </div>
          </transition>
          <div class="gallery-preview" @click="showGallery = true" v-if="photos.length > 0">
            <img :src="photos[0].filepath" alt="Latest snap" />
          </div>
          <div class="gallery-preview placeholder" v-else></div>

          <button class="snap-btn" @click="takePhoto" :disabled="!enabled">
            <div class="inner-circle"></div>
          </button>
          
          <button class="filter-toggle-btn" :class="{ active: showFilters }" @click="showFilters = !showFilters">
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
            </svg>
          </button>
        </div>
      </div>

      <!-- Bottom header -->
      <header class="header">
        <h1>Photo<span class="highlight">booth</span></h1>
      </header>
    </div>

    <!-- Gallery Modal -->
    <div class="gallery-modal" :class="{ open: showGallery }">
      <div class="modal-header">
        <h2>Your Snaps</h2>
        <button class="close-btn" @click="showGallery = false">&times;</button>
      </div>
      <div class="gallery-grid">
        <div v-for="photo in photos" :key="photo.id" class="photo-card">
          <img :src="photo.filepath" :alt="photo.filename" />
        </div>
      </div>
    </div>
  </div>
</template>

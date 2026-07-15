<script setup>
import { ref, watchEffect, onMounted } from 'vue';
import { useUserMedia } from '@vueuse/core';

const videoRef = ref(null);
const canvasRef = ref(null);
const photos = ref([]);
const activeFilter = ref('none');
const showGallery = ref(false);

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
  
  const ctx = canvas.getContext('2d');
  ctx.filter = activeFilter.value !== 'none' ? activeFilter.value : 'none';
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  
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
        <!-- Filters (Scrollable horizontally) -->
        <div class="filters-scroller">
          <button 
            v-for="f in filters" 
            :key="f.value"
            :class="{ active: activeFilter === f.value }"
            @click="activeFilter = f.value"
          >
            {{ f.name }}
          </button>
        </div>
        
        <!-- Action Row -->
        <div class="action-row">
          <div class="gallery-preview" @click="showGallery = true" v-if="photos.length > 0">
            <img :src="photos[0].filepath" alt="Latest snap" :style="{ filter: photos[0].filter_used }" />
          </div>
          <div class="gallery-preview placeholder" v-else></div>

          <button class="snap-btn" @click="takePhoto" :disabled="!enabled">
            <div class="inner-circle"></div>
          </button>
          
          <div class="spacer"></div>
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
          <img :src="photo.filepath" :alt="photo.filename" :style="{ filter: photo.filter_used }" />
        </div>
      </div>
    </div>
  </div>
</template>

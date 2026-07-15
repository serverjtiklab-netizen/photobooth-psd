<script setup>
import { ref, watchEffect, onMounted } from 'vue';
import { useUserMedia } from '@vueuse/core';

const videoRef = ref(null);
const canvasRef = ref(null);
const { stream, start, enabled } = useUserMedia();
const photos = ref([]);
const activeFilter = ref('none');

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
  start(); // Request camera access on load
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
        await fetchPhotos(); // Refresh gallery
      }
    } catch (err) {
      console.error('Error saving photo:', err);
    }
  }, 'image/png');
};
</script>

<template>
  <div class="app-container">
    <header class="header">
      <h1>Photo<span class="highlight">booth</span></h1>
    </header>

    <main class="main-content">
      <div class="camera-section">
        <div class="video-wrapper" :style="{ filter: activeFilter }">
          <video ref="videoRef" autoplay playsinline muted></video>
          <canvas ref="canvasRef" style="display: none;"></canvas>
        </div>
        
        <div class="controls">
          <div class="filters">
            <button 
              v-for="f in filters" 
              :key="f.value"
              :class="{ active: activeFilter === f.value }"
              @click="activeFilter = f.value"
            >
              {{ f.name }}
            </button>
          </div>
          <button class="snap-btn" @click="takePhoto" :disabled="!enabled">
            <div class="inner-circle"></div>
          </button>
        </div>
      </div>

      <div class="gallery-section">
        <h2>Gallery</h2>
        <div class="gallery-grid">
          <div v-for="photo in photos" :key="photo.id" class="photo-card">
            <img :src="photo.filepath" :alt="photo.filename" />
            <div class="photo-meta">
              <span>{{ new Date(photo.created_at).toLocaleTimeString() }}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

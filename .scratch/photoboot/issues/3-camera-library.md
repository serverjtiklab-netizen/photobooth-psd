---
labels: ["wayfinder:research", "closed"]
---
## Question

Should we use a third-party Vue webcam library or stick to native `navigator.mediaDevices.getUserMedia`? We need to research the quickest and most reliable approach for a simple photobooth.

## Answer

**Use the Native API, optionally supplemented by VueUse (`@vueuse/core`).**

Do not use full-UI wrapper libraries for Vue 3. They are mostly unmaintained and unnecessary given the power of modern Vue composables. The quickest, most reliable approach is to use the **VueUse `useUserMedia`** composable. It handles the reactive boilerplate (device selection, stream initialization, component cleanup) without restricting your UI layout or adding bloat. 

Snapshot Implementation Example:
1. Use `useUserMedia` to get a video stream and bind it to a `<video autoplay playsinline />` tag.
2. On your capture event, draw the current video frame to a `<canvas>`.
3. Extract the image using `canvas.toDataURL('image/png')`.

/* ================================================================
   NewsForge — Client-Side Renderer & Export Engine
   Fabric.js canvas rendering + FFmpeg.wasm video export
   ================================================================ */

const Renderer = {
  _ffmpeg: null,
  _ffmpegLoading: false,

  /**
   * Safe helper to load JSON that handles both promise and callback structures in Fabric.js
   */
  async _safeLoadFromJSON(canvas, json) {
    return new Promise((resolve) => {
      let resolved = false;
      const done = () => {
        if (resolved) return;
        resolved = true;
        resolve();
      };
      try {
        const res = canvas.loadFromJSON(json, done);
        if (res && typeof res.then === 'function') {
          res.then(done);
        }
      } catch (e) {
        console.error('[Renderer] loadFromJSON error:', e);
        resolve();
      }
    });
  },

  /**
   * Export the current Fabric.js canvas as an image (PNG or JPG).
   * @param {fabric.Canvas|fabric.StaticCanvas} canvas - The canvas to export
   * @param {string} format - 'png' or 'jpg'
   * @param {object} outputSize - { width, height }
   * @param {function} onProgress - Progress callback (0-100)
   * @returns {Promise<Blob>} - The image blob
   */
  async exportImage(canvas, format = 'png', outputSize = null, onProgress = null) {
    if (onProgress) onProgress(10, 'Preparing canvas...');

    // Get the target output dimensions
    const targetW = outputSize?.width || 1080;
    const targetH = outputSize?.height || 1920;

    if (onProgress) onProgress(30, 'Rendering at full resolution...');

    // Create a temporary canvas at full resolution
    const tempCanvasEl = document.createElement('canvas');
    tempCanvasEl.width = targetW;
    tempCanvasEl.height = targetH;

    const tempCanvas = new fabric.StaticCanvas(tempCanvasEl, {
      width: targetW,
      height: targetH,
    });

    // Clone the canvas content to the temp canvas
    const jsonData = canvas.toJSON(['id', 'name', 'slot_config']);

    await this._safeLoadFromJSON(tempCanvas, jsonData);

    // Scale objects to fit target resolution
    const scaleX = targetW / (canvas.getWidth() / canvas.getZoom());
    const scaleY = targetH / (canvas.getHeight() / canvas.getZoom());
    tempCanvas.setZoom(1);
    tempCanvas.getObjects().forEach(obj => {
      obj.set({
        left: obj.left * scaleX,
        top: obj.top * scaleY,
        scaleX: (obj.scaleX || 1) * scaleX,
        scaleY: (obj.scaleY || 1) * scaleY,
      });
      obj.setCoords();
    });
    tempCanvas.renderAll();

    if (onProgress) onProgress(60, 'Encoding image...');

    const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
    const quality = format === 'jpg' ? 0.92 : undefined;
    const dataUrl = tempCanvas.toDataURL({ format: mimeType.split('/')[1], quality });

    if (onProgress) onProgress(80, 'Finalizing...');

    // Convert data URL to blob
    const blob = await (await fetch(dataUrl)).blob();

    // Cleanup temp canvas
    tempCanvas.dispose();

    if (onProgress) onProgress(100, 'Complete!');
    return blob;
  },

  /**
   * Export the canvas as an MP4 video using FFmpeg.wasm.
   * @param {fabric.Canvas|fabric.StaticCanvas} canvas - The canvas
   * @param {object[]} scenes - Scene definitions with durations and transitions
   * @param {Blob|null} voiceBlob - Optional voice audio blob
   * @param {object} outputSize - { width, height }
   * @param {function} onProgress - Progress callback (0-100, label)
   * @returns {Promise<Blob>} - The MP4 blob
   */
  async exportVideo(canvas, scenes = null, voiceBlob = null, outputSize = null, onProgress = null) {
    const targetW = outputSize?.width || 1080;
    const targetH = outputSize?.height || 1920;

    // Default to single scene if no scenes defined
    if (!scenes || !scenes.length) {
      scenes = [{ id: 's1', duration_ms: 5000, transition: 'none' }];
    }

    const totalDurationMs = scenes.reduce((sum, s) => sum + (s.duration_ms || 3000), 0);
    const fps = 24;
    const totalFrames = Math.ceil((totalDurationMs / 1000) * fps);

    if (onProgress) onProgress(5, 'Loading FFmpeg.wasm...');

    // Lazy-load FFmpeg
    const ffmpeg = await this._getFFmpeg(onProgress);
    if (!ffmpeg) {
      throw new Error('FFmpeg.wasm failed to load. Try image export instead.');
    }

    if (onProgress) onProgress(15, 'Generating frames...');

    // Create temp canvas for frame rendering
    const tempCanvasEl = document.createElement('canvas');
    tempCanvasEl.width = targetW;
    tempCanvasEl.height = targetH;
    const tempCanvas = new fabric.StaticCanvas(tempCanvasEl, {
      width: targetW,
      height: targetH,
    });

    // Load canvas data
    const jsonData = canvas.toJSON(['id', 'name', 'slot_config']);
    await this._safeLoadFromJSON(tempCanvas, jsonData);

    const scaleX = targetW / (canvas.getWidth() / canvas.getZoom());
    const scaleY = targetH / (canvas.getHeight() / canvas.getZoom());
    tempCanvas.setZoom(1);
    tempCanvas.getObjects().forEach(obj => {
      obj.set({
        left: obj.left * scaleX,
        top: obj.top * scaleY,
        scaleX: (obj.scaleX || 1) * scaleX,
        scaleY: (obj.scaleY || 1) * scaleY,
      });
      obj.setCoords();
    });
    tempCanvas.renderAll();

    // Render frames
    for (let i = 0; i < totalFrames; i++) {
      const progress = 15 + Math.round((i / totalFrames) * 50);
      if (onProgress && i % 5 === 0) {
        onProgress(progress, `Rendering frame ${i + 1}/${totalFrames}...`);
      }

      // Apply scene transitions (fade in/out at scene boundaries)
      const timeMs = (i / fps) * 1000;
      let accTime = 0;
      for (const scene of scenes) {
        const sceneEnd = accTime + scene.duration_ms;
        if (timeMs >= accTime && timeMs < sceneEnd) {
          const sceneProgress = (timeMs - accTime) / scene.duration_ms;
          if (scene.transition === 'fade') {
            const fadeIn = Math.min(sceneProgress * 4, 1);
            const fadeOut = Math.min((1 - sceneProgress) * 4, 1);
            const opacity = Math.min(fadeIn, fadeOut);
            tempCanvas.getObjects().forEach(obj => obj.set('opacity', opacity));
          }
          break;
        }
        accTime = sceneEnd;
      }
      tempCanvas.renderAll();

      // Capture frame as PNG
      const frameDataUrl = tempCanvasEl.toDataURL('image/png');
      const frameData = await (await fetch(frameDataUrl)).arrayBuffer();
      const paddedIndex = String(i).padStart(5, '0');
      await ffmpeg.writeFile(`frame_${paddedIndex}.png`, new Uint8Array(frameData));
    }

    if (onProgress) onProgress(70, 'Encoding video...');

    // Write voice audio if provided
    const hasVoice = !!voiceBlob;
    if (hasVoice) {
      const voiceData = await voiceBlob.arrayBuffer();
      await ffmpeg.writeFile('voice.mp3', new Uint8Array(voiceData));
    }

    // FFmpeg command
    const ffmpegArgs = [
      '-framerate', String(fps),
      '-i', 'frame_%05d.png',
    ];

    if (hasVoice) {
      ffmpegArgs.push('-i', 'voice.mp3');
    }

    ffmpegArgs.push(
      '-c:v', 'libx264',
      '-pix_fmt', 'yuv420p',
      '-preset', 'fast',
      '-crf', '23',
    );

    if (hasVoice) {
      ffmpegArgs.push('-c:a', 'aac', '-shortest');
    }

    ffmpegArgs.push('-y', 'output.mp4');

    try {
      await ffmpeg.exec(ffmpegArgs);
    } catch (err) {
      console.error('[Renderer] FFmpeg encoding failed:', err);
      throw new Error('Video encoding failed. Your device may not have enough memory. Try image export instead.');
    }

    if (onProgress) onProgress(90, 'Finalizing video...');

    const outputData = await ffmpeg.readFile('output.mp4');
    const videoBlob = new Blob([outputData.buffer], { type: 'video/mp4' });

    // Cleanup
    tempCanvas.dispose();
    for (let i = 0; i < totalFrames; i++) {
      const paddedIndex = String(i).padStart(5, '0');
      try { await ffmpeg.deleteFile(`frame_${paddedIndex}.png`); } catch {}
    }
    try { await ffmpeg.deleteFile('output.mp4'); } catch {}
    if (hasVoice) { try { await ffmpeg.deleteFile('voice.mp3'); } catch {} }

    if (onProgress) onProgress(100, 'Complete!');
    return videoBlob;
  },

  /**
   * Lazy-load FFmpeg.wasm
   */
  async _getFFmpeg(onProgress) {
    if (this._ffmpeg) return this._ffmpeg;
    if (this._ffmpegLoading) {
      // Wait for ongoing load
      await new Promise(resolve => {
        const check = setInterval(() => {
          if (this._ffmpeg || !this._ffmpegLoading) {
            clearInterval(check);
            resolve();
          }
        }, 200);
      });
      return this._ffmpeg;
    }

    this._ffmpegLoading = true;

    try {
      // Check if FFmpegWASM is available
      if (typeof FFmpeg === 'undefined' && typeof FFmpegWASM === 'undefined') {
        // Try dynamic import
        try {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/@anthropic-ai/ffmpeg@0.12.10/dist/umd/ffmpeg.js';
          document.head.appendChild(script);
          await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = reject;
            setTimeout(reject, 15000);
          });
        } catch {
          console.warn('[Renderer] FFmpeg.wasm CDN not available — video export disabled');
          this._ffmpegLoading = false;
          return null;
        }
      }

      const FFmpegClass = (typeof FFmpegWASM !== 'undefined' ? FFmpegWASM : window.FFmpeg)?.FFmpeg;
      if (!FFmpegClass) {
        console.warn('[Renderer] FFmpeg class not found');
        this._ffmpegLoading = false;
        return null;
      }

      const ffmpeg = new FFmpegClass();

      ffmpeg.on('progress', ({ progress }) => {
        if (onProgress) {
          const pct = 70 + Math.round(progress * 20);
          onProgress(pct, `Encoding: ${Math.round(progress * 100)}%`);
        }
      });

      await ffmpeg.load();
      this._ffmpeg = ffmpeg;
      this._ffmpegLoading = false;
      return ffmpeg;
    } catch (err) {
      console.error('[Renderer] FFmpeg.wasm load failed:', err);
      this._ffmpegLoading = false;
      return null;
    }
  },

  /**
   * Download a blob as a file
   */
  downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  },
};

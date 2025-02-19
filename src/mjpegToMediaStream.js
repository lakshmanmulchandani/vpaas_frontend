export const mjpegToMediaStream = async (url) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = 'Anonymous';

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      const drawFrame = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        requestAnimationFrame(drawFrame);
      };

      drawFrame();

      const stream = canvas.captureStream();
      resolve(stream);
    };

    img.onerror = (error) => {
      console.error('Image element error:', error);
      reject(error);
    };

    img.src = 'http://localhost:5000/video_stream';
  });
};

export const resizeImage = (file, wsize, hsize) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = document.createElement("img");
    img.onload = () => {
      const canvas = document.createElement("canvas");
      // const size = 512; // target size
      canvas.width = wsize;
      canvas.height = hsize;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, wsize, hsize);

      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg', 0.7); // Adjust the quality (0.7) as needed to manage the file size
    };
    img.src = e.target.result;
  };
  reader.onerror = reject;
  reader.readAsDataURL(file);
});
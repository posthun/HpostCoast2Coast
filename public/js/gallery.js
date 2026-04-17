fetch("./generated/images.json")
  .then(r => r.json())
  .then(images => {
    const grid = document.getElementById("gallery");

    images.forEach((img, i) => {
      const el = document.createElement("img");
      el.src = img.thumb;
      el.loading = "lazy";
      el.onclick = () => openViewer(images, i);
      grid.appendChild(el);
    });
  });
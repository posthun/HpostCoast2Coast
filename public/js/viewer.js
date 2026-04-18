let current = 0;
let list = [];
let viewerEl = null;

function closeViewer() {
  if (!viewerEl) return;

  document.removeEventListener("keydown", handleKeys);
  viewerEl.remove();
  viewerEl = null;
}

function openViewer(images, index) {
  list = images;
  current = index;

  viewerEl = document.createElement("div");
  viewerEl.id = "viewer";

  viewerEl.innerHTML = `
    <div class="overlay">
      <button id="close">✕</button>
      <button id="prev">←</button>

      <div class="viewer-content">
        <div id="spinner" class="spinner"></div>
        <img id="img" style="display:none;">
        <div id="exif"></div>
      </div>

      <button id="next">→</button>
    </div>
  `;

  document.body.appendChild(viewerEl);

  document.getElementById("prev").onclick = prev;
  document.getElementById("next").onclick = next;
  document.getElementById("close").onclick = closeViewer;

  viewerEl.addEventListener("click", (e) => {
    if (e.target.id === "viewer") closeViewer();
  });

  document.addEventListener("keydown", handleKeys);

  update();
}

function update() {
  const imgData = list[current];
  const imgEl = document.getElementById("img");
  const spinner = document.getElementById("spinner");

  // show spinner, hide image
  spinner.style.display = "block";
  imgEl.style.display = "none";

  const loader = new Image();
  loader.src = imgData.full;

  loader.onload = () => {
    imgEl.src = imgData.full;
    imgEl.style.display = "block";
    spinner.style.display = "none";
  };

  loader.onerror = () => {
    spinner.style.display = "none";
    console.error("Failed to load image:", imgData.full);
  };

  const e = imgData.exif;
  document.getElementById("exif").innerHTML = e
    ? `${e.camera || ""}<br>
       ${e.focal ? e.focal + "mm" : ""} 
       ${e.aperture ? "f/" + e.aperture : ""} 
       ${e.shutter ? format(e.shutter) : ""} 
       ${e.iso ? "ISO " + e.iso : ""}`
    : "";
}

function prev() {
  current = (current - 1 + list.length) % list.length;
  update();
}

function next() {
  current = (current + 1) % list.length;
  update();
}

function handleKeys(e) {
  if (!viewerEl) return;

  if (e.key === "Escape") closeViewer();
  if (e.key === "ArrowLeft") prev();
  if (e.key === "ArrowRight") next();
}

function format(s) {
  return s >= 1 ? `${s}s` : `1/${Math.round(1 / s)}s`;
}
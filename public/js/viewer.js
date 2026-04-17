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
      <img id="img">
      <div id="exif"></div>
    </div>

    <button id="next">→</button>
  </div>
`;

  document.body.appendChild(viewerEl);

  // controls
  document.getElementById("prev").onclick = prev;
  document.getElementById("next").onclick = next;
  document.getElementById("close").onclick = closeViewer;

  // click outside image closes
  viewerEl.addEventListener("click", (e) => {
    if (e.target.id === "viewer") closeViewer();
  });

  document.addEventListener("keydown", handleKeys);

  update();
}

function update() {
  const img = list[current];
  document.getElementById("img").src = img.full;

  const e = img.exif;
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
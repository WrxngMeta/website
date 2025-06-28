// script.js
let currentLink = null;

window.onload = async function () {
  const response = await fetch("files.json");
  const structure = await response.json();
  renderIcons("desktop", structure);
  updateClock();
  setInterval(updateClock, 1000);
};

function renderIcons(directory, structure) {
  const container = document.getElementById("desktop");
  structure[directory].forEach((item) => {
    const icon = document.createElement("div");
    icon.className = "icon";
    icon.onclick = () => handleClick(item);

    const img = document.createElement("img");
    img.src = getIcon(item);
    const label = document.createElement("span");
    label.textContent = item.name.replace(/\.txt$/, "");

    icon.appendChild(img);
    icon.appendChild(label);
    container.appendChild(icon);
  });
}

function handleClick(item) {
  if (item.type === "folder") {
    openWindow(item.name, "folder", item.contents);
  } else if (item.type === "doc") {
    openWindow(item.name, "doc", item.path);
  } else if (item.type === "link") {
    currentLink = item.path;
    showUACModal(item);
  }
}

function getIcon(item) {
  if (item.icon) return item.icon;
  if (item.type === "doc") return "assets/word-icon.png";
  if (item.type === "folder") return "assets/folder-icon.png";
  if (item.type === "link") return "assets/generic-link-icon.png";
  return "assets/default-site-icon.png";
}

function openWindow(name, type, content) {
  const id = name.replace(/\W+/g, "_");
  if (document.getElementById(id)) return;

  const container = document.getElementById("windows-container");
  const win = document.createElement("div");
  const isMobile = window.innerWidth <= 768;
  win.className = "window" + (isMobile ? " maximized" : "");
  win.id = id;

  win.innerHTML = `
    <div class="title-bar" style="background: white; font-family: 'Segoe UI', sans-serif;">
      <span class="window-title">${name}</span>
      <div class="window-controls">
        <button class="minimize" style="background: none; border: none;"><img src="assets/minimize.png" alt="minimize"></button>
        <button class="maximize" style="background: none; border: none;"><img src="assets/maximize.png" alt="maximize"></button>
        <button class="close" style="background: none; border: none;"><img src="assets/close.png" alt="close"></button>
      </div>
    </div>
    <div class="window-body">
      ${type === "doc"
        ? `<iframe src="${content}" frameborder="0"></iframe>`
        : `<div class="folder-contents" id="${id}_contents"></div>`}
    </div>
  `;

  container.appendChild(win);
  requestAnimationFrame(() => win.classList.add("visible"));


  if (type === "folder") {
    fetch("files.json")
      .then((res) => res.json())
      .then((structure) => {
        renderFolderContents(content, structure, `${id}_contents`);
      });
  }
}

function renderFolderContents(path, structure, containerId) {
  const container = document.getElementById(containerId);
  structure[path]?.forEach((item) => {
    const icon = document.createElement("div");
    icon.className = "icon";
    icon.onclick = () => handleClick(item);

    const img = document.createElement("img");
    img.src = getIcon(item);
    const label = document.createElement("span");
    label.textContent = item.name.replace(/\.txt$/, "");

    icon.appendChild(img);
    icon.appendChild(label);
    container.appendChild(icon);
  });
}

function closeWindow(id) {
  const win = document.getElementById(id);
  if (win) {
    win.classList.remove("visible");
    setTimeout(() => win.remove(), 400); // Match transition duration
  }
}

function updateClock() {
  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const date = now.toLocaleDateString();
  document.getElementById("clock").textContent = `${time}\n${date}`;
}

function showFakePopup() {
  alert("Why would you need to access applications? We are literally in a fake desktop. What could even run in this thing..?");
}

function showUACModal(item) {
  document.getElementById("external-link-modal").classList.remove("hidden");
  const dest = document.getElementById("link-destination");
  dest.textContent = item.path;
  const modal = document.getElementById("modal-box");
  modal.style.width = Math.min(500, item.path.length * 8 + 200) + "px";
}

function closeModal() {
  document.getElementById("external-link-modal").classList.add("hidden");
  currentLink = null;
}

function proceedToLink() {
  if (currentLink) window.open(currentLink, '_blank');
  closeModal();
}

// Drag logic

document.addEventListener("mousedown", function (e) {
  const titleBar = e.target.closest(".title-bar");
  const win = e.target.closest(".window");
  if (!titleBar || win.classList.contains("maximized")) return;

  let offsetX = e.clientX - win.offsetLeft;
  let offsetY = e.clientY - win.offsetTop;

  function move(e) {
    win.style.left = e.clientX - offsetX + "px";
    win.style.top = e.clientY - offsetY + "px";
  }

  function stop() {
    document.removeEventListener("mousemove", move);
    document.removeEventListener("mouseup", stop);
  }

  document.addEventListener("mousemove", move);
  document.addEventListener("mouseup", stop);
});

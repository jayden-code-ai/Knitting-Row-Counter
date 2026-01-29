const STORAGE_KEY = "knit_projects_v1";

const homeView = document.getElementById("home-view");
const countView = document.getElementById("count-view");
const projectList = document.getElementById("project-list");
const addFab = document.getElementById("add-project-fab");
const addModal = document.getElementById("add-modal");
const settingsModal = document.getElementById("settings-modal");
const backdrop = document.getElementById("modal-backdrop");
const addForm = document.getElementById("add-form");
const settingsForm = document.getElementById("settings-form");
const addStepValue = document.getElementById("add-step-value");
const settingsStepValue = document.getElementById("settings-step-value");

const countTitle = document.getElementById("count-project-title");
const rowValue = document.getElementById("row-value");
const setValue = document.getElementById("set-value");
const setTarget = document.getElementById("set-target");

const tapInc = document.getElementById("tap-inc");
const tapDec = document.getElementById("tap-dec");
const backHome = document.getElementById("back-home");
const homeButton = document.getElementById("home-button");
const resetCount = document.getElementById("reset-count");
const editSettings = document.getElementById("edit-settings");
const addRefPreview = document.getElementById("add-ref-preview");
const addDonePreview = document.getElementById("add-done-preview");
const addRefImg = document.getElementById("add-ref-img");
const addDoneImg = document.getElementById("add-done-img");
const settingsRefPreview = document.getElementById("settings-ref-preview");
const settingsDonePreview = document.getElementById("settings-done-preview");
const settingsRefImg = document.getElementById("settings-ref-img");
const settingsDoneImg = document.getElementById("settings-done-img");

let projects = loadProjects();
let activeId = null;
let addImages = { ref: null, done: null };
let settingsImages = { ref: null, done: null };

const STATUS_CLASS = {
  진행중: "status--active",
  보류중: "status--paused",
  완료함: "status--done",
};

function loadProjects() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveProjects() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

function clampInt(value, min, max) {
  const num = Number.parseInt(value, 10);
  if (Number.isNaN(num)) return min;
  if (num < min) return min;
  if (max !== undefined && num > max) return max;
  return num;
}

function readFileAsDataUrl(file, callback) {
  const reader = new FileReader();
  reader.onload = () => callback(reader.result);
  reader.readAsDataURL(file);
}

function setPreview(previewEl, imgEl, dataUrl) {
  if (dataUrl) {
    previewEl.classList.add("has-image");
    imgEl.src = dataUrl;
  } else {
    previewEl.classList.remove("has-image");
    imgEl.removeAttribute("src");
  }
}

function computeSetRow(totalRows, rowsPerSet) {
  const rows = Math.max(1, rowsPerSet);
  const setCount = Math.floor(totalRows / rows);
  const rowInSet = totalRows % rows;
  const rowDisplay = totalRows > 0 && rowInSet === 0 ? rows : rowInSet;
  return { setCount, rowDisplay };
}

function formatTime(ts) {
  if (!ts) return "방금";
  const diff = Date.now() - ts;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "방금";
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  return `${days}일 전`;
}

function showView(view) {
  if (view === "home") {
    homeView.classList.add("is-active");
    countView.classList.remove("is-active");
  } else {
    homeView.classList.remove("is-active");
    countView.classList.add("is-active");
  }
}

function renderProjects() {
  projectList.innerHTML = "";
  let needsSave = false;
  if (!projects.length) {
    const empty = document.createElement("div");
    empty.textContent = "프로젝트가 없습니다. 아래 버튼으로 추가해주세요.";
    empty.style.color = "var(--muted)";
    projectList.appendChild(empty);
    return;
  }

  projects.forEach((project) => {
    if (!project.status) {
      project.status = "진행중";
      needsSave = true;
    }
    const { setCount, rowDisplay } = computeSetRow(
      project.count,
      project.rowsPerSet
    );

    const card = document.createElement("div");
    card.className = "project-card";

    const header = document.createElement("div");
    header.className = "project-header";
    const left = document.createElement("div");
    left.innerHTML = `
        <div class="project-title">${project.name}</div>
        <div class="project-meta">마지막 기록 ${formatTime(project.updatedAt)}</div>
      `;

    const right = document.createElement("div");
    right.className = "project-header-right";
    const statusPill = document.createElement("div");
    const statusClass = STATUS_CLASS[project.status] || "status--active";
    statusPill.className = `project-status ${statusClass}`;
    statusPill.textContent = project.status;
    right.append(statusPill);
    header.append(left, right);

    const stats = document.createElement("div");
    stats.className = "project-stats";
    stats.innerHTML = `
      <div class="stat-block">
        <span class="stat-label">단수</span>
        <span class="stat-value">${rowDisplay}</span>
      </div>
      <div class="divider" style="width:1px;height:48px;background:var(--border);"></div>
      <div class="stat-block" style="align-items:flex-end;">
        <span class="stat-label">세트</span>
        <span class="set-value">${setCount} <span style="color:var(--muted);font-size:12px;">/ ${project.targetSets || "-"}</span></span>
      </div>
    `;

    const gallery = document.createElement("div");
    gallery.className = "project-gallery";
    if (project.refImage) {
      const img = document.createElement("img");
      img.src = project.refImage;
      img.alt = "레퍼런스";
      img.loading = "lazy";
      gallery.appendChild(img);
    }
    if (project.doneImage) {
      const img = document.createElement("img");
      img.src = project.doneImage;
      img.alt = "완료";
      img.loading = "lazy";
      gallery.appendChild(img);
    }

    const incrementBtn = document.createElement("button");
    incrementBtn.className = "increment-btn";
    incrementBtn.innerHTML = `<span class="material-symbols-outlined">add_circle</span> 단수 증가`;
    incrementBtn.addEventListener("click", () => {
      project.count += project.step;
      project.updatedAt = Date.now();
      saveProjects();
      renderProjects();
    });

    const actions = document.createElement("div");
    actions.className = "project-actions";
    const openBtn = document.createElement("button");
    openBtn.className = "action-pill";
    openBtn.textContent = "열기";
    openBtn.addEventListener("click", () => openProject(project.id));

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "action-pill";
    deleteBtn.textContent = "삭제";
    deleteBtn.addEventListener("click", () => deleteProject(project.id));

    actions.append(openBtn, deleteBtn);

    if (gallery.children.length) {
      card.append(header, stats, gallery, incrementBtn, actions);
    } else {
      card.append(header, stats, incrementBtn, actions);
    }
    projectList.appendChild(card);
  });

  if (needsSave) saveProjects();
}

function openProject(id) {
  activeId = id;
  updateCountView();
  showView("count");
}

function deleteProject(id) {
  if (!confirm("프로젝트를 삭제할까요?")) return;
  projects = projects.filter((p) => p.id !== id);
  saveProjects();
  renderProjects();
}

function updateCountView() {
  const project = projects.find((p) => p.id === activeId);
  if (!project) return;

  const { setCount, rowDisplay } = computeSetRow(
    project.count,
    project.rowsPerSet
  );

  countTitle.textContent = project.name;
  rowValue.textContent = rowDisplay;
  setValue.textContent = setCount;
  setTarget.textContent = project.targetSets ? `/ ${project.targetSets}` : "/ -";

  settingsForm.status.value = project.status || "진행중";
  settingsForm.rowsPerSet.value = project.rowsPerSet;
  settingsForm.targetSets.value = project.targetSets || 0;
  settingsForm.step.value = project.step;
  settingsForm.memo.value = project.memo || "";
  settingsStepValue.textContent = project.step;

  settingsImages.ref = project.refImage || null;
  settingsImages.done = project.doneImage || null;
  setPreview(settingsRefPreview, settingsRefImg, settingsImages.ref);
  setPreview(settingsDonePreview, settingsDoneImg, settingsImages.done);
}

function handleTap(delta) {
  const project = projects.find((p) => p.id === activeId);
  if (!project) return;
  project.count = Math.max(0, project.count + delta);
  project.updatedAt = Date.now();
  saveProjects();
  updateCountView();
  renderProjects();
}

function openModal(modal) {
  modal.classList.add("is-open");
  backdrop.classList.add("is-open");
}

function closeModal(modal) {
  modal.classList.remove("is-open");
  backdrop.classList.remove("is-open");
}

addFab.addEventListener("click", () => openModal(addModal));

backdrop.addEventListener("click", () => {
  closeModal(addModal);
  closeModal(settingsModal);
});

document.querySelectorAll("[data-close]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const id = btn.getAttribute("data-close");
    closeModal(document.getElementById(id));
  });
});

const addRefInput = addForm.querySelector("input[name='refImage']");
const addDoneInput = addForm.querySelector("input[name='doneImage']");
const settingsRefInput = settingsForm.querySelector("input[name='refImage']");
const settingsDoneInput = settingsForm.querySelector("input[name='doneImage']");

addRefInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;
  readFileAsDataUrl(file, (dataUrl) => {
    addImages.ref = dataUrl;
    setPreview(addRefPreview, addRefImg, dataUrl);
  });
});

addDoneInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;
  readFileAsDataUrl(file, (dataUrl) => {
    addImages.done = dataUrl;
    setPreview(addDonePreview, addDoneImg, dataUrl);
  });
});

settingsRefInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;
  readFileAsDataUrl(file, (dataUrl) => {
    settingsImages.ref = dataUrl;
    setPreview(settingsRefPreview, settingsRefImg, dataUrl);
  });
});

settingsDoneInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;
  readFileAsDataUrl(file, (dataUrl) => {
    settingsImages.done = dataUrl;
    setPreview(settingsDonePreview, settingsDoneImg, dataUrl);
  });
});

document.querySelectorAll(".image-clear").forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.clear;
    if (target === "add-ref") {
      addImages.ref = null;
      addRefInput.value = "";
      setPreview(addRefPreview, addRefImg, null);
    }
    if (target === "add-done") {
      addImages.done = null;
      addDoneInput.value = "";
      setPreview(addDonePreview, addDoneImg, null);
    }
    if (target === "settings-ref") {
      settingsImages.ref = null;
      settingsRefInput.value = "";
      setPreview(settingsRefPreview, settingsRefImg, null);
    }
    if (target === "settings-done") {
      settingsImages.done = null;
      settingsDoneInput.value = "";
      setPreview(settingsDonePreview, settingsDoneImg, null);
    }
  });
});

addForm.step.addEventListener("input", (event) => {
  addStepValue.textContent = event.target.value;
});

settingsForm.step.addEventListener("input", (event) => {
  settingsStepValue.textContent = event.target.value;
});

addForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(addForm);
  const name = formData.get("name").trim();
  if (!name) return;

  const project = {
    id: crypto.randomUUID(),
    name,
    count: 0,
    status: formData.get("status") || "진행중",
    rowsPerSet: clampInt(formData.get("rowsPerSet"), 1, 999),
    targetSets: clampInt(formData.get("targetSets"), 0, 999),
    step: clampInt(formData.get("step"), 1, 20),
    memo: "",
    refImage: addImages.ref,
    doneImage: addImages.done,
    updatedAt: Date.now(),
  };

  projects.unshift(project);
  saveProjects();
  addForm.reset();
  addStepValue.textContent = "1";
  addRefInput.value = "";
  addDoneInput.value = "";
  addImages = { ref: null, done: null };
  setPreview(addRefPreview, addRefImg, null);
  setPreview(addDonePreview, addDoneImg, null);
  closeModal(addModal);
  renderProjects();
});

settingsForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const project = projects.find((p) => p.id === activeId);
  if (!project) return;
  const formData = new FormData(settingsForm);
  project.status = formData.get("status") || "진행중";
  project.rowsPerSet = clampInt(formData.get("rowsPerSet"), 1, 999);
  project.targetSets = clampInt(formData.get("targetSets"), 0, 999);
  project.step = clampInt(formData.get("step"), 1, 20);
  project.memo = formData.get("memo").trim();
  project.refImage = settingsImages.ref;
  project.doneImage = settingsImages.done;
  project.updatedAt = Date.now();
  saveProjects();
  closeModal(settingsModal);
  updateCountView();
  renderProjects();
});

// reset handled below

editSettings.addEventListener("click", () => openModal(settingsModal));

backHome.addEventListener("click", () => {
  activeId = null;
  showView("home");
});

homeButton.addEventListener("click", () => {
  activeId = null;
  showView("home");
});

tapInc.addEventListener("click", () => {
  const project = projects.find((p) => p.id === activeId);
  if (!project) return;
  handleTap(project.step);
});

tapDec.addEventListener("click", () => {
  const project = projects.find((p) => p.id === activeId);
  if (!project) return;
  handleTap(-project.step);
});

function resetCountHandler() {
  const project = projects.find((p) => p.id === activeId);
  if (!project) return;
  project.count = 0;
  project.updatedAt = Date.now();
  saveProjects();
  updateCountView();
  renderProjects();
}

resetCount.addEventListener("click", resetCountHandler);

renderProjects();

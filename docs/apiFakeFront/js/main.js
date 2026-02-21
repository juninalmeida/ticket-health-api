import { createActions } from "./app/actions.js";
import { initialState } from "./app/initialState.js";
import { createStore } from "./app/store.js";
import { ticketsRepoLocal } from "./libs/ticketsRepoLocal.js";
import { renderApp } from "./render/renderApp.js";
import { createBackgroundGeometry } from "./ui/backgroundAnimated.js";
import { createModals } from "./ui/modals.js";
import { runStartupLoader } from "./ui/startupLoader.js";
import { createToast } from "./ui/toast.js";
import { formatDashboardDate } from "./utils/date.js";

const SEARCH_DEBOUNCE_MS = 150;

function debounce(callback, waitMs) {
  let timeoutId = null;

  return (value) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      callback(value);
    }, waitMs);
  };
}

function setCurrentDate() {
  const dateEl = document.getElementById("current-date");

  if (!dateEl) {
    return;
  }

  dateEl.textContent = formatDashboardDate();
}

function syncStorageStatus(status) {
  const statusEl = document.getElementById("api-status");
  const textEl = document.getElementById("api-status-text");

  if (!statusEl || !textEl) {
    return;
  }

  if (status.mode === "persistent") {
    statusEl.dataset.mode = "persistent";
    textEl.textContent = "LocalStorage ativo";
    return;
  }

  statusEl.dataset.mode = "volatile";

  if (status.issue === "quota_exceeded") {
    textEl.textContent = "Sessão temporária (quota)";
    return;
  }

  if (status.issue === "storage_corrupted") {
    textEl.textContent = "Sessão temporária (recuperada)";
    return;
  }

  textEl.textContent = "Sessão temporária";
}

const store = createStore(initialState);
const modals = createModals();
const toast = createToast();

const actions = createActions({
  store,
  repo: ticketsRepoLocal,
  modals,
  toast,
  syncStorageStatus,
  confirmAction: (message) => window.confirm(message),
});

store.subscribe((state) => {
  renderApp(state);
});

const searchInput = document.getElementById("search-input");
const ticketForm = document.getElementById("ticket-form");
const closeForm = document.getElementById("close-form");

const onSearch = debounce((value) => {
  actions.setSearch(value);
}, SEARCH_DEBOUNCE_MS);

searchInput?.addEventListener("input", (event) => {
  onSearch(event.target.value);
});

document.addEventListener("click", (event) => {
  const trigger = event.target.closest("[data-action]");

  if (!trigger) {
    return;
  }

  const { action } = trigger.dataset;

  if (action === "set-filter") {
    actions.setFilter(trigger.dataset.filter);
    return;
  }

  if (action === "open-create") {
    actions.openCreateModal();
    return;
  }

  if (action === "open-edit") {
    actions.openEditModal(trigger.dataset.id);
    return;
  }

  if (action === "open-close") {
    actions.openCloseModal(trigger.dataset.id);
    return;
  }

  if (action === "delete-ticket") {
    actions.deleteTicket(trigger.dataset.id);
    return;
  }

  if (action === "close-modal") {
    actions.closeModal(trigger.dataset.modal);
    return;
  }

  if (action === "reset-seed") {
    actions.resetSeed();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") {
    return;
  }

  actions.closeModalFromEscape();
});

ticketForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  actions.submitTicketForm({
    id: document.getElementById("form-id")?.value,
    equipment: document.getElementById("form-equipment")?.value,
    userName: document.getElementById("form-user")?.value,
    description: document.getElementById("form-desc")?.value,
  });
});

closeForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  actions.submitCloseForm({
    id: document.getElementById("close-id")?.value,
    solution: document.getElementById("close-solution")?.value,
  });
});

async function init() {
  const loaderPromise = runStartupLoader(1500);
  createBackgroundGeometry();
  setCurrentDate();
  renderApp(store.getState());
  const bootstrapPromise = actions.bootstrap();
  await loaderPromise;
  await bootstrapPromise;
}

init();

const ticketList = document.getElementById("ticket-list");

ticketList.addEventListener("mousemove", (event) => {
  const card = event.target.closest(".ticket-card");
  if (!card) return;

  const rect = card.getBoundingClientRect();

  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  card.style.setProperty("--mouse-x", `${x}px`);
  card.style.setProperty("--mouse-y", `${y}px`);
});

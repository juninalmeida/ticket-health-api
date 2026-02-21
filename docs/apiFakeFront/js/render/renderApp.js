import { ticketCardNode } from "./templates.js";

const FILTER_TAB_IDS = [
  { id: "tab-open", filter: "open" },
  { id: "tab-closed", filter: "closed" },
];

function getVisibleTickets(state) {
  const term = state.search;

  return state.tickets.filter((ticket) => {
    if (ticket.status !== state.filter) {
      return false;
    }

    if (!term) {
      return true;
    }

    const haystack =
      `${ticket.equipment} ${ticket.description} ${ticket.userName}`.toLowerCase();
    return haystack.includes(term);
  });
}

function updateFilterTabs(filter) {
  FILTER_TAB_IDS.forEach(({ id, filter: current }) => {
    const tab = document.getElementById(id);

    if (!tab) {
      return;
    }

    const selected = current === filter;
    tab.setAttribute("aria-selected", String(selected));
  });
}

export function renderApp(state) {
  const openEl = document.getElementById("stat-open");
  const closedEl = document.getElementById("stat-closed");
  const openProgress = document.getElementById("stat-open-progress");
  const closedProgress = document.getElementById("stat-closed-progress");

  const listEl = document.getElementById("ticket-list");
  const emptyEl = document.getElementById("empty-state");

  const openCount = state.tickets.filter(
    (ticket) => ticket.status === "open",
  ).length;
  const closedCount = state.tickets.filter(
    (ticket) => ticket.status === "closed",
  ).length;
  const total = state.tickets.length || 1;

  openEl.textContent = String(openCount).padStart(2, "0");
  closedEl.textContent = String(closedCount).padStart(2, "0");

  openProgress.style.width = `${Math.round((openCount / total) * 100)}%`;
  closedProgress.style.width = `${Math.round((closedCount / total) * 100)}%`;

  updateFilterTabs(state.filter);

  const visibleTickets = getVisibleTickets(state);
  const fragment = document.createDocumentFragment();

  visibleTickets.forEach((ticket) => {
    fragment.append(ticketCardNode(ticket));
  });

  listEl.replaceChildren(fragment);

  const hasTickets = visibleTickets.length > 0;
  listEl.hidden = !hasTickets;
  emptyEl.hidden = hasTickets;
}

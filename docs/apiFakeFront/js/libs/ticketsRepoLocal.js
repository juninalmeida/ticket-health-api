const STORAGE_KEY = "ticketHealth:tickets:v2";
const LEGACY_KEYS = ["ticketHealth:tickets:v1"];

let storageMode = "persistent";
let storageIssue = null;
let memoryTickets = null;
let initialized = false;

const storage = getStorage();

if (!storage) {
  storageMode = "volatile";
  storageIssue = "storage_unavailable";
}

function getStorage() {
  try {
    if (!globalThis.localStorage) {
      return null;
    }

    const probe = "__ticket_health_probe__";
    globalThis.localStorage.setItem(probe, "1");
    globalThis.localStorage.removeItem(probe);

    return globalThis.localStorage;
  } catch {
    return null;
  }
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function nowISO() {
  return new Date().toISOString();
}

function isQuotaError(error) {
  if (!error) {
    return false;
  }

  return (
    error.name === "QuotaExceededError" ||
    error.name === "NS_ERROR_DOM_QUOTA_REACHED" ||
    error.code === 22 ||
    error.code === 1014
  );
}

function makeId() {
  const cryptoObj = globalThis.crypto;

  if (cryptoObj && typeof cryptoObj.randomUUID === "function") {
    return `t_${cryptoObj.randomUUID()}`;
  }

  return `t_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeText(value, fallback = "") {
  return String(value ?? fallback)
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeDate(value, fallback) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return fallback;
  }

  return date.toISOString();
}

function normalizeTicket(raw) {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const fallbackDate = nowISO();
  const status = raw.status === "closed" ? "closed" : "open";
  const equipment = normalizeText(raw.equipment, "Equipamento não informado");
  const description = normalizeText(raw.description, "Sem descrição.");

  const userName = normalizeText(raw.user_name);
  const createdAt = normalizeDate(raw.created_at, fallbackDate);

  let solution = normalizeText(raw.solution);
  let closedAt = raw.updated_at ?? null;

  if (status === "closed") {
    solution = solution || "Solução não registrada.";
    closedAt = normalizeDate(closedAt ?? fallbackDate, fallbackDate);
  } else {
    solution = null;
    closedAt = null;
  }

  return {
    id: normalizeText(raw.id) || makeId(),
    equipment,
    userName,
    description,
    status,
    solution,
    createdAt,
    closedAt,
  };
}

function normalizeTickets(rawList) {
  if (!Array.isArray(rawList)) {
    return [];
  }

  const seen = new Set();
  const next = [];

  rawList.forEach((item) => {
    const ticket = normalizeTicket(item);

    if (!ticket || seen.has(ticket.id)) {
      return;
    }

    seen.add(ticket.id);
    next.push(ticket);
  });

  return next;
}

function buildSeedTickets() {
  const now = new Date();
  const before = new Date(now.getTime() - 1000 * 60 * 48);

  return normalizeTickets([
    {
      id: makeId(),
      equipment: "Monitor Dell 24\" - Setor Administrativo",
      userName: "Fernanda",
      description: "Tela apagada e sem sinal de vídeo após queda de energia elétrica.",
      status: "open",
      solution: null,
      createdAt: before.toISOString(),
      closedAt: null,
    },
    {
      id: makeId(),
      equipment: "Mouse sem fio e Teclado - RH",
      userName: "Carlos",
      description:
        "Mouse com cliques falhando e teclado com algumas teclas travando.",
      status: "closed",
      solution: "Substituição do kit de periféricos por um novo.",
      createdAt: new Date(now.getTime() - 1000 * 60 * 120).toISOString(),
      closedAt: new Date(now.getTime() - 1000 * 60 * 35).toISOString(),
    },
    {
      id: makeId(),
      equipment: "Computador Desktop - Recepção 01",
      userName: "Ana Maria",
      description: "Lentidão extrema e travamentos constantes ao utilizar o sistema.",
      status: "open",
      solution: null,
      createdAt: new Date(now.getTime() - 1000 * 60 * 15).toISOString(),
      closedAt: null,
    },
  ]);
}

function downgradeToVolatile(error, fallbackTickets = null) {
  storageMode = "volatile";
  storageIssue = isQuotaError(error) ? "quota_exceeded" : "storage_unavailable";

  if (fallbackTickets) {
    memoryTickets = clone(fallbackTickets);
  }
}

function parseTicketsFromRaw(raw) {
  if (typeof raw !== "string" || raw.trim() === "") {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    return normalizeTickets(parsed);
  } catch {
    storageIssue = "storage_corrupted";
    return null;
  }
}

function readFromKey(key) {
  if (!storage) {
    return null;
  }

  try {
    const raw = storage.getItem(key);

    if (raw === null) {
      return null;
    }

    return parseTicketsFromRaw(raw);
  } catch (error) {
    downgradeToVolatile(error);
    return null;
  }
}

function writeToStorage(tickets) {
  if (!storage || storageMode !== "persistent") {
    memoryTickets = clone(tickets);
    return;
  }

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(tickets));
    storageIssue = null;
  } catch (error) {
    downgradeToVolatile(error, tickets);
  }
}

function persist(nextTickets) {
  const normalized = normalizeTickets(nextTickets);
  memoryTickets = clone(normalized);
  writeToStorage(normalized);
  return normalized;
}

function migrateFromLegacy() {
  if (!storage) {
    return null;
  }

  for (const key of LEGACY_KEYS) {
    const legacyTickets = readFromKey(key);

    if (!legacyTickets) {
      continue;
    }

    try {
      storage.removeItem(key);
    } catch {
      // no-op
    }

    return legacyTickets;
  }

  return null;
}

function initializeIfNeeded() {
  if (initialized) {
    return;
  }

  initialized = true;

  if (storageMode === "persistent" && storage) {
    let tickets = readFromKey(STORAGE_KEY);

    if (tickets === null) {
      tickets = migrateFromLegacy();
    }

    if (tickets === null) {
      tickets = buildSeedTickets();
    }

    persist(tickets);
    return;
  }

  if (!memoryTickets) {
    memoryTickets = buildSeedTickets();
  }
}

function getWorkingTickets() {
  initializeIfNeeded();

  if (storageMode === "persistent" && storage) {
    const fromStorage = readFromKey(STORAGE_KEY);

    if (fromStorage !== null) {
      memoryTickets = clone(fromStorage);
      return fromStorage;
    }

    if (storageIssue === "storage_corrupted") {
      const fallback = buildSeedTickets();
      persist(fallback);
      return fallback;
    }
  }

  return clone(memoryTickets ?? []);
}

function touchStorageIssue(issue) {
  if (!issue || storageIssue) {
    return;
  }

  storageIssue = issue;
}

export const ticketsRepoLocal = {
  async list() {
    return clone(getWorkingTickets());
  },

  async create(draft) {
    const tickets = getWorkingTickets();
    const now = nowISO();

    const nextTicket = normalizeTicket({
      id: makeId(),
      equipment: draft.equipment,
      user_name: draft.userName,
      description: draft.description,
      status: "open",
      solution: null,
      created_at: now,
      updated_at: now,
    });

    const nextTickets = [nextTicket, ...tickets];

    persist(nextTickets);
    return clone(nextTicket);
  },

  async update(id, payload) {
    const ticketId = normalizeText(id);
    if (!ticketId) return null;

    const tickets = getWorkingTickets();
    let updatedTicket = null;

    const nextTickets = tickets.map((ticket) => {
      if (ticket.id !== ticketId) return ticket;

      updatedTicket = normalizeTicket({
        ...ticket,
        equipment: payload.equipment || ticket.equipment,
        description: payload.description || ticket.description,
        user_name: payload.userName || ticket.userName,
        status: payload.status || ticket.status,
        solution: payload.solution || ticket.solution,
        updated_at: nowISO(),
      });

      return updatedTicket;
    });

    if (!updatedTicket) return null;

    persist(nextTickets);
    return clone(updatedTicket);
  },

  async close(id, solution) {
    const ticketId = normalizeText(id);
    const nextSolution = normalizeText(solution);

    if (!ticketId || !nextSolution) return null;

    return this.update(ticketId, {
      status: "closed",
      solution: nextSolution,
    });
  },

  async remove(id) {
    const ticketId = normalizeText(id);

    if (!ticketId) {
      return false;
    }

    const tickets = getWorkingTickets();
    const nextTickets = tickets.filter((ticket) => ticket.id !== ticketId);

    if (nextTickets.length === tickets.length) {
      return false;
    }

    persist(nextTickets);
    return true;
  },

  async resetSeed() {
    const seed = buildSeedTickets();
    persist(seed);
  },

  getStorageStatus() {
    if (storageMode === "persistent" && !storageIssue) {
      return {
        mode: "persistent",
        issue: null,
      };
    }

    if (storageMode === "persistent" && storageIssue) {
      touchStorageIssue("storage_corrupted");
      return {
        mode: "volatile",
        issue: storageIssue,
      };
    }

    return {
      mode: "volatile",
      issue: storageIssue ?? "storage_unavailable",
    };
  },
};

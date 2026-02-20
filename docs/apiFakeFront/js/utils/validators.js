const FILTERS = new Set(["open", "closed"]);

function cleanText(value) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeSearchTerm(value) {
  return cleanText(value).toLowerCase();
}

export function isValidFilter(value) {
  return FILTERS.has(value);
}

export function validateTicketDraft(raw) {
  const equipment = cleanText(raw.equipment);
  const userName = cleanText(raw.userName);
  const description = cleanText(raw.description);

  if (equipment.length < 3) {
    return {
      ok: false,
      error: "Informe equipamento/local com pelo menos 3 caracteres.",
    };
  }

  if (equipment.length > 120) {
    return {
      ok: false,
      error: "Equipamento/local pode ter no máximo 120 caracteres.",
    };
  }

  if (description.length < 5) {
    return {
      ok: false,
      error: "A descrição precisa ter pelo menos 5 caracteres.",
    };
  }

  if (description.length > 500) {
    return {
      ok: false,
      error: "A descrição pode ter no máximo 500 caracteres.",
    };
  }

  if (userName.length > 80) {
    return {
      ok: false,
      error: "Solicitante pode ter no máximo 80 caracteres.",
    };
  }

  return {
    ok: true,
    value: {
      equipment,
      userName,
      description,
    },
  };
}

export function validateCloseDraft(raw) {
  const id = cleanText(raw.id);
  const solution = cleanText(raw.solution);

  if (!id) {
    return {
      ok: false,
      error: "Chamado inválido para encerramento.",
    };
  }

  if (solution.length < 5) {
    return {
      ok: false,
      error: "A solução precisa ter pelo menos 5 caracteres.",
    };
  }

  if (solution.length > 500) {
    return {
      ok: false,
      error: "A solução pode ter no máximo 500 caracteres.",
    };
  }

  return {
    ok: true,
    value: {
      id,
      solution,
    },
  };
}

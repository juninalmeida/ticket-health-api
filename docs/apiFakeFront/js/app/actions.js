import {
  isValidFilter,
  normalizeSearchTerm,
  validateCloseDraft,
  validateTicketDraft,
} from "../utils/validators.js";

const STORAGE_ISSUE_MESSAGE = {
  storage_unavailable:
    "LocalStorage indisponível: os dados ficarão só nesta sessão.",
  quota_exceeded:
    "Limite do navegador atingido: os dados novos ficarão só nesta sessão.",
  storage_corrupted:
    "Dados locais corrompidos: o sistema restaurou a base de demonstração.",
};

function normalizeErrorMessage(error) {
  if (!error) {
    return "Falha inesperada ao processar a operação.";
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Falha inesperada ao processar a operação.";
}

export function createActions({
  store,
  repo,
  modals,
  toast,
  syncStorageStatus,
  confirmAction = () => true,
}) {
  let warnedIssue = null;

  function getState() {
    return store.getState();
  }

  function setState(updater) {
    store.setState(updater);
  }

  function findTicketById(id) {
    const ticketId = String(id ?? "").trim();
    return getState().tickets.find((ticket) => ticket.id === ticketId) ?? null;
  }

  function updateStatus(showIssueToast = true) {
    if (typeof repo.getStorageStatus !== "function") {
      syncStorageStatus({ mode: "persistent", issue: null });
      return;
    }

    const status = repo.getStorageStatus();
    syncStorageStatus(status);

    if (!showIssueToast || status.mode !== "volatile" || !status.issue) {
      return;
    }

    if (warnedIssue === status.issue) {
      return;
    }

    warnedIssue = status.issue;
    toast.warning(STORAGE_ISSUE_MESSAGE[status.issue] || STORAGE_ISSUE_MESSAGE.storage_unavailable);
  }

  async function refresh() {
    const tickets = await repo.list();

    setState((state) => ({
      ...state,
      tickets,
    }));

    updateStatus();
  }

  function closeModalState(modalId = null) {
    setState((state) => ({
      ...state,
      ui: {
        ...state.ui,
        modal: modalId,
        editingId: null,
        closingId: null,
      },
    }));
  }

  async function safeOperation(operation, fallbackMessage) {
    try {
      await operation();
    } catch (error) {
      toast.error(normalizeErrorMessage(error) || fallbackMessage);
      updateStatus();
    }
  }

  return {
    async bootstrap() {
      await safeOperation(async () => {
        await refresh();
      }, "Erro ao carregar os tickets.");
    },

    setFilter(filter) {
      if (!isValidFilter(filter)) {
        return;
      }

      setState((state) => ({
        ...state,
        filter,
      }));
    },

    setSearch(term) {
      setState((state) => ({
        ...state,
        search: normalizeSearchTerm(term),
      }));
    },

    openCreateModal() {
      modals.openCreate();

      setState((state) => ({
        ...state,
        ui: {
          ...state.ui,
          modal: "form",
          editingId: null,
          closingId: null,
        },
      }));
    },

    openEditModal(ticketId) {
      const ticket = findTicketById(ticketId);

      if (!ticket) {
        toast.warning("Chamado não encontrado para edição.");
        return;
      }

      modals.openEdit(ticket);

      setState((state) => ({
        ...state,
        ui: {
          ...state.ui,
          modal: "form",
          editingId: ticket.id,
          closingId: null,
        },
      }));
    },

    openCloseModal(ticketId) {
      const ticket = findTicketById(ticketId);

      if (!ticket) {
        toast.warning("Chamado não encontrado para encerramento.");
        return;
      }

      if (ticket.status === "closed") {
        toast.info("Este chamado já está encerrado.");
        return;
      }

      modals.openClose(ticket.id);

      setState((state) => ({
        ...state,
        ui: {
          ...state.ui,
          modal: "close",
          editingId: null,
          closingId: ticket.id,
        },
      }));
    },

    closeModal(modalId) {
      modals.close(modalId);
      closeModalState(null);
    },

    async submitTicketForm(formData) {
      const validated = validateTicketDraft(formData);

      if (!validated.ok) {
        toast.warning(validated.error);
        return;
      }

      await safeOperation(async () => {
        const editingId = String(formData.id ?? "").trim();

        if (editingId) {
          const updated = await repo.update(editingId, validated.value);

          if (!updated) {
            toast.warning("Chamado não encontrado para atualização.");
            return;
          }

          toast.success("Chamado atualizado com sucesso.");
        } else {
          await repo.create(validated.value);
          toast.success("Novo chamado criado com sucesso.");
        }

        modals.close("modal-form");
        closeModalState(null);
        await refresh();
      }, "Erro ao salvar chamado.");
    },

    async submitCloseForm(formData) {
      const validated = validateCloseDraft(formData);

      if (!validated.ok) {
        toast.warning(validated.error);
        return;
      }

      await safeOperation(async () => {
        const closed = await repo.close(validated.value.id, validated.value.solution);

        if (!closed) {
          toast.warning("Chamado não encontrado para encerramento.");
          return;
        }

        toast.success("Chamado encerrado com sucesso.");
        modals.close("modal-close");
        closeModalState(null);
        await refresh();
      }, "Erro ao encerrar chamado.");
    },

    async deleteTicket(ticketId) {
      const ticket = findTicketById(ticketId);

      if (!ticket) {
        toast.warning("Chamado não encontrado para remoção.");
        return;
      }

      const allowed = confirmAction("Remover este chamado permanentemente?");

      if (!allowed) {
        return;
      }

      await safeOperation(async () => {
        const removed = await repo.remove(ticket.id);

        if (!removed) {
          toast.warning("Chamado já foi removido.");
          return;
        }

        toast.info("Chamado removido.");
        await refresh();
      }, "Erro ao remover chamado.");
    },

    async resetSeed() {
      const allowed = confirmAction(
        "Restaurar dados demo? Isso substitui a lista atual de chamados.",
      );

      if (!allowed) {
        return;
      }

      await safeOperation(async () => {
        await repo.resetSeed();
        toast.info("Dados demo restaurados.");
        await refresh();
      }, "Erro ao restaurar os dados demo.");
    },

    closeModalFromEscape() {
      const { ui } = getState();

      if (ui.modal === "form") {
        this.closeModal("modal-form");
      }

      if (ui.modal === "close") {
        this.closeModal("modal-close");
      }
    },
  };
}

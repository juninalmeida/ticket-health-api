const MODAL_IDS = ["modal-form", "modal-close"];

function getModal(id) {
  return document.getElementById(id);
}

function updateBodyScrollLock() {
  const hasOpenModal = MODAL_IDS.some((id) => {
    const modal = getModal(id);
    return Boolean(modal && !modal.hidden);
  });

  document.body.classList.toggle("has-modal-open", hasOpenModal);
}

function setModalVisibility(id, isVisible) {
  const modal = getModal(id);

  if (!modal) {
    return;
  }

  modal.hidden = !isVisible;
  modal.setAttribute("aria-hidden", String(!isVisible));

  updateBodyScrollLock();
}

export function createModals() {
  const ticketForm = document.getElementById("ticket-form");
  const closeForm = document.getElementById("close-form");

  const titleEl = document.getElementById("modal-form-title");
  const hiddenIdField = document.getElementById("form-id");
  const equipmentField = document.getElementById("form-equipment");
  const userField = document.getElementById("form-user");
  const descField = document.getElementById("form-desc");
  const userNameWrapper = document.getElementById("field-user-name");
  const closeIdField = document.getElementById("close-id");
  const closeSolutionField = document.getElementById("close-solution");

  function openCreate() {
    titleEl.textContent = "Novo incidente";

    if (ticketForm) {
      ticketForm.reset();
    }

    hiddenIdField.value = "";

    if (userNameWrapper) {
      userNameWrapper.hidden = false;
    }

    setModalVisibility("modal-form", true);
    equipmentField?.focus();
  }

  function openEdit(ticket) {
    titleEl.textContent = "Editar incidente";

    if (ticketForm) {
      ticketForm.reset();
    }

    hiddenIdField.value = ticket.id;
    equipmentField.value = ticket.equipment;
    descField.value = ticket.description;
    userField.value = ticket.userName;

    if (userNameWrapper) {
      userNameWrapper.hidden = true;
    }

    setModalVisibility("modal-form", true);
    equipmentField?.focus();
  }

  function openClose(ticketId) {
    if (closeForm) {
      closeForm.reset();
    }

    closeIdField.value = ticketId;
    setModalVisibility("modal-close", true);
    closeSolutionField?.focus();
  }

  function close(id) {
    if (id) {
      setModalVisibility(id, false);
    } else {
      MODAL_IDS.forEach((modalId) => {
        setModalVisibility(modalId, false);
      });
    }

    if (id === "modal-form" || !id) {
      if (userNameWrapper) {
        userNameWrapper.hidden = false;
      }
    }
  }

  return {
    openCreate,
    openEdit,
    openClose,
    close,
  };
}

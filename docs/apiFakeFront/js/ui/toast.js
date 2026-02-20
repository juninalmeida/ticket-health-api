const ICON_BY_TYPE = {
  success: "✓",
  info: "i",
  warning: "!",
  error: "⚠",
};

export function createToast(containerId = "toast-container") {
  const container = document.getElementById(containerId);

  function show(message, type = "info") {
    if (!container) {
      return;
    }

    const toast = document.createElement("div");
    toast.className = `toast toast--${type}`;

    const icon = document.createElement("span");
    icon.className = "toast__icon";
    icon.textContent = ICON_BY_TYPE[type] ?? ICON_BY_TYPE.info;

    const text = document.createElement("p");
    text.className = "toast__text";
    text.textContent = message;

    toast.append(icon, text);
    container.append(toast);

    requestAnimationFrame(() => {
      toast.classList.add("is-visible");
    });

    if (container.childElementCount > 4) {
      container.firstElementChild?.remove();
    }

    setTimeout(() => {
      toast.classList.remove("is-visible");
      setTimeout(() => toast.remove(), 180);
    }, 3000);
  }

  return {
    show,
    success(message) {
      show(message, "success");
    },
    info(message) {
      show(message, "info");
    },
    warning(message) {
      show(message, "warning");
    },
    error(message) {
      show(message, "error");
    },
  };
}

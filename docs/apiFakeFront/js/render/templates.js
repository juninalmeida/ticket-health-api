import { formatTicketTimestamp } from "../utils/date.js";

function createActionButton({ label, action, id, className = "chip-btn" }) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className;
  button.dataset.action = action;
  button.dataset.id = id;
  button.textContent = label;
  return button;
}

export function ticketCardNode(ticket) {
  const article = document.createElement("article");
  article.className = "ticket-card surface-card fade-in";
  article.dataset.id = ticket.id;

  const head = document.createElement("header");
  head.className = "ticket-card__head";

  const status = document.createElement("div");
  status.className = "ticket-card__status";

  const dot = document.createElement("span");
  dot.className = `ticket-card__dot ticket-card__dot--${ticket.status}`;
  dot.ariaHidden = "true";

  const owner = document.createElement("span");
  owner.className = "ticket-card__owner";
  owner.textContent = ticket.userName || "Sistema";

  status.append(dot, owner);

  const deleteButton = createActionButton({
    label: "Excluir",
    action: "delete-ticket",
    id: ticket.id,
    className: "ticket-card__delete",
  });
  deleteButton.setAttribute("aria-label", "Excluir chamado");

  head.append(status, deleteButton);

  const title = document.createElement("h3");
  title.className = "ticket-card__title";
  title.textContent = ticket.equipment;

  const description = document.createElement("p");
  description.className = "ticket-card__description";
  description.textContent = ticket.description;

  const meta = document.createElement("p");
  meta.className = "ticket-card__meta";
  meta.textContent = `Criado em ${formatTicketTimestamp(ticket.createdAt)}`;

  article.append(head, title, description, meta);

  if (ticket.status === "open") {
    const footer = document.createElement("footer");
    footer.className = "ticket-card__footer";

    const editButton = createActionButton({
      label: "Editar",
      action: "open-edit",
      id: ticket.id,
    });

    const closeButton = createActionButton({
      label: "Resolver",
      action: "open-close",
      id: ticket.id,
      className: "chip-btn chip-btn--accent",
    });

    footer.append(editButton, closeButton);
    article.append(footer);

    return article;
  }

  const solutionBox = document.createElement("div");
  solutionBox.className = "solution-box";

  const solutionLabel = document.createElement("p");
  solutionLabel.className = "solution-box__label";
  solutionLabel.textContent = "Solução";

  const solutionText = document.createElement("p");
  solutionText.className = "solution-box__text";
  solutionText.textContent = ticket.solution || "Solução não registrada.";

  solutionBox.append(solutionLabel, solutionText);
  article.append(solutionBox);

  return article;
}

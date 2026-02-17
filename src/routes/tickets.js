import { create } from "../controllers/tickets/create.js"; 

export const tickets = [
  {
    method: "POST",
    path: "/tickets",
    controller: create,

  },
];

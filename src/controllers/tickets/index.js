export function index({ req, res, database }) {
  const tickets = database.select("tickets");

  return res.end(JSON.stringify(tickets));
}


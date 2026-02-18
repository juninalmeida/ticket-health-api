export function remove({ req, res, database }) {
  const { id } = req.params;

  database.delete("tickets", id);

  return res.end();
}

export function update({ req, res, database }) {
  const { id } = req.params;
  const { equipment, description } = req.body;

  database.update("tickets", id, {
    equipment,
    description,
    updated_at: new Date(),
  })

  return res.end();
}

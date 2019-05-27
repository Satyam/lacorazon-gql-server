export default {
  Query: {
    distribuidor: (parent, { id }, { db }) =>
      db.get('select * rom Distribuidores where id = ?', [id]),
    distribuidores: (parent, { offset = 0, limit }, { db }) =>
      db.all(
        limit
          ? 'select * from Distribuidores order by nombre limit $limit offset $offset'
          : 'select * from Distribuidores order by nombre',
        {
          $limit: limit,
          $offset: offset,
        }
      ),
  },
};

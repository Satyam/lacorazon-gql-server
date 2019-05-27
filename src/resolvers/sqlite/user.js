export default {
  Query: {
    user: (parent, { id }, { db }) =>
      db.get('select * from Users where id = ?', [id]),
    users: (parent, { offset = 0, limit }, { db }) =>
      limit
        ? db.all(
            'select * from Users order by nombre limit $limit offset $offset',
            {
              $limit: limit,
              $offset: offset,
            }
          )
        : db.all('select * from Users order by nombre'),
  },
  User: {
    ventas: (parent, { offset = 0, limit, last }, { db }) => {
      if (last) {
        return db
          .all(
            'select * from Ventas where vendedor = $vendedor order by fecha desc limit $last',
            {
              $vendedor: parent.id,
              $last: last,
            }
          )
          .then(data => data.reverse());
      }
      if (limit) {
        return db.all(
          'select * from Ventas where vendedor = $vendedor order by fecha limit $last offset $offset',
          {
            $vendedor: parent.id,
            $limit: limit,
            $offset: offset,
          }
        );
      }
      return db.all(
        'select * from Ventas where vendedor = $vendedor order by fecha',
        {
          $vendedor: parent.id,
        }
      );
    },
  },
};

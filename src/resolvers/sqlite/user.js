import cuid from 'cuid';

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
  Mutation: {
    createUser: (parent, { nombre, email }, { db }) => {
      const id = cuid();
      return db
        .run('insert into Users (id, nombre, email) values (?,?,?)', [
          id,
          nombre,
          email,
        ])
        .then(response => {
          console.log(
            'Insert lastID:',
            response.stmt.lastID,
            'changes:',
            response.stmt.changes
          );
          return {
            id,
            nombre,
            email,
          };
        });
    },
    updateUser: (parent, { id, nombre, email }, { db }) => {
      const items = [];
      if (typeof nombre !== 'undefined') items.push('nombre = $nombre');
      if (typeof email !== 'undefined') items.push('email = $email');
      return db
        .run(`update Users set ${items.join(',')}  where id = $id`, {
          $nombre: nombre,
          $email: email,
          $id: id,
        })
        .then(result => {
          if (result.stmt.changes !== 1)
            throw new Error(`User ${id} not found`);
          return db.get('select * from Users where id = ?', [id]);
        });
    },
    deleteUser: (parent, { id }, { db }) => {
      const u = db.get('select * from Users where id = ?', [id]);
      return db.run('delete from Users where id = ?', [id]).then(result => {
        if (result.stmt.changes !== 1) throw new Error(`User ${id} not found`);
        return u;
      });
    },
  },
  User: {
    ventas: (parent, { offset = 0, limit, last }, { db }) => {
      if (last) {
        return db
          .all(
            'select * from Ventas where vendedor = $vendedor order by fecha desc, id desc limit $last',
            {
              $vendedor: parent.id,
              $last: last,
            }
          )
          .then(data => data.reverse());
      }
      if (limit) {
        return db.all(
          'select * from Ventas where vendedor = $vendedor order by fecha, id limit $limit offset $offset',
          {
            $vendedor: parent.id,
            $limit: limit,
            $offset: offset,
          }
        );
      }
      return db.all(
        'select * from Ventas where vendedor = $vendedor order by fecha, id',
        {
          $vendedor: parent.id,
        }
      );
    },
  },
};

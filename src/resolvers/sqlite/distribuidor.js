import cuid from 'cuid';

export default {
  Query: {
    distribuidor: (parent, { id }, { db }) =>
      db.get('select * from Distribuidores where id = ?', [id]),
    distribuidores: (parent, { offset = 0, limit }, { db }) =>
      limit
        ? db.all(
            'select * from Distribuidores order by nombre limit $limit offset $offset',
            {
              $limit: limit,
              $offset: offset,
            }
          )
        : db.all('select * from Distribuidores order by nombre'),
  },
  Mutation: {
    createDistribuidor: (parent, { nombre, email }, { db }) => {
      const id = cuid();
      return db
        .run('insert into Distribuidores (id, nombre, email) values (?,?,?)', [
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
    updateDistribuidor: (parent, args, { db }) => {
      const { id, ...rest } = args;
      const ks = Object.keys(rest);
      const items = ks.map(k => `${k} = ?`);
      const vars = ks.map(k => rest[k]);
      return db
        .run(`update Distribuidores set ${items.join(',')}  where id = $id`, [
          ...vars,
          id,
        ])
        .then(result => {
          if (result.stmt.changes !== 1)
            throw new Error(`Distribuidor ${id} not found`);
          return db.get('select * from Distribuidores where id = ?', [id]);
        });
    },
    deleteDistribuidor: (parent, { id }, { db }) => {
      const u = db.get('select * from Distribuidores where id = ?', [id]);
      return db
        .run('delete from Distribuidores where id = ?', [id])
        .then(result => {
          if (result.stmt.changes !== 1)
            throw new Error(`Distribuidor ${id} not found`);
          return u;
        });
    },
  },
  Distribuidor: {
    consigna: (parent, { offset = 0, limit, last }, { db }) => {
      if (last) {
        return db
          .all(
            'select * from Consigna where distribuidor = $distribuidor order by fecha desc, id desc limit $last',
            {
              $distribuidor: parent.id,
              $last: last,
            }
          )
          .then(data => data.reverse());
      }
      if (limit) {
        return db.all(
          'select * from Consigna where distribuidor = $distribuidor order by fecha, id limit $limit offset $offset',
          {
            $distribuidor: parent.id,
            $limit: limit,
            $offset: offset,
          }
        );
      }
      return db.all(
        'select * from Consigna where distribuidor = $distribuidor order by fecha, id',
        {
          $distribuidor: parent.id,
        }
      );
    },
    existencias: (parent, args, { db }) =>
      db
        .get(
          `select 
            total(entregados) - total(vendidos) - total(devueltos) as existencias 
            from Consigna where distribuidor = $distribuidor`,
          {
            $distribuidor: parent.id,
          }
        )
        .then(row => row.existencias),
    entregados: (parent, args, { db }) =>
      db
        .get(
          `select total(entregados) as entregados
            from Consigna where distribuidor = $distribuidor`,
          {
            $distribuidor: parent.id,
          }
        )
        .then(row => row.entregados),
  },
};

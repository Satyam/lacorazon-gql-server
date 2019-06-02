import cuid from 'cuid';

export function getAllLimitOffset(table, { offset = 0, limit }, db) {
  if (limit) {
    return db.all(`select * from ${table} order by nombre limit ? offset ?`, [
      limit,
      offset,
    ]);
  }
  return db.all(`select * from ${table} order by nombre`);
}

export function getWithId(table, id, db) {
  return db.get(`select * from ${table} where id = ?`, [id]);
}

export function createWithId(table, args, db) {
  const id = cuid();
  const fields = Object.keys(args);
  const vars = fields.map(f => args[f]);
  return db
    .run(
      `insert into ${table} (id, ${fields.join(',')}) values (? ${',?'.repeat(
        fields.length
      )})`,
      [id, ...vars]
    )
    .then(response => {
      console.log(
        'Insert lastID:',
        response.stmt.lastID,
        'changes:',
        response.stmt.changes
      );
      return getWithId(table, id, db);
    });
}

export function updateWithId(table, args, db) {
  const { id, ...rest } = args;
  const fields = Object.keys(rest);
  const items = fields.map(f => `${f} = ?`);
  const vars = fields.map(f => rest[f]);
  return db
    .run(`update ${table}  set ${items.join(',')}  where id = ?`, [...vars, id])
    .then(result => {
      if (result.stmt.changes !== 1)
        throw new Error(`${id} not found in ${table}`);
      return getWithId(table, id, db);
    });
}

export function deleteWithId(table, id, db) {
  const u = getWithId(table, id, db);
  return db.run(`delete from ${table} where id = ?`, [id]).then(result => {
    if (result.stmt.changes !== 1)
      throw new Error(`${id} not found in ${table}`);
    return u;
  });
}
import cuid from 'cuid';
import { Database } from 'sqlite';
import { Fila } from '..'

export function getAllLimitOffset(table: string, { offset = 0, limit }: { offset?: number, limit?: number }, db: Database, fields?: string[]) {
  const f = fields ? fields.join(',') : '*';
  if (limit) {
    return db.all(
      `select ${f} from ${table} order by nombre limit ? offset ?`,
      [limit, offset]
    );
  }
  return db.all(`select * from ${table} order by nombre`);
}

export function getById(table: string, id: ID, db: Database, fields?: string[]) {
  const f = fields ? fields.join(',') : '*';
  return db.get(`select ${f} from ${table} where id = ?`, [id]);
}

export function createWithAutoId(table: string, args: Partial<Fila>, db: Database, outFields?: string[]) {
  const fields = Object.keys(args);
  const vars = fields.map((f) => args[f]);
  return db
    .run(
      `insert into ${table} (${fields.join(',')}) values (? ${',?'.repeat(
        fields.length - 1
      )})`,
      [...vars]
    )
    .then((response) => getById(table, response.lastID, db, outFields));
}

export function createWithCuid(table: string, args: Partial<Fila>, db: Database, outFields?: string[]) {
  const id = cuid();
  const fields = Object.keys(args);
  const vars = fields.map((f) => args[f]);
  return db
    .run(
      `insert into ${table} (id, ${fields.join(',')}) values (? ${',?'.repeat(
        fields.length
      )})`,
      [id, ...vars]
    )
    .then(() => getById(table, id, db, outFields));
}

export function updateById(table: string, args: Partial<Fila>, db: Database, outFields?: string[]) {
  const { id, ...rest } = args;
  const fields = Object.keys(rest);
  const items = fields.map((f) => `${f} = ?`);
  const vars = fields.map((f) => rest[f]);
  return db
    .run(`update ${table}  set ${items.join(',')}  where id = ?`, [...vars, id])
    .then((result) => {
      if (result.changes !== 1) throw new Error(`${id} not found in ${table}`);
      return getById(table, id, db, outFields);
    });
}

export function deleteById(table: string, id: ID, db: Database, outFields?: string[]) {
  return getById(table, id, db, outFields).then((u) =>
    db.run(`delete from ${table} where id = ?`, [id]).then((result) => {
      if (result.changes !== 1) throw new Error(`${id} not found in ${table}`);
      return u;
    })
  );
}

// export function delay(ms: number) {
//   return (value) =>
//     new Promise((resolve) => {
//       setTimeout(() => resolve(value), ms);
//     });
// }

import cuid from 'cuid';
import { Database } from 'sqlite';
import { Fila } from '..'

export function getAllLimitOffset(nombreTabla: string, { offset = 0, limit }: { offset?: number, limit?: number }, db: Database, fields?: string[]) {
  const f = fields ? fields.join(',') : '*';
  if (limit) {
    return db.all(
      `select ${f} from ${nombreTabla} order by nombre limit ? offset ?`,
      [limit, offset]
    );
  }
  return db.all(`select * from ${nombreTabla} order by nombre`);
}

export function getById(nombreTabla: string, id: ID, db: Database, fields?: string[]) {
  const f = fields ? fields.join(',') : '*';
  return db.get(`select ${f} from ${nombreTabla} where id = ?`, [id]);
}

export function createWithAutoId(nombreTabla: string, fila: Partial<Fila>, db: Database, camposSalida?: string[]) {
  const fields = Object.keys(fila);
  const vars = fields.map((f: keyof Fila) => fila[f]);
  return db
    .run(
      `insert into ${nombreTabla} (${fields.join(',')}) values (? ${',?'.repeat(
        fields.length - 1
      )})`,
      [...vars]
    )
    .then((response) => getById(nombreTabla, response.lastID, db, camposSalida));
}

export function createWithCuid(nombreTabla: string, fila: Partial<Fila>, db: Database, camposSalida?: string[]) {
  const id = cuid();
  const fields = Object.keys(fila);
  const vars = fields.map((f: keyof Fila) => fila[f]);
  return db
    .run(
      `insert into ${nombreTabla} (id, ${fields.join(',')}) values (? ${',?'.repeat(
        fields.length
      )})`,
      [id, ...vars]
    )
    .then(() => getById(nombreTabla, id, db, camposSalida));
}

export function updateById(nombreTabla: string, fila: Partial<Fila>, db: Database, camposSalida?: string[]) {
  const { id, ...rest } = fila;
  const fields = Object.keys(rest);
  const items = fields.map((f: keyof Omit<Fila, 'id'>) => `${f} = ?`);
  const vars = fields.map((f: keyof Omit<Fila, 'id'>) => rest[f]);
  return db
    .run(`update ${nombreTabla}  set ${items.join(',')}  where id = ?`, [...vars, id])
    .then((result) => {
      if (result.changes !== 1) throw new Error(`${id} not found in ${nombreTabla}`);
      return getById(nombreTabla, id, db, camposSalida);
    });
}

export function deleteById(nombreTabla: string, id: ID, db: Database, camposSalida?: string[]) {
  return getById(nombreTabla, id, db, camposSalida).then((u) =>
    db.run(`delete from ${nombreTabla} where id = ?`, [id]).then((result) => {
      if (result.changes !== 1) throw new Error(`${id} not found in ${nombreTabla}`);
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

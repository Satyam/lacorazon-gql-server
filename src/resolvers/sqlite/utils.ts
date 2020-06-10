import cuid from 'cuid';
import { Database } from 'sqlite';
import { RecordWithId } from '..';

export function getAllLimitOffset<R extends RecordWithId>(
  nombreTabla: string,
  { offset = 0, limit }: Rango,
  db: Database,
  camposSalida?: Array<keyof R>
): Promise<R[]> {
  const f = camposSalida ? camposSalida.join(',') : '*';
  if (limit) {
    return db.all(
      `select ${f} from ${nombreTabla} order by nombre limit ? offset ?`,
      [limit, offset]
    );
  }
  return db.all(`select * from ${nombreTabla} order by nombre`);
}

export function getById<R extends RecordWithId>(
  nombreTabla: string,
  id: ID,
  db: Database,
  camposSalida?: Array<keyof R>
): Promise<R | undefined> {
  const f = camposSalida ? camposSalida.join(',') : '*';
  return db.get(`select ${f} from ${nombreTabla} where id = ?`, [id]);
}

export async function createWithAutoId<R extends RecordWithId>(
  nombreTabla: string,
  fila: Omit<R, 'id'>,
  db: Database,
  camposSalida?: Array<keyof R>
): Promise<R | undefined> {
  const fields = Object.keys(fila);
  const values = Object.values(fila);
  const response = await db.run(
    `insert into ${nombreTabla} (${fields}) values (${Array(fields.length)
      .fill('?')
      .join(',')})`,
    values
  );
  if (response.lastID)
    return getById(nombreTabla, response.lastID, db, camposSalida);
  return undefined;
}

export async function createWithCuid<R extends RecordWithId>(
  nombreTabla: string,
  fila: R,
  db: Database,
  camposSalida?: Array<keyof R>
): Promise<R | undefined> {
  const id = cuid();
  const fields = Object.keys(fila);
  const values = Object.values(fila);
  await db.run(
    `insert into ${nombreTabla} (id, ${fields.join(',')}) values (${Array(
      fields.length + 1
    )
      .fill('?')
      .join(',')})`,
    [id, ...values]
  );
  return getById(nombreTabla, id, db, camposSalida);
}

export async function updateById<R extends RecordWithId>(
  nombreTabla: string,
  fila: PartialExcept<R, 'id'>,
  db: Database,
  camposSalida?: Array<keyof R>
): Promise<R | undefined> {
  if ('id' in fila) {
    const { id, ...rest } = fila;
    const fields = Object.keys(rest);
    const values = Object.values(rest);
    const result = await db.run(
      `update ${nombreTabla}  set (${fields.join(',')}) = (${Array(
        fields.length
      )
        .fill('?')
        .join(',')})  where id = ?`,
      [...values, id]
    );
    if (result.changes !== 1)
      throw new Error(`${id} not found in ${nombreTabla}`);
    return getById(nombreTabla, id, db, camposSalida);
  }
}

export async function deleteById<R extends RecordWithId>(
  nombreTabla: string,
  id: ID,
  db: Database,
  camposSalida?: Array<keyof R>
): Promise<R | undefined> {
  const old = await getById(nombreTabla, id, db, camposSalida);
  if (old) {
    await db.run(`delete from ${nombreTabla} where id = ?`, [id]);
    return old as R;
  } else throw new Error(`${id} not found in ${nombreTabla}`);
}

// export function delay(ms: number) {
//   return (value) =>
//     new Promise((resolve) => {
//       setTimeout(() => resolve(value), ms);
//     });
// }

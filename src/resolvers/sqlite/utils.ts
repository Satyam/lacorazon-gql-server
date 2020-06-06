import cuid from 'cuid';
import { Database } from 'sqlite';
import { AnyFila } from '..';

export function getAllLimitOffset<R extends AnyFila, K extends keyof R>(
  nombreTabla: string,
  { offset = 0, limit }: Rango,
  db: Database,
  camposSalida?: K[]
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

export function getById<R extends AnyFila, K extends keyof R>(
  nombreTabla: string,
  id: ID,
  db: Database,
  camposSalida?: K[]
): Promise<R | undefined> {
  const f = camposSalida ? camposSalida.join(',') : '*';
  return db.get(`select ${f} from ${nombreTabla} where id = ?`, [id]);
}

export async function createWithAutoId<R extends AnyFila, K extends keyof R>(
  nombreTabla: string,
  fila: Omit<R, 'id'>,
  db: Database,
  camposSalida?: K[]
): Promise<R | undefined> {
  const fields = [];
  const vars = [];
  for (const f in fila) {
    fields.push(f);
    vars.push(fila[f]);
  }
  // const fields: K[] = Object.keys(fila);
  // const vars = fields.map((f) => fila[f]);
  const response = await db.run(
    `insert into ${nombreTabla} (${fields.join(',')}) values (? ${',?'.repeat(
      fields.length - 1
    )})`,
    vars
  );
  if (response.lastID)
    return getById(nombreTabla, response.lastID, db, camposSalida);
  return undefined;
}

export async function createWithCuid<R extends AnyFila, K extends keyof R>(
  nombreTabla: string,
  fila: R,
  db: Database,
  camposSalida?: K[]
): Promise<R | undefined> {
  const id = cuid();
  const fields = Object.keys(fila) as K[];
  const vars = fields.map((f) => fila[f]);
  await db.run(
    `insert into ${nombreTabla} (id, ${fields.join(
      ','
    )}) values (? ${',?'.repeat(fields.length)})`,
    [id, ...vars]
  );
  return getById(nombreTabla, id, db, camposSalida);
}

export async function updateById<R extends AnyFila, K extends keyof R>(
  nombreTabla: string,
  fila: PartialExcept<R, 'id'>,
  db: Database,
  camposSalida?: K[]
): Promise<R | undefined> {
  if ('id' in fila) {
    const { id, ...rest } = fila;
    const items: string[] = [];
    const vars = [];
    for (const f in rest) {
      items.push(`${f} = ?`);
      vars.push(rest[f]);
    }
    const result = await db.run(
      `update ${nombreTabla}  set ${items.join(',')}  where id = ?`,
      [...vars, id]
    );

    if (result.changes !== 1)
      throw new Error(`${id} not found in ${nombreTabla}`);
    return getById(nombreTabla, id, db, camposSalida);
  }
}

export async function deleteById<R extends AnyFila, K extends keyof R>(
  nombreTabla: string,
  id: ID,
  db: Database,
  camposSalida?: K[]
): Promise<R | undefined> {
  // @ts-ignore
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

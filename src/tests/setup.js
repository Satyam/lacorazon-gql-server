import dotenv from 'dotenv';
import { join } from 'path';
import { copy } from 'fs-extra';

dotenv.config({ path: '.env.tests' });
dotenv.config();

// eslint-disable-next-line import/first
import { start } from '../server';

function relPath(path) {
  return join(process.cwd(), path);
}

module.exports = () =>
  copy(relPath('src/tests/data.orig.json'), relPath(process.env.JSON_FILE))
    .then(() =>
      copy(
        relPath('src/tests/db.orig.sqlite'),
        relPath(process.env.SQLITE_FILE)
      )
    )
    .then(() => start());

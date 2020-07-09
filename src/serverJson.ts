import resolvers from './resolvers/memory';
import { JSONData } from './resolvers/memory';

import type { Context } from '.';

export async function contextJson(): Promise<Context | undefined> {
  console.log('Start with JSON');
  const jsonFile = process.env.JSON_FILE;
  if (jsonFile) {
    const fs = await import('fs-extra');
    const data: JSONData = await fs.readJson(jsonFile);
    if (data) return { resolvers, context: { data } };
  }
  console.error('Environment variable JSON_FILE is required');
}

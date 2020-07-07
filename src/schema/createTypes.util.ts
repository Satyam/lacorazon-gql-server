import schema from './';
import { generateTypeScriptTypes } from 'graphql-schema-typescript';
import { makeExecutableSchema } from 'apollo-server';
import { printSchema } from 'graphql';
import { writeFile } from 'fs-extra';
import { join } from 'path';
(async () => {
  const jsonSchema = makeExecutableSchema({
    typeDefs: schema,
  });

  await writeFile(join(__dirname, 'schema.graphql'), printSchema(jsonSchema));
  await generateTypeScriptTypes(jsonSchema, join(__dirname, 'graphql.d.ts'), {
    smartTParent: true,
    smartTResult: true,
    asyncResult: 'always',
  });
  process.exit(0);
})();

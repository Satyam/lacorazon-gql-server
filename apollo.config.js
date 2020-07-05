module.exports = {
  client: {
    // excludes: ['src/**'],
    // includes: ['src/schema/index.ts'],
    service: {
      name: 'local schema',
      // url: 'http://localhost:8000/graphql',
      localSchemaFile: 'src/schema/schema.graphql',
    },
    excludes: ['src/schema/*', 'src/tests/**/*'],
  },
};

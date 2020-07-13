import { ApolloServer } from 'apollo-server';
import {
  createTestClient,
  ApolloServerTestClient,
} from 'apollo-server-testing';
import { DocumentNode } from 'graphql';

import type { GraphQLResponse } from 'apollo-server-types';
import schema from '../schema';
import { PrismaClient } from '@prisma/client';

const cache: { server?: ApolloServer; prisma?: PrismaClient } & Partial<
  ApolloServerTestClient
> = {};

export default async function getApolloTestServer(): Promise<ApolloServer> {
  const dataSource = process.env.DATA_SOURCE;
  if (dataSource) {
    const { getContext } = await import(
      `../resolvers/${dataSource.toLowerCase()}`
    );
    const ctx = await getContext();

    if (ctx) {
      cache.prisma = ctx.context.prisma;
      return new ApolloServer({
        typeDefs: schema,
        ...ctx,
      });
    }
    process.exit(1);
  } else {
    console.error('Environment variable DATA_SOURCE is required');
    process.exit(1);
  }
}

export async function initTestClient(): Promise<void> {
  if (!cache.server) {
    cache.server = await getApolloTestServer();
    const { query, mutate } = createTestClient(cache.server);
    cache.query = query;
    cache.mutate = mutate;
  }
}

// See: https://github.com/prisma/prisma-client-js/issues/540
export async function killPrisma(): Promise<void> {
  if (cache.prisma) return cache.prisma.disconnect();
}

type CustomResponse<R> = Promise<Omit<GraphQLResponse, 'data'> & { data: R }>;

export const getQuery: <
  R = Record<string, unknown>,
  V = Record<string, unknown> | undefined
>(
  gqlQuery: DocumentNode
) => (variables?: V) => CustomResponse<R> = (gqlQuery) => (variables) => {
  if (typeof cache.query === 'function') {
    return cache.query({
      query: gqlQuery,
      variables,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
    }) as CustomResponse<R>;
  } else {
    throw new Error('This module needs to be initialized by calling beforeAll');
  }
};

export const getMutation: <
  V = Record<string, unknown>,
  R = Record<string, unknown>
>(
  gqlQuery: DocumentNode
) => (variables?: V) => CustomResponse<R> = (gqlMutation) => (variables) => {
  if (typeof cache.mutate === 'function') {
    return cache.mutate({
      mutation: gqlMutation,
      variables,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
    }) as CustomResponse<R>;
  } else {
    throw new Error('This module needs to be initialized by calling beforeAll');
  }
};

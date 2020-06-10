import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApolloError } from 'apollo-server-express';

const API_URL = `${process.env.HOST}:${process.env.SERVER_PORT || 8000}${
  process.env.GRAPHQL
}`;

export default function gqlFetch<T>(query: string) {
  return (
    variables?: { [key: string]: unknown } | null,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<{ data: T; errors: ApolloError[] }>> =>
    axios.post(API_URL, { query, variables }, config).catch((error) => {
      if (error.response && error.response.status === 400) {
        throw new Error(
          error.response.data.errors.map((err: Error) => err.message).join('\n')
        );
      } else {
        throw error;
      }
    });
}

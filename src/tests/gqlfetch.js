// eslint-disable-next-line import/no-extraneous-dependencies
import axios from 'axios';

const API_URL = `${process.env.HOST}:${process.env.SERVER_PORT || 8000}${
  process.env.GRAPHQL
}`;

export default function gqlFetch(query) {
  return (variables, config) =>
    axios.post(API_URL, { query, variables }, config).catch(error => {
      if (error.response && error.response.status === 400) {
        throw new Error(
          error.response.data.errors.map(err => err.message).join('\n')
        );
      } else {
        throw error;
      }
    });
}

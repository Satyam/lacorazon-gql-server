// eslint-disable-next-line import/no-extraneous-dependencies
import axios from 'axios';

const API_URL = 'http://localhost:8000/graphql';

export default function gqlFetch(query) {
  return variables =>
    axios.post(API_URL, { query, variables }).catch(error => {
      if (error.response && error.response.status === 400) {
        throw new Error(
          error.response.data.errors.map(err => err.message).join('\n')
        );
      } else {
        throw error;
      }
    });
}
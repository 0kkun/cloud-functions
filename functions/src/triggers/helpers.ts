/* eslint-disable */
import * as functions from 'firebase-functions';

const regions = {
  tokyo: 'asia-northeast1',
}

export const tokyoFunctions = () => functions.region(regions.tokyo);

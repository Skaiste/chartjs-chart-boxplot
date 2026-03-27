import type { ChartConfiguration } from 'chart.js';
import type {} from '../../src';
import { data } from './raincloud';

// #region config
export const config: ChartConfiguration<'raincloud'> = {
  type: 'raincloud',
  data,
  options: {
    indexAxis: 'y',
  },
};
// #endregion config

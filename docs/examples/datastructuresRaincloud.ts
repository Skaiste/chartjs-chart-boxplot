import type { ChartConfiguration } from 'chart.js';
import type {} from '../../src';

// #region data
const data: ChartConfiguration<'raincloud'>['data'] = {
  labels: ['array', '{raincloud values}', 'with items', 'with whiskers'],
  datasets: [
    {
      label: 'Dataset 1',
      borderWidth: 1,
      itemRadius: 2,
      itemHitRadius: 3,
      itemStyle: 'circle',
      itemBackgroundColor: '#000',
      outlierBackgroundColor: '#000',
      data: [
        [1, 2, 3, 4, 5, 11],
        {
          min: 1,
          q1: 2,
          median: 4,
          q3: 5,
          max: 11,
          mean: 4.33,
          maxEstimate: 10,
          coords: [
            { v: 1, estimate: 0 },
            { v: 2, estimate: 6 },
            { v: 4, estimate: 10 },
            { v: 6, estimate: 4 },
            { v: 11, estimate: 0 },
          ],
          outliers: [11],
          items: [1, 2, 3, 4, 5, 11],
        },
        {
          min: 1,
          q1: 2,
          median: 4,
          q3: 5,
          max: 11,
          mean: 4.33,
          maxEstimate: 10,
          coords: [
            { v: 1, estimate: 0 },
            { v: 2, estimate: 6 },
            { v: 4, estimate: 10 },
            { v: 6, estimate: 4 },
            { v: 11, estimate: 0 },
          ],
          items: [1, 2, 3, 4, 5, 11],
          outliers: [11],
        },
        {
          min: 1,
          q1: 2,
          median: 4,
          q3: 5,
          max: 11,
          mean: 4.33,
          whiskerMin: 1,
          whiskerMax: 5,
          maxEstimate: 10,
          coords: [
            { v: 1, estimate: 0 },
            { v: 2, estimate: 6 },
            { v: 4, estimate: 10 },
            { v: 6, estimate: 4 },
            { v: 11, estimate: 0 },
          ],
          outliers: [11],
        },
      ],
    },
  ],
};
// #endregion data

// #region config
export const config: ChartConfiguration<'raincloud'> = {
  type: 'raincloud',
  data,
};
// #endregion config

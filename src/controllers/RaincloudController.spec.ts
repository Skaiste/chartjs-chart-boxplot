import { CategoryScale, LinearScale, LineController, LineElement, PointElement, registry } from 'chart.js';
import { beforeAll, describe, expect, test } from 'vitest';
import createChart from '../__tests__/createChart';
import { rnd } from '../data';
import { Raincloud } from '../elements';
import { RaincloudController, type RaincloudDataPoint } from './RaincloudController';
import { Samples } from './__tests__/utils';

const options = {
  options: {
    scales: {
      x: {
        display: false,
      },
      y: {
        display: false,
      },
    },
  },
};

describe('raincloud', () => {
  beforeAll(() => {
    registry.addControllers(RaincloudController, LineController);
    registry.addElements(Raincloud, PointElement, LineElement);
    registry.addScales(CategoryScale, LinearScale);
  });

  test('default', () => {
    const samples = new Samples(10);
    const chart = createChart<'raincloud', RaincloudDataPoint[]>({
      type: RaincloudController.id,
      data: {
        labels: samples.months({ count: 7 }),
        datasets: [
          {
            label: 'Dataset 1',
            backgroundColor: 'red',
            borderWidth: 1,
            itemRadius: 2,
            itemHitRadius: 3,
            data: samples.boxplotsArray({ count: 7 }),
            outlierBackgroundColor: '#999999',
          },
          {
            label: 'Dataset 2',
            backgroundColor: 'blue',
            borderWidth: 1,
            itemRadius: 2,
            itemHitRadius: 3,
            side: 'after',
            data: samples.boxplotsArray({ count: 7 }),
            outlierBackgroundColor: '#999999',
            lowerBackgroundColor: '#461e7d',
          },
        ],
      },
      ...options,
    });

    return chart.toMatchImageSnapshot();
  });

  test('horizontal', () => {
    const samples = new Samples(10);
    const chart = createChart<'raincloud', RaincloudDataPoint[]>({
      type: RaincloudController.id,
      data: {
        labels: samples.months({ count: 4 }),
        datasets: [
          {
            label: 'Dataset 1',
            backgroundColor: 'steelblue',
            borderWidth: 1,
            itemRadius: 2,
            itemHitRadius: 3,
            data: samples.boxplotsArray({ count: 4 }),
          },
        ],
      },
      options: {
        indexAxis: 'y',
        scales: {
          x: {
            display: false,
          },
          y: {
            display: false,
          },
        },
      },
    });

    return chart.toMatchImageSnapshot();
  });

  test('hybrid', () => {
    const samples = new Samples(10);
    const chart = createChart({
      type: RaincloudController.id,
      data: {
        labels: samples.months({ count: 7 }),
        datasets: [
          {
            label: 'Raincloud',
            backgroundColor: 'steelblue',
            itemRadius: 2,
            itemHitRadius: 3,
            data: samples.boxplotsArray({ count: 7 }),
          },
          {
            label: 'Line',
            type: 'line',
            borderColor: 'red',
            data: samples.numbers({ count: 7, max: 150 }) as any,
          },
        ],
      },
      ...options,
    });

    return chart.toMatchImageSnapshot();
  });

  test('empty', () => {
    const samples = new Samples(10);
    const chart = createChart({
      type: RaincloudController.id,
      data: {
        labels: ['A', 'B'],
        datasets: [
          {
            label: 'Dataset 1',
            borderColor: 'red',
            borderWidth: 1,
            itemRadius: 2,
            itemHitRadius: 3,
            outlierBackgroundColor: '#999999',
            data: [[], samples.numbers({ count: 100, min: 0, max: 10 })],
          },
        ],
      },
      ...options,
    });

    return chart.toMatchImageSnapshot();
  });

  test('item hover uses shifted cloud bounds', () => {
    const chart = createChart<'raincloud', RaincloudDataPoint[]>({
      type: RaincloudController.id,
      data: {
        labels: ['A'],
        datasets: [
          {
            label: 'Dataset 1',
            itemRadius: 2,
            itemHitRadius: 4,
            data: [[1, 2, 3, 4, 5]],
          },
        ],
      },
      ...options,
    });

    const element = chart.chart.getDatasetMeta(0).data[0] as any;
    const scatter = element._scatterRect(element.getProps(['x', 'y', 'width', 'height']));
    const y = element.getProps(['items']).items[0];
    const x = scatter.x + rnd(0)() * scatter.width;
    const item = element._itemIndexInRange(x, y);

    expect(item).toBeTruthy();

    const tooltip: any = {};
    const position = element.tooltipPosition({ x: item.x, y: item.y }, tooltip);

    expect(position).toEqual({ x: item.x, y: item.y });
    expect(tooltip._tooltipItem?.datasetIndex).toBe(0);
    expect(tooltip._tooltipItem?.index).toBe(item.index);
  });
});

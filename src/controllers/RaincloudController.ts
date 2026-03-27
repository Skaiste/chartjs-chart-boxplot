import {
  AnimationOptions,
  BarController,
  BarControllerDatasetOptions,
  CartesianScaleTypeRegistry,
  CategoryScale,
  Chart,
  ChartConfiguration,
  ChartItem,
  CommonHoverOptions,
  ControllerDatasetOptions,
  Element,
  LinearScale,
  ScriptableAndArrayOptions,
  ScriptableContext,
  UpdateMode,
} from 'chart.js';
import { merge } from 'chart.js/helpers';
import { interpolateKdeCoords } from '../animation';
import { asRaincloudStats, defaultRaincloudOptions, type IRaincloud, type IRaincloudOptions } from '../data';
import { Raincloud, raincloudOptionKeys, type IRaincloudElementOptions } from '../elements';
import patchController from './patchController';
import { StatsBase, baseDefaults, defaultOverrides } from './StatsBase';

export class RaincloudController extends StatsBase<IRaincloud, Required<IRaincloudOptions>> {
  protected _parseStats(value: any, config: IRaincloudOptions): IRaincloud | undefined {
    return asRaincloudStats(value, {
      ...defaultRaincloudOptions,
      ...config,
    });
  }

  protected _transformStats<T>(target: any, source: IRaincloud, mapper: (v: number) => T): void {
    super._transformStats(target, source, mapper);
    for (const key of ['whiskerMin', 'whiskerMax']) {
      target[key] = mapper(source[key as 'whiskerMin' | 'whiskerMax']);
    }
    target.maxEstimate = source.maxEstimate;
    if (Array.isArray(source.coords)) {
      target.coords = source.coords.map((c) => ({ ...c, v: mapper(c.v) }));
    }
  }

  updateElement(rectangle: Element, index: number, properties: any, mode: UpdateMode): void {
    properties.side = this.options.side;
    super.updateElement(rectangle, index, properties, mode);
  }

  static readonly id = 'raincloud';

  static readonly defaults: any = /* #__PURE__ */ merge({}, [
    BarController.defaults,
    baseDefaults(raincloudOptionKeys),
    defaultRaincloudOptions,
    {
      animations: {
        numbers: {
          type: 'number',
          properties: (BarController.defaults as any).animations.numbers.properties.concat(
            ['q1', 'q3', 'min', 'max', 'median', 'whiskerMin', 'whiskerMax', 'mean', 'maxEstimate'],
            raincloudOptionKeys.filter((c) => !c.endsWith('Color'))
          ),
        },
        kdeCoords: {
          fn: interpolateKdeCoords,
          properties: ['coords'],
        },
      },
      dataElementType: Raincloud.id,
    },
  ]);

  static readonly overrides: any = /* #__PURE__ */ merge({}, [(BarController as any).overrides, defaultOverrides()]);
}

export interface RaincloudControllerDatasetOptions
  extends ControllerDatasetOptions,
    Pick<
      BarControllerDatasetOptions,
      'barPercentage' | 'barThickness' | 'categoryPercentage' | 'maxBarThickness' | 'minBarLength'
    >,
    IRaincloudOptions,
    ScriptableAndArrayOptions<IRaincloudElementOptions, ScriptableContext<'raincloud'>>,
    ScriptableAndArrayOptions<CommonHoverOptions, ScriptableContext<'raincloud'>>,
    AnimationOptions<'raincloud'> {}

export type RaincloudDataPoint =
  | number[]
  | (Partial<IRaincloud> &
      Pick<IRaincloud, 'min' | 'max' | 'median' | 'q1' | 'q3' | 'coords'>);

export type IRaincloudChartOptions = IRaincloudOptions;

declare module 'chart.js' {
  export interface ChartTypeRegistry {
    raincloud: {
      chartOptions: IRaincloudChartOptions;
      datasetOptions: RaincloudControllerDatasetOptions;
      defaultDataPoint: RaincloudDataPoint;
      scales: keyof CartesianScaleTypeRegistry;
      metaExtensions: object;
      parsedDataType: IRaincloud & ChartTypeRegistry['bar']['parsedDataType'];
    };
  }
}

export class RaincloudChart<DATA extends unknown[] = RaincloudDataPoint[], LABEL = string> extends Chart<
  'raincloud',
  DATA,
  LABEL
> {
  static id = RaincloudController.id;

  constructor(item: ChartItem, config: Omit<ChartConfiguration<'raincloud', DATA, LABEL>, 'type'>) {
    super(item, patchController('raincloud', config, RaincloudController, Raincloud, [LinearScale, CategoryScale]));
  }
}

import { BarElement, ChartType, CommonHoverOptions, ScriptableAndArrayOptions, ScriptableContext } from 'chart.js';
import { drawPoint } from 'chart.js/helpers';
import { rnd, type IKDEPoint } from '../data';
import { StatsBase, baseRoutes, type IStatsBaseProps } from './base';
import { BoxAndWiskers, boxOptionsKeys, type IBoxAndWhiskerProps, type IBoxAndWhiskersOptions } from './BoxAndWiskers';

export interface IRaincloudElementOptions extends IBoxAndWhiskersOptions {
}

export interface IRaincloudElementProps extends IBoxAndWhiskerProps {
  side: 'before' | 'after';
  coords: IKDEPoint[];
  maxEstimate?: number;
}

type TCloudRect = { x: number; y: number; width: number; height: number; seam: number };
type TScatterRect = { x: number; y: number; width: number; height: number };
type TBoxRect = { x: number; y: number; width: number; height: number };

export class Raincloud extends StatsBase<IRaincloudElementProps, IRaincloudElementOptions> {
  static readonly id = 'raincloud';

  static readonly defaults = /* #__PURE__ */ {
    ...BoxAndWiskers.defaults,
  };

  static readonly defaultRoutes = /* #__PURE__ */ {
    ...BarElement.defaultRoutes,
    ...baseRoutes,
    itemBorderColor: 'backgroundColor',
  };

  declare side: 'before' | 'after';

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    ctx.fillStyle = this.options.backgroundColor;
    ctx.strokeStyle = this.options.borderColor;
    ctx.lineWidth = this.options.borderWidth;

    const props = this.getProps([
      'x',
      'y',
      'width',
      'height',
      'q1',
      'q3',
      'median',
      'whiskerMin',
      'whiskerMax',
      'coords',
      'maxEstimate',
    ]);

    this._drawCloud(ctx, props);
    this._drawShiftedBoxPlot(ctx, props);
    this._drawOutliers(ctx);
    this._drawMeanDot(ctx);

    ctx.restore();

    this._drawItems(ctx);
  }

  protected _drawCloud(
    ctx: CanvasRenderingContext2D,
    props: Pick<IRaincloudElementProps, 'x' | 'y' | 'width' | 'height' | 'coords' | 'maxEstimate'>
  ): void {
    if (!props.coords || props.coords.length === 0) {
      return;
    }

    const cloud = this._cloudRect(props);
    const maxEstimate =
      props.maxEstimate ?? props.coords.reduce((a, d) => Math.max(a, d.estimate), Number.NEGATIVE_INFINITY);

    if (!Number.isFinite(maxEstimate) || maxEstimate <= 0) {
      return;
    }

    ctx.beginPath();

    if (this.isVertical()) {
      const factor = cloud.width / maxEstimate;
      if (this.side === 'before') {
        props.coords.forEach((c) => {
          ctx.lineTo(cloud.seam - c.estimate * factor, c.v);
        });
      } else {
        props.coords.forEach((c) => {
          ctx.lineTo(cloud.seam + c.estimate * factor, c.v);
        });
      }

      props.coords
        .slice()
        .reverse()
        .forEach((c) => {
          ctx.lineTo(cloud.seam, c.v);
        });
    } else {
      const factor = cloud.height / maxEstimate;
      if (this.side === 'before') {
        props.coords.forEach((c) => {
          ctx.lineTo(c.v, cloud.seam - c.estimate * factor);
        });
      } else {
        props.coords.forEach((c) => {
          ctx.lineTo(c.v, cloud.seam + c.estimate * factor);
        });
      }

      props.coords
        .slice()
        .reverse()
        .forEach((c) => {
          ctx.lineTo(c.v, cloud.seam);
        });
    }

    ctx.closePath();
    ctx.stroke();
    ctx.fill();
  }

  protected _drawShiftedBoxPlot(
    ctx: CanvasRenderingContext2D,
    props: Pick<
      IRaincloudElementProps,
      'x' | 'y' | 'width' | 'height' | 'q1' | 'q3' | 'median' | 'whiskerMin' | 'whiskerMax'
    >
  ): void {
    const box = this._boxRect(props);
    const { options } = this;

    if (this.isVertical()) {
      const x0 = box.x;
      const { q1, q3, median, whiskerMin, whiskerMax } = props;

      if (q3 > q1) {
        ctx.fillRect(x0, q1, box.width, q3 - q1);
      } else {
        ctx.fillRect(x0, q3, box.width, q1 - q3);
      }

      ctx.save();
      if (options.medianColor && options.medianColor !== 'transparent' && options.medianColor !== '#0000') {
        ctx.strokeStyle = options.medianColor;
      }
      ctx.beginPath();
      ctx.moveTo(x0, median);
      ctx.lineTo(x0 + box.width, median);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();

      ctx.save();
      if (
        options.lowerBackgroundColor &&
        options.lowerBackgroundColor !== 'transparent' &&
        options.lowerBackgroundColor !== '#0000'
      ) {
        ctx.fillStyle = options.lowerBackgroundColor;
        if (q3 > q1) {
          ctx.fillRect(x0, median, box.width, q3 - median);
        } else {
          ctx.fillRect(x0, median, box.width, q1 - median);
        }
      }
      ctx.restore();

      if (q3 > q1) {
        ctx.strokeRect(x0, q1, box.width, q3 - q1);
      } else {
        ctx.strokeRect(x0, q3, box.width, q1 - q3);
      }

      const boxCenter = x0 + box.width / 2;
      ctx.beginPath();
      ctx.moveTo(x0, whiskerMin);
      ctx.lineTo(x0 + box.width, whiskerMin);
      ctx.moveTo(boxCenter, whiskerMin);
      ctx.lineTo(boxCenter, q1);
      ctx.moveTo(x0, whiskerMax);
      ctx.lineTo(x0 + box.width, whiskerMax);
      ctx.moveTo(boxCenter, whiskerMax);
      ctx.lineTo(boxCenter, q3);
      ctx.closePath();
      ctx.stroke();
      return;
    }

    const y0 = box.y;
    const { q1, q3, median, whiskerMin, whiskerMax } = props;

    if (q3 > q1) {
      ctx.fillRect(q1, y0, q3 - q1, box.height);
    } else {
      ctx.fillRect(q3, y0, q1 - q3, box.height);
    }

    ctx.save();
    if (options.medianColor && options.medianColor !== 'transparent' && options.medianColor !== '#0000') {
      ctx.strokeStyle = options.medianColor;
    }
    ctx.beginPath();
    ctx.moveTo(median, y0);
    ctx.lineTo(median, y0 + box.height);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();

    ctx.save();
    if (
      options.lowerBackgroundColor &&
      options.lowerBackgroundColor !== 'transparent' &&
      options.lowerBackgroundColor !== '#0000'
    ) {
      ctx.fillStyle = options.lowerBackgroundColor;
      if (q3 > q1) {
        ctx.fillRect(median, y0, q3 - median, box.height);
      } else {
        ctx.fillRect(median, y0, q1 - median, box.height);
      }
    }
    ctx.restore();

    if (q3 > q1) {
      ctx.strokeRect(q1, y0, q3 - q1, box.height);
    } else {
      ctx.strokeRect(q3, y0, q1 - q3, box.height);
    }

    const boxCenter = y0 + box.height / 2;
    ctx.beginPath();
    ctx.moveTo(whiskerMin, y0);
    ctx.lineTo(whiskerMin, y0 + box.height);
    ctx.moveTo(whiskerMin, boxCenter);
    ctx.lineTo(q1, boxCenter);
    ctx.moveTo(whiskerMax, y0);
    ctx.lineTo(whiskerMax, y0 + box.height);
    ctx.moveTo(whiskerMax, boxCenter);
    ctx.lineTo(q3, boxCenter);
    ctx.closePath();
    ctx.stroke();
  }

  protected _drawItems(ctx: CanvasRenderingContext2D): void {
    const props = this.getProps(['items', 'outliers'], false);
    const { options } = this;

    if (options.itemRadius <= 0 || !props.items || props.items.length <= 0) {
      return;
    }

    const random = rnd(this._datasetIndex * 1000 + this._index);
    const outliers = new Set(props.outliers || []);
    const pointOptions = {
      pointStyle: options.itemStyle,
      radius: options.itemRadius,
      borderWidth: options.itemBorderWidth,
    };
    const scatter = this._scatterRect(this.getProps(['x', 'y', 'width', 'height']));

    ctx.save();
    ctx.strokeStyle = options.itemBorderColor;
    ctx.fillStyle = options.itemBackgroundColor;
    ctx.lineWidth = options.itemBorderWidth;

    if (this.isVertical()) {
      props.items.forEach((v) => {
        if (!outliers.has(v)) {
          drawPoint(ctx, pointOptions, scatter.x + random() * scatter.width, v);
        }
      });
    } else {
      props.items.forEach((v) => {
        if (!outliers.has(v)) {
          drawPoint(ctx, pointOptions, v, scatter.y + random() * scatter.height);
        }
      });
    }

    ctx.restore();
  }

  protected _itemIndexInRange(
    mouseX: number,
    mouseY: number,
    useFinalPosition?: boolean
  ): { index: number; x: number; y: number } | null {
    const hitRadius = this.options.itemHitRadius;
    if (hitRadius <= 0) {
      return null;
    }
    const props = this.getProps(['items', 'outliers'], useFinalPosition);
    if (this.options.itemRadius <= 0 || !props.items || props.items.length <= 0) {
      return null;
    }

    const scatter = this._scatterRect(this.getProps(['x', 'y', 'width', 'height'], useFinalPosition));
    const random = rnd(this._datasetIndex * 1000 + this._index);
    const outliers = new Set(props.outliers || []);

    if (this.isVertical()) {
      for (let i = 0; i < props.items.length; i += 1) {
        const y = props.items[i];
        if (!outliers.has(y)) {
          const x = scatter.x + random() * scatter.width;
          if (Math.abs(x - mouseX) <= hitRadius && Math.abs(y - mouseY) <= hitRadius) {
            return { index: i, x, y };
          }
        }
      }
      return null;
    }

    for (let i = 0; i < props.items.length; i += 1) {
      const x = props.items[i];
      if (!outliers.has(x)) {
        const y = scatter.y + random() * scatter.height;
        if (Math.abs(x - mouseX) <= hitRadius && Math.abs(y - mouseY) <= hitRadius) {
          return { index: i, x, y };
        }
      }
    }
    return null;
  }

  _getBounds(useFinalPosition?: boolean): { left: number; top: number; right: number; bottom: number } {
    if (this.isVertical()) {
      const { x, width, whiskerMin, whiskerMax } = this.getProps(
        ['x', 'width', 'whiskerMin', 'whiskerMax'],
        useFinalPosition
      );
      const x0 = x - width / 2;
      return {
        left: x0,
        top: whiskerMax,
        right: x0 + width,
        bottom: whiskerMin,
      };
    }

    const { y, height, whiskerMin, whiskerMax } = this.getProps(['y', 'height', 'whiskerMin', 'whiskerMax'], useFinalPosition);
    const y0 = y - height / 2;
    return {
      left: whiskerMin,
      top: y0,
      right: whiskerMax,
      bottom: y0 + height,
    };
  }

  protected _cloudRect(
    props: Pick<IStatsBaseProps, 'x' | 'y' | 'width' | 'height'>
  ): TCloudRect {
    const cloudRatio = 0.55;
    const before = this.side === 'before';

    if (this.isVertical()) {
      const cloudWidth = props.width * cloudRatio;
      const x = before ? props.x - props.width / 2 : props.x + props.width / 2 - cloudWidth;
      const seam = before ? x + cloudWidth : x;
      return {
        x,
        y: props.y - props.height / 2,
        width: cloudWidth,
        height: props.height,
        seam,
      };
    }

    const cloudHeight = props.height * cloudRatio;
    const y = before ? props.y - props.height / 2 : props.y + props.height / 2 - cloudHeight;
    const seam = before ? y + cloudHeight : y;
    return {
      x: props.x - props.width / 2,
      y,
      width: props.width,
      height: cloudHeight,
      seam,
    };
  }

  protected _scatterRect(
    props: Pick<IStatsBaseProps, 'x' | 'y' | 'width' | 'height'>
  ): TScatterRect {
    const box = this._boxRect(props);

    if (this.isVertical()) {
      if (this.side === 'before') {
        return {
          x: box.x + box.width,
          y: props.y - props.height / 2,
          width: props.x + props.width / 2 - (box.x + box.width),
          height: props.height,
        };
      }
      return {
        x: props.x - props.width / 2,
        y: props.y - props.height / 2,
        width: box.x - (props.x - props.width / 2),
        height: props.height,
      };
    }

    if (this.side === 'before') {
      return {
        x: props.x - props.width / 2,
        y: box.y + box.height,
        width: props.width,
        height: props.y + props.height / 2 - (box.y + box.height),
      };
    }
    return {
      x: props.x - props.width / 2,
      y: props.y - props.height / 2,
      width: props.width,
      height: box.y - (props.y - props.height / 2),
    };
  }

  protected _boxRect(
    props: Pick<IStatsBaseProps, 'x' | 'y' | 'width' | 'height'>
  ): TBoxRect {
    const boxRatio = 0.18;
    const cloud = this._cloudRect(props);

    if (this.isVertical()) {
      const width = props.width * boxRatio;
      const x = cloud.seam - width / 2;
      return {
        x,
        y: props.y - props.height / 2,
        width,
        height: props.height,
      };
    }

    const height = props.height * boxRatio;
    const y = cloud.seam - height / 2;
    return {
      x: props.x - props.width / 2,
      y,
      width: props.width,
      height,
    };
  }
}

export const raincloudOptionKeys = boxOptionsKeys;

declare module 'chart.js' {
  export interface ElementOptionsByType<TType extends ChartType> {
    raincloud: ScriptableAndArrayOptions<IRaincloudElementOptions & CommonHoverOptions, ScriptableContext<TType>>;
  }
}

import { BaseChartDirective } from 'ng2-charts';
import { ChartOptions } from 'chart.js';

export type ChartHandle = {
    canvas: HTMLCanvasElement;
    remove: () => void;
};

export function createChartHandle(chartDir: BaseChartDirective): ChartHandle | null {
    try {
        const chart = (chartDir as any).chart as any;
        if (!chart || !chart.canvas) return null;
        const canvas = chart.canvas as HTMLCanvasElement;

        let dragging = false;
        let startValue: number | null = null;
        let startIndex: number | null = null;
        let _origPointBg: any = null;
        let _origPointBorder: any = null;
        let _origPointRadius: any = null;
        let _origBackground: any = null;
        let _origFill: any = null;
        let _highlightDatasetIndex: number | null = null;

        const nearestIndex = (chart: any, xValue: any): number => {
            const labels = chart.data.labels || [];
            if (!labels || labels.length === 0) return 0;
            const first = labels[0];
            if (typeof first === 'string') {
                const idx = Math.round(Number(xValue));
                return Math.max(0, Math.min(labels.length - 1, idx));
            }
            let nearest = 0;
            let bestDiff = Number.POSITIVE_INFINITY;
            for (let i = 0; i < labels.length; i++) {
                const lab = labels[i];
                const num = (typeof lab === 'number') ? lab : (new Date(lab)).getTime();
                const diff = Math.abs(num - xValue);
                if (diff < bestDiff) { bestDiff = diff; nearest = i; }
            }
            return nearest;
        };

        const onPointerDown = (ev: PointerEvent) => {
            dragging = true;
            const rect = canvas.getBoundingClientRect();
            const x = ev.clientX - rect.left;
            const xVal = chart.scales.x.getValueForPixel(x);
            const idx = nearestIndex(chart, xVal);
            startIndex = idx;
            const ds = chart.data.datasets && chart.data.datasets[0];
            startValue = (ds && ds.data && ds.data[idx] != null) ? Number(ds.data[idx]) : null;
            try { (chart as any)._dragStartIndex = idx; (chart as any)._dragStartValue = startValue; } catch {}
        };

        const onPointerMove = (ev: PointerEvent) => {
            if (!dragging) return;
            const rect = canvas.getBoundingClientRect();
            const x = ev.clientX - rect.left;
            const xVal = chart.scales.x.getValueForPixel(x);
            const idx = nearestIndex(chart, xVal);
            const ds = chart.data.datasets && chart.data.datasets[0];
            const currValue = (ds && ds.data && ds.data[idx] != null) ? Number(ds.data[idx]) : null;
            try {
                if (!ds) return;
                if (_origPointBg === null) _origPointBg = ds.pointBackgroundColor ?? null;
                if (_origPointBorder === null) _origPointBorder = ds.pointBorderColor ?? null;
                if (_origPointRadius === null) _origPointRadius = ds.pointRadius ?? null;
                if (_origBackground === null) _origBackground = ds.backgroundColor ?? null;
                if (_origFill === null) _origFill = ds.fill ?? null;

                if (startIndex == null || currValue == null || startValue == null) {
                    if (_origPointBg !== null) ds.pointBackgroundColor = _origPointBg; else ds.pointBackgroundColor = undefined;
                    if (_origPointBorder !== null) ds.pointBorderColor = _origPointBorder; else ds.pointBorderColor = undefined;
                    if (_origPointRadius !== null) ds.pointRadius = _origPointRadius; else ds.pointRadius = undefined;
                    chart.data.datasets = chart.data.datasets.filter((d: any) => d == null || d.label !== '__drag_highlight__');
                    _highlightDatasetIndex = null;
                    chart.update();
                    return;
                }

                const s = Math.min(startIndex, idx);
                const e = Math.max(startIndex, idx);
                const pct = ((currValue - startValue) / Math.abs(startValue)) * 100;
                const colorFill = pct > 0 ? 'rgba(31,138,31,0.15)' : (pct < 0 ? 'rgba(200,36,51,0.15)' : 'rgba(0,0,0,0.08)');
                const pointColor = pct > 0 ? '#1f8a1f' : (pct < 0 ? '#c82333' : '#000');

                const cnt = (ds.data && ds.data.length) ? ds.data.length : (chart.data.labels ? chart.data.labels.length : 0);
                const bgArr = new Array(cnt).fill('rgba(0,0,0,0)');
                const defaultRadius = (typeof _origPointRadius === 'number') ? _origPointRadius : (chart.options && chart.options.elements && chart.options.elements.point && (chart.options.elements.point as any).radius) || 2;
                const pRad = new Array(cnt).fill(defaultRadius);
                for (let i = s; i <= e; i++) {
                    bgArr[i] = pointColor;
                    pRad[i] = defaultRadius;
                }

                ds.pointBackgroundColor = bgArr as any;
                ds.pointBorderColor = bgArr as any;
                ds.pointRadius = pRad as any;

                const highlightData = new Array(cnt).fill(null);
                for (let i = s; i <= e; i++) {
                    highlightData[i] = ds.data[i];
                }
                if (_highlightDatasetIndex === null) {
                    const hd = {
                        label: '__drag_highlight__',
                        data: highlightData,
                        backgroundColor: colorFill,
                        borderColor: 'transparent',
                        pointRadius: 0,
                        fill: true,
                        tension: ds.tension ?? 0.1,
                        order: (ds.order || 0) + 1
                    };
                    chart.data.datasets.push(hd as any);
                    _highlightDatasetIndex = chart.data.datasets.length - 1;
                } else {
                    const hd = chart.data.datasets[_highlightDatasetIndex];
                    hd.data = highlightData;
                    hd.backgroundColor = colorFill;
                }
                chart.update('none');
            } catch (ex) {}
        };

        const onPointerUp = () => {
            dragging = false;
            startValue = null;
            try {
                const ds = chart.data.datasets && chart.data.datasets[0];
                if (ds) {
                    if (_origPointBg !== null) ds.pointBackgroundColor = _origPointBg; else ds.pointBackgroundColor = undefined;
                    if (_origPointBorder !== null) ds.pointBorderColor = _origPointBorder; else ds.pointBorderColor = undefined;
                    if (_origPointRadius !== null) ds.pointRadius = _origPointRadius; else ds.pointRadius = undefined;
                    if (_origBackground !== null) ds.backgroundColor = _origBackground; else ds.backgroundColor = undefined;
                    if (_origFill !== null) ds.fill = _origFill; else ds.fill = undefined;
                    chart.data.datasets = chart.data.datasets.filter((d: any) => d == null || d.label !== '__drag_highlight__');
                    _highlightDatasetIndex = null;
                    chart.update();
                }
                _origPointBg = null;
                _origPointBorder = null;
                _origPointRadius = null;
                _origBackground = null;
                _origFill = null;
            } catch {}
            try { delete (chart as any)._dragStartIndex; delete (chart as any)._dragStartValue; } catch {}
        };

        canvas.addEventListener('pointerdown', onPointerDown);
        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);

        const remove = () => {
            try { canvas.removeEventListener('pointerdown', onPointerDown); } catch {}
            try { window.removeEventListener('pointermove', onPointerMove); } catch {}
            try { window.removeEventListener('pointerup', onPointerUp); } catch {}
            try {
                chart.data.datasets = chart.data.datasets.filter((d: any) => d == null || d.label !== '__drag_highlight__');
                chart.update();
            } catch {}
        };

        return { canvas, remove };
    } catch (e) {
        return null;
    }
}

export function applyTooltipTheme(options: ChartOptions<'line'>) {
    const plugins: any = options.plugins ?? (options.plugins = {} as any);
    plugins.tooltip = {
        mode: 'index',
        intersect: false,
        displayColors: false,
        // themed dark card matching app accent
        backgroundColor: 'rgba(17,24,39,0.96)',
        borderColor: '#ff4081',
        borderWidth: 1,
        titleColor: '#ffffff',
        bodyColor: '#f5f5f7',
        titleFont: { size: 15, weight: '700' },
        bodyFont: { size: 14, weight: '600' },
        padding: 12,
        cornerRadius: 10,
        boxPadding: 6,
        // alignment
        titleAlign: 'left',
        bodyAlign: 'left',
        caretPadding: 8,
        caretSize: 6,
        // filter out the temporary highlight dataset so values don't duplicate
        filter: function(item: any) {
            return !(item && item.dataset && item.dataset.label === '__drag_highlight__');
        },
        callbacks: {
            title: function(items: any) {
                const idx = items && items.length ? items[0].dataIndex : null;
                const chart = items && items.length ? items[0].chart : null;
                if (idx == null || !chart) return '';
                const lab = chart.data.labels ? chart.data.labels[idx] : null;
                return lab ? `Date: ${String(lab)}` : '';
            },
            label: function(context: any) {
                const val = context?.parsed?.y ?? '';
                const chart = context && (context as any).chart as any;
                const idx = context.dataIndex;
                const lines: string[] = [];
                lines.push(`Amount: $${Number(val).toLocaleString()}`);
                try {
                    const sIdx = chart && chart._dragStartIndex != null ? chart._dragStartIndex as number : null;
                    const sVal = chart && chart._dragStartValue != null ? chart._dragStartValue as number : null;
                    if (sIdx != null && sVal != null) {
                        const startLabel = chart.data.labels ? chart.data.labels[sIdx] : null;
                        const currLabel = chart.data.labels ? chart.data.labels[idx] : null;
                        let pctText = 'N/A';
                        if (sVal === 0) pctText = 'N/A';
                        else {
                            const pct = ((Number(val) - sVal) / Math.abs(sVal)) * 100;
                            const sign = pct > 0 ? '+' : '';
                            pctText = `${sign}${pct.toFixed(2)}%`;
                        }
                        if (startLabel || currLabel) {
                            lines.push(`Date Range: ${startLabel ?? 'N/A'} → ${currLabel ?? 'N/A'} `);
                        } 
                        if (pctText) {
                            lines.push(`Percent Change: ${pctText}`);
                        }
                    }
                } catch (e) {}
                return lines;
            }
        }
    } as any;
    return options;
}

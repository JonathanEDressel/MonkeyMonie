import { BaseChartDirective } from 'ng2-charts';
import { ChartOptions } from 'chart.js';
import { range } from 'rxjs';

export type ChartHandle = {
    canvas: HTMLCanvasElement;
    remove: () => void;
};

export function createChartHandle(chartDir: BaseChartDirective): ChartHandle | null {
    try {
        const chart = (chartDir as any).chart as any;
        if (!chart || !chart.canvas) return null;
        const canvas = chart.canvas as HTMLCanvasElement;
        // find a sensible container to attach the drag info UI
        // prefer the nearest .card so the bar sits inside the card, otherwise fall back to .chart-wrapper or parent
        let container: HTMLElement | null = null;
        try {
            container = (canvas.closest && canvas.closest('.card')) as HTMLElement | null;
        } catch {}
        if (!container) {
            try { container = (canvas.closest && canvas.closest('.chart-wrapper')) as HTMLElement | null; } catch {}
        }
        if (!container) container = canvas.parentElement as HTMLElement | null;
        if (!container) container = (chart.canvas && (chart.canvas.parentElement as HTMLElement)) || null;
        if (container && container instanceof HTMLElement) {
            // ensure the wrapper can position children absolutely
            if (getComputedStyle(container).position === 'static') container.style.position = 'relative';
        }

        // create small drag info element (hidden until drag starts)
        let infoEl: HTMLElement | null = null;
        if (container) {
            infoEl = document.createElement('div');
            infoEl.className = 'chart-drag-info';
            infoEl.style.display = 'none';
            infoEl.style.pointerEvents = 'none';
            infoEl.innerHTML = `
                <div class="drag-info-left">
                    <div class="label">Date</div>
                    <div class="value range">N/A</div>
                </div>
                <div class="drag-info-right">
                    <div class="label">Change</div>
                    <div class="value pct">N/A</div>
                </div>`;
            container.appendChild(infoEl);

            // apply inline fallback styles so the UI is visible even if global SCSS
            try {
                const pctEl = infoEl.querySelector('.pct') as HTMLElement | null;
                const rangeEl = infoEl.querySelector('.range') as HTMLElement | null;
                if (pctEl) {
                    pctEl.style.background = 'rgba(255,255,255,0.03)';
                    pctEl.style.padding = '6px 10px';
                    pctEl.style.borderRadius = '999px';
                    pctEl.style.fontWeight = '800';
                    pctEl.style.minWidth = '72px';
                    pctEl.style.textAlign = 'center';
                    pctEl.style.display = 'inline-block';
                    pctEl.style.color = '#000000';
                    pctEl.style.border = '1px solid rgba(255,255,255,0.04)';
                    pctEl.style.fontVariantNumeric = 'tabular-nums';
                }
                if (rangeEl) {
                    rangeEl.style.background = 'rgba(255,255,255,0.03)';
                    rangeEl.style.padding = '6px 8px';
                    rangeEl.style.borderRadius = '8px';
                    rangeEl.style.border = '1px solid rgba(255,255,255,0.04)';
                    rangeEl.style.fontWeight = '700';
                    rangeEl.style.whiteSpace = 'nowrap';
                }
            } catch {}
        }

        const formatShortDate = (lab: any) => {
            try {
                if (!lab) return 'N/A';
                const d = new Date(lab);
                if (isNaN(d.getTime())) return String(lab);
                const month = d.toLocaleString('en-US', { month: 'short' });
                return `${month} ${d.getDate()}`;
            } catch { return String(lab); }
        };

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
            try { 
                console.log('idx - ', idx, startValue);
                (chart as any)._dragStartIndex = idx;
                (chart as any)._dragStartValue = startValue; 
            } catch {}
            // show info element if present
            try {
                if (infoEl) {
                        const startLabel = chart.data.labels ? chart.data.labels[startIndex!] : 'N/A';
                        const pctText = startValue == null ? 'N/A' : '0.00%';
                        const pctEl = infoEl.querySelector('.pct') as HTMLElement | null;
                        const rangeEl = infoEl.querySelector('.range') as HTMLElement | null;
                        if (rangeEl)  {
                            rangeEl.textContent = `${formatShortDate(startLabel)} → ${formatShortDate(startLabel)}`;
                        }
                        if (pctEl) {
                            pctEl.textContent = pctText;
                            pctEl.classList.remove('positive','negative');
                            pctEl.style.color = '#000000';
                            pctEl.style.backgroundColor = 'rgba(255,255,255,0.03)';
                            pctEl.style.border = '1px solid rgba(255,255,255,0.04)';
                        }
                        infoEl.style.display = 'flex';
                    }
            } catch {}
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
                // update info element with date range and percent
                try {
                    if (infoEl) {
                        const startLabel = (typeof startIndex === 'number' && chart.data.labels) ? chart.data.labels[startIndex] : 'N/A';
                        const currLabel = chart.data.labels ? chart.data.labels[idx] : 'N/A';
                        const pctText = isFinite(pct) ? `${pct > 0 ? '+' : ''}${pct.toFixed(2)}%` : 'N/A';
                        const pctEl = infoEl.querySelector('.pct') as HTMLElement | null;
                        const rangeEl = infoEl.querySelector('.range') as HTMLElement | null;
                        if (rangeEl) rangeEl.textContent = `${formatShortDate(startLabel)} → ${formatShortDate(currLabel)}`;
                        if (pctEl) {
                            pctEl.textContent = pctText;
                            pctEl.classList.remove('positive','negative');
                            // inline color/background fallback
                            if (pct > 0) {
                                pctEl.classList.add('positive');
                                pctEl.style.color = '#000000';
                                pctEl.style.backgroundColor = 'rgba(34,197,94,0.12)';
                                pctEl.style.border = '1px solid rgba(34,197,94,0.18)';
                                pctEl.style.textShadow = '';
                            } else if (pct < 0) {
                                pctEl.classList.add('negative');
                                pctEl.style.color = '#000000';
                                pctEl.style.backgroundColor = 'rgba(220,38,38,0.08)';
                                pctEl.style.border = '1px solid rgba(220,38,38,0.12)';
                                pctEl.style.textShadow = '';
                            } else {
                                pctEl.style.color = '#000000';
                                pctEl.style.backgroundColor = 'rgba(255,255,255,0.03)';
                                pctEl.style.border = '1px solid rgba(255,255,255,0.04)';
                                pctEl.style.textShadow = '';
                            }
                        }
                    }
                } catch {}
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
            try { 
                if(chart) {
                    console.log('deleting - ', (chart as any)._dragStartIndex)
                    console.log('deleting - ', (chart as any)._dragStartValue)
                    if (chart._dragStartIndex)
                        delete (chart as any)._dragStartIndex; 
                    if (chart._dragStartValue)
                        delete (chart as any)._dragStartValue; 
                    
                }
                
            } catch {
            }
            try {
                if (infoEl) {
                    infoEl.style.display = 'none';
                }
            } catch {}

            try {
                if (infoEl) {
                    const pctEl = infoEl.querySelector('.pct') as HTMLElement | null;
                    const rangeEl = infoEl.querySelector('.range') as HTMLElement | null;
                    if (pctEl) {
                        pctEl.style.color = '';
                        pctEl.style.backgroundColor = '';
                        pctEl.style.border = '';
                    }
                    if (rangeEl) {
                        rangeEl.style.background = '';
                        rangeEl.style.border = '';
                    }
                }
            } catch {}
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
            try {
                if (infoEl && infoEl.parentElement) infoEl.parentElement.removeChild(infoEl);
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
        position: 'nearest',
        yAlign: 'top',
        xAlign: 'center',
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
        titleAlign: 'left',
        bodyAlign: 'left',
        caretPadding: 8,
        caretSize: 6,
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
                const lines: string[] = [];
                lines.push(`Amount: $${Number(val).toLocaleString()}`);
                return lines;
            }
        }
    } as any;
    return options;
}

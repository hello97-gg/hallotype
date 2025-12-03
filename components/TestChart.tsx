import React, { useMemo } from 'react';
import { TestGraphDataPoint } from '../types';

interface TestChartProps {
    data: TestGraphDataPoint[];
    timeLimit: number;
}

const TestChart: React.FC<TestChartProps> = ({ data, timeLimit }) => {
    const width = 800;
    const height = 200;
    const margin = { top: 10, right: 30, bottom: 20, left: 30 };
    const boundedWidth = width - margin.left - margin.right;
    const boundedHeight = height - margin.top - margin.bottom;

    const { wpmPath, rawPath, errorPoints, yTicks, xTicks } = useMemo(() => {
        if (data.length === 0) return { wpmPath: '', rawPath: '', errorPoints: [], yTicks: [], xTicks: [] };

        const allWpm = data.flatMap(d => [d.wpm, d.raw]);
        const minWpm = 0;
        const maxWpm = Math.max(80, ...allWpm) + 10;
        
        const maxErrors = Math.max(1, ...data.map(d => d.errors));

        const xScale = (time: number) => (time / timeLimit) * boundedWidth;
        const yScaleWpm = (wpm: number) => boundedHeight - ((wpm - minWpm) / (maxWpm - minWpm)) * boundedHeight;
        const yScaleErrors = (errors: number) => boundedHeight - (errors / maxErrors) * boundedHeight;

        const generatePath = (yValue: (d: TestGraphDataPoint) => number) => {
            if (data.length < 2) return '';
            let path = `M ${xScale(data[0].time)} ${yScaleWpm(yValue(data[0]))}`;
            for(let i = 1; i < data.length; i++) {
                const x1 = xScale(data[i-1].time);
                const y1 = yScaleWpm(yValue(data[i-1]));
                const x2 = xScale(data[i].time);
                const y2 = yScaleWpm(yValue(data[i]));
                const cx = (x1 + x2) / 2;
                path += ` Q ${x1} ${y1}, ${cx} ${(y1 + y2) / 2} T ${x2} ${y2}`;
            }
            return path;
        };

        const wpmPath = generatePath(d => d.wpm);
        const rawPath = generatePath(d => d.raw);

        const errorPoints = data.filter(d => d.errors > 0).map(d => ({
            x: xScale(d.time),
            y: yScaleWpm(d.wpm),
        }));

        const yTickCount = 5;
        const yTicks = Array.from({ length: yTickCount }, (_, i) => {
            const wpm = minWpm + (i / (yTickCount - 1)) * (maxWpm - minWpm);
            return {
                value: Math.round(wpm),
                yOffset: yScaleWpm(wpm),
            };
        });

        const xTickCount = Math.min(15, timeLimit);
        const xTicks = Array.from({ length: xTickCount + 1 }, (_, i) => {
             if (i % Math.ceil(xTickCount / 10) !== 0 && i !== xTickCount) return null;
            const time = (i / xTickCount) * timeLimit;
            return {
                value: Math.round(time),
                xOffset: xScale(time),
            };
        }).filter(Boolean);


        return { wpmPath, rawPath, errorPoints, yTicks, xTicks };

    }, [data, timeLimit, boundedWidth, boundedHeight]);

    return (
        <div className="w-full text-xs" style={{ fontFamily: "'Fira Code', monospace" }}>
            <svg width="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
                <g transform={`translate(${margin.left}, ${margin.top})`}>
                    {/* Grid lines */}
                    {yTicks.map(({ yOffset }) => (
                        <line key={yOffset} x1="0" x2={boundedWidth} y1={yOffset} y2={yOffset} className="stroke-current text-gray-400/20 dark:text-gray-600/50" strokeWidth="1" />
                    ))}

                    {/* Y-axis labels */}
                    {yTicks.map(({ value, yOffset }) => (
                        <text key={value} x="-8" y={yOffset} textAnchor="end" alignmentBaseline="middle" className="fill-current text-gray-400 dark:text-gray-500">{value}</text>
                    ))}
                    <text transform={`translate(${-25}, ${boundedHeight/2}) rotate(-90)`} textAnchor="middle" className="fill-current text-gray-400 dark:text-gray-500">wpm</text>


                    {/* X-axis labels */}
                    {xTicks.map(tick => tick && (
                        <text key={tick.value} x={tick.xOffset} y={boundedHeight + 15} textAnchor="middle" className="fill-current text-gray-400 dark:text-gray-500">{tick.value}</text>
                    ))}

                    {/* Data lines */}
                    <path d={rawPath} fill="none" className="stroke-current text-gray-400 dark:text-gray-600" strokeWidth="2" />
                    <path d={wpmPath} fill="none" className="stroke-current text-[#e2b714]" strokeWidth="2.5" />
                    
                    {/* Error points */}
                    {errorPoints.map((p, i) => (
                         <path key={i} d={`M ${p.x - 4} ${p.y - 4} L ${p.x + 4} ${p.y + 4} M ${p.x - 4} ${p.y + 4} L ${p.x + 4} ${p.y - 4}`} className="stroke-current text-[#ca4754]" strokeWidth="2" />
                    ))}
                </g>
            </svg>
        </div>
    );
};

export default TestChart;

import React, { useMemo } from 'react';
import { TestHistoryItem } from '../types';

interface HistoryGraphProps {
    history: TestHistoryItem[];
}

const HistoryGraph: React.FC<HistoryGraphProps> = ({ history }) => {
    const width = 500;
    const height = 150;
    const margin = { top: 10, right: 10, bottom: 20, left: 30 };
    const boundedWidth = width - margin.left - margin.right;
    const boundedHeight = height - margin.top - margin.bottom;

    const { points, xTicks, yTicks } = useMemo(() => {
        if (history.length < 2) return { points: '', xTicks: [], yTicks: [] };

        const wpmValues = history.map(d => d.wpm);
        const minWpm = Math.max(0, Math.min(...wpmValues) - 5);
        const maxWpm = Math.max(...wpmValues) + 5;

        const xScale = (index: number) => (index / (history.length - 1)) * boundedWidth;
        const yScale = (wpm: number) => boundedHeight - ((wpm - minWpm) / (maxWpm - minWpm)) * boundedHeight;

        const path = history
            .map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d.wpm)}`)
            .join(' ');
        
        const yAxisTicks = [minWpm, Math.round((minWpm + maxWpm) / 2), maxWpm].map(wpm => ({
            value: Math.round(wpm),
            yOffset: yScale(wpm),
        }));
        
        return {
            points: path,
            yTicks: yAxisTicks,
            xTicks: [], // Not showing x-axis ticks for simplicity
        };
    }, [history, boundedWidth, boundedHeight]);

    if (history.length < 2) {
        return (
            <div style={{ height: `${height}px` }} className="flex items-center justify-center text-gray-500 dark:text-gray-400">
                <p>Complete at least two tests to see your progress graph.</p>
            </div>
        );
    }
    
    return (
        <svg width={width} height={height} className="w-full h-auto">
            <g transform={`translate(${margin.left}, ${margin.top})`}>
                {/* Y-axis */}
                <line y2={boundedHeight} className="stroke-current text-gray-400 dark:text-gray-500" strokeWidth="1" />
                {yTicks.map(({ value, yOffset }) => (
                    <g key={value} transform={`translate(0, ${yOffset})`}>
                        <line x2="-5" className="stroke-current text-gray-400 dark:text-gray-500" strokeWidth="1" />
                        <text
                            x="-8"
                            textAnchor="end"
                            alignmentBaseline="middle"
                            className="fill-current text-xs text-gray-500 dark:text-gray-400"
                        >
                            {value}
                        </text>
                    </g>
                ))}

                {/* X-axis */}
                <line y1={boundedHeight} y2={boundedHeight} x2={boundedWidth} className="stroke-current text-gray-400 dark:text-gray-500" strokeWidth="1" />
                <text 
                    x={boundedWidth / 2} 
                    y={boundedHeight + 15}
                    textAnchor="middle" 
                    className="fill-current text-xs text-gray-500 dark:text-gray-400"
                >
                    Recent Tests
                </text>

                {/* Data line */}
                <path
                    d={points}
                    fill="none"
                    strokeWidth="2"
                    className="stroke-current text-teal-500 dark:text-teal-400"
                />
            </g>
        </svg>
    );
};

export default HistoryGraph;

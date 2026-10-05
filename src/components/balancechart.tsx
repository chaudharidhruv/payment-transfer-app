'use client';

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface BalanceDataPoint {
  updated_at: string;
  balance: number;
}

interface BalanceChartProps {
  data: BalanceDataPoint[];
}

export default function BalanceChart({ data }: BalanceChartProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('7d');

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const width = 600;
    const height = 300;
    const margin = { top: 20, right: 30, bottom: 40, left: 60 };

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const parsedData = data.map(d => ({
      date: new Date(d.updated_at),
      balance: d.balance,
    })).sort((a, b) => a.date.getTime() - b.date.getTime());

    const now = new Date();
    const startDate =
      timeRange === '7d'
        ? new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        : timeRange === '30d'
        ? new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        : parsedData[0]?.date;

    // Always include a virtual point at startDate
    const firstPoint = parsedData.find(d => d.date >= startDate) || parsedData[0];
    const virtualStart = { date: startDate!, balance: firstPoint.balance };

    const filteredData = [virtualStart, ...parsedData.filter(d => d.date > startDate)];

    const interpolateData = (
      start: Date,
      end: Date,
      startValue: number,
      endValue: number
    ) => {
      const points: { date: Date; balance: number }[] = [];
      const dayMs = 1000 * 60 * 60 * 24;
      const totalDays = Math.ceil((end.getTime() - start.getTime()) / dayMs);
      for (let i = 1; i < totalDays; i++) {
        const date = new Date(start.getTime() + i * dayMs);
        const balance = startValue + ((endValue - startValue) * i) / totalDays;
        points.push({ date, balance });
      }
      return points;
    };

    const interpolatedData: { date: Date; balance: number }[] = [];
    for (let i = 0; i < filteredData.length - 1; i++) {
      interpolatedData.push(filteredData[i]);
      interpolatedData.push(...interpolateData(
        filteredData[i].date,
        filteredData[i + 1].date,
        filteredData[i].balance,
        filteredData[i + 1].balance
      ));
    }
    interpolatedData.push(filteredData[filteredData.length - 1]);

    const x = d3.scaleTime()
      .domain([startDate!, now])
      .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(interpolatedData, d => d.balance)!])
      .nice()
      .range([height - margin.bottom, margin.top]);

    const line = d3.line<{ date: Date; balance: number }>()
      .x(d => x(d.date))
      .y(d => y(d.balance));

    svg.attr('viewBox', `0 0 ${width} ${height}`);

    // Axes
    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).tickFormat(d3.timeFormat('%b %d') as any));

    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));

    // Line path
    svg.append('path')
      .datum(interpolatedData)
      .attr('fill', 'none')
      .attr('stroke', 'steelblue')
      .attr('stroke-width', 2)
      .attr('d', line as any);

    // Tooltip
    const tooltip = svg.append('text')
      .attr('class', 'tooltip')
      .attr('text-anchor', 'middle')
      .attr('fill', 'black')
      .style('opacity', 0)
      .style('font-size', '12px');
    const focusCircle = svg.append('circle')
      .attr('r', 4)
      .attr('fill', 'steelblue')
      .attr('stroke', 'white')
      .attr('stroke-width', 2)
      .style('opacity', 0);
    
    svg.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'transparent')
      .on('mousemove', (event) => {
        const [xPos] = d3.pointer(event);
        const hoveredDate = x.invert(xPos);
        const index = d3.bisector((d: { date: Date }) => d.date).center(interpolatedData, hoveredDate);
        const d = interpolatedData[index];
      
        if (d) {
          const cx = x(d.date);
          const cy = y(d.balance);
      
          tooltip
            .style('opacity', 1)
            .attr('x', cx)
            .attr('y', cy - 10)
            .text(`$${d.balance.toFixed(2)}`);
      
          focusCircle
            .style('opacity', 1)
            .attr('cx', cx)
            .attr('cy', cy);
        }
      })
      .on('mouseleave', () => {
        tooltip.style('opacity', 0);
        focusCircle.style('opacity', 0);
      });      
  }, [data, timeRange]);

  return (
    <div className="p-4 w-full max-w-3xl">
      <h2 className="text-lg font-bold mb-4">Balance Over Time</h2>
      <div className="flex gap-2 mb-4">
        {['7d', '30d', 'all'].map(range => (
          <button
            key={range}
            onClick={() => setTimeRange(range as '7d' | '30d' | 'all')}
            className={`px-3 py-1 rounded border ${
              timeRange === range
                ? 'bg-blue-500 text-white'
                : 'bg-white text-black border-gray-300'
            }`}
          >
            {range === '7d' ? 'Last 7 Days' : range === '30d' ? 'Last 30 Days' : 'Full History'}
          </button>
        ))}
      </div>
      <svg ref={svgRef} />
    </div>
  );
}

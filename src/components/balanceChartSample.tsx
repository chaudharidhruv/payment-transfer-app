'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface BalanceDataPoint {
  date: string; // originally a string in your `balanceData`
  balance: number;
}

interface BalanceChartProps {
  data: BalanceDataPoint[];
}

export default function BalanceChart({ data }: BalanceChartProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Parse string dates into Date objects
    const parsedData = data.map(d => ({
      date: new Date(d.date),
      balance: d.balance,
    }));

    const width = 600;
    const height = 300;
    const margin = { top: 20, right: 30, bottom: 40, left: 60 };

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous render

    const x = d3
      .scaleTime()
      .domain(d3.extent(parsedData, d => d.date) as [Date, Date])
      .range([margin.left, width - margin.right]);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(parsedData, d => d.balance)!])
      .nice()
      .range([height - margin.bottom, margin.top]);

    const line = d3
      .line<typeof parsedData[0]>()
      .x(d => x(d.date))
      .y(d => y(d.balance));

    svg
      .attr('viewBox', `0 0 ${width} ${height}`)
      .append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom<Date>(x).tickFormat(d3.timeFormat('%b')));

    svg
      .append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));

    svg
      .append('path')
      .datum(parsedData)
      .attr('fill', 'none')
      .attr('stroke', 'steelblue')
      .attr('stroke-width', 2)
      .attr('d', line);
  }, [data]);

  return (
    <div className="p-4 w-full max-w-3xl">
      <h2 className="text-lg font-bold mb-2">Balance Over Time</h2>
      <svg ref={svgRef}></svg>
    </div>
  );
}

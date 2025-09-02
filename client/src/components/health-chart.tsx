import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { type HealthLog } from "@shared/schema";
import { format, parseISO, subDays, eachDayOfInterval } from "date-fns";

interface HealthChartProps {
  logs: HealthLog[];
}

export default function HealthChart({ logs }: HealthChartProps) {
  const chartData = useMemo(() => {
    if (!logs.length) return [];

    // Get the last 30 days
    const endDate = new Date();
    const startDate = subDays(endDate, 29);
    const dateRange = eachDayOfInterval({ start: startDate, end: endDate });

    // Create a map of dates to log data
    const dataMap = new Map();

    // Initialize all dates with empty data
    dateRange.forEach(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      dataMap.set(dateStr, {
        date: dateStr,
        displayDate: format(date, 'MMM dd'),
        symptoms: 0,
        medication: 0,
        vitals: 0,
        exercise: 0,
        mood: 0,
        avgSeverity: 0,
        count: 0,
      });
    });

    // Process logs
    logs.forEach(log => {
      const logDate = format(parseISO(log.date), 'yyyy-MM-dd');
      const existingData = dataMap.get(logDate);
      
      if (existingData) {
        existingData[log.type] += 1;
        existingData.count += 1;
        
        if (log.severity) {
          existingData.avgSeverity = 
            (existingData.avgSeverity * (existingData.count - 1) + log.severity) / existingData.count;
        }
      }
    });

    return Array.from(dataMap.values()).slice(-14); // Show last 14 days for better readability
  }, [logs]);

  const severityData = useMemo(() => {
    return chartData.map(item => ({
      ...item,
      avgSeverity: Math.round(item.avgSeverity * 10) / 10, // Round to 1 decimal place
    }));
  }, [chartData]);

  if (!logs.length) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        <p>No data available for chart visualization</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Log Frequency Chart */}
      <div>
        <h4 className="text-sm font-medium text-foreground mb-3">Daily Log Entries (Last 14 Days)</h4>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="displayDate" 
              tick={{ fontSize: 12 }}
              tickLine={false}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px'
              }}
            />
            <Bar dataKey="symptoms" stackId="a" fill="hsl(var(--destructive))" name="Symptoms" />
            <Bar dataKey="medication" stackId="a" fill="hsl(var(--primary))" name="Medication" />
            <Bar dataKey="vitals" stackId="a" fill="hsl(var(--accent))" name="Vitals" />
            <Bar dataKey="exercise" stackId="a" fill="hsl(var(--chart-4))" name="Exercise" />
            <Bar dataKey="mood" stackId="a" fill="hsl(var(--chart-5))" name="Mood" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Severity Trend Chart */}
      {severityData.some(item => item.avgSeverity > 0) && (
        <div>
          <h4 className="text-sm font-medium text-foreground mb-3">Average Severity Trend</h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={severityData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="displayDate" 
                tick={{ fontSize: 12 }}
                tickLine={false}
              />
              <YAxis 
                domain={[0, 10]}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                label={{ value: 'Severity (1-10)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
                formatter={(value: number) => [value.toFixed(1), 'Avg Severity']}
              />
              <Line 
                type="monotone" 
                dataKey="avgSeverity" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

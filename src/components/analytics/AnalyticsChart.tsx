"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AnalyticsChartProps {
  data: {
    name: string;
    value: number;
    color?: string;
  }[];
  title: string;
  description?: string;
  className?: string;
}

export function AnalyticsChart({ data, title, description, className }: AnalyticsChartProps) {
  return (
    <Card className={cn("border-border/50 bg-card/50 backdrop-blur-sm", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#888" opacity={0.1} />
              <XAxis dataKey="name" fontSize={12} stroke="#888" tickLine={false} axisLine={false} />
              <YAxis fontSize={12} stroke="#888" tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                cursor={{ fill: 'rgba(255,255,255,0.1)' }}
              />
              <Bar dataKey="value" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

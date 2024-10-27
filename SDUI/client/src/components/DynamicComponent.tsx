import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table } from '@/components/ui/table';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { ComponentConfig } from '@/types/uiConfig';

interface DynamicComponentProps {
  config: ComponentConfig;
}

const components = {
  Card: ({ title, children, className }: any) => (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  ),
  
  Grid: ({ columns, gap, children }: any) => (
    <div className={`grid grid-cols-${columns} gap-${gap}`}>
      {children}
    </div>
  ),
  
  MetricDisplay: ({ label, value, trend, trendDirection }: any) => (
    <div className="p-4">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
      <div className={`text-sm ${trendDirection === 'up' ? 'text-green-500' : 'text-red-500'}`}>
        {trend}
      </div>
    </div>
  ),
  
  Table: ({ data, columns }: any) => (
    <Table>
      <thead>
        <tr>
          {columns.map((col: string) => (
            <th key={col} className="p-2">{col}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row: any) => (
          <tr key={row.id}>
            {columns.map((col: string) => (
              <td key={col} className="p-2">{row[col]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </Table>
  ),
  
  LineChart: ({ data }: any) => (
    <LineChart width={400} height={200} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="month" />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey="value" stroke="#8884d8" />
    </LineChart>
  )
};


export const DynamicComponent : React.FC<DynamicComponentProps> = ({ config }) => {
    const Component = components[config.type as keyof typeof components];
    console.log(config);

    if (!Component) {
        console.warn(`Component type "${config.type}" not found`);
      return null;
    }

    const childrenElements = config.children?.map((child, index) => (
        <DynamicComponent key={index} config={child} />
    ));

    return <Component {...config.props}>{childrenElements}</Component>;
}
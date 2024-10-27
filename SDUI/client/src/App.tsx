import React, { useEffect, useState } from 'react';
import { UIConfig } from './types/uiConfig';
import { DynamicComponent } from './components/DynamicComponent';

const Dashboard: React.FC = () => {
  const [uiConfig, setUiConfig] = useState<UIConfig | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/ui-config/sales-dashboard');
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard configuration');
        }
        const config = await response.json();
        console.log("server ui config",JSON.stringify(config));
        setUiConfig(config);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    };

    fetchConfig();
  }, []);

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (!uiConfig) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Sales Dashboard</h1>
      {uiConfig.layout.map((componentConfig, index) => (
        <DynamicComponent key={index} config={componentConfig} />
      ))}
    </div>
  );
};

export default Dashboard;
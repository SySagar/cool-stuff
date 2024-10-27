import { UIConfig } from "../types/uiConfig";

export const dashboardConfigs: Record<string, UIConfig> = {
    'sales-dashboard': {
      version: '1.0.0',
      lastUpdated: '2024-10-28',
      layout: [
        {
          type: 'Card',
          props: {
            title: 'Sales Overview',
            className: 'mb-4'
          },
          children: [
            {
              type: 'MetricDisplay',
              props: {
                label: 'Total Sales',
                value: '$45,678',
                trend: '+12.5%',
                trendDirection: 'up'
              }
            }
          ]
        },
        {
          type: 'Grid',
          props: {
            columns: 2,
            gap: 4
          },
          children: [
            {
              type: 'Card',
              props: {
                title: 'Recent Orders'
              },
              children: [
                {
                  type: 'Table',
                  props: {
                    data: [
                      { id: 1, customer: 'John Doe', amount: '$120', status: 'completed' },
                      { id: 2, customer: 'Jane Smith', amount: '$85', status: 'pending' }
                    ],
                    columns: ['customer', 'amount', 'status']
                  }
                }
              ]
            },
            {
              type: 'Card',
              props: {
                title: 'Revenue Trend'
              },
              children: [
                {
                  type: 'LineChart',
                  props: {
                    data: [
                      { month: 'Jan', value: 1000 },
                      { month: 'Feb', value: 1500 },
                      { month: 'Mar', value: 1300 }
                    ]
                  }
                }
              ]
            }
          ]
        }
      ]
    }
  };
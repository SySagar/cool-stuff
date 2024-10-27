import express from 'express';
import cors from 'cors';
import { dashboardConfigs } from './data/dashboardConfigs';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/ui-config/:dashboardId', (req:any, res:any) => {
  const { dashboardId } = req.params;
  const config = dashboardConfigs[dashboardId];
  
  if (!config) {
    return res.status(404).json({ error: 'Dashboard configuration not found' });
  }
  
  res.json(config);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
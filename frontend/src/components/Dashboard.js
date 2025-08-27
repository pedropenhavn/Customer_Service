import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Container,
  Paper,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  People,
  TrendingUp,
  Warning,
  CheckCircle,
  Cancel,
  Schedule,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import api from '../services/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const Dashboard = () => {
  const [statistics, setStatistics] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsResponse, chartResponse] = await Promise.all([
        api.get('/api/dashboard/statistics'),
        api.get('/api/dashboard/chart-data?days=30'),
      ]);

      setStatistics(statsResponse.data.data);
      setChartData(chartResponse.data.data);
    } catch (error) {
      setError('Erro ao carregar dados do dashboard');
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PEN: '#FF9800',
      PRO: '#2196F3',
      ERR: '#F44336',
      RPV: '#F44336',
      APV: '#4CAF50',
    };
    return colors[status] || '#757575';
  };

  const getStatusIcon = (status) => {
    const icons = {
      PEN: <Schedule />,
      PRO: <TrendingUp />,
      ERR: <Warning />,
      RPV: <Cancel />,
      APV: <CheckCircle />,
    };
    return icons[status] || <People />;
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!statistics) {
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      {/* Cards de estatísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <People sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total de Clientes
                  </Typography>
                  <Typography variant="h4">
                    {statistics.total_clients}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <TrendingUp sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Últimos 7 dias
                  </Typography>
                  <Typography variant="h4">
                    {statistics.recent_clients_7d}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <CheckCircle sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Aprovados
                  </Typography>
                  <Typography variant="h4">
                    {statistics.status_statistics.find(s => s.code === 'APV')?.count || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Warning sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Pendentes
                  </Typography>
                  <Typography variant="h4">
                    {statistics.status_statistics.find(s => s.code === 'PEN')?.count || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Gráficos */}
      <Grid container spacing={3}>
        {/* Gráfico de barras - Status */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Distribuição por Status
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statistics.status_statistics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Gráfico de pizza - Status */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Status dos Clientes
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statistics.status_statistics}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ label, percentage }) => `${label} ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {statistics.status_statistics.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Gráfico de linha - Evolução temporal */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Evolução dos Clientes (Últimos 30 dias)
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="PEN" stackId="a" fill="#FF9800" name="Pendente" />
                <Bar dataKey="PRO" stackId="a" fill="#2196F3" name="Processando" />
                <Bar dataKey="ERR" stackId="a" fill="#F44336" name="Erro" />
                <Bar dataKey="RPV" stackId="a" fill="#F44336" name="Reprovado" />
                <Bar dataKey="APV" stackId="a" fill="#4CAF50" name="Aprovado" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Estatísticas por origem */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Clientes por Origem
            </Typography>
            <Box>
              {statistics.origin_statistics.map((origin, index) => (
                <Box
                  key={origin.origem}
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mb: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}
                >
                  <Typography variant="body2">
                    {origin.origem || 'Não informado'}
                  </Typography>
                  <Chip
                    label={origin.total}
                    color="primary"
                    size="small"
                  />
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Estatísticas por flag */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Status de Flag
            </Typography>
            <Box>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}
              >
                <Typography variant="body2">Flag 0</Typography>
                <Chip
                  label={statistics.flag_statistics.flag_0}
                  color="default"
                  size="small"
                />
              </Box>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}
              >
                <Typography variant="body2">Flag 1</Typography>
                <Chip
                  label={statistics.flag_statistics.flag_1}
                  color="primary"
                  size="small"
                />
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;

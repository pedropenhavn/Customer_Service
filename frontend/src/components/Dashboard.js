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
  LinearProgress,
  Divider,
} from '@mui/material';
import {
  People,
  TrendingUp,
  Warning,
  CheckCircle,
  Cancel,
  Schedule,
  Hub,
  Speed,
  Security,
  Assessment,
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
  LineChart,
  Line,
  Area,
  AreaChart,
} from 'recharts';
import api from '../services/api';

const COLORS = ['#4caf50', '#45a049', '#2e7d32', '#1b5e20', '#0d47a1'];

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

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Animated background elements */}
        <Box
          sx={{
            position: 'absolute',
            top: '20%',
            left: '10%',
            width: '200px',
            height: '200px',
            background: 'radial-gradient(circle, rgba(76, 175, 80, 0.1) 0%, transparent 70%)',
            borderRadius: '50%',
            animation: 'float 6s ease-in-out infinite',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '30%',
            right: '15%',
            width: '150px',
            height: '150px',
            background: 'radial-gradient(circle, rgba(76, 175, 80, 0.08) 0%, transparent 70%)',
            borderRadius: '50%',
            animation: 'float 8s ease-in-out infinite reverse',
          }}
        />
        
        <Box sx={{ textAlign: 'center', zIndex: 1 }}>
          <CircularProgress 
            sx={{ 
              color: '#4caf50',
              '& .MuiCircularProgress-circle': {
                strokeLinecap: 'round',
              }
            }} 
            size={60}
          />
          <Typography 
            variant="h6" 
            sx={{ 
              mt: 2, 
              color: 'white',
              fontWeight: 300,
              letterSpacing: '1px'
            }}
          >
            Carregando Dashboard...
          </Typography>
        </Box>

        <style>
          {`
            @keyframes float {
              0%, 100% { transform: translateY(0px) rotate(0deg); }
              50% { transform: translateY(-20px) rotate(180deg); }
            }
          `}
        </style>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Alert severity="error" sx={{ maxWidth: 400 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  if (!statistics) {
    return null;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated background elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          left: '5%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(76, 175, 80, 0.05) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'float 10s ease-in-out infinite',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '20%',
          right: '10%',
          width: '250px',
          height: '250px',
          background: 'radial-gradient(circle, rgba(76, 175, 80, 0.03) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'float 12s ease-in-out infinite reverse',
        }}
      />

      <Container maxWidth="xl" sx={{ pt: 4, pb: 4, position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
            <Hub sx={{ 
              fontSize: 50, 
              color: '#4caf50', 
              mr: 2,
              filter: 'drop-shadow(0 0 10px rgba(76, 175, 80, 0.5))'
            }} />
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 700, 
                color: 'white',
                textShadow: '0 0 20px rgba(76, 175, 80, 0.3)',
                letterSpacing: '2px'
              }}
            >
              Validator New Clients
            </Typography>
          </Box>
         
        </Box>

        {/* Cards de estatísticas */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(76, 175, 80, 0.2)',
                borderRadius: '16px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 12px 40px rgba(76, 175, 80, 0.2)',
                }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center">
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
                      mr: 2,
                      boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)'
                    }}
                  >
                    <People sx={{ fontSize: 30, color: 'white' }} />
                  </Box>
                  <Box>
                    <Typography 
                      color="rgba(255,255,255,0.7)" 
                      gutterBottom
                      sx={{ fontSize: '0.9rem', fontWeight: 500 }}
                    >
                      Total de Clientes
                    </Typography>
                    <Typography 
                      variant="h3" 
                      sx={{ 
                        color: 'white',
                        fontWeight: 700,
                        textShadow: '0 0 10px rgba(76, 175, 80, 0.3)'
                      }}
                    >
                      {statistics.total_clients}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(76, 175, 80, 0.2)',
                borderRadius: '16px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 12px 40px rgba(76, 175, 80, 0.2)',
                }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center">
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
                      mr: 2,
                      boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)'
                    }}
                  >
                    <TrendingUp sx={{ fontSize: 30, color: 'white' }} />
                  </Box>
                  <Box>
                    <Typography 
                      color="rgba(255,255,255,0.7)" 
                      gutterBottom
                      sx={{ fontSize: '0.9rem', fontWeight: 500 }}
                    >
                      Últimos 7 dias
                    </Typography>
                    <Typography 
                      variant="h3" 
                      sx={{ 
                        color: 'white',
                        fontWeight: 700,
                        textShadow: '0 0 10px rgba(76, 175, 80, 0.3)'
                      }}
                    >
                      {statistics.recent_clients_7d}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(76, 175, 80, 0.2)',
                borderRadius: '16px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 12px 40px rgba(76, 175, 80, 0.2)',
                }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center">
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
                      mr: 2,
                      boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)'
                    }}
                  >
                    <CheckCircle sx={{ fontSize: 30, color: 'white' }} />
                  </Box>
                  <Box>
                    <Typography 
                      color="rgba(255,255,255,0.7)" 
                      gutterBottom
                      sx={{ fontSize: '0.9rem', fontWeight: 500 }}
                    >
                      Aprovados
                    </Typography>
                    <Typography 
                      variant="h3" 
                      sx={{ 
                        color: 'white',
                        fontWeight: 700,
                        textShadow: '0 0 10px rgba(76, 175, 80, 0.3)'
                      }}
                    >
                      {statistics.status_statistics.find(s => s.code === 'APV')?.count || 0}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(76, 175, 80, 0.2)',
                borderRadius: '16px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 12px 40px rgba(76, 175, 80, 0.2)',
                }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center">
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
                      mr: 2,
                      boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)'
                    }}
                  >
                    <Warning sx={{ fontSize: 30, color: 'white' }} />
                  </Box>
                  <Box>
                    <Typography 
                      color="rgba(255,255,255,0.7)" 
                      gutterBottom
                      sx={{ fontSize: '0.9rem', fontWeight: 500 }}
                    >
                      Pendentes
                    </Typography>
                    <Typography 
                      variant="h3" 
                      sx={{ 
                        color: 'white',
                        fontWeight: 700,
                        textShadow: '0 0 10px rgba(76, 175, 80, 0.3)'
                      }}
                    >
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
          {/* Gráfico de área - Evolução temporal */}
          <Grid item xs={12}>
            <Paper
              sx={{
                p: 4,
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(76, 175, 80, 0.1)',
                borderRadius: '20px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              }}
            >
              <Typography 
                variant="h5" 
                gutterBottom
                sx={{ 
                  color: 'white',
                  fontWeight: 600,
                  mb: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <TrendingUp sx={{ color: '#4caf50' }} />
                Evolução dos Clientes (Últimos 30 dias)
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorPEN" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF9800" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#FF9800" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorPRO" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2196F3" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#2196F3" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorAPV" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4caf50" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#4caf50" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="date" 
                    stroke="rgba(255,255,255,0.7)"
                    tick={{ fill: 'rgba(255,255,255,0.7)' }}
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.7)"
                    tick={{ fill: 'rgba(255,255,255,0.7)' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(0,0,0,0.8)',
                      border: '1px solid rgba(76, 175, 80, 0.3)',
                      borderRadius: '8px',
                      color: 'white'
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ color: 'white' }}
                  />
                  <Area type="monotone" dataKey="PEN" stackId="1" stroke="#FF9800" fillOpacity={1} fill="url(#colorPEN)" name="Pendente" />
                  <Area type="monotone" dataKey="PRO" stackId="1" stroke="#2196F3" fillOpacity={1} fill="url(#colorPRO)" name="Processando" />
                  <Area type="monotone" dataKey="APV" stackId="1" stroke="#4caf50" fillOpacity={1} fill="url(#colorAPV)" name="Aprovado" />
                </AreaChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Gráfico de barras - Status */}
          <Grid item xs={12} md={8}>
            <Paper
              sx={{
                p: 4,
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(76, 175, 80, 0.1)',
                borderRadius: '20px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              }}
            >
              <Typography 
                variant="h5" 
                gutterBottom
                sx={{ 
                  color: 'white',
                  fontWeight: 600,
                  mb: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <Assessment sx={{ color: '#4caf50' }} />
                Distribuição por Status
              </Typography>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={statistics.status_statistics}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="label" 
                    stroke="rgba(255,255,255,0.7)"
                    tick={{ fill: 'rgba(255,255,255,0.7)' }}
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.7)"
                    tick={{ fill: 'rgba(255,255,255,0.7)' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(0,0,0,0.8)',
                      border: '1px solid rgba(76, 175, 80, 0.3)',
                      borderRadius: '8px',
                      color: 'white'
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ color: 'white' }}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="#4caf50"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Gráfico de pizza - Status */}
          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                p: 4,
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(76, 175, 80, 0.1)',
                borderRadius: '20px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              }}
            >
              <Typography 
                variant="h5" 
                gutterBottom
                sx={{ 
                  color: 'white',
                  fontWeight: 600,
                  mb: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <Hub sx={{ color: '#4caf50' }} />
                Status dos Clientes
              </Typography>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={statistics.status_statistics}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ label, percentage }) => `${label} ${percentage}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {statistics.status_statistics.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]}
                        stroke="rgba(0,0,0,0.3)"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(0,0,0,0.8)',
                      border: '1px solid rgba(76, 175, 80, 0.3)',
                      borderRadius: '8px',
                      color: 'white'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Estatísticas por origem */}
          <Grid item xs={12} md={6}>
            <Paper
              sx={{
                p: 4,
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(76, 175, 80, 0.1)',
                borderRadius: '20px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              }}
            >
              <Typography 
                variant="h5" 
                gutterBottom
                sx={{ 
                  color: 'white',
                  fontWeight: 600,
                  mb: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <Security sx={{ color: '#4caf50' }} />
                Clientes por Origem
              </Typography>
              <Box>
                {statistics.origin_statistics.map((origin, index) => (
                  <Box
                    key={origin.origem}
                    sx={{ 
                      mb: 2, 
                      p: 2, 
                      background: 'rgba(76, 175, 80, 0.05)',
                      borderRadius: '12px',
                      border: '1px solid rgba(76, 175, 80, 0.1)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'rgba(76, 175, 80, 0.1)',
                        transform: 'translateX(5px)',
                      }
                    }}
                  >
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography 
                        variant="body1"
                        sx={{ 
                          color: 'white',
                          fontWeight: 500
                        }}
                      >
                        {origin.origem || 'Não informado'}
                      </Typography>
                      <Chip
                        label={origin.total}
                        sx={{
                          background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
                          color: 'white',
                          fontWeight: 600,
                          boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)'
                        }}
                      />
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(origin.total / Math.max(...statistics.origin_statistics.map(o => o.total))) * 100}
                      sx={{
                        mt: 1,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        '& .MuiLinearProgress-bar': {
                          background: 'linear-gradient(90deg, #4caf50 0%, #45a049 100%)',
                          borderRadius: 3,
                        }
                      }}
                    />
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>

          {/* Estatísticas por flag */}
          <Grid item xs={12} md={6}>
            <Paper
              sx={{
                p: 4,
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(76, 175, 80, 0.1)',
                borderRadius: '20px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              }}
            >
              <Typography 
                variant="h5" 
                gutterBottom
                sx={{ 
                  color: 'white',
                  fontWeight: 600,
                  mb: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <Speed sx={{ color: '#4caf50' }} />
                Status de Flag
              </Typography>
              <Box>
                <Box
                  sx={{ 
                    mb: 3, 
                    p: 3, 
                    background: 'rgba(76, 175, 80, 0.05)',
                    borderRadius: '16px',
                    border: '1px solid rgba(76, 175, 80, 0.1)',
                    textAlign: 'center'
                  }}
                >
                  <Typography 
                    variant="h4"
                    sx={{ 
                      color: 'white',
                      fontWeight: 700,
                      mb: 1,
                      textShadow: '0 0 10px rgba(76, 175, 80, 0.3)'
                    }}
                  >
                    {statistics.flag_statistics.flag_0}
                  </Typography>
                  <Typography 
                    variant="body1"
                    sx={{ 
                      color: 'rgba(255,255,255,0.7)',
                      fontWeight: 500
                    }}
                  >
                    Flag 0
                  </Typography>
                </Box>
                <Box
                  sx={{ 
                    p: 3, 
                    background: 'rgba(76, 175, 80, 0.1)',
                    borderRadius: '16px',
                    border: '1px solid rgba(76, 175, 80, 0.2)',
                    textAlign: 'center'
                  }}
                >
                  <Typography 
                    variant="h4"
                    sx={{ 
                      color: 'white',
                      fontWeight: 700,
                      mb: 1,
                      textShadow: '0 0 10px rgba(76, 175, 80, 0.3)'
                    }}
                  >
                    {statistics.flag_statistics.flag_1}
                  </Typography>
                  <Typography 
                    variant="body1"
                    sx={{ 
                      color: 'rgba(255,255,255,0.7)',
                      fontWeight: 500
                    }}
                  >
                    Flag 1
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
          }
        `}
      </style>
    </Box>
  );
};

export default Dashboard;

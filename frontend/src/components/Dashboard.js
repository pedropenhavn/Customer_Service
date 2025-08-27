import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  People,
  TrendingUp,
  CheckCircle,
  Warning,
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
  AreaChart,
  Area,
  LineChart,
  Line,
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

  // Preparar dados para os gráficos
  const statusData = statistics.status_statistics.map(item => ({
    name: item.label,
    value: item.count,
    percentage: item.percentage,
  }));

  const originData = statistics.origin_statistics.map(item => ({
    name: item.origem,
    value: item.total,
  }));

  const evolutionData = chartData.map(item => ({
    date: new Date(item.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    Pendente: item.PEN,
    Processando: item.PRO,
    Aprovado: item.APV,
    Reprovado: item.RPV,
    Erro: item.ERR,
  }));

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)',
        position: 'relative',
        overflow: 'hidden',
        py: { xs: 2, md: 4 },
      }}
    >
      {/* Animated background elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          left: '5%',
          width: { xs: '150px', md: '300px' },
          height: { xs: '150px', md: '300px' },
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
          width: { xs: '120px', md: '250px' },
          height: { xs: '120px', md: '250px' },
          background: 'radial-gradient(circle, rgba(76, 175, 80, 0.03) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'float 12s ease-in-out infinite reverse',
        }}
      />

      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
        

        {/* Statistic Cards */}
        <Grid container spacing={{ xs: 1.5, md: 2.5 }} sx={{ mb: { xs: 2, md: 4 }, justifyContent: 'center' }}>
          <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Card
              sx={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(76, 175, 80, 0.1)',
                borderRadius: '16px',
                boxShadow: '0 6px 24px rgba(0, 0, 0, 0.25)',
                transition: 'all 0.3s ease',
                height: '100%',
                width: '100%',
                maxWidth: { xs: '280px', md: '320px' },
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)',
                  border: '1px solid rgba(76, 175, 80, 0.15)',
                }
              }}
            >
              <CardContent sx={{ p: { xs: 1.5, md: 2.5 }, textAlign: 'center' }}>
                <Box
                  sx={{
                    background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
                    borderRadius: '12px',
                    p: { xs: 1, md: 1.5 },
                    mb: 1.5,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: { xs: '45px', md: '55px' },
                    height: { xs: '45px', md: '55px' },
                  }}
                >
                  <People sx={{ color: 'white', fontSize: { xs: 20, md: 24 } }} />
                </Box>
                <Typography variant="h4" sx={{ 
                  color: 'white', 
                  fontWeight: 600,
                  fontSize: { xs: '1.5rem', md: '1.75rem' },
                  mb: 0.5
                }}>
                  {statistics.total_clients}
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: 'rgba(255,255,255,0.6)', 
                  fontWeight: 300,
                  fontSize: { xs: '0.75rem', md: '0.875rem' }
                }}>
                  Total de Clientes
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Card
              sx={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(76, 175, 80, 0.1)',
                borderRadius: '16px',
                boxShadow: '0 6px 24px rgba(0, 0, 0, 0.25)',
                transition: 'all 0.3s ease',
                height: '100%',
                width: '100%',
                maxWidth: { xs: '280px', md: '320px' },
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)',
                  border: '1px solid rgba(76, 175, 80, 0.15)',
                }
              }}
            >
              <CardContent sx={{ p: { xs: 1.5, md: 2.5 }, textAlign: 'center' }}>
                <Box
                  sx={{
                    background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
                    borderRadius: '12px',
                    p: { xs: 1, md: 1.5 },
                    mb: 1.5,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: { xs: '45px', md: '55px' },
                    height: { xs: '45px', md: '55px' },
                  }}
                >
                  <TrendingUp sx={{ color: 'white', fontSize: { xs: 20, md: 24 } }} />
                </Box>
                <Typography variant="h4" sx={{ 
                  color: 'white', 
                  fontWeight: 600,
                  fontSize: { xs: '1.5rem', md: '1.75rem' },
                  mb: 0.5
                }}>
                  {statistics.recent_clients_7d}
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: 'rgba(255,255,255,0.6)', 
                  fontWeight: 300,
                  fontSize: { xs: '0.75rem', md: '0.875rem' }
                }}>
                  Últimos 7 dias
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Card
              sx={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(76, 175, 80, 0.1)',
                borderRadius: '16px',
                boxShadow: '0 6px 24px rgba(0, 0, 0, 0.25)',
                transition: 'all 0.3s ease',
                height: '100%',
                width: '100%',
                maxWidth: { xs: '280px', md: '320px' },
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)',
                  border: '1px solid rgba(76, 175, 80, 0.15)',
                }
              }}
            >
              <CardContent sx={{ p: { xs: 1.5, md: 2.5 }, textAlign: 'center' }}>
                <Box
                  sx={{
                    background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
                    borderRadius: '12px',
                    p: { xs: 1, md: 1.5 },
                    mb: 1.5,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: { xs: '45px', md: '55px' },
                    height: { xs: '45px', md: '55px' },
                  }}
                >
                  <CheckCircle sx={{ color: 'white', fontSize: { xs: 20, md: 24 } }} />
                </Box>
                <Typography variant="h4" sx={{ 
                  color: 'white', 
                  fontWeight: 600,
                  fontSize: { xs: '1.5rem', md: '1.75rem' },
                  mb: 0.5
                }}>
                  {statistics.status_statistics.find(s => s.code === 'APV')?.count || 0}
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: 'rgba(255,255,255,0.6)', 
                  fontWeight: 300,
                  fontSize: { xs: '0.75rem', md: '0.875rem' }
                }}>
                  Aprovados
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Card
              sx={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(76, 175, 80, 0.1)',
                borderRadius: '16px',
                boxShadow: '0 6px 24px rgba(0, 0, 0, 0.25)',
                transition: 'all 0.3s ease',
                height: '100%',
                width: '100%',
                maxWidth: { xs: '280px', md: '320px' },
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)',
                  border: '1px solid rgba(76, 175, 80, 0.15)',
                }
              }}
            >
              <CardContent sx={{ p: { xs: 1.5, md: 2.5 }, textAlign: 'center' }}>
                <Box
                  sx={{
                    background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
                    borderRadius: '12px',
                    p: { xs: 1, md: 1.5 },
                    mb: 1.5,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: { xs: '45px', md: '55px' },
                    height: { xs: '45px', md: '55px' },
                  }}
                >
                  <Warning sx={{ color: 'white', fontSize: { xs: 20, md: 24 } }} />
                </Box>
                <Typography variant="h4" sx={{ 
                  color: 'white', 
                  fontWeight: 600,
                  fontSize: { xs: '1.5rem', md: '1.75rem' },
                  mb: 0.5
                }}>
                  {statistics.status_statistics.find(s => s.code === 'PEN')?.count || 0}
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: 'rgba(255,255,255,0.6)', 
                  fontWeight: 300,
                  fontSize: { xs: '0.75rem', md: '0.875rem' }
                }}>
                  Pendentes
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Novos Cards Adicionados */}
          <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Card
              sx={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(76, 175, 80, 0.1)',
                borderRadius: '16px',
                boxShadow: '0 6px 24px rgba(0, 0, 0, 0.25)',
                transition: 'all 0.3s ease',
                height: '100%',
                width: '100%',
                maxWidth: { xs: '280px', md: '320px' },
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)',
                  border: '1px solid rgba(76, 175, 80, 0.15)',
                }
              }}
            >
              <CardContent sx={{ p: { xs: 1.5, md: 2.5 }, textAlign: 'center' }}>
                <Box
                  sx={{
                    background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
                    borderRadius: '12px',
                    p: { xs: 1, md: 1.5 },
                    mb: 1.5,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: { xs: '45px', md: '55px' },
                    height: { xs: '45px', md: '55px' },
                  }}
                >
                  <Assessment sx={{ color: 'white', fontSize: { xs: 20, md: 24 } }} />
                </Box>
                <Typography variant="h4" sx={{ 
                  color: 'white', 
                  fontWeight: 600,
                  fontSize: { xs: '1.5rem', md: '1.75rem' },
                  mb: 0.5
                }}>
                  {statistics.total_clients > 0 ? Math.round((statistics.status_statistics.find(s => s.code === 'APV')?.count || 0) / statistics.total_clients * 100) : 0}%
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: 'rgba(255,255,255,0.6)', 
                  fontWeight: 300,
                  fontSize: { xs: '0.75rem', md: '0.875rem' }
                }}>
                  Taxa de Aprovação
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Card
              sx={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(76, 175, 80, 0.1)',
                borderRadius: '16px',
                boxShadow: '0 6px 24px rgba(0, 0, 0, 0.25)',
                transition: 'all 0.3s ease',
                height: '100%',
                width: '100%',
                maxWidth: { xs: '280px', md: '320px' },
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)',
                  border: '1px solid rgba(76, 175, 80, 0.15)',
                }
              }}
            >
              <CardContent sx={{ p: { xs: 1.5, md: 2.5 }, textAlign: 'center' }}>
                <Box
                  sx={{
                    background: 'linear-gradient(135deg, #F44336 0%, #D32F2F 100%)',
                    borderRadius: '12px',
                    p: { xs: 1, md: 1.5 },
                    mb: 1.5,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: { xs: '45px', md: '55px' },
                    height: { xs: '45px', md: '55px' },
                  }}
                >
                  <Security sx={{ color: 'white', fontSize: { xs: 20, md: 24 } }} />
                </Box>
                <Typography variant="h4" sx={{ 
                  color: 'white', 
                  fontWeight: 600,
                  fontSize: { xs: '1.5rem', md: '1.75rem' },
                  mb: 0.5
                }}>
                  {statistics.status_statistics.find(s => s.code === 'RPV')?.count || 0}
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: 'rgba(255,255,255,0.6)', 
                  fontWeight: 300,
                  fontSize: { xs: '0.75rem', md: '0.875rem' }
                }}>
                  Reprovados
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Card
              sx={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(76, 175, 80, 0.1)',
                borderRadius: '16px',
                boxShadow: '0 6px 24px rgba(0, 0, 0, 0.25)',
                transition: 'all 0.3s ease',
                height: '100%',
                width: '100%',
                maxWidth: { xs: '280px', md: '320px' },
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)',
                  border: '1px solid rgba(76, 175, 80, 0.15)',
                }
              }}
            >
              <CardContent sx={{ p: { xs: 1.5, md: 2.5 }, textAlign: 'center' }}>
                <Box
                  sx={{
                    background: 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)',
                    borderRadius: '12px',
                    p: { xs: 1, md: 1.5 },
                    mb: 1.5,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: { xs: '45px', md: '55px' },
                    height: { xs: '45px', md: '55px' },
                  }}
                >
                  <Schedule sx={{ color: 'white', fontSize: { xs: 20, md: 24 } }} />
                </Box>
                <Typography variant="h4" sx={{ 
                  color: 'white', 
                  fontWeight: 600,
                  fontSize: { xs: '1.5rem', md: '1.75rem' },
                  mb: 0.5
                }}>
                  {statistics.status_statistics.find(s => s.code === 'PRO')?.count || 0}
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: 'rgba(255,255,255,0.6)', 
                  fontWeight: 300,
                  fontSize: { xs: '0.75rem', md: '0.875rem' }
                }}>
                  Processando
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Card
              sx={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(76, 175, 80, 0.1)',
                borderRadius: '16px',
                boxShadow: '0 6px 24px rgba(0, 0, 0, 0.25)',
                transition: 'all 0.3s ease',
                height: '100%',
                width: '100%',
                maxWidth: { xs: '280px', md: '320px' },
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)',
                  border: '1px solid rgba(76, 175, 80, 0.15)',
                }
              }}
            >
            
            </Card>
          </Grid>
        </Grid>

        {/* Charts */}
        <Grid container spacing={{ xs: 1.5, md: 2.5 }} sx={{ justifyContent: 'center' }}>
          {/* Evolução dos Clientes */}
          <Grid item xs={12} lg={8} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Paper
              sx={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(76, 175, 80, 0.1)',
                borderRadius: '16px',
                boxShadow: '0 6px 24px rgba(0, 0, 0, 0.25)',
                p: { xs: 1.5, md: 3 },
                height: '100%',
                width: '100%',
                maxWidth: '100%',
              }}
            >
              <Typography variant="h5" sx={{ 
                color: 'white', 
                fontWeight: 500, 
                mb: { xs: 1.5, md: 2.5 }, 
                display: 'flex', 
                alignItems: 'center',
                fontSize: { xs: '1.125rem', md: '1.25rem' }
              }}>
                <TrendingUp sx={{ mr: 1, color: '#4caf50', fontSize: { xs: 20, md: 24 } }} />
                Evolução dos Clientes (Últimos 30 dias)
              </Typography>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={evolutionData}>
                  <defs>
                    <linearGradient id="colorPendente" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF9800" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#FF9800" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorProcessando" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2196F3" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#2196F3" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorAprovado" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4caf50" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#4caf50" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorReprovado" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F44336" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#F44336" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="date" 
                    stroke="rgba(255,255,255,0.7)"
                    tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.7)"
                    tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(0,0,0,0.9)',
                      border: '1px solid rgba(76, 175, 80, 0.3)',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '12px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
                    }}
                    formatter={(value, name) => [value, name]}
                    labelFormatter={(label) => `Data: ${label}`}
                  />
                  <Legend 
                    wrapperStyle={{ 
                      color: 'white', 
                      fontSize: '12px',
                      paddingTop: '10px'
                    }} 
                  />
                  <Area type="monotone" dataKey="Pendente" stackId="1" stroke="#FF9800" fill="url(#colorPendente)" />
                  <Area type="monotone" dataKey="Processando" stackId="1" stroke="#2196F3" fill="url(#colorProcessando)" />
                  <Area type="monotone" dataKey="Aprovado" stackId="1" stroke="#4caf50" fill="url(#colorAprovado)" />
                  <Area type="monotone" dataKey="Reprovado" stackId="1" stroke="#F44336" fill="url(#colorReprovado)" />
                </AreaChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Distribuição por Status */}
          <Grid item xs={12} lg={4} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Paper
              sx={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(76, 175, 80, 0.1)',
                borderRadius: '16px',
                boxShadow: '0 6px 24px rgba(0, 0, 0, 0.25)',
                p: { xs: 1.5, md: 3 },
                height: '100%',
                width: '100%',
                maxWidth: '100%',
              }}
            >
              <Typography variant="h5" sx={{ 
                color: 'white', 
                fontWeight: 500, 
                mb: { xs: 1.5, md: 2.5 }, 
                display: 'flex', 
                alignItems: 'center',
                fontSize: { xs: '1.125rem', md: '1.25rem' }
              }}>
                <Assessment sx={{ mr: 1, color: '#4caf50', fontSize: { xs: 20, md: 24 } }} />
                Distribuição por Status
              </Typography>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(0,0,0,0.8)',
                      border: '1px solid rgba(76, 175, 80, 0.3)',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <Box sx={{ mt: 1.5 }}>
                {statusData.map((item, index) => (
                  <Box key={item.name} sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 0.75,
                    p: 0.75,
                    borderRadius: '6px',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.03)',
                    }
                  }}>
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        backgroundColor: COLORS[index % COLORS.length],
                        mr: 1,
                        boxShadow: '0 0 6px rgba(76, 175, 80, 0.2)',
                      }}
                    />
                    <Typography variant="body2" sx={{ 
                      color: 'rgba(255,255,255,0.7)', 
                      flex: 1,
                      fontSize: { xs: '0.7rem', md: '0.8rem' }
                    }}>
                      {item.name}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: 'white', 
                      fontWeight: 500,
                      fontSize: { xs: '0.7rem', md: '0.8rem' }
                    }}>
                      {item.value} ({item.percentage}%)
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>

          {/* Estatísticas por Origem */}
          <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Paper
              sx={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(76, 175, 80, 0.1)',
                borderRadius: '16px',
                boxShadow: '0 6px 24px rgba(0, 0, 0, 0.25)',
                p: { xs: 1.5, md: 3 },
                height: '100%',
                width: '100%',
                maxWidth: '100%',
              }}
            >
              <Typography variant="h5" sx={{ 
                color: 'white', 
                fontWeight: 500, 
                mb: { xs: 1.5, md: 2.5 }, 
                display: 'flex', 
                alignItems: 'center',
                fontSize: { xs: '1.125rem', md: '1.25rem' }
              }}>
                <Security sx={{ mr: 1, color: '#4caf50', fontSize: { xs: 20, md: 24 } }} />
                Estatísticas por Origem
              </Typography>
              <Box sx={{ mb: 2.5 }}>
                {originData.map((item, index) => (
                  <Box key={item.name} sx={{ mb: 2 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      mb: 1,
                      alignItems: 'center'
                    }}>
                      <Typography variant="body2" sx={{ 
                        color: 'rgba(255,255,255,0.7)',
                        fontWeight: 400,
                        fontSize: { xs: '0.8rem', md: '0.875rem' }
                      }}>
                        {item.name}
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        color: 'white', 
                        fontWeight: 500,
                        fontSize: { xs: '0.8rem', md: '0.875rem' }
                      }}>
                        {item.value}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(item.value / Math.max(...originData.map(d => d.value))) * 100}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: 'rgba(255,255,255,0.08)',
                        '& .MuiLinearProgress-bar': {
                          background: `linear-gradient(90deg, ${COLORS[index % COLORS.length]} 0%, ${COLORS[(index + 1) % COLORS.length]} 100%)`,
                          borderRadius: 4,
                          boxShadow: '0 0 8px rgba(76, 175, 80, 0.2)',
                        }
                      }}
                    />
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>

          {/* Status de Flag */}
          <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Paper
              sx={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(76, 175, 80, 0.1)',
                borderRadius: '16px',
                boxShadow: '0 6px 24px rgba(0, 0, 0, 0.25)',
                p: { xs: 1.5, md: 3 },
                height: '100%',
                width: '100%',
                maxWidth: '100%',
              }}
            >
              <Typography variant="h5" sx={{ 
                color: 'white', 
                fontWeight: 500, 
                mb: { xs: 1.5, md: 2.5 }, 
                display: 'flex', 
                alignItems: 'center',
                fontSize: { xs: '1.125rem', md: '1.25rem' }
              }}>
                <Speed sx={{ mr: 1, color: '#4caf50', fontSize: { xs: 20, md: 24 } }} />
                Status de Flag
              </Typography>
              <Grid container spacing={1.5}>
                <Grid item xs={6}>
                  <Box
                    sx={{
                      background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.15) 0%, rgba(76, 175, 80, 0.08) 100%)',
                      borderRadius: '12px',
                      p: { xs: 1.5, md: 2 },
                      textAlign: 'center',
                      border: '1px solid rgba(76, 175, 80, 0.2)',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="h3" sx={{ 
                      color: '#4caf50', 
                      fontWeight: 600, 
                      mb: 0.5,
                      fontSize: { xs: '1.5rem', md: '2rem' }
                    }}>
                      {statistics.flag_statistics.flag_1}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: 'rgba(255,255,255,0.7)', 
                      fontWeight: 400,
                      fontSize: { xs: '0.75rem', md: '0.875rem' }
                    }}>
                      Validado
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box
                    sx={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%)',
                      borderRadius: '12px',
                      p: { xs: 1.5, md: 2 },
                      textAlign: 'center',
                      border: '1px solid rgba(255,255,255,0.15)',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="h3" sx={{ 
                      color: 'white', 
                      fontWeight: 600, 
                      mb: 0.5,
                      fontSize: { xs: '1.5rem', md: '2rem' }
                    }}>
                      {statistics.flag_statistics.flag_0}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: 'rgba(255,255,255,0.7)', 
                      fontWeight: 400,
                      fontSize: { xs: '0.75rem', md: '0.875rem' }
                    }}>
                      Pendente
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
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

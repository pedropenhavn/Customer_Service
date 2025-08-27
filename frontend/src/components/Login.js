import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Container,
  Grid,
  InputAdornment,
  IconButton,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
  Hub,
  VerifiedUser,
  Assessment,
  Security,
  Speed,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { user, login, register } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirecionar se já estiver logado
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  // Estilo melhorado para os campos de texto
  const textFieldStyle = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      transition: 'all 0.3s ease',
      '& fieldset': {
        borderColor: '#e0e0e0',
        borderWidth: '1.5px',
      },
      '&:hover fieldset': {
        borderColor: '#4caf50',
        borderWidth: '2px',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#4caf50',
        borderWidth: '2px',
      },
      '& .MuiInputBase-input': {
        padding: '14px 16px',
      },
    },
    '& .MuiInputLabel-root': {
      color: '#666',
      '&.Mui-focused': {
        color: '#4caf50',
      },
    },
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let result;
      if (activeTab === 0) { // Login
        result = await login(formData.email, formData.password);
      } else { // Register
        if (formData.password !== formData.password_confirmation) {
          setError('As senhas não coincidem');
          setLoading(false);
          return;
        }
        result = await register(
          formData.name,
          formData.email,
          formData.password,
          formData.password_confirmation
        );
      }

      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setFormData({
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
    });
    setError('');
  };

  return (
    <Box
      sx={{
        height: '100vh',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 80%, rgba(76, 175, 80, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(76, 175, 80, 0.1) 0%, transparent 50%), radial-gradient(circle at 40% 40%, rgba(76, 175, 80, 0.05) 0%, transparent 50%)',
          zIndex: 1,
        },
      }}
    >
      {/* Animated background elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          left: '10%',
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(76, 175, 80, 0.1) 0%, transparent 70%)',
          animation: 'float 8s ease-in-out infinite',
          zIndex: 1,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '20%',
          right: '15%',
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(76, 175, 80, 0.08) 0%, transparent 70%)',
          animation: 'float 10s ease-in-out infinite reverse',
          zIndex: 1,
        }}
      />
      
      <Container component="main" maxWidth="xl" sx={{ position: 'relative', zIndex: 2, height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 0, pl: 0 }}>
        <Box sx={{ display: 'flex', width: '100vw', height: '100vh', position: 'absolute', top: 0, left: 0, flexDirection: { xs: 'column', md: 'row' } }}>
          {/* Left side - Logo and Info */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            flex: { xs: 'none', md: 1 }, 
            height: { xs: '60vh', md: '100vh' },
            width: { xs: '100%', md: 'auto' },
            order: { xs: 2, md: 1 }
          }}>
                          <Box sx={{ textAlign: 'center', color: 'white', maxWidth: { xs: '90%', sm: 500 }, px: { xs: 2, sm: 0 } }}>
              {/* Logo */}
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: { xs: 2, md: 4 }, flexDirection: { xs: 'column', sm: 'row' } }}>
                                  <VerifiedUser sx={{ fontSize: { xs: 30, sm: 35, md: 40 }, color: '#4caf50', mr: { xs: 0, sm: 2 }, mb: { xs: 1, sm: 0 } }} />
                <Box>
                                                  <Typography variant="h4" component="h1" sx={{ 
                    fontWeight: 700, 
                    color: 'white', 
                    mb: 1, 
                    fontSize: { xs: '1.4rem', sm: '1.8rem', md: '2.2rem' },
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                    letterSpacing: '1px'
                  }}>
                    API CLIENT
                  </Typography>
                                      <Typography variant="body2" sx={{ 
                      fontWeight: 400, 
                      color: 'rgba(255,255,255,0.9)', 
                      fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                      textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                      letterSpacing: '0.5px'
                    }}>
                      Sistema de Validação de Clientes
                    </Typography>
                </Box>
              </Box>

              {/* Description */}
                              <Typography variant="body2" sx={{ 
                  mb: 4, 
                  fontWeight: 400, 
                  lineHeight: 1.5, 
                  color: 'rgba(255,255,255,0.9)', 
                  fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' },
                  textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                  letterSpacing: '0.3px',
                  maxWidth: '600px',
                  margin: '0 auto 2rem auto'
                }}>
                  Plataforma completa para análise, validação e gestão de clientes com máxima segurança e eficiência
                </Typography>

              {/* Features */}
                              <Grid container spacing={{ xs: 1, sm: 2 }} sx={{ mt: { xs: 2, md: 3 }, alignItems: 'center', justifyContent: 'center' }}>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80px' }}>
                    <Security sx={{ 
                      fontSize: { xs: 25, sm: 30, md: 35 }, 
                      color: '#4caf50', 
                      mb: 1.5,
                      filter: 'drop-shadow(0 2px 4px rgba(76, 175, 80, 0.3))'
                    }} />
                    <Typography variant="body2" sx={{ 
                      fontWeight: 600, 
                      mb: 1, 
                      fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' },
                      color: 'white',
                      textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                      letterSpacing: '0.3px'
                    }}>
                      Validação Segura
                    </Typography>
                    <Typography variant="caption" sx={{ 
                      opacity: 0.9, 
                      fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.85rem' },
                      color: 'rgba(255,255,255,0.9)',
                      textShadow: '0 1px 2px rgba(0,0,0,0.2)'
                    }}>
                      Análise completa de dados
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80px' }}>
                    <Assessment sx={{ 
                      fontSize: { xs: 25, sm: 30, md: 35 }, 
                      color: '#4caf50', 
                      mb: 1.5,
                      filter: 'drop-shadow(0 2px 4px rgba(76, 175, 80, 0.3))'
                    }} />
                    <Typography variant="body2" sx={{ 
                      fontWeight: 600, 
                      mb: 1, 
                      fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' },
                      color: 'white',
                      textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                      letterSpacing: '0.3px'
                    }}>
                      Relatórios Detalhados
                    </Typography>
                    <Typography variant="caption" sx={{ 
                      opacity: 0.9, 
                      fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.85rem' },
                      color: 'rgba(255,255,255,0.9)',
                      textShadow: '0 1px 2px rgba(0,0,0,0.2)'
                    }}>
                      Insights e métricas
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80px' }}>
                    <Speed sx={{ 
                      fontSize: { xs: 25, sm: 30, md: 35 }, 
                      color: '#4caf50', 
                      mb: 1.5,
                      filter: 'drop-shadow(0 2px 4px rgba(76, 175, 80, 0.3))'
                    }} />
                    <Typography variant="body2" sx={{ 
                      fontWeight: 600, 
                      mb: 1, 
                      fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' },
                      color: 'white',
                      textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                      letterSpacing: '0.3px'
                    }}>
                      Processamento Rápido
                    </Typography>
                    <Typography variant="caption" sx={{ 
                      opacity: 0.9, 
                      fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.85rem' },
                      color: 'rgba(255,255,255,0.9)',
                      textShadow: '0 1px 2px rgba(0,0,0,0.2)'
                    }}>
                      Validação em tempo real
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80px' }}>
                    <Hub sx={{ 
                      fontSize: { xs: 25, sm: 30, md: 35 }, 
                      color: '#4caf50', 
                      mb: 1.5,
                      filter: 'drop-shadow(0 2px 4px rgba(76, 175, 80, 0.3))'
                    }} />
                    <Typography variant="body2" sx={{ 
                      fontWeight: 600, 
                      mb: 1, 
                      fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' },
                      color: 'white',
                      textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                      letterSpacing: '0.3px'
                    }}>
                      Gestão Centralizada
                    </Typography>
                    <Typography variant="caption" sx={{ 
                      opacity: 0.9, 
                      fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.85rem' },
                      color: 'rgba(255,255,255,0.9)',
                      textShadow: '0 1px 2px rgba(0,0,0,0.2)'
                    }}>
                      Controle total de clientes
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Box>

          {/* Right side - Login Form */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            width: { xs: '100%', md: '400px' }, 
            height: { xs: '40vh', md: '100vh' },
            mr: 0,
            order: { xs: 1, md: 2 }
          }}>
            <Paper
              elevation={8}
              sx={{
                padding: { xs: 2.5, sm: 3.5, md: 4.5 },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: { xs: '95%', sm: '90%', md: '400px' },
                height: { xs: 'auto', md: '100vh' },
                borderRadius: { xs: '16px', md: '16px 0 0 16px' },
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
                backdropFilter: 'blur(25px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRight: 'none',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1), 0 8px 16px rgba(0, 0, 0, 0.05)',
                mr: 0,
              }}
            >
              {/* Logo and Title */}
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                  <Hub sx={{ fontSize: 35, color: '#4caf50', mr: 1.5, filter: 'drop-shadow(0 2px 4px rgba(76, 175, 80, 0.3))' }} />
                  <Typography variant="h5" component="h1" sx={{ fontWeight: 600, color: '#1a1a1a', letterSpacing: '0.5px' }}>
                    Validator
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 300, opacity: 0.8, letterSpacing: '0.3px' }}>
                  Sistema de Validação de Clientes
                </Typography>
              </Box>

              {/* Tabs */}
              <Box sx={{ width: '100%', mb: 3 }}>
                <Tabs
                  value={activeTab}
                  onChange={handleTabChange}
                  variant="fullWidth"
                  sx={{
                    '& .MuiTab-root': {
                      color: '#666',
                      fontWeight: 400,
                      textTransform: 'none',
                      fontSize: '0.9rem',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        color: '#4caf50',
                        backgroundColor: 'rgba(76, 175, 80, 0.05)',
                      },
                    },
                    '& .Mui-selected': {
                      color: '#4caf50',
                      fontWeight: 500,
                    },
                    '& .MuiTabs-indicator': {
                      backgroundColor: '#4caf50',
                      height: 3,
                      borderRadius: '2px',
                    },
                  }}
                >
                  <Tab label="Entrar" />
                  <Tab label="Cadastrar" />
                </Tabs>
              </Box>

              {/* Welcome Message */}
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 500, color: '#1a1a1a', mb: 1, letterSpacing: '0.3px' }}>
                  {activeTab === 0 ? 'Bem-vindo de volta' : 'Criar nova conta'}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ opacity: 0.7, lineHeight: 1.4 }}>
                  {activeTab === 0 
                    ? 'Digite suas credenciais para acessar sua conta'
                    : 'Preencha os dados para criar sua conta'
                  }
                </Typography>
              </Box>

              {/* Error Alert */}
              {error && (
                <Alert severity="error" sx={{ width: '100%', mb: 3 }}>
                  {error}
                </Alert>
              )}

              {/* Form */}
              <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                {activeTab === 1 && (
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="name"
                    label="Nome completo"
                    name="name"
                    autoComplete="name"
                    autoFocus
                    value={formData.name}
                    onChange={handleInputChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person sx={{ color: '#4caf50' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: '#e0e0e0',
                        },
                        '&:hover fieldset': {
                          borderColor: '#4caf50',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#4caf50',
                        },
                      },
                    }}
                  />
                )}

                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email"
                  name="email"
                  autoComplete="email"
                  autoFocus={activeTab === 0}
                  value={formData.email}
                  onChange={handleInputChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email sx={{ color: '#4caf50' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: '#e0e0e0',
                      },
                      '&:hover fieldset': {
                        borderColor: '#4caf50',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#4caf50',
                      },
                    },
                  }}
                />

                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Senha"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleInputChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: '#4caf50' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: '#e0e0e0',
                      },
                      '&:hover fieldset': {
                        borderColor: '#4caf50',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#4caf50',
                      },
                    },
                  }}
                />

                {activeTab === 1 && (
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="password_confirmation"
                    label="Confirmar senha"
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="password_confirmation"
                    value={formData.password_confirmation}
                    onChange={handleInputChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock sx={{ color: '#4caf50' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: '#e0e0e0',
                        },
                        '&:hover fieldset': {
                          borderColor: '#4caf50',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#4caf50',
                        },
                      },
                    }}
                  />
                )}

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  sx={{
                    mt: 3,
                    mb: 2,
                    py: 2,
                    backgroundColor: '#4caf50',
                    color: 'white',
                    fontWeight: 500,
                    fontSize: '0.95rem',
                    textTransform: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 6px 20px rgba(76, 175, 80, 0.3)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: '#45a049',
                      boxShadow: '0 8px 25px rgba(76, 175, 80, 0.4)',
                      transform: 'translateY(-2px)',
                    },
                    '&:disabled': {
                      backgroundColor: '#ccc',
                      boxShadow: 'none',
                      transform: 'none',
                    },
                  }}
                >
                  {loading ? 'Carregando...' : (activeTab === 0 ? 'Entrar no Sistema' : 'Criar Conta')}
                </Button>
              </Box>

              {/* Footer */}
              <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Typography variant="caption" color="text.secondary" sx={{ opacity: 0.6, letterSpacing: '0.5px' }}>
                  © 2024 Sistema HUB. Todos os direitos reservados.
                </Typography>
              </Box>
            </Paper>
          </Box>
        </Box>
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

export default Login;

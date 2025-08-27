import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Chip,
  Modal,
  IconButton,
  Card,
  CardContent,
  Grid,
  Divider,
} from '@mui/material';
import {
  People,
  Close,
  Visibility,
} from '@mui/icons-material';
import api from '../services/api';

const statusLabels = {
  PEN: { label: 'Pendente', color: '#FF9800', bgColor: 'rgba(255, 152, 0, 0.1)' },
  PRO: { label: 'Processando', color: '#2196F3', bgColor: 'rgba(33, 150, 243, 0.1)' },
  ERR: { label: 'Erro', color: '#F44336', bgColor: 'rgba(244, 67, 54, 0.1)' },
  RPV: { label: 'Reprovado', color: '#F44336', bgColor: 'rgba(244, 67, 54, 0.1)' },
  APV: { label: 'Aprovado', color: '#4caf50', bgColor: 'rgba(76, 175, 80, 0.1)' },
};

const ClientsList = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Fazendo requisição para consultClients...');
      const response = await api.get('/api/consultClients');
      console.log('Resposta recebida:', response.data);
      
      if (response.data.success) {
        console.log('Clientes encontrados:', response.data.data.length);
        setClients(response.data.data);
      } else {
        setError('Erro na resposta da API');
      }
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      setError(`Erro ao carregar clientes: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCnpj = (cnpj) => {
    if (!cnpj) return '';
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  };

  const handleOpenModal = (client) => {
    setSelectedClient(client);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedClient(null);
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
            Carregando Clientes...
          </Typography>
        </Box>
      </Box>
    );
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
      <Container maxWidth="xl" sx={{ pt: 4, pb: 4, position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
            <People sx={{ 
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
              CLIENTES
            </Typography>
          </Box>
          <Typography 
            variant="h6" 
            sx={{ 
              color: 'rgba(255,255,255,0.7)',
              fontWeight: 300,
              letterSpacing: '1px'
            }}
          >
            Total de Clientes: {clients.length}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Table */}
        <Paper
          sx={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(76, 175, 80, 0.1)',
            borderRadius: '20px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            overflow: 'hidden',
          }}
        >
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ background: 'rgba(76, 175, 80, 0.1)' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>ID</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>CNPJ</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Origem</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Flag</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Criado em</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {clients.map((client) => (
                  <TableRow 
                    key={client.id}
                    sx={{ 
                      '&:hover': {
                        backgroundColor: 'rgba(76, 175, 80, 0.05)',
                      }
                    }}
                  >
                    <TableCell sx={{ color: 'white' }}>{client.id}</TableCell>
                    <TableCell sx={{ color: 'white' }}>{formatCnpj(client.cnpj)}</TableCell>
                    <TableCell>
                      <Chip
                        label={statusLabels[client.status]?.label || client.status}
                        sx={{
                          backgroundColor: statusLabels[client.status]?.bgColor || 'rgba(255,255,255,0.1)',
                          color: statusLabels[client.status]?.color || 'white',
                          fontWeight: 600,
                          border: `1px solid ${statusLabels[client.status]?.color || 'rgba(255,255,255,0.3)'}`,
                        }}
                        size="small"
                      />
                    </TableCell>
                    <TableCell sx={{ color: 'white' }}>{client.origem}</TableCell>
                    <TableCell>
                      <Chip
                        label={`Flag ${client.flag}`}
                        sx={{
                          backgroundColor: client.flag === 1 ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255,255,255,0.1)',
                          color: client.flag === 1 ? '#4caf50' : 'white',
                          fontWeight: 600,
                          border: `1px solid ${client.flag === 1 ? '#4caf50' : 'rgba(255,255,255,0.3)'}`,
                        }}
                        size="small"
                      />
                    </TableCell>
                    <TableCell sx={{ color: 'white' }}>{formatDate(client.created_at)}</TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => handleOpenModal(client)}
                        size="small"
                        sx={{
                          color: 'rgba(255,255,255,0.7)',
                          '&:hover': {
                            color: '#4caf50',
                            backgroundColor: 'rgba(76, 175, 80, 0.1)',
                          }
                        }}
                      >
                        <Visibility />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Modal de Detalhes */}
        <Modal
          open={modalOpen}
          onClose={handleCloseModal}
          aria-labelledby="client-details-modal"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 2,
          }}
        >
          <Box
            sx={{
              width: '90%',
              maxWidth: 1200,
              maxHeight: '90vh',
              background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
              border: '2px solid rgba(76, 175, 80, 0.3)',
              borderRadius: '20px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {/* Header do Modal */}
            <Box
              sx={{
                background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.2) 0%, rgba(76, 175, 80, 0.1) 100%)',
                p: 3,
                borderBottom: '1px solid rgba(76, 175, 80, 0.2)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Box>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    color: 'white',
                    fontWeight: 700,
                    mb: 1,
                  }}
                >
                  Cliente #{selectedClient?.id}
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: 'rgba(255,255,255,0.8)',
                    fontWeight: 400,
                  }}
                >
                  CNPJ: {selectedClient ? formatCnpj(selectedClient.cnpj) : ''}
                </Typography>
              </Box>
              <IconButton
                onClick={handleCloseModal}
                sx={{
                  color: 'rgba(255,255,255,0.7)',
                  '&:hover': {
                    color: '#4caf50',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                  }
                }}
              >
                <Close />
              </IconButton>
            </Box>

            {/* Conteúdo do Modal */}
            <Box sx={{ p: 3, overflow: 'auto', maxHeight: 'calc(90vh - 120px)' }}>
              {selectedClient && (
                <Grid container spacing={3}>
                  {/* Informações Básicas */}
                  <Grid item xs={12} md={6}>
                    <Card
                      sx={{
                        background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%)',
                        border: '1px solid rgba(76, 175, 80, 0.2)',
                        borderRadius: '16px',
                      }}
                    >
                      <CardContent>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            color: 'white',
                            fontWeight: 600,
                            mb: 2
                          }}
                        >
                          Informações Básicas
                        </Typography>
                        
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 0.5 }}>
                            Status:
                          </Typography>
                          <Chip
                            label={statusLabels[selectedClient.status]?.label || selectedClient.status}
                            sx={{
                              backgroundColor: statusLabels[selectedClient.status]?.bgColor || 'rgba(255,255,255,0.1)',
                              color: statusLabels[selectedClient.status]?.color || 'white',
                              fontWeight: 600,
                            }}
                          />
                        </Box>

                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 0.5 }}>
                            Origem:
                          </Typography>
                          <Typography variant="body1" sx={{ color: 'white', fontWeight: 500 }}>
                            {selectedClient.origem}
                          </Typography>
                        </Box>

                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 0.5 }}>
                            Flag:
                          </Typography>
                          <Chip
                            label={`Flag ${selectedClient.flag}`}
                            sx={{
                              backgroundColor: selectedClient.flag === 1 ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255,255,255,0.1)',
                              color: selectedClient.flag === 1 ? '#4caf50' : 'white',
                              fontWeight: 600,
                            }}
                          />
                        </Box>

                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 0.5 }}>
                            Criado em:
                          </Typography>
                          <Typography variant="body1" sx={{ color: 'white', fontWeight: 500 }}>
                            {formatDate(selectedClient.created_at)}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Dados de Consulta */}
                  <Grid item xs={12} md={6}>
                    <Card
                      sx={{
                        background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%)',
                        border: '1px solid rgba(76, 175, 80, 0.2)',
                        borderRadius: '16px',
                      }}
                    >
                      <CardContent>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            color: 'white',
                            fontWeight: 600,
                            mb: 2
                          }}
                        >
                          Dados de Consulta
                        </Typography>
                        
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 0.5 }}>
                            Sintegra:
                          </Typography>
                          <Box
                            component="pre"
                            sx={{
                              background: 'rgba(0,0,0,0.3)',
                              color: 'white',
                              p: 1.5,
                              borderRadius: '8px',
                              fontSize: '0.75rem',
                              overflow: 'auto',
                              maxHeight: 100,
                              border: '1px solid rgba(76, 175, 80, 0.2)',
                            }}
                          >
                            {selectedClient.sintegra || 'Não disponível'}
                          </Box>
                        </Box>

                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 0.5 }}>
                            CNPJ WS:
                          </Typography>
                          <Box
                            component="pre"
                            sx={{
                              background: 'rgba(0,0,0,0.3)',
                              color: 'white',
                              p: 1.5,
                              borderRadius: '8px',
                              fontSize: '0.75rem',
                              overflow: 'auto',
                              maxHeight: 100,
                              border: '1px solid rgba(76, 175, 80, 0.2)',
                            }}
                          >
                            {selectedClient.cnpjws || 'Não disponível'}
                          </Box>
                        </Box>

                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 0.5 }}>
                            Consulta CEP:
                          </Typography>
                          <Box
                            component="pre"
                            sx={{
                              background: 'rgba(0,0,0,0.3)',
                              color: 'white',
                              p: 1.5,
                              borderRadius: '8px',
                              fontSize: '0.75rem',
                              overflow: 'auto',
                              maxHeight: 100,
                              border: '1px solid rgba(76, 175, 80, 0.2)',
                            }}
                          >
                            {selectedClient.consultacep || 'Não disponível'}
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Motivo/Reason */}
                  <Grid item xs={12}>
                    <Card
                      sx={{
                        background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%)',
                        border: '1px solid rgba(76, 175, 80, 0.2)',
                        borderRadius: '16px',
                      }}
                    >
                      <CardContent>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            color: 'white',
                            fontWeight: 600,
                            mb: 2
                          }}
                        >
                          Motivo/Reason
                        </Typography>
                        <Box
                          component="pre"
                          sx={{
                            background: 'rgba(0,0,0,0.3)',
                            color: 'white',
                            p: 2,
                            borderRadius: '8px',
                            fontSize: '0.875rem',
                            overflow: 'auto',
                            maxHeight: 200,
                            border: '1px solid rgba(76, 175, 80, 0.2)',
                          }}
                        >
                          {selectedClient.reason || 'Não disponível'}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* JSON Data */}
                  <Grid item xs={12}>
                    <Card
                      sx={{
                        background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%)',
                        border: '1px solid rgba(76, 175, 80, 0.2)',
                        borderRadius: '16px',
                      }}
                    >
                      <CardContent>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            color: 'white',
                            fontWeight: 600,
                            mb: 2
                          }}
                        >
                          JSON Data
                        </Typography>
                        <Box
                          component="pre"
                          sx={{
                            background: 'rgba(0,0,0,0.3)',
                            color: 'white',
                            p: 2,
                            borderRadius: '8px',
                            fontSize: '0.875rem',
                            overflow: 'auto',
                            maxHeight: 300,
                            border: '1px solid rgba(76, 175, 80, 0.2)',
                          }}
                        >
                          {JSON.stringify(selectedClient.json, null, 2)}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              )}
            </Box>
          </Box>
        </Modal>
      </Container>
    </Box>
  );
};

export default ClientsList;

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  IconButton,
  Collapse,
  Card,
  CardContent,
} from '@mui/material';
import {
  Search,
  FilterList,
  ExpandMore,
  ExpandLess,
  Refresh,
} from '@mui/icons-material';
import api from '../services/api';

const statusLabels = {
  PEN: { label: 'Pendente', color: 'warning' },
  PRO: { label: 'Processando', color: 'info' },
  ERR: { label: 'Erro', color: 'error' },
  RPV: { label: 'Reprovado', color: 'error' },
  APV: { label: 'Aprovado', color: 'success' },
};

const ClientsList = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    cnpj: '',
    origem: '',
    status: '',
    flag: '',
    created_from: '',
    created_to: '',
  });
  const [pagination, setPagination] = useState({
    page: 0,
    rowsPerPage: 15,
    total: 0,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [expandedRows, setExpandedRows] = useState(new Set());

  useEffect(() => {
    fetchClients();
  }, [pagination.page, pagination.rowsPerPage]);

  // Separar o useEffect para filters para evitar re-renders infinitos
  useEffect(() => {
    if (pagination.page === 0) {
      fetchClients();
    } else {
      setPagination(prev => ({ ...prev, page: 0 }));
    }
  }, [filters.cnpj, filters.origem, filters.status, filters.flag, filters.created_from, filters.created_to]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        page: pagination.page + 1,
        per_page: pagination.rowsPerPage,
      };

      const response = await api.get('/api/consultClients', { params });
      
      if (response.data.success) {
        setClients(response.data.data);
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination.total,
        }));
      }
    } catch (error) {
      setError('Erro ao carregar clientes');
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPagination(prev => ({ ...prev, page: 0 }));
  };

  const handlePageChange = (event, newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleRowsPerPageChange = (event) => {
    setPagination(prev => ({
      ...prev,
      rowsPerPage: parseInt(event.target.value, 10),
      page: 0,
    }));
  };

  const clearFilters = () => {
    setFilters({
      cnpj: '',
      origem: '',
      status: '',
      flag: '',
      created_from: '',
      created_to: '',
    });
    setPagination(prev => ({ ...prev, page: 0 }));
  };

  const toggleRowExpansion = (clientId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(clientId)) {
      newExpanded.delete(clientId);
    } else {
      newExpanded.add(clientId);
    }
    setExpandedRows(newExpanded);
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

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Lista de Clientes</Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<FilterList />}
            onClick={() => setShowFilters(!showFilters)}
            sx={{ mr: 1 }}
          >
            Filtros
          </Button>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchClients}
          >
            Atualizar
          </Button>
        </Box>
      </Box>

      {/* Filtros */}
      <Collapse in={showFilters}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Filtros
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="CNPJ"
                value={filters.cnpj}
                onChange={(e) => handleFilterChange('cnpj', e.target.value)}
                placeholder="Digite o CNPJ"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Origem"
                value={filters.origem}
                onChange={(e) => handleFilterChange('origem', e.target.value)}
                placeholder="Digite a origem"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  label="Status"
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <MenuItem value="">Todos</MenuItem>
                  {Object.entries(statusLabels).map(([code, { label }]) => (
                    <MenuItem key={code} value={code}>
                      {label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Flag</InputLabel>
                <Select
                  value={filters.flag}
                  label="Flag"
                  onChange={(e) => handleFilterChange('flag', e.target.value)}
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="0">Flag 0</MenuItem>
                  <MenuItem value="1">Flag 1</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                label="Data inicial"
                type="date"
                value={filters.created_from}
                onChange={(e) => handleFilterChange('created_from', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                label="Data final"
                type="date"
                value={filters.created_to}
                onChange={(e) => handleFilterChange('created_to', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <Button variant="outlined" onClick={clearFilters}>
                Limpar Filtros
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Collapse>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>CNPJ</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Origem</TableCell>
                  <TableCell>Flag</TableCell>
                  <TableCell>Criado em</TableCell>
                  <TableCell>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {clients.map((client) => (
                  <React.Fragment key={client.id}>
                    <TableRow>
                      <TableCell>{formatCnpj(client.cnpj)}</TableCell>
                      <TableCell>
                        <Chip
                          label={statusLabels[client.status]?.label || client.status}
                          color={statusLabels[client.status]?.color || 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{client.origem}</TableCell>
                      <TableCell>
                        <Chip
                          label={`Flag ${client.flag}`}
                          color={client.flag === 1 ? 'primary' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{formatDate(client.created_at)}</TableCell>
                      <TableCell>
                        <IconButton
                          onClick={() => toggleRowExpansion(client.id)}
                          size="small"
                        >
                          {expandedRows.has(client.id) ? <ExpandLess /> : <ExpandMore />}
                        </IconButton>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                        <Collapse in={expandedRows.has(client.id)} timeout="auto" unmountOnExit>
                          <Box sx={{ margin: 1 }}>
                            <Card>
                              <CardContent>
                                <Typography variant="h6" gutterBottom>
                                  Detalhes do Cliente
                                </Typography>
                                <Grid container spacing={2}>
                                  <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle2" color="textSecondary">
                                      JSON Data:
                                    </Typography>
                                    <Box
                                      component="pre"
                                      sx={{
                                        bgcolor: 'grey.100',
                                        p: 1,
                                        borderRadius: 1,
                                        fontSize: '0.875rem',
                                        overflow: 'auto',
                                        maxHeight: 200,
                                      }}
                                    >
                                      {JSON.stringify(client.json, null, 2)}
                                    </Box>
                                  </Grid>
                                  <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle2" color="textSecondary">
                                      Sintegra:
                                    </Typography>
                                    <Box
                                      component="pre"
                                      sx={{
                                        bgcolor: 'grey.100',
                                        p: 1,
                                        borderRadius: 1,
                                        fontSize: '0.875rem',
                                        overflow: 'auto',
                                        maxHeight: 200,
                                      }}
                                    >
                                      {client.sintegra || 'Não disponível'}
                                    </Box>
                                  </Grid>
                                  {client.reason && (
                                    <Grid item xs={12}>
                                      <Typography variant="subtitle2" color="textSecondary">
                                        Motivo:
                                      </Typography>
                                      <Typography variant="body2">
                                        {client.reason}
                                      </Typography>
                                    </Grid>
                                  )}
                                </Grid>
                              </CardContent>
                            </Card>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={pagination.total}
            page={pagination.page}
            onPageChange={handlePageChange}
            rowsPerPage={pagination.rowsPerPage}
            onRowsPerPageChange={handleRowsPerPageChange}
            rowsPerPageOptions={[10, 15, 25, 50]}
            labelRowsPerPage="Linhas por página:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`
            }
          />
        </>
      )}
    </Container>
  );
};

export default ClientsList;

import React, { useState } from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Menu,
  MenuItem,
  ListItemButton,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  People,
  Person,
  Logout,
  Hub,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    handleProfileMenuClose();
  };

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { text: 'Clientes', icon: <People />, path: '/clients' },
  ];

  const drawer = (
    <Box 
      sx={{ 
        width: 250,
        height: '100vh',
        background: 'linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%)',
        borderRight: '1px solid rgba(76, 175, 80, 0.2)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated background elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          left: '10%',
          width: '100px',
          height: '100px',
          background: 'radial-gradient(circle, rgba(76, 175, 80, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'float 8s ease-in-out infinite',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '20%',
          right: '10%',
          width: '80px',
          height: '80px',
          background: 'radial-gradient(circle, rgba(76, 175, 80, 0.08) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'float 10s ease-in-out infinite reverse',
        }}
      />

      <Box sx={{ p: 3, textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
          <Hub sx={{ 
            fontSize: 35, 
            color: '#4caf50', 
            mr: 1.5,
            filter: 'drop-shadow(0 0 10px rgba(76, 175, 80, 0.5))'
          }} />
          <Typography 
            variant="h6" 
            sx={{ 
              color: 'white',
              fontWeight: 600,
              letterSpacing: '1px',
              textShadow: '0 0 10px rgba(76, 175, 80, 0.3)'
            }}
          >
            HUB
          </Typography>
        </Box>
        <Typography 
          variant="body2" 
          sx={{ 
            color: 'rgba(255,255,255,0.7)',
            fontWeight: 300,
            letterSpacing: '0.5px'
          }}
        >
          Sistema de Validação
        </Typography>
      </Box>
      
      <Divider sx={{ borderColor: 'rgba(76, 175, 80, 0.2)' }} />
      
      <List sx={{ position: 'relative', zIndex: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              onClick={() => {
                navigate(item.path);
                setDrawerOpen(false);
              }}
              selected={location.pathname === item.path}
              sx={{
                mx: 2,
                borderRadius: '12px',
                background: location.pathname === item.path 
                  ? 'linear-gradient(135deg, rgba(76, 175, 80, 0.2) 0%, rgba(76, 175, 80, 0.1) 100%)'
                  : 'transparent',
                border: location.pathname === item.path 
                  ? '1px solid rgba(76, 175, 80, 0.3)'
                  : '1px solid transparent',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'rgba(76, 175, 80, 0.1)',
                  border: '1px solid rgba(76, 175, 80, 0.2)',
                  transform: 'translateX(5px)',
                },
                '&.Mui-selected': {
                  background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.2) 0%, rgba(76, 175, 80, 0.1) 100%)',
                  border: '1px solid rgba(76, 175, 80, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.25) 0%, rgba(76, 175, 80, 0.15) 100%)',
                  }
                }
              }}
            >
              <ListItemIcon sx={{ 
                color: location.pathname === item.path ? '#4caf50' : 'rgba(255,255,255,0.7)',
                minWidth: 40
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                sx={{
                  '& .MuiListItemText-primary': {
                    color: location.pathname === item.path ? 'white' : 'rgba(255,255,255,0.8)',
                    fontWeight: location.pathname === item.path ? 600 : 400,
                    fontSize: '0.95rem',
                    letterSpacing: '0.3px'
                  }
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
          borderBottom: '1px solid rgba(76, 175, 80, 0.2)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ 
              mr: 2, 
              display: { sm: 'none' },
              color: 'rgba(255,255,255,0.8)',
              '&:hover': {
                color: '#4caf50',
                background: 'rgba(76, 175, 80, 0.1)',
              }
            }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography 
            variant="h6" 
            noWrap 
            component="div" 
            sx={{ 
              flexGrow: 1,
              color: 'white',
              fontWeight: 600,
              letterSpacing: '1px',
              textShadow: '0 0 10px rgba(76, 175, 80, 0.3)'
            }}
          >
            Sistema de Clientes
          </Typography>
          
          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  mr: 2,
                  color: 'rgba(255,255,255,0.8)',
                  fontWeight: 500
                }}
              >
                Olá, {user.name}
              </Typography>
              <IconButton
                size="large"
                edge="end"
                aria-label="account of current user"
                aria-controls="primary-search-account-menu"
                aria-haspopup="true"
                onClick={handleProfileMenuOpen}
                sx={{
                  color: 'rgba(255,255,255,0.8)',
                  '&:hover': {
                    color: '#4caf50',
                    background: 'rgba(76, 175, 80, 0.1)',
                  }
                }}
              >
                <Avatar sx={{ 
                  width: 32, 
                  height: 32,
                  background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
                  boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)'
                }}>
                  <Person />
                </Avatar>
              </IconButton>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: 250 }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={drawerOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: 250,
              background: 'linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%)',
              borderRight: '1px solid rgba(76, 175, 80, 0.2)',
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: 250,
              background: 'linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%)',
              borderRight: '1px solid rgba(76, 175, 80, 0.2)',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - 250px)` },
          mt: 8,
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)',
          minHeight: 'calc(100vh - 64px)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Animated background elements */}
        <Box
          sx={{
            position: 'absolute',
            top: '5%',
            right: '5%',
            width: '200px',
            height: '200px',
            background: 'radial-gradient(circle, rgba(76, 175, 80, 0.03) 0%, transparent 70%)',
            borderRadius: '50%',
            animation: 'float 12s ease-in-out infinite',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '10%',
            left: '5%',
            width: '150px',
            height: '150px',
            background: 'radial-gradient(circle, rgba(76, 175, 80, 0.02) 0%, transparent 70%)',
            borderRadius: '50%',
            animation: 'float 15s ease-in-out infinite reverse',
          }}
        />

        <Box sx={{ position: 'relative', zIndex: 1 }}>
          {children}
        </Box>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        onClick={handleProfileMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)',
            border: '1px solid rgba(76, 175, 80, 0.2)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            borderRadius: '12px',
            mt: 1,
          }
        }}
      >
        <MenuItem 
          onClick={handleLogout}
          sx={{
            color: 'rgba(255,255,255,0.8)',
            '&:hover': {
              background: 'rgba(76, 175, 80, 0.1)',
              color: '#4caf50',
            }
          }}
        >
          <ListItemIcon sx={{ color: 'inherit' }}>
            <Logout fontSize="small" />
          </ListItemIcon>
          Sair
        </MenuItem>
      </Menu>

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

export default Layout;

import { Outlet, Link, useLocation } from 'react-router-dom'
import { AppBar, Box, Container, Toolbar, Typography, Button, Stack } from '@mui/material'

export default function Layout() {
  const loc = useLocation()
  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Kuzey ERP
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button color="inherit" component={Link} to="/">Dashboard</Button>
            <Button color="inherit" component={Link} to="/partners">Cari</Button>
          </Stack>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg">
        <Outlet />
      </Container>
    </Box>
  )
}

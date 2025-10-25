import { Outlet, Link, useLocation } from 'react-router-dom'
import { AppBar, Box, Container, Toolbar, Typography, Button, Stack } from '@mui/material'
import { useState } from 'react'

function InlineLogo({ width = 32, height = 32 }: { width?: number; height?: number }) {
  // Simple inline SVG fallback (stylized cutlery + text)
  return (
    <svg width={width} height={height} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="20" r="18" fill="#000000" fillOpacity="0.05" />
      <g transform="translate(10,6)" fill="#ff6f61">
        <path d="M6 6c0 1.1-.9 2-2 2s-2-.9-2-2V2h4v4z" />
        <rect x="10" y="2" width="2" height="8" rx="1" />
        <path d="M20 2c0 1.1-.9 2-2 2s-2-.9-2-2V0h4v2z" />
      </g>
    </svg>
  )
}

export default function Layout() {
  const loc = useLocation()
  const [imgError, setImgError] = useState(false)
  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ flexGrow: 1 }}>
            {/* Place your logo image at frontend/public/logo.png — fallback to inline SVG if missing */}
            {!imgError ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src="/logo.png"
                alt="Kuzey"
                width={40}
                height={40}
                style={{ borderRadius: 6 }}
                onError={() => setImgError(true)}
              />
            ) : (
              <InlineLogo width={40} height={40} />
            )}
            <Typography variant="h6">Kuzey ERP</Typography>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Button color="inherit" component={Link} to="/">Dashboard</Button>
            <Button color="inherit" component={Link} to="/partners">Cari</Button>
            <Button color="inherit" component={Link} to="/stock">Stok</Button>
          </Stack>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg">
        <Outlet />
      </Container>
    </Box>
  )
}

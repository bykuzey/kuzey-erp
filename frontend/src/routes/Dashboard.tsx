import { Container, Typography } from '@mui/material'

export default function Dashboard() {
  return (
    <Container sx={{ py: 3 }}>
      <Typography variant="h5">Dashboard</Typography>
      <Typography color="text.secondary">Kuzey ERP'ye hoş geldiniz.</Typography>
    </Container>
  )
}

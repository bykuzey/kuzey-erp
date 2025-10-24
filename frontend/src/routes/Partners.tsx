import { useEffect, useState } from 'react'
import { Container, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material'
import api from '../services/api'

type Partner = {
  id: number
  name: string
  type: string
  tax_no?: string | null
  phone?: string | null
  email?: string | null
  address?: string | null
}

export default function Partners() {
  const [rows, setRows] = useState<Partner[]>([])

  useEffect(() => {
    api.get<Partner[]>('/api/v1/partners/').then(r => setRows(r.data)).catch(() => setRows([]))
  }, [])

  return (
    <Container sx={{ py: 3 }}>
      <Typography variant="h5">Cari (Müşteri/Tedarikçi)</Typography>
      <Paper sx={{ mt: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Ad</TableCell>
              <TableCell>Tip</TableCell>
              <TableCell>Telefon</TableCell>
              <TableCell>E-posta</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(r => (
              <TableRow key={r.id}>
                <TableCell>{r.id}</TableCell>
                <TableCell>{r.name}</TableCell>
                <TableCell>{r.type}</TableCell>
                <TableCell>{r.phone}</TableCell>
                <TableCell>{r.email}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  )
}

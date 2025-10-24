import { useState } from 'react'
import { Box, Button, Paper, Stack, TextField, Typography } from '@mui/material'
import api from '../services/api'

export default function Login() {
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('admin')
  const [message, setMessage] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const form = new URLSearchParams()
      form.append('username', username)
      form.append('password', password)
      const { data } = await api.post('/api/v1/core/auth/login', form, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
      localStorage.setItem('token', data.access_token)
      setMessage('Giriş başarılı')
    } catch (err: any) {
      setMessage('Giriş başarısız')
    }
  }

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
      <Paper sx={{ p: 3, width: 360 }}>
        <Typography variant="h6">Kuzey ERP Giriş</Typography>
        <Box component="form" onSubmit={onSubmit}>
          <Stack spacing={2} mt={2}>
            <TextField label="Kullanıcı Adı" value={username} onChange={e => setUsername(e.target.value)} />
            <TextField label="Şifre" type="password" value={password} onChange={e => setPassword(e.target.value)} />
            <Button type="submit" variant="contained">Giriş</Button>
            {message && <Typography color="text.secondary">{message}</Typography>}
          </Stack>
        </Box>
      </Paper>
    </Box>
  )
}

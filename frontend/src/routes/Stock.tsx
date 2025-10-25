import { useEffect, useState } from 'react'
import {
  Container,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Stack,
  CircularProgress,
  Snackbar,
} from '@mui/material'
// Removed icon imports to avoid resolution issues in some environments
import api from '../services/api'

type StockItem = {
  id: number
  sku?: string | null
  name: string
  barcode?: string | null
  unit?: string | null
  price_sale?: number
  price_cost?: number
}

export default function Stock() {
  const [rows, setRows] = useState<StockItem[]>([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<StockItem | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const emptyForm: StockItem = { id: 0, sku: '', name: '', quantity: 0, location: '' }
  const [form, setForm] = useState<StockItem>(emptyForm)

  const demoRows: StockItem[] = [
    { id: 201, sku: 'SKU-1001', name: 'Vida M4x10', quantity: 500, location: 'Depo A' },
    { id: 202, sku: 'SKU-1002', name: 'Somun M4', quantity: 300, location: 'Depo B' },
    { id: 203, sku: 'SKU-2001', name: 'Motor 12V', quantity: 12, location: 'Depo C' },
  ]

  const [filterName, setFilterName] = useState('')
  const [filterLowStock, setFilterLowStock] = useState(false)

  useEffect(() => {
    api.get<StockItem[]>('/api/v1/stock/products').then(r => {
      if (r.data && r.data.length > 0) setRows(r.data)
      else setRows(demoRows)
    }).catch(() => setRows(demoRows))
  }, [])

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setOpen(true)
  }

  function openEdit(item: StockItem) {
    setEditing(item)
    setForm(item)
    setOpen(true)
  }

  async function handleSubmit() {
    if (!form.name || form.name.trim() === '') {
      setError('Ürün adı zorunludur')
      return
    }
    setSaving(true)
    try {
      if (editing) {
        const res = await api.put<StockItem>(`/api/v1/stock/products/${editing.id}`, form)
        setRows(prev => prev.map(r => (r.id === editing.id ? res.data : r)))
      } else {
        const res = await api.post<StockItem>('/api/v1/stock/products', form)
        setRows(prev => [...prev, res.data])
      }
      setOpen(false)
    } catch (err) {
      setError('Kaydetme başarısız oldu')
    } finally {
      setSaving(false)
    }
  }

  async function seedDemo() {
    if (!confirm('Demo verileri backend\'e eklensin mi? (Varolan veriler etkilenmez)')) return
    setSaving(true)
    try {
      const created = await Promise.all(demoRows.map(d => api.post<StockItem>('/api/v1/stock/products', d).then(r => r.data).catch(() => null)))
      const good = created.filter(Boolean) as StockItem[]
      if (good.length) setRows(prev => [...prev, ...good])
      else setError('Demo verileri backend\'e eklenemedi')
    } catch (err) {
      setError('Demo seed sırasında hata oluştu')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Container sx={{ py: 3 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="h4" sx={{ fontWeight: 500 }}>Stok</Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" size="small" onClick={seedDemo} disabled={saving} sx={{ textTransform: 'uppercase' }}>Seed Demo</Button>
          <Button variant="contained" size="small" onClick={openCreate} sx={{ textTransform: 'uppercase' }}>Yeni Stok</Button>
        </Stack>
      </Stack>

      <Paper sx={{ mt: 2, p: 2 }} elevation={1}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <TextField label="Ara (isim/sku)" size="small" value={filterName} onChange={e => setFilterName(e.target.value)} fullWidth />
          <Button variant={filterLowStock ? 'contained' : 'outlined'} size="small" onClick={() => setFilterLowStock(v => !v)} sx={{ textTransform: 'uppercase' }}>
            {filterLowStock ? 'Tümünü göster' : 'Azalan stokları göster'}
          </Button>
        </Stack>
      </Paper>

      <Paper sx={{ mt: 2 }} elevation={2}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>SKU</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Ad</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600 }}>Miktar</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Lokasyon</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows
              .filter(r => r.name.toLowerCase().includes(filterName.trim().toLowerCase()) || (r.sku || '').toLowerCase().includes(filterName.trim().toLowerCase()))
              .filter(r => (filterLowStock ? r.quantity < 20 : true))
              .map(r => (
                <TableRow key={r.id}>
                  <TableCell>{r.id}</TableCell>
                  <TableCell>{r.sku}</TableCell>
                  <TableCell>{r.name}</TableCell>
                  <TableCell align="center">{r.quantity}</TableCell>
                  <TableCell>{r.location}</TableCell>
                  <TableCell>
                      <Button size="small" onClick={() => openEdit(r)}>Düzenle</Button>
                      <Button color="error" size="small" onClick={async () => {
                      if (!confirm('Bu kaydı silmek istediğinize emin misiniz?')) return
                      try {
                        await api.delete(`/api/v1/stock/products/${r.id}`)
                        setRows(prev => prev.filter(x => x.id !== r.id))
                      } catch (err) {
                          alert('Silme işlemi başarısız oldu')
                      }
                    }}>
                        Sil
                      </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? 'Stok Düzenle' : 'Yeni Stok'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="SKU" value={form.sku || ''} onChange={e => setForm({ ...form, sku: e.target.value })} fullWidth />
            <TextField label="Ad" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} fullWidth required />
            <TextField label="Miktar" type="number" value={String(form.quantity)} onChange={e => setForm({ ...form, quantity: Number(e.target.value) })} fullWidth />
            <TextField label="Lokasyon" value={form.location || ''} onChange={e => setForm({ ...form, location: e.target.value })} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={saving}>İptal</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={saving}>
            {saving ? <CircularProgress size={18} /> : 'Kaydet'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError(null)} message={error} />
    </Container>
  )
}

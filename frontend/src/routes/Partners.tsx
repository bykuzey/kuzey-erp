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
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
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
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Partner | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const emptyForm: Partner = { id: 0, name: '', type: 'customer' }
  const [form, setForm] = useState<Partner>(emptyForm)
  const [filterName, setFilterName] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'customer' | 'supplier'>('all')
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailPartner, setDetailPartner] = useState<Partner | null>(null)
  const demoRows: Partner[] = [
    { id: 101, name: 'ACME Ticaret A.Ş.', type: 'supplier', tax_no: '1234567890', phone: '+90 212 555 0101', email: 'info@acme.com', address: 'İstanbul, Türkiye' },
    { id: 102, name: 'Beta Müşteri Ltd.', type: 'customer', tax_no: '9876543210', phone: '+90 232 555 0202', email: 'sales@beta.com', address: 'İzmir, Türkiye' },
    { id: 103, name: 'Gama Tedarik', type: 'supplier', tax_no: null, phone: '+90 312 555 0303', email: null, address: 'Ankara, Türkiye' },
  ]

  useEffect(() => {
    api.get<Partner[]>('/api/v1/partners/').then(r => {
      if (r.data && r.data.length > 0) setRows(r.data)
      else setRows(demoRows)
    }).catch(() => setRows(demoRows))
  }, [])

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setOpen(true)
  }

  async function seedDemo() {
    if (!confirm('Demo verileri backend\'e eklensin mi? (Varolan veriler etkilenmez)')) return
    setSaving(true)
    try {
      const created = await Promise.all(demoRows.map(d => api.post<Partner>('/api/v1/partners/', d).then(r => r.data).catch(() => null)))
      const good = created.filter(Boolean) as Partner[]
      if (good.length) setRows(prev => [...prev, ...good])
      else setError('Demo verileri backend\'e eklenemedi')
    } catch (err) {
      setError('Demo seed sırasında hata oluştu')
    } finally {
      setSaving(false)
    }
  }

  function openEdit(p: Partner) {
    setEditing(p)
    setForm(p)
    setOpen(true)
  }

  async function handleSubmit() {
    if (!form.name || form.name.trim() === '') {
      setError('Ad alanı zorunludur')
      return
    }
    setSaving(true)
    try {
      if (editing) {
        const res = await api.put<Partner>(`/api/v1/partners/${editing.id}/`, form)
        setRows(prev => prev.map(r => (r.id === editing.id ? res.data : r)))
      } else {
        const res = await api.post<Partner>('/api/v1/partners/', form)
        setRows(prev => [...prev, res.data])
      }
      setOpen(false)
    } catch (err) {
      setError('Kaydetme işlemi başarısız oldu')
    } finally {
      setSaving(false)
    }
  }

  function handleClose() {
    setOpen(false)
    setError(null)
  }

  return (
    <Container sx={{ py: 3 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="h5">Cari (Müşteri/Tedarikçi)</Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" size="small" onClick={seedDemo} disabled={saving}>Seed demo</Button>
          <Button variant="contained" size="small" onClick={openCreate}>Yeni Cari</Button>
        </Stack>
      </Stack>

      <Paper sx={{ mt: 2, p: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <TextField label="Ara (isim)" size="small" value={filterName} onChange={e => setFilterName(e.target.value)} />
          <TextField select size="small" label="Tip" value={filterType} onChange={e => setFilterType(e.target.value as any)} sx={{ width: 160 }}>
            <MenuItem value="all">Hepsi</MenuItem>
            <MenuItem value="customer">Müşteri</MenuItem>
            <MenuItem value="supplier">Tedarikçi</MenuItem>
          </TextField>
          <Button variant="text" size="small" onClick={() => { setFilterName(''); setFilterType('all') }}>Temizle</Button>
        </Stack>
      </Paper>
      <Paper sx={{ mt: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Ad</TableCell>
              <TableCell>Tip</TableCell>
              <TableCell>Telefon</TableCell>
              <TableCell>E-posta</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows
              .filter(r => (filterType === 'all' ? true : r.type === filterType))
              .filter(r => r.name.toLowerCase().includes(filterName.trim().toLowerCase()))
              .map(r => (
              <TableRow key={r.id} sx={{ cursor: 'pointer' }} onClick={() => { setDetailPartner(r); setDetailOpen(true) }}>
                <TableCell>{r.id}</TableCell>
                <TableCell>{r.name}</TableCell>
                <TableCell>{r.type}</TableCell>
                <TableCell>{r.phone}</TableCell>
                <TableCell>{r.email}</TableCell>
                <TableCell>
                  <IconButton size="small" aria-label="edit" onClick={(e) => { e.stopPropagation(); openEdit(r) }}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" aria-label="delete" onClick={async (e) => { e.stopPropagation(); if (!confirm('Bu kaydı silmek istediğinize emin misiniz?')) return; try { await api.delete(`/api/v1/partners/${r.id}/`); setRows(prev => prev.filter(x => x.id !== r.id)) } catch (err) { alert('Silme işlemi başarısız oldu') } }}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? 'Cari Düzenle' : 'Yeni Cari'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Ad" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} fullWidth required />
            <TextField select label="Tip" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
              <MenuItem value="customer">Müşteri</MenuItem>
              <MenuItem value="supplier">Tedarikçi</MenuItem>
            </TextField>
            <TextField label="Vergi No" value={form.tax_no || ''} onChange={e => setForm({ ...form, tax_no: e.target.value })} />
            <TextField label="Telefon" value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} />
            <TextField label="E-posta" value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} />
            <TextField label="Adres" value={form.address || ''} onChange={e => setForm({ ...form, address: e.target.value })} multiline rows={2} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={saving}>İptal</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={saving}>
            {saving ? <CircularProgress size={18} /> : 'Kaydet'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle> Cari Detayı </DialogTitle>
        <DialogContent>
          {detailPartner ? (
            <Stack spacing={1} sx={{ mt: 1 }}>
              <Typography><strong>ID:</strong> {detailPartner.id}</Typography>
              <Typography><strong>Ad:</strong> {detailPartner.name}</Typography>
              <Typography><strong>Tip:</strong> {detailPartner.type}</Typography>
              <Typography><strong>Vergi No:</strong> {detailPartner.tax_no || '-'}</Typography>
              <Typography><strong>Telefon:</strong> {detailPartner.phone || '-'}</Typography>
              <Typography><strong>E-posta:</strong> {detailPartner.email || '-'}</Typography>
              <Typography><strong>Adres:</strong> {detailPartner.address || '-'}</Typography>
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailOpen(false)}>Kapat</Button>
          <Button onClick={() => { if (detailPartner) { setDetailOpen(false); openEdit(detailPartner) } }} variant="contained">Düzenle</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError(null)} message={error} />
    </Container>
  )
}

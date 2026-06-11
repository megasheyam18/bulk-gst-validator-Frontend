import React, { useState, useCallback, useMemo } from 'react'
import {
  Container, Typography, Box, Paper, Button, TextField, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip, Alert, CircularProgress,
  Card, CardContent, Grid, LinearProgress, IconButton, Divider,
  TablePagination, Snackbar, Stack, ThemeProvider, createTheme, CssBaseline
} from '@mui/material'
import {
  CloudUpload, Download, CheckCircle, Error, BarChart, Refresh, Delete
} from '@mui/icons-material'

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
    success: { main: '#2e7d32' },
    error: { main: '#d32f2f' },
    warning: { main: '#ed6c02' },
    background: { default: '#f5f7fa', paper: '#ffffff' }
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h4: { fontWeight: 700 },
    h6: { fontWeight: 600 }
  }
})

const API_BASE = '/api/gst'

const COLORS = {
  primary: '#1976d2',
  secondary: '#dc004e',
  success: '#2e7d32',
  error: '#d32f2f',
  warning: '#ed6c02',
  purple: '#9c27b0'
}

function StatCard({ title, value, color, icon }) {
  return (
    <Card sx={{ height: '100%', borderLeft: `4px solid ${color}` }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography color="text.secondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div" sx={{ color, fontWeight: 600 }}>
              {value.toLocaleString()}
            </Typography>
          </Box>
          <Box sx={{ fontSize: 40 }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

function FileUpload({ onUpload, uploading }) {
  const [dragActive, setDragActive] = useState(false)
  const [files, setFiles] = useState([])
  const [gstColumn, setGstColumn] = useState('GST Number')

  const handleDrag = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const newFiles = Array.from(e.dataTransfer.files).filter(
        f => f.name.endsWith('.xlsx') || f.name.endsWith('.xls')
      )
      setFiles(prev => [...prev, ...newFiles])
    }
  }, [])

  const handleFileInput = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setFiles(prev => [...prev, ...newFiles])
    }
  }

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleUpload = () => {
    if (files.length > 0) {
      onUpload(files, gstColumn)
    }
  }

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 3,
        mb: 3,
        border: dragActive ? `2px solid ${COLORS.primary}` : '2px dashed #ccc',
        backgroundColor: dragActive ? 'rgba(25, 118, 210, 0.04)' : 'white',
        transition: 'all 0.2s',
        borderRadius: 2
      }}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <Box textAlign="center" py={3}>
        <CloudUpload sx={{ fontSize: 64, color: COLORS.primary, mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          Drag & Drop Excel Files Here
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Supports .xlsx and .xls files
        </Typography>
        <input
          type="file"
          multiple
          accept=".xlsx,.xls"
          onChange={handleFileInput}
          style={{ display: 'none' }}
          id="file-input"
        />
        <label htmlFor="file-input">
          <Button variant="outlined" component="span" startIcon={<CloudUpload />}>
            Browse Files
          </Button>
        </label>
      </Box>

      {files.length > 0 && (
        <Box mt={3}>
          <Typography variant="subtitle2" gutterBottom>
            Selected Files ({files.length})
          </Typography>
          <Stack spacing={1}>
            {files.map((file, index) => (
              <Box key={index} display="flex" alignItems="center" justifyContent="space-between"
                   sx={{ p: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="body2">{file.name}</Typography>
                <IconButton size="small" onClick={() => removeFile(index)}>
                  <Delete fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Stack>
        </Box>
      )}

      <Box mt={3}>
        <TextField
          fullWidth
          label="GST Column Name"
          value={gstColumn}
          onChange={(e) => setGstColumn(e.target.value)}
          helperText="Column name containing GST numbers in your Excel file"
          size="small"
        />
      </Box>

      <Box mt={3} display="flex" justifyContent="flex-end">
        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={files.length === 0 || uploading}
          startIcon={uploading ? <CircularProgress size={20} /> : <CloudUpload />}
          sx={{ px: 4 }}
        >
          {uploading ? 'Processing...' : 'Upload & Validate'}
        </Button>
      </Box>
    </Paper>
  )
}

function Dashboard({ stats, loading }) {
  if (loading) return <LinearProgress />

  return (
    <Grid container spacing={3} mb={3}>
      <Grid item xs={12} sm={6} md={2.4}>
        <StatCard title="Total Records" value={stats.totalRecords} color={COLORS.primary} icon={<BarChart fontSize="large" />} />
      </Grid>
      <Grid item xs={12} sm={6} md={2.4}>
        <StatCard title="Valid GST" value={stats.validCount} color={COLORS.success} icon={<CheckCircle fontSize="large" />} />
      </Grid>
      <Grid item xs={12} sm={6} md={2.4}>
        <StatCard title="Invalid GST" value={stats.invalidCount} color={COLORS.error} icon={<Error fontSize="large" />} />
      </Grid>
      <Grid item xs={12} sm={6} md={2.4}>
        <StatCard title="Tamil Nadu" value={stats.tamilNaduCount} color={COLORS.warning} icon={<BarChart fontSize="large" />} />
      </Grid>
      <Grid item xs={12} sm={6} md={2.4}>
        <StatCard title="Puducherry" value={stats.puducherryCount} color={COLORS.purple} icon={<BarChart fontSize="large" />} />
      </Grid>
    </Grid>
  )
}

function ResultsTable({ results, onDownload }) {
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(25)

  const paginatedResults = useMemo(() => {
    const start = page * rowsPerPage
    return results.slice(start, start + rowsPerPage)
  }, [results, page, rowsPerPage])

  return (
    <Paper variant="outlined" sx={{ borderRadius: 2 }}>
      <Box p={2} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">Validation Results</Typography>
        <Button
          variant="contained"
          startIcon={<Download />}
          onClick={onDownload}
          disabled={results.length === 0}
        >
          Download Excel
        </Button>
      </Box>
      <Divider />
      <TableContainer sx={{ maxHeight: 500 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell>S.No</TableCell>
              <TableCell>GST Number</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>State</TableCell>
              <TableCell>Error Message</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedResults.map((row, index) => (
              <TableRow key={index} hover>
                <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                <TableCell sx={{ fontFamily: 'monospace' }}>{row.gstNumber}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={row.validationStatus}
                    color={row.validationStatus === 'Valid' ? 'success' : 'error'}
                    variant="filled"
                  />
                </TableCell>
                <TableCell>{row.stateName || '-'}</TableCell>
                <TableCell sx={{ maxWidth: 300 }}>{row.errorMessage || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={results.length}
        page={page}
        onPageChange={(e, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10))
          setPage(0)
        }}
        rowsPerPageOptions={[25, 50, 100, 250]}
      />
    </Paper>
  )
}

function App() {
  const [uploading, setUploading] = useState(false)
  const [batchId, setBatchId] = useState(null)
  const [stats, setStats] = useState({
    totalRecords: 0,
    validCount: 0,
    invalidCount: 0,
    tamilNaduCount: 0,
    puducherryCount: 0
  })
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity })
  }

  const handleUpload = async (files, gstColumn) => {
    setUploading(true)
    const formData = new FormData()
    files.forEach(file => formData.append('files', file))
    formData.append('gstColumnName', gstColumn)

    try {
      const response = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) throw new Error('Upload failed')

      const data = await response.json()
      setBatchId(data.batchId)
      showSnackbar(`Successfully processed ${data.totalFiles} file(s)`, 'success')
      loadResults(data.batchId)
    } catch (error) {
      showSnackbar('Upload failed: ' + error.message, 'error')
    } finally {
      setUploading(false)
    }
  }

  const loadResults = async (id) => {
    if (!id) return
    setLoading(true)

    try {
      const [statsRes, resultsRes] = await Promise.all([
        fetch(`${API_BASE}/dashboard/${id}`),
        fetch(`${API_BASE}/results/${id}`)
      ])

      const statsData = await statsRes.json()
      const resultsData = await resultsRes.json()

      setStats(statsData)
      setResults(resultsData)
    } catch (error) {
      showSnackbar('Failed to load results', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (!batchId) return
    window.open(`${API_BASE}/download/${batchId}`, '_blank')
  }

  const handleReset = () => {
    setBatchId(null)
    setResults([])
    setStats({
      totalRecords: 0,
      validCount: 0,
      invalidCount: 0,
      tamilNaduCount: 0,
      puducherryCount: 0
    })
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ bgcolor: '#f5f7fa', minHeight: '100vh', py: 4 }}>
        <Container maxWidth="xl">
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
            <Box>
              <Typography variant="h4" component="h1" fontWeight={700} color="primary">
                Bulk GST Validator
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Validate GST numbers from Excel files
              </Typography>
            </Box>
            {batchId && (
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={handleReset}
              >
                New Validation
              </Button>
            )}
          </Box>

          <FileUpload onUpload={handleUpload} uploading={uploading} />

          {batchId && (
            <>
              <Alert severity="info" sx={{ mb: 3 }}>
                Batch ID: <strong>{batchId}</strong>
              </Alert>

              <Dashboard stats={stats} loading={loading} />

              <ResultsTable results={results} onDownload={handleDownload} />
            </>
          )}

          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
          >
            <Alert
              onClose={() => setSnackbar({ ...snackbar, open: false })}
              severity={snackbar.severity}
              variant="filled"
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Container>
      </Box>
    </ThemeProvider>
  )
}

export default App

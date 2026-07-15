import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import axiosClient from '../../api/axiosClient'

export default function ScanQr() {
  const [scanning, setScanning] = useState(false)
  const [message, setMessage] = useState(null) // { type: 'success'|'error', text }
  const [manualToken, setManualToken] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const scannerRef = useRef(null)

  useEffect(() => {
    return () => {
      stopScanner()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop()
        await scannerRef.current.clear()
      } catch (e) {
        // scanner already stopped
      }
      scannerRef.current = null
    }
    setScanning(false)
  }

  const submitToken = async (token) => {
    setSubmitting(true)
    setMessage(null)
    try {
      const res = await axiosClient.post('/student/attendance/scan', { token })
      setMessage({ type: 'success', text: res.data.message })
      await stopScanner()
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Could not mark attendance.' })
    } finally {
      setSubmitting(false)
    }
  }

  const startScanner = async () => {
    setMessage(null)
    setScanning(true)
    const html5QrCode = new Html5Qrcode('qr-reader')
    scannerRef.current = html5QrCode
    try {
      await html5QrCode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: 240 },
        async (decodedText) => {
          await stopScanner()
          submitToken(decodedText)
        },
        () => {
          // ignore per-frame scan failures
        }
      )
    } catch (err) {
      setScanning(false)
      setMessage({ type: 'error', text: 'Could not access camera. You can enter the code manually below.' })
    }
  }

  const handleManualSubmit = (e) => {
    e.preventDefault()
    if (manualToken.trim()) {
      submitToken(manualToken.trim())
    }
  }

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h3>Scan attendance QR code</h3>
          <p className="muted">Point your camera at the code your faculty is displaying.</p>
        </div>
      </div>

      {message && (
        <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>
          {message.text}
        </div>
      )}

      <div className="qr-box">
        <div id="qr-reader" style={{ display: scanning ? 'block' : 'none' }} />

        {!scanning && (
          <button className="btn btn-accent" onClick={startScanner} disabled={submitting}>
            Start camera scan
          </button>
        )}
        {scanning && (
          <button className="btn btn-outline" onClick={stopScanner}>
            Cancel scan
          </button>
        )}

        <form onSubmit={handleManualSubmit} style={{ width: '100%', maxWidth: 320, marginTop: 10 }}>
          <div className="field">
            <label>Or enter the code manually</label>
            <input
              value={manualToken}
              onChange={(e) => setManualToken(e.target.value)}
              placeholder="Session token"
            />
          </div>
          <button className="btn btn-primary" type="submit" style={{ width: '100%' }} disabled={submitting}>
            {submitting ? 'Marking…' : 'Mark attendance'}
          </button>
        </form>
      </div>
    </div>
  )
}

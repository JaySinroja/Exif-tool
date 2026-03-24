import React from 'react';

export default function GoogleMapViewer({ lat, lon }) {
  if (lat == null || lon == null) return (
    <div style={{ textAlign: 'center', padding: '32px', background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border2)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
      <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🗺️</div>No GPS coordinates found.
    </div>
  );

  const osmSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${lon-0.01},${lat-0.01},${lon+0.01},${lat+0.01}&layer=mapnik&marker=${lat},${lon}`;
  const googleUrl = `https://www.google.com/maps?q=${lat},${lon}`;

  return (
    <div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '12px' }}>📍 GPS Location</div>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
        {[['LAT', lat], ['LON', lon]].map(([l, v]) => (
          <span key={l} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '5px 12px', color: 'var(--accent)' }}>{l} {v}</span>
        ))}
      </div>
      <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border)' }}>
        <iframe title="GPS Map" src={osmSrc} style={{ display: 'block', width: '100%', height: '300px', border: 'none' }} allowFullScreen />
      </div>
      <a href={googleUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-block', marginTop: '10px', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--accent)', border: '1px solid rgba(0,255,231,0.3)', padding: '5px 14px', borderRadius: 'var(--radius)' }}>↗ Open in Google Maps</a>
    </div>
  );
}

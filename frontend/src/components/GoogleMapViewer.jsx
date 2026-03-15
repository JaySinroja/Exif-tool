import React from 'react';

const styles = {
  wrap: {},
  title: { fontWeight: 700, fontSize: '1rem', color: 'var(--text)', marginBottom: '14px', letterSpacing: '0.02em' },
  coords: {
    display: 'flex', gap: '16px', marginBottom: '12px', flexWrap: 'wrap',
  },
  coord: {
    fontFamily: 'var(--font-mono)', fontSize: '0.8rem',
    background: 'var(--bg)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius)', padding: '6px 14px', color: 'var(--accent)',
  },
  mapContainer: {
    borderRadius: 'var(--radius-lg)', overflow: 'hidden',
    border: '1px solid var(--border)', position: 'relative',
  },
  iframe: { display: 'block', width: '100%', height: '320px', border: 'none' },
  noGps: {
    textAlign: 'center', padding: '32px 16px',
    background: 'var(--surface)', borderRadius: 'var(--radius-lg)',
    border: '1px dashed var(--border2)',
    color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.82rem',
  },
  openBtn: {
    display: 'inline-block', marginTop: '12px',
    background: 'none', border: '1px solid var(--accent)',
    color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
    padding: '6px 16px', borderRadius: 'var(--radius)', cursor: 'pointer',
    textDecoration: 'none', transition: 'all 0.15s',
  },
};

export default function GoogleMapViewer({ lat, lon }) {
  if (lat == null || lon == null) {
    return (
      <div style={styles.noGps}>
        <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🗺️</div>
        No GPS coordinates found in this image.
      </div>
    );
  }

  // Use OpenStreetMap embed (no API key required) as the default, with a
  // Google Maps deep-link for opening in a new tab.
  const osmSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${lon - 0.01},${lat - 0.01},${lon + 0.01},${lat + 0.01}&layer=mapnik&marker=${lat},${lon}`;
  const googleUrl = `https://www.google.com/maps?q=${lat},${lon}`;

  return (
    <div style={styles.wrap}>
      <div style={styles.title}>📍 GPS Location</div>
      <div style={styles.coords}>
        <span style={styles.coord}>LAT {lat}</span>
        <span style={styles.coord}>LON {lon}</span>
      </div>
      <div style={styles.mapContainer}>
        <iframe
          title="GPS Map"
          style={styles.iframe}
          src={osmSrc}
          allowFullScreen
        />
      </div>
      <a href={googleUrl} target="_blank" rel="noreferrer" style={styles.openBtn}>
        ↗ Open in Google Maps
      </a>
    </div>
  );
}

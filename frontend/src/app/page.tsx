"use client";
import React, { useState } from 'react';
import ScreenshotFloat from './components/ScreenshotFloat';
import IframeFull from './components/IframeFull';
import UrlBar from './components/UrlBar';
import Loader from './components/Loader';
import ErrorOverlay from './components/ErrorOverlay';
import styles from './page.module.css';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [iframeHtml, setIframeHtml] = useState('');
  const iframeRef = React.useRef<HTMLIFrameElement>(null);
  // Track if the task is finished
  const [taskFinished, setTaskFinished] = useState(false);

  // Helper to scroll iframe to a random area
  function scrollIframeRandomly() {
    const iframe = iframeRef.current;
    if (!iframe) return;
    try {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc) return;
      const body = doc.body;
      if (!body) return;
      const maxScrollY = Math.max(0, body.scrollHeight - iframe.clientHeight);
      const maxScrollX = Math.max(0, body.scrollWidth - iframe.clientWidth);
      if (maxScrollY > 0 || maxScrollX > 0) {
        const randY = Math.floor(Math.random() * (maxScrollY + 1));
        const randX = Math.floor(Math.random() * (maxScrollX + 1));
        iframe.contentWindow?.scrollTo(randX, randY);
      }
    } catch {}
  }

  // Helper to scroll iframe to top
  function scrollIframeToTop() {
    const iframe = iframeRef.current;
    try {
      iframe?.contentWindow?.scrollTo(0, 0);
    } catch {}
  }

  // Whenever iframeHtml updates, scroll randomly (but not on final SUCCESS)
  React.useEffect(() => {
    if (!taskFinished && iframeHtml) {
      // Wait for iframe to render
      setTimeout(scrollIframeRandomly, 120);
    }
  }, [iframeHtml, taskFinished]);

  // When task is finished, scroll to top
  React.useEffect(() => {
    if (taskFinished) {
      setTimeout(scrollIframeToTop, 120);
    }
  }, [taskFinished]);

  const submit = async () => {
    setError('');
    setScreenshotUrl('');
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      const taskId = data.task_id;
      const poll = async () => {
        await new Promise(r => setTimeout(r, 1000));
        try {
          const res = await fetch(`${BACKEND_URL}/tasks/${taskId}`);
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          const statusData = await res.json();
          if (statusData.status === 'PENDING') {
            poll();
          } else if (statusData.status === 'SUCCESS') {
            setScreenshotUrl(statusData.screenshot_url);
            setLoading(false);
          } else {
            setError(statusData.error || 'Task failed');
            setLoading(false);
          }
        } catch (err: any) {
          setError(err.message);
          setLoading(false);
        }
      };
      poll();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const fetchAndStreamHtml = async () => {
    setTaskFinished(false);
    setIframeHtml(`
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;background:#fff;font-family:sans-serif;">
        <div style="border:8px solid #eee;border-top:8px solid #0070f3;border-radius:50%;width:60px;height:60px;animation:spin 1s linear infinite;margin-bottom:2rem;"></div>
        <div style="font-size:1.3rem;color:#222;">Building design... Please wait</div>
        <div style="font-size:1rem;color:#888;margin-top:0.5rem;">Extracting HTML, rendering preview, and preparing your workspace.</div>
        <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
      </div>
    `);
    if (!screenshotUrl) return;
    try {
      // Step 1: POST to /extract-html to get task_id
      const res = await fetch(`${BACKEND_URL}/extract-html`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ screenshot_url: screenshotUrl }),
      });
      if (!res.ok) throw new Error('Failed to start HTML extraction');
      const data = await res.json();
      const taskId = data.task_id;
      // Step 2: Poll GET /extract-html/{task_id}
      const poll = async () => {
        await new Promise(r => setTimeout(r, 1200));
        try {
          const pollRes = await fetch(`${BACKEND_URL}/extract-html/${taskId}`);
          if (!pollRes.ok) throw new Error('Failed to poll HTML extraction');
          const pollData = await pollRes.json();
          // Always update with the latest html chunk if available
          if (pollData.html !== undefined) {
            setIframeHtml(pollData.html || '');
          }
          if (pollData.status === 'PENDING') {
            setTaskFinished(false);
            poll();
          } else if (pollData.status === 'SUCCESS') {
            setTaskFinished(true);
            // Final html already set above
          } else if (pollData.status === 'FAILURE') {
            setTaskFinished(true);
            setIframeHtml(`<div style='color:red;padding:2rem;'>Error: ${pollData.error || 'Task failed'}</div>`);
          }
        } catch (err: any) {
          setTaskFinished(true);
          setIframeHtml(`<div style='color:red;padding:2rem;'>Error: ${err.message}</div>`);
        }
      };
      poll();
    } catch (err: any) {
      setTaskFinished(true);
      setIframeHtml(`<div style='color:red;padding:2rem;'>Error: ${err.message}</div>`);
    }
  };

  React.useEffect(() => {
    if (screenshotUrl) fetchAndStreamHtml();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screenshotUrl]);

  return (
    <div className={styles.pageRoot}>
      {/* Show welcome screen if no screenshotUrl, not loading, and no error */}
      {!screenshotUrl && !loading && !error && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          color: '#fff',
          maxWidth: 520,
          padding: '2.5rem 2rem',
          background: 'rgba(24,26,27,0.92)',
          borderRadius: 18,
          boxShadow: '0 2px 32px rgba(0,0,0,0.22)',
          zIndex: 1000,
        }}>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 700, marginBottom: '1.2rem', letterSpacing: 1 }}>AI Website Cloner</h1>
          <p style={{ fontSize: '1.15rem', color: '#ccc', marginBottom: '0.5rem' }}>
            Instantly clone web page designs into HTML.<br />
            Enter a URL below to get started!
          </p>
        </div>
      )}
      {screenshotUrl && !loading && !error && (
        <ScreenshotFloat screenshotUrl={screenshotUrl} />
      )}
      <div className={styles.iframeCrossfadeWrapper}>
        <IframeFull iframeHtml={iframeHtml} iframeRef={iframeRef as React.RefObject<HTMLIFrameElement>} />
      </div>
      <UrlBar url={url} setUrl={setUrl} loading={loading} onSubmit={e => { e.preventDefault(); submit(); }} />
      {loading && <Loader />}
      {error && <ErrorOverlay error={error} />}
    </div>
  );
}

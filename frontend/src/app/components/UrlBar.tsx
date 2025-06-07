import React from 'react';
import styles from './UrlBar.module.css';

interface UrlBarProps {
  url: string;
  setUrl: (url: string) => void;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

const UrlBar = ({ url, setUrl, loading, onSubmit }: UrlBarProps) => (
  <form
    onSubmit={onSubmit}
    className={styles.urlBar}
  >
    <input
      type="text"
      value={url}
      onChange={e => setUrl(e.target.value)}
      placeholder="Enter URL"
      className={styles.urlInput}
    />
    <button
      type="submit"
      disabled={loading || !url}
      className={styles.urlButton}
    >
      {loading ? 'Loading...' : 'Go'}
    </button>
  </form>
);

export default UrlBar;

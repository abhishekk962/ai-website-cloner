import React from 'react';
import styles from './ErrorOverlay.module.css';

interface ErrorOverlayProps {
  error: string;
}

const ErrorOverlay = ({ error }: ErrorOverlayProps) => (
  <div className={styles.errorOverlay}>
    Error: {error}
  </div>
);

export default ErrorOverlay;

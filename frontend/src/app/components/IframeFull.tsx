import React from 'react';
import styles from './IframeFull.module.css';

interface IframeFullProps {
  iframeHtml: string;
  iframeRef: React.RefObject<HTMLIFrameElement>;
}

const IframeFull = ({ iframeHtml, iframeRef }: IframeFullProps) => (
  <div className={styles.iframeFull}>
    <iframe
      ref={iframeRef}
      srcDoc={iframeHtml}
      title="Extracted HTML"
      className={styles.iframe}
      sandbox="allow-scripts allow-same-origin"
    />
  </div>
);

export default IframeFull;

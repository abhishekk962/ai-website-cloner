import React from 'react';
import styles from './ScreenshotFloat.module.css';

interface ScreenshotFloatProps {
  screenshotUrl: string;
}

const ScreenshotFloat = ({ screenshotUrl }: ScreenshotFloatProps) => (
  <div className={styles.screenshotFloat}>
    <img
      src={screenshotUrl}
      alt="Screenshot"
      className={styles.screenshotImg}
    />
  </div>
);

export default ScreenshotFloat;

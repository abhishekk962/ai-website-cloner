import React from 'react';
import styles from './Loader.module.css';

const loaderMessages = [
  'Extracting design...',
  'Rendering image...',
  'Fetching image...',
  'Almost there...'
];

const Loader = () => {
  const [messageIndex, setMessageIndex] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loaderMessages.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.loaderOverlay}>
      <div className={styles.loaderSpinner} />
      <div className={styles.loaderText}>{loaderMessages[messageIndex]}</div>
    </div>
  );
};

export default Loader;

import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource/manrope/400.css';
import '@fontsource/manrope/500.css';
import '@fontsource/manrope/600.css';
import '@fontsource/manrope/700.css';
import '@fontsource/ibm-plex-mono/400.css';
import App from './App';
const Film = React.lazy(() => import('./film/Film'));
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>{new URLSearchParams(window.location.search).has("film") ? <React.Suspense fallback={null}><Film/></React.Suspense> : <App />}</React.StrictMode>,
);

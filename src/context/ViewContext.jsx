import { createContext, useContext, useEffect, useState } from 'react';

/* ---------------------------------------------------------------------------
   Quick View / Detailed View — recruiter toggle (Feature #5).
   'quick' condenses the whole site to a 60-second scan; 'detailed' shows
   everything. The choice persists in localStorage.
--------------------------------------------------------------------------- */
const ViewContext = createContext({ view: 'detailed', isQuick: false, setView: () => {} });

const STORAGE_KEY = 'za-view';

export function ViewProvider({ children }) {
  const [view, setView] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'quick' ? 'quick' : 'detailed';
    } catch {
      return 'detailed';
    }
  });

  // Persist the visitor's choice for return visits (client-side only)
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, view);
    } catch {
      /* storage unavailable — choice just won't persist */
    }
  }, [view]);

  return (
    <ViewContext.Provider value={{ view, isQuick: view === 'quick', setView }}>
      {children}
    </ViewContext.Provider>
  );
}

export const useView = () => useContext(ViewContext);

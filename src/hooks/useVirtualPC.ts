import { useState, useEffect } from 'react';
import { SystemState, FileItem, AppInstance } from '../types';

export function useVirtualPC() {
  const [state, setState] = useState<SystemState>({
    cpu: 12,
    memory: 45,
    storage: 67,
    network: 154,
    files: [
      { id: '1', name: 'Mark_85_Design.pdf', type: 'file', modified: '2026-04-19', size: '25MB' },
      { id: '2', name: 'Iron_Legion_Protocols', type: 'folder', modified: '2026-04-18' },
      { id: '3', name: 'Global_Security_Status.exe', type: 'file', modified: '2026-04-20', size: '150MB' },
    ],
    apps: [
      { id: 'app1', name: 'Satellite Uplink', status: 'running', cpu: 5 },
      { id: 'app2', name: 'Threat Detection', status: 'warning', cpu: 15 },
      { id: 'app3', name: 'Home Automation', status: 'idle', cpu: 2 },
    ],
  });

  const [notifications, setNotifications] = useState<string[]>([]);

  const addNotification = (msg: string) => {
    setNotifications(prev => [msg, ...prev].slice(0, 5));
  };

  // Simulate jitter
  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => ({
        ...prev,
        cpu: Math.max(5, Math.min(95, prev.cpu + (Math.random() * 10 - 5))),
        memory: Math.max(20, Math.min(90, prev.memory + (Math.random() * 4 - 2))),
        network: Math.max(10, Math.min(999, prev.network + (Math.random() * 50 - 25))),
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const openFile = (fileName: string) => {
    addNotification(`Opening ${fileName}... Decrypting protocols.`);
    return `Sir, I have opened ${fileName} for you. It contains sensitive energy signatures.`;
  };

  const closeApp = (appName: string) => {
    addNotification(`Terminating ${appName} processes.`);
    setState(prev => ({
      ...prev,
      apps: prev.apps.map(a => a.name.toLowerCase() === appName.toLowerCase() ? { ...a, status: 'idle', cpu: 0 } : a)
    }));
    return `Process ${appName} has been terminated, Sir.`;
  };

  return { state, notifications, openFile, closeApp, addNotification };
}

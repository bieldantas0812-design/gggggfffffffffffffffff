export interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: string;
  modified: string;
}

export interface AppInstance {
  id: string;
  name: string;
  status: 'running' | 'idle' | 'warning';
  cpu: number;
}

export interface SystemState {
  cpu: number;
  memory: number;
  storage: number;
  network: number;
  files: FileItem[];
  apps: AppInstance[];
}

export interface Message {
  role: 'user' | 'jarvis';
  content: string;
  timestamp: Date;
}

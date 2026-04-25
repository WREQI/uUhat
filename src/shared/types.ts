export interface Contact {
  id: number;
  name: string;
  preview: string;
  time: string;
  muted: boolean;
}

export interface Message {
  id: number;
  text: string;
  isMine: boolean;
  time: string;
}


import { State } from "perry/ui";
import { makeChatData, makeContacts } from "./mock";
import type { Contact, Message } from "./types";

export interface ChatStore {
  contacts: Contact[];
  chatData: Record<number, Message[]>;
  selectedId: ReturnType<typeof State<number | null>>;
  selectedName: ReturnType<typeof State<string>>;
  messages: ReturnType<typeof State<Message[]>>;
  msgCount: ReturnType<typeof State<number>>;
  inputText: ReturnType<typeof State<string>>;
  searchText: ReturnType<typeof State<string>>;
  selectContact: (id: number) => void;
  sendMessage: () => Message | null;
}

function nowTime(): string {
  const d = new Date();
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

export function createChatStore(): ChatStore {
  const contacts = makeContacts(80);
  const chatData: Record<number, Message[]> = makeChatData(contacts);

  const selectedId = State<number | null>(1);
  const selectedName = State(contacts.find((c) => c.id === 1)?.name ?? "");
  const messages = State<Message[]>(chatData[1] ?? []);
  const msgCount = State(messages.value.length);
  const inputText = State("");
  const searchText = State("");

  let nextMsgId = 100;

  function selectContact(id: number) {
    selectedId.set(id);
    selectedName.set(contacts.find((c) => c.id === id)?.name ?? "");
    const msgs = chatData[id] ?? [];
    messages.set(msgs);
    msgCount.set(msgs.length);
  }

  function sendMessage(): Message | null {
    const text = inputText.value.trim();
    if (!text || selectedId.value === null) return null;

    const msg: Message = { id: nextMsgId++, text, isMine: true, time: nowTime() };
    const updated = [...messages.value, msg];
    chatData[selectedId.value] = updated;
    messages.set(updated);
    msgCount.set(updated.length);
    inputText.set("");
    return msg;
  }

  return {
    contacts,
    chatData,
    selectedId,
    selectedName,
    messages,
    msgCount,
    inputText,
    searchText,
    selectContact,
    sendMessage,
  };
}


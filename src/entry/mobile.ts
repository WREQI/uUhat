import {
  App,
  Button,
  Divider,
  ForEach,
  HStack,
  LazyVStack,
  ScrollView,
  Spacer,
  State,
  Text,
  TextArea,
  VStack,
  buttonSetBordered,
  lazyvstackSetRowHeight,
  scrollViewSetChild,
  setCornerRadius,
  stackSetAlignment,
  textSetColor,
  textSetFontSize,
  textSetFontWeight,
  textSetWraps,
  textSetString,
  textareaSetString,
  widgetSetBackgroundColor,
  widgetSetEdgeInsets,
  widgetSetHeight,
  widgetSetHugging,
  widgetSetOnClick,
  widgetSetWidth,
} from "perry/ui";
import { makeChatData, makeContacts } from "../shared/mock";
import type { Contact, Message } from "../shared/types";

// ── 微信配色 ──────────────────────────────────────────────────────────────────
const WX_GREEN = [0.027, 0.757, 0.376, 1.0] as const;
const BG_GRAY = [0.937, 0.937, 0.937, 1.0] as const; // #EFEFEF
const WHITE = [1.0, 1.0, 1.0, 1.0] as const;
const TEXT_BLACK = [0.1, 0.1, 0.1, 1.0] as const;
const TEXT_GRAY = [0.6, 0.6, 0.6, 1.0] as const;
const DIVIDER = [0.9, 0.9, 0.9, 1.0] as const;
const CHAT_BG = [0.961, 0.961, 0.961, 1.0] as const;
const AVATAR_BLUE = [0.22, 0.53, 0.96, 1.0] as const;

// ── 数据状态 ──────────────────────────────────────────────────────────────────
const contacts: Contact[] = makeContacts(80);
const chatData: Record<number, Message[]> = makeChatData(contacts);

const selectedId = State<number | null>(1);
const selectedName = State(contacts.find((c) => c.id === 1)?.name ?? "");
const messages = State<Message[]>(chatData[1] ?? []);
const msgCount = State(messages.value.length);
const inputText = State("");
const currentTab = State<"chats" | "contacts" | "discover" | "me">("chats");
const showChatDetail = State(false);

let nextMsgId = 100;

// 用于更新会话列表时间
const contactTimeLabelById = new Map<number, any>();

function nowTime(): string {
  const d = new Date();
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

function lastMessageTime(id: number): string {
  const msgs = chatData[id];
  if (!msgs || msgs.length === 0) return contacts.find((c) => c.id === id)?.time ?? "";
  return msgs[msgs.length - 1]?.time ?? "";
}

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

// ══════════════════════════════════════════════════════════════════════════════
// 底部导航栏
// ══════════════════════════════════════════════════════════════════════════════
function TabButton(icon: string, label: string, tab: typeof currentTab.value, isActive: boolean) {
  const iconText = Text(icon);
  textSetFontSize(iconText, 24);
  const iconColor = isActive ? WX_GREEN : TEXT_GRAY;
  textSetColor(iconText, iconColor[0], iconColor[1], iconColor[2], iconColor[3]);

  const labelText = Text(label);
  textSetFontSize(labelText, 10);
  const labelColor = isActive ? WX_GREEN : TEXT_GRAY;
  textSetColor(labelText, labelColor[0], labelColor[1], labelColor[2], labelColor[3]);

  const btn = VStack(4, [iconText, labelText]);
  stackSetAlignment(btn, 9); // CenterX
  widgetSetEdgeInsets(btn, 6, 0, 6, 0);
  widgetSetHugging(btn, 1);

  widgetSetOnClick(btn, () => {
    currentTab.set(tab);
    showChatDetail.set(false);
  });

  return btn;
}

function buildBottomNav() {
  const isChats = currentTab.value === "chats";
  const isContacts = currentTab.value === "contacts";
  const isDiscover = currentTab.value === "discover";
  const isMe = currentTab.value === "me";

  const chatTab = TabButton("💬", "微信", "chats", isChats);
  const contactTab = TabButton("👥", "通讯录", "contacts", isContacts);
  const discoverTab = TabButton("🔍", "发现", "discover", isDiscover);
  const meTab = TabButton("👤", "我", "me", isMe);

  // 使用四个相等的 Spacer 来平分空间
  const nav = HStack(0, [Spacer(), chatTab, Spacer(), contactTab, Spacer(), discoverTab, Spacer(), meTab, Spacer()]);

  widgetSetHeight(nav, 65);
  widgetSetBackgroundColor(nav, ...WHITE);
  widgetSetEdgeInsets(nav, 4, 0, 8, 0);

  return nav;
}

// ══════════════════════════════════════════════════════════════════════════════
// 聊天列表页
// ══════════════════════════════════════════════════════════════════════════════
function ContactAvatar(c: Contact) {
  const text = c.name === "文件传输助手" ? "文" : c.name.includes("群") ? "群" : c.name.slice(0, 1);

  const av = Text(text);
  textSetFontSize(av, 16);
  textSetColor(av, 1.0, 1.0, 1.0, 1.0);
  widgetSetWidth(av, 50);
  widgetSetHeight(av, 50);
  setCornerRadius(av, 8);
  widgetSetBackgroundColor(av, ...AVATAR_BLUE);
  return av;
}

function ChatListRow(c: Contact) {
  const av = ContactAvatar(c);

  const name = Text(c.name);
  textSetFontSize(name, 16);
  textSetFontWeight(name, 16, 0.6);
  textSetColor(name, ...TEXT_BLACK);

  const preview = Text(c.preview);
  textSetFontSize(preview, 14);
  textSetColor(preview, ...TEXT_GRAY);

  const timeLabel = Text(lastMessageTime(c.id));
  textSetFontSize(timeLabel, 12);
  textSetColor(timeLabel, ...TEXT_GRAY);
  widgetSetEdgeInsets(timeLabel, 0, 4, 0, 0);

  contactTimeLabelById.set(c.id, timeLabel);

  const muteIcon = c.muted ? Text("🔕") : Spacer();
  if (c.muted) {
    textSetFontSize(muteIcon as any, 12);
    widgetSetEdgeInsets(muteIcon as any, 0, 4, 0, 0);
  }

  const nameRow = HStack(8, [name, Spacer(), timeLabel]);
  widgetSetHugging(nameRow, 1);
  
  const previewRow = HStack(8, [preview, Spacer(), muteIcon]);
  widgetSetHugging(previewRow, 1);

  const textCol = VStack(6, [nameRow, previewRow]);
  widgetSetHugging(textCol, 1);

  const row = HStack(12, [av, textCol]);
  widgetSetEdgeInsets(row, 12, 16, 12, 16);
  widgetSetBackgroundColor(row, ...WHITE);

  widgetSetOnClick(row, () => {
    selectContact(c.id);
    showChatDetail.set(true);
  });

  return row;
}

function buildChatListPage() {
  const header = Text("微信");
  textSetFontSize(header, 18);
  textSetFontWeight(header, 18, 0.7);
  textSetColor(header, ...TEXT_BLACK);

  const searchBtn = Button("🔍 搜索", () => {});
  buttonSetBordered(searchBtn, 0);
  textSetFontSize(searchBtn, 14);
  widgetSetBackgroundColor(searchBtn, ...BG_GRAY);
  setCornerRadius(searchBtn, 8);
  widgetSetHeight(searchBtn, 36);
  widgetSetEdgeInsets(searchBtn, 0, 12, 0, 12);
  widgetSetHugging(searchBtn, 1);

  const addBtn = Button("+", () => {});
  buttonSetBordered(addBtn, 0);
  textSetFontSize(addBtn, 24);
  widgetSetWidth(addBtn, 36);
  widgetSetHeight(addBtn, 36);

  const headerRow = HStack(12, [header, Spacer(), addBtn]);
  widgetSetHugging(headerRow, 1);

  const topBar = VStack(10, [headerRow, searchBtn]);
  widgetSetEdgeInsets(topBar, 12, 16, 12, 16);
  widgetSetBackgroundColor(topBar, ...WHITE);

  const list = LazyVStack(contacts.length, (i: number) => ChatListRow(contacts[i]));
  lazyvstackSetRowHeight(list, 80);
  widgetSetBackgroundColor(list, ...BG_GRAY);
  widgetSetHugging(list, 1);

  const page = VStack(0, [topBar, Divider(), list]);
  widgetSetHugging(page, 1);
  return page;
}

// ══════════════════════════════════════════════════════════════════════════════
// 聊天详情页
// ══════════════════════════════════════════════════════════════════════════════
function MsgBubble(msg: Message) {
  const bubble = Text(msg.text);
  textSetFontSize(bubble, 16);
  textSetWraps(bubble, 1);
  setCornerRadius(bubble, 8);
  widgetSetEdgeInsets(bubble, 10, 14, 10, 14);

  if (msg.isMine) {
    textSetColor(bubble, 1.0, 1.0, 1.0, 1.0);
    widgetSetBackgroundColor(bubble, ...WX_GREEN);
  } else {
    textSetColor(bubble, ...TEXT_BLACK);
    widgetSetBackgroundColor(bubble, ...WHITE);
  }

  const av = Text(msg.isMine ? "我" : "友");
  textSetFontSize(av, 14);
  textSetColor(av, 1.0, 1.0, 1.0, 1.0);
  widgetSetWidth(av, 40);
  widgetSetHeight(av, 40);
  setCornerRadius(av, 8);
  widgetSetBackgroundColor(
    av,
    msg.isMine ? WX_GREEN[0] : 0.4,
    msg.isMine ? WX_GREEN[1] : 0.6,
    msg.isMine ? WX_GREEN[2] : 0.9,
    1.0
  );

  const row = msg.isMine ? HStack(8, [Spacer(), bubble, av]) : HStack(8, [av, bubble, Spacer()]);
  widgetSetEdgeInsets(row, 6, 16, 6, 16);
  return row;
}

function buildChatDetailPage() {
  const backBtn = Button("< 返回", () => showChatDetail.set(false));
  buttonSetBordered(backBtn, 0);
  textSetFontSize(backBtn, 16);
  textSetColor(backBtn, ...TEXT_BLACK);

  const title = Text(selectedName.value);
  textSetFontSize(title, 16);
  textSetFontWeight(title, 16, 0.6);
  textSetColor(title, ...TEXT_BLACK);

  const moreBtn = Button("⋯", () => {});
  buttonSetBordered(moreBtn, 0);
  textSetFontSize(moreBtn, 24);
  textSetColor(moreBtn, ...TEXT_BLACK);

  const topBar = HStack(12, [backBtn, Spacer(), title, Spacer(), moreBtn]);
  widgetSetHeight(topBar, 50);
  widgetSetEdgeInsets(topBar, 12, 16, 12, 16);
  widgetSetBackgroundColor(topBar, ...WHITE);
  stackSetAlignment(topBar, 5); // Leading

  const msgList = VStack(0, [ForEach(msgCount, (i: number) => MsgBubble(messages.value[i]))]);
  widgetSetBackgroundColor(msgList, ...CHAT_BG);

  const chatScroll = ScrollView();
  scrollViewSetChild(chatScroll, msgList);
  widgetSetHugging(chatScroll, 1);

  let messageFieldWidget: any = null;

  const field = TextArea("输入消息", (val: string) => inputText.set(val));
  messageFieldWidget = field;
  setCornerRadius(field, 8);
  widgetSetEdgeInsets(field, 10, 12, 10, 12);
  widgetSetHeight(field, 80);
  widgetSetBackgroundColor(field, ...WHITE);

  const voiceBtn = Button("🎤", () => {});
  buttonSetBordered(voiceBtn, 0);
  textSetFontSize(voiceBtn, 20);
  widgetSetWidth(voiceBtn, 40);
  widgetSetHeight(voiceBtn, 40);

  const emojiBtn = Button("😊", () => {});
  buttonSetBordered(emojiBtn, 0);
  textSetFontSize(emojiBtn, 20);
  widgetSetWidth(emojiBtn, 40);
  widgetSetHeight(emojiBtn, 40);

  const moreIconBtn = Button("+", () => {});
  buttonSetBordered(moreIconBtn, 0);
  textSetFontSize(moreIconBtn, 24);
  widgetSetWidth(moreIconBtn, 40);
  widgetSetHeight(moreIconBtn, 40);

  const sendBtn = Button("发送", () => {
    const sent = sendMessage();
    if (sent && messageFieldWidget) {
      textareaSetString(messageFieldWidget, "");
      // 更新会话列表时间
      const currentId = selectedId.value;
      if (currentId !== null) {
        const contact = contacts.find((c) => c.id === currentId);
        if (contact) contact.time = sent.time;
        const timeLabel = contactTimeLabelById.get(currentId);
        if (timeLabel) textSetString(timeLabel, sent.time);
      }
    }
  });
  buttonSetBordered(sendBtn, 1);
  setCornerRadius(sendBtn, 6);
  widgetSetBackgroundColor(sendBtn, ...WX_GREEN);
  widgetSetHeight(sendBtn, 36);
  widgetSetEdgeInsets(sendBtn, 0, 16, 0, 16);

  const toolRow = HStack(8, [voiceBtn, emojiBtn, moreIconBtn, Spacer(), sendBtn]);
  widgetSetEdgeInsets(toolRow, 8, 12, 8, 12);

  const inputArea = VStack(8, [field, toolRow]);
  widgetSetBackgroundColor(inputArea, ...BG_GRAY);
  widgetSetEdgeInsets(inputArea, 8, 0, 8, 0);

  const page = VStack(0, [topBar, Divider(), chatScroll, Divider(), inputArea]);
  widgetSetHugging(page, 1);
  return page;
}

// ══════════════════════════════════════════════════════════════════════════════
// 其他页面（占位）
// ══════════════════════════════════════════════════════════════════════════════
function buildPlaceholderPage(title: string) {
  const header = Text(title);
  textSetFontSize(header, 18);
  textSetFontWeight(header, 18, 0.7);
  textSetColor(header, ...TEXT_BLACK);

  const topBar = HStack(0, [header, Spacer()]);
  widgetSetHeight(topBar, 50);
  widgetSetEdgeInsets(topBar, 12, 16, 12, 16);
  widgetSetBackgroundColor(topBar, ...WHITE);
  stackSetAlignment(topBar, 5); // Leading

  const content = Text(`${title}页面（待实现）`);
  textSetFontSize(content, 16);
  textSetColor(content, ...TEXT_GRAY);

  const contentArea = VStack(0, [content]);
  widgetSetHugging(contentArea, 1);
  widgetSetBackgroundColor(contentArea, ...BG_GRAY);
  widgetSetEdgeInsets(contentArea, 20, 16, 0, 16);
  stackSetAlignment(contentArea, 5); // Leading

  const page = VStack(0, [topBar, Divider(), contentArea]);
  widgetSetHugging(page, 1);
  return page;
}

// ══════════════════════════════════════════════════════════════════════════════
// 主应用
// ══════════════════════════════════════════════════════════════════════════════
export function runMobileApp() {
  function buildMainContent() {
    if (showChatDetail.value) {
      return buildChatDetailPage();
    }

    switch (currentTab.value) {
      case "chats":
        return buildChatListPage();
      case "contacts":
        return buildPlaceholderPage("通讯录");
      case "discover":
        return buildPlaceholderPage("发现");
      case "me":
        return buildPlaceholderPage("我");
      default:
        return buildChatListPage();
    }
  }

  const mainContent = buildMainContent();
  const bottomNav = buildBottomNav();

  const root = VStack(0, [mainContent, Divider(), bottomNav]);

  App({
    title: "微信",
    width: 390,
    height: 844,
    body: root,
  });
}

runMobileApp();


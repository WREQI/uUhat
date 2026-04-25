import {
  Button,
  Divider,
  ForEach,
  HStack,
  ScrollView,
  Spacer,
  Text,
  TextArea,
  TextField,
  VStack,
  buttonSetBordered,
  scrollViewSetChild,
  setCornerRadius,
  stackSetAlignment,
  stateOnChange,
  textSetColor,
  textSetFontSize,
  textSetFontWeight,
  textSetString,
  textSetWraps,
  textfieldSetBackgroundColor,
  textfieldBlurAll,
  textareaSetString,
  widgetAnimateOpacity,
  widgetSetBackgroundColor,
  widgetSetEdgeInsets,
  widgetSetHeight,
  widgetSetHugging,
  widgetSetOnClick,
  widgetSetOnHover,
  widgetSetWidth,
} from "perry/ui";
import type { Message } from "../../shared/types";
import type { Contact } from "../../shared/types";

export interface ChatStore {
  contacts: Contact[];
  selectedName: { value: string; set: (v: string) => void };
  messages: { value: Message[]; set: (v: Message[]) => void };
  msgCount: { value: number; set: (v: number) => void };
  inputText: { value: string; set: (v: string) => void };
  searchText: { value: string; set: (v: string) => void };
  selectContact: (id: number) => void;
  sendMessage: () => Message | null;
}

// ── 颜色（接近微信桌面版） ─────────────────────────────────────────────────────
const WX_GREEN = [0.027, 0.757, 0.376, 1.0] as const;
const SIDEBAR_BG = [0.224, 0.224, 0.224, 1.0] as const;
const LIST_BG = [0.953, 0.953, 0.953, 1.0] as const;
const CHAT_BG = [0.961, 0.961, 0.961, 1.0] as const;
const WHITE = [1.0, 1.0, 1.0, 1.0] as const;
const DIVIDER = [0.86, 0.86, 0.86, 1.0] as const;
const AVATAR_BLUE = [0.22, 0.53, 0.96, 1.0] as const;
const ROW_SELECTED_BG = [0.88, 0.88, 0.88, 1.0] as const;
const ROW_HOVER_BG = [0.9, 0.9, 0.9, 1.0] as const;

function VDivider() {
  const line = Text(" ");
  widgetSetWidth(line, 1);
  widgetSetBackgroundColor(line, ...DIVIDER);
  return line;
}

function NavIcon(label: string, active: boolean) {
  const btn = Button(label, () => {});
  buttonSetBordered(btn, 0);
  textSetFontSize(btn, 20);
  widgetSetWidth(btn, 40);
  widgetSetHeight(btn, 40);
  setCornerRadius(btn, 8);
  if (active) widgetSetBackgroundColor(btn, 0.35, 0.35, 0.35, 1.0);
  return btn;
}

function buildSidebar() {
  const avatar = Text("我");
  textSetFontSize(avatar, 13);
  textSetColor(avatar, 1.0, 1.0, 1.0, 1.0);
  widgetSetWidth(avatar, 36);
  widgetSetHeight(avatar, 36);
  setCornerRadius(avatar, 6);
  widgetSetBackgroundColor(avatar, ...WX_GREEN);
  widgetSetEdgeInsets(avatar, 4, 2, 4, 2);

  const topIcons = VStack(4, [avatar, NavIcon("💬", true), NavIcon("👥", false), NavIcon("📦", false)]);
  widgetSetEdgeInsets(topIcons, 12, 4, 0, 4);
  stackSetAlignment(topIcons, 9); // CenterX

  const bottomIcons = VStack(4, [NavIcon("📱", false), NavIcon("☰", false)]);
  widgetSetEdgeInsets(bottomIcons, 0, 4, 12, 4);
  stackSetAlignment(bottomIcons, 9);

  const sidebar = VStack(0, [topIcons, Spacer(), bottomIcons]);
  widgetSetWidth(sidebar, 54);
  widgetSetBackgroundColor(sidebar, ...SIDEBAR_BG);
  return sidebar;
}

function ContactAvatar(name: string) {
  const text = name === "文件传输助手" ? "文" : name.includes("群") ? "群" : name.slice(0, 1);
  const av = Text(text);
  textSetFontSize(av, 14);
  textSetColor(av, 1.0, 1.0, 1.0, 1.0);
  widgetSetWidth(av, 40);
  widgetSetHeight(av, 40);
  setCornerRadius(av, 6);
  widgetSetBackgroundColor(av, ...AVATAR_BLUE);
  return av;
}

function getContactLatestTime(store: ChatStore, c: Contact): string {
  const msgs = (store as any).chatData?.[c.id] as Message[] | undefined;
  if (!msgs || msgs.length === 0) return c.time;
  return msgs[msgs.length - 1]?.time ?? c.time;
}

function ContactRow(store: ChatStore, index: number) {
  const c = store.contacts[index];
  const av = ContactAvatar(c.name);

  const name = Text(c.name);
  textSetFontSize(name, 14);
  textSetFontWeight(name, 14, 0.6);
  textSetColor(name, 0.1, 0.1, 0.1, 1.0);

  const preview = Text(c.preview);
  textSetFontSize(preview, 12);
  textSetColor(preview, 0.5, 0.5, 0.5, 1.0);

  const nameRow = VStack(2, [name, preview]);
  stackSetAlignment(nameRow, 5); // Leading

  const timeLabel = Text(getContactLatestTime(store, c));
  textSetFontSize(timeLabel, 11);
  textSetColor(timeLabel, 0.6, 0.6, 0.6, 1.0);

  const muteIcon = c.muted ? Text("🔕") : Spacer();
  if (c.muted) textSetFontSize(muteIcon as any, 10);

  const rightCol = VStack(4, [timeLabel, muteIcon]);
  stackSetAlignment(rightCol, 7); // trailing

  const row = HStack(10, [av, nameRow, Spacer(), rightCol]);
  widgetSetEdgeInsets(row, 8, 12, 8, 12);
  setCornerRadius(row, 8);

  function applyRowStyle() {
    const isSelected = (store as any).selectedId?.value === c.id;
    if (isSelected) widgetSetBackgroundColor(row, ...ROW_SELECTED_BG);
    else widgetSetBackgroundColor(row, 0, 0, 0, 0);
  }
  applyRowStyle();

  // 选中态变化时刷新背景（如果上层 store 有 selectedId）
  if ((store as any).selectedId) {
    stateOnChange((store as any).selectedId, () => applyRowStyle());
  }

  widgetSetOnClick(row, () => store.selectContact(c.id));

  // hover：加深背景并做轻微透明动画，模拟“阴影加深”
  // Perry 的 onHover 在不同平台可能会传入 hovering(true/false)，这里用 any 兼容。
  widgetSetOnHover(
    row,
    ((hovering?: boolean) => {
      // 同 entry：避免 hover “移出”不触发导致背景残留
      if (hovering === false) return;
      widgetAnimateOpacity(row, 0.97, 0.05);
      widgetAnimateOpacity(row, 1.0, 0.12);
    }) as any
  );

  // 时间：如果上层 store 有 chatData/messages/sendMessage 逻辑，发送后会更新 contact.time；
  // 这里监听 messages 数组变化（若存在），把选中会话的时间刷新到右上角。
  if ((store as any).messages && (store as any).selectedId) {
    stateOnChange((store as any).messages, () => {
      if ((store as any).selectedId.value === c.id) {
        textSetString(timeLabel, getContactLatestTime(store, c));
      }
    });
  }

  return row;
}

function buildContactList(store: ChatStore) {
  const searchField = TextField("搜索", (val: string) => store.searchText.set(val));
  textfieldSetBackgroundColor(searchField, 0.878, 0.878, 0.878, 1.0);
  setCornerRadius(searchField, 6);
  widgetSetEdgeInsets(searchField, 4, 8, 4, 8);
  widgetSetHeight(searchField, 28);

  const addBtn = Button("+", () => {});
  buttonSetBordered(addBtn, 0);
  textSetFontSize(addBtn, 18);
  widgetSetWidth(addBtn, 28);
  widgetSetHeight(addBtn, 28);

  const searchRow = HStack(8, [searchField, addBtn]);
  widgetSetEdgeInsets(searchRow, 8, 10, 8, 10);
  widgetSetBackgroundColor(searchRow, ...LIST_BG);

  const visibleCount = Math.min(store.contacts.length, 40);
  const rows: any[] = [];
  for (let i = 0; i < visibleCount; i++) rows.push(ContactRow(store, i));
  const list = VStack(0, rows);
  widgetSetOnClick(list, () => textfieldBlurAll());

  const panel = VStack(0, [searchRow, Divider(), list]);
  widgetSetWidth(panel, 290);
  widgetSetBackgroundColor(panel, ...LIST_BG);
  return panel;
}

function MsgBubble(msg: Message) {
  const bubble = Text(msg.text);
  textSetFontSize(bubble, 14);
  textSetWraps(bubble, 1);
  setCornerRadius(bubble, 6);
  widgetSetEdgeInsets(bubble, 8, 12, 8, 12);

  if (msg.isMine) {
    textSetColor(bubble, 1.0, 1.0, 1.0, 1.0);
    widgetSetBackgroundColor(bubble, ...WX_GREEN);
  } else {
    textSetColor(bubble, 0.1, 0.1, 0.1, 1.0);
    widgetSetBackgroundColor(bubble, ...WHITE);
  }

  const av = Text(msg.isMine ? "我" : "友");
  textSetFontSize(av, 12);
  textSetColor(av, 1.0, 1.0, 1.0, 1.0);
  widgetSetWidth(av, 32);
  widgetSetHeight(av, 32);
  setCornerRadius(av, 6);
  widgetSetBackgroundColor(
    av,
    msg.isMine ? WX_GREEN[0] : 0.4,
    msg.isMine ? WX_GREEN[1] : 0.6,
    msg.isMine ? WX_GREEN[2] : 0.9,
    1.0
  );

  const row = msg.isMine ? HStack(8, [Spacer(), bubble, av]) : HStack(8, [av, bubble, Spacer()]);
  widgetSetEdgeInsets(row, 4, 12, 4, 12);
  return row;
}

function buildChatArea(store: ChatStore) {
  const msgList = VStack(0, [ForEach(store.msgCount, (i: number) => MsgBubble(store.messages.value[i]))]);
  widgetSetBackgroundColor(msgList, ...CHAT_BG);

  const chatScroll = ScrollView();
  scrollViewSetChild(chatScroll, msgList);
  widgetSetHugging(chatScroll, 1);

  let messageFieldWidget: any = null;

  const field = TextArea("发送消息", (val: string) => store.inputText.set(val));
  messageFieldWidget = field;
  setCornerRadius(field, 6);
  widgetSetEdgeInsets(field, 10, 10, 10, 10);
  widgetSetHeight(field, 90);

  const sendBtn = Button("发送", () => {
    const sent = store.sendMessage();
    if (sent && messageFieldWidget) textareaSetString(messageFieldWidget, "");
  });
  buttonSetBordered(sendBtn, 1);
  setCornerRadius(sendBtn, 6);
  widgetSetBackgroundColor(sendBtn, ...WX_GREEN);
  widgetSetHeight(sendBtn, 34);
  widgetSetEdgeInsets(sendBtn, 0, 14, 0, 14);

  const inputRow = HStack(8, [field, sendBtn]);
  widgetSetEdgeInsets(inputRow, 8, 12, 8, 12);
  widgetSetBackgroundColor(inputRow, ...LIST_BG);

  const chatTitle = Text(`${store.selectedName.value}`);
  textSetFontSize(chatTitle, 15);
  textSetFontWeight(chatTitle, 15, 0.7);
  textSetColor(chatTitle, 0.1, 0.1, 0.1, 1.0);

  const topBar = HStack(0, [chatTitle, Spacer()]);
  stackSetAlignment(topBar, 5); // Leading
  widgetSetEdgeInsets(topBar, 12, 16, 12, 16);
  widgetSetBackgroundColor(topBar, ...WHITE);
  widgetSetHeight(topBar, 46);

  const chatPanel = VStack(0, [topBar, Divider(), chatScroll, Divider(), inputRow]);
  widgetSetBackgroundColor(chatPanel, ...CHAT_BG);
  return chatPanel;
}

export function buildWechatDesktopRoot(store: ChatStore) {
  const sidebar = buildSidebar();
  const contactList = buildContactList(store);
  const chatArea = buildChatArea(store);

  widgetSetHugging(sidebar, 1000);
  widgetSetHugging(contactList, 1000);
  widgetSetHugging(chatArea, 1);

  const root = HStack(0, [sidebar, VDivider(), contactList, VDivider(), chatArea]);
  return root;
}


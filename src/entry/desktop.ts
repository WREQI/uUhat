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
  TextField,
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
  textfieldSetBackgroundColor,
  textfieldBlurAll,
  textareaSetString,
  widgetSetBackgroundColor,
  widgetSetEdgeInsets,
  widgetSetHeight,
  widgetSetHugging,
  widgetSetOnClick,
  widgetSetOnHover,
  widgetAnimateOpacity,
  widgetSetWidth,
} from "perry/ui";
import { makeChatData, makeContacts } from "../shared/mock";
import type { Contact, Message } from "../shared/types";

// ── 颜色（接近微信桌面版） ─────────────────────────────────────────────────────
const WX_GREEN = [0.027, 0.757, 0.376, 1.0] as const;
const SIDEBAR_BG = [0.224, 0.224, 0.224, 1.0] as const; // #393939
const LIST_BG = [0.953, 0.953, 0.953, 1.0] as const; // #F3F3F3
const CHAT_BG = [0.961, 0.961, 0.961, 1.0] as const;
const WHITE = [1.0, 1.0, 1.0, 1.0] as const;
const DIVIDER = [0.86, 0.86, 0.86, 1.0] as const;
const AVATAR_BLUE = [0.22, 0.53, 0.96, 1.0] as const;

function VDivider() {
  const line = Text(" ");
  widgetSetWidth(line, 1);
  widgetSetBackgroundColor(line, ...DIVIDER);
  return line;
}

// ── 数据/状态 ──────────────────────────────────────────────────────────────────
const contacts: Contact[] = makeContacts(80);
const chatData: Record<number, Message[]> = makeChatData(contacts);

const selectedId = State<number | null>(1);
const selectedName = State(contacts.find((c) => c.id === 1)?.name ?? "");
const messages = State<Message[]>(chatData[1] ?? []);
const msgCount = State(messages.value.length);
const inputText = State("");
const searchText = State("");
let nextMsgId = 100;

// 用于把“选中态/时间”变化反映到已渲染的行上
const contactRowById = new Map<number, any>();
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

function applyContactRowStyle(id: number) {
  const row = contactRowById.get(id);
  if (!row) return;

  const isSelected = selectedId.value === id;
  // 选中态高亮背景（比列表底色更深一点）
  if (isSelected) widgetSetBackgroundColor(row, 0.88, 0.88, 0.88, 1.0);
  // 未选中不主动上色（透明），避免看起来“扫过就变灰/一片灰”
  else widgetSetBackgroundColor(row, 0, 0, 0, 0);
}

function selectContact(id: number) {
  selectedId.set(id);
  selectedName.set(contacts.find((c) => c.id === id)?.name ?? "");
  const msgs = chatData[id] ?? [];
  messages.set(msgs);
  msgCount.set(msgs.length);

  // 强制刷新所有行：确保永远只有一个选中高亮
  for (const [cid] of contactRowById) applyContactRowStyle(cid);
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

  // 更新会话列表右上角时间（最新消息时间）
  const contact = contacts.find((c) => c.id === selectedId.value);
  if (contact) contact.time = msg.time;
  const timeLabel = contactTimeLabelById.get(selectedId.value);
  if (timeLabel) textSetString(timeLabel, msg.time);

  return msg;
}

// ══════════════════════════════════════════════════════════════════════════════
// 左侧导航栏（图标列）
// ══════════════════════════════════════════════════════════════════════════════
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

// ══════════════════════════════════════════════════════════════════════════════
// 中间会话列表
// ══════════════════════════════════════════════════════════════════════════════
function ContactAvatar(c: Contact) {
  const text = c.name === "文件传输助手" ? "文" : c.name.includes("群") ? "群" : c.name.slice(0, 1);

  const av = Text(text);
  textSetFontSize(av, 14);
  textSetColor(av, 1.0, 1.0, 1.0, 1.0);
  widgetSetWidth(av, 40);
  widgetSetHeight(av, 40);
  setCornerRadius(av, 6);
  widgetSetBackgroundColor(av, ...AVATAR_BLUE);
  return av;
}

function ContactRow(c: Contact) {
  const av = ContactAvatar(c);

  const name = Text(c.name);
  textSetFontSize(name, 14);
  textSetFontWeight(name, 14, 0.6);
  textSetColor(name, 0.1, 0.1, 0.1, 1.0);

  const preview = Text(c.preview);
  textSetFontSize(preview, 12);
  textSetColor(preview, 0.5, 0.5, 0.5, 1.0);

  const nameRow = VStack(2, [name, preview]);
  stackSetAlignment(nameRow, 5); // Leading

  // 右上角显示“最新聊天信息时间”
  const timeLabel = Text(lastMessageTime(c.id));
  textSetFontSize(timeLabel, 11);
  textSetColor(timeLabel, 0.6, 0.6, 0.6, 1.0);

  const muteIcon = c.muted ? Text("🔕") : Spacer();
  if (c.muted) textSetFontSize(muteIcon as any, 10);

  const rightCol = VStack(4, [timeLabel, muteIcon]);
  stackSetAlignment(rightCol, 7); // trailing

  const row = HStack(10, [av, nameRow, Spacer(), rightCol]);
  widgetSetEdgeInsets(row, 8, 12, 8, 12);
  setCornerRadius(row, 8);

  contactRowById.set(c.id, row);
  contactTimeLabelById.set(c.id, timeLabel);
  applyContactRowStyle(c.id);

  widgetSetOnClick(row, () => selectContact(c.id));

  // 鼠标经过：背景“阴影”更深（用更深的底色 + 轻微透明动画模拟）
  // Perry 的 onHover 在不同平台可能会传入 hovering(true/false)，这里用 any 兼容。
  widgetSetOnHover(
    row,
    ((hovering?: boolean) => {
      // 某些平台 hover 只触发“进入”，不触发“离开”，因此这里不改背景色，
      // 只做轻微透明度动画来模拟“阴影加深”，避免扫过多行后都残留灰底。
      if (hovering === false) return;
      widgetAnimateOpacity(row, 0.97, 0.05);
      widgetAnimateOpacity(row, 1.0, 0.12);
    }) as any
  );

  return row;
}

function buildContactList() {
  const searchField = TextField("搜索", (val: string) => searchText.set(val));
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

  const list = LazyVStack(contacts.length, (i: number) => ContactRow(contacts[i]));
  lazyvstackSetRowHeight(list, 68);
  widgetSetOnClick(list, () => textfieldBlurAll());

  const panel = VStack(0, [searchRow, Divider(), list]);
  widgetSetWidth(panel, 290);
  widgetSetBackgroundColor(panel, ...LIST_BG);
  return panel;
}

// ══════════════════════════════════════════════════════════════════════════════
// 右侧聊天区
// ══════════════════════════════════════════════════════════════════════════════
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

function buildChatArea() {
  const msgList = VStack(0, [ForEach(msgCount, (i: number) => MsgBubble(messages.value[i]))]);
  widgetSetBackgroundColor(msgList, ...CHAT_BG);

  const chatScroll = ScrollView();
  scrollViewSetChild(chatScroll, msgList);
  widgetSetHugging(chatScroll, 1);

  let messageFieldWidget: any = null;

  const field = TextArea("发送消息", (val: string) => inputText.set(val));
  messageFieldWidget = field;
  setCornerRadius(field, 6);
  widgetSetEdgeInsets(field, 10, 10, 10, 10);
  widgetSetHeight(field, 90);

  const sendBtn = Button("发送", () => {
    const sent = sendMessage();
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

  const chatTitle = Text(`${selectedName.value}`);
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

const sidebar = buildSidebar();
const contactList = buildContactList();
const chatArea = buildChatArea();

widgetSetHugging(sidebar, 1000);
widgetSetHugging(contactList, 1000);
widgetSetHugging(chatArea, 1);

const root = HStack(0, [sidebar, VDivider(), contactList, VDivider(), chatArea]);

// 注意：不依赖 stateOnChange(selectedId)，因为 selectedId 是 State<number | null>
// 选中态刷新由 selectContact() 主动触发。

App({
  title: "微信",
  width: 900,
  height: 680,
  body: root,
});


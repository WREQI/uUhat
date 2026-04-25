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
  textfieldSetBackgroundColor,
  textfieldSetFontSize,
  textfieldSetOnSubmit,
  textfieldSetString,
  textfieldBlurAll,
  textareaSetString,
  widgetMatchParentHeight,
  widgetMatchParentWidth,
  widgetSetBackgroundColor,
  widgetSetEdgeInsets,
  widgetSetHeight,
  widgetSetHugging,
  widgetSetOnClick,
  widgetSetWidth,
} from "perry/ui";

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
  widgetMatchParentHeight(line);
  widgetSetBackgroundColor(line, ...DIVIDER);
  return line;
}

// ── 数据 ──────────────────────────────────────────────────────────────────────
interface Contact {
  id: number;
  name: string;
  preview: string;
  time: string;
  muted: boolean;
}

interface Message {
  id: number;
  text: string;
  isMine: boolean;
  time: string;
}

function makeContacts(total: number): Contact[] {
  const seed: Contact[] = [
    { id: 1, name: "文件传输助手", preview: "图片", time: "昨天", muted: false },
    { id: 2, name: "共同富裕交流群", preview: "好的，明天见", time: "昨天", muted: true },
    { id: 3, name: "工程几何技术天地 3 群", preview: "有人在吗", time: "周二", muted: true },
    { id: 4, name: "张诗雨", preview: "好的！", time: "周二", muted: false },
    { id: 5, name: "div", preview: "收到", time: "周一", muted: false },
    { id: 6, name: "远程&工作 交流群", preview: "周报发一下", time: "周一", muted: true },
  ];

  const timePool = ["刚刚", "10:12", "11:05", "12:38", "昨天", "周一", "周二", "周三", "周四", "周五"];
  const previewPool = ["收到", "OK", "哈哈", "在吗", "好的", "我到了", "稍等下", "发你了", "明天见", "👍"];

  const list: Contact[] = [...seed];
  for (let i = seed.length + 1; i <= total; i++) {
    const isGroup = i % 4 === 0;
    const name = isGroup ? `测试群聊 ${i - 6} 群` : `测试联系人 ${i - 6}`;
    list.push({
      id: i,
      name,
      preview: previewPool[i % previewPool.length],
      time: timePool[i % timePool.length],
      muted: i % 3 === 0,
    });
  }
  return list;
}

const contacts: Contact[] = makeContacts(80);

function makeChatData(list: Contact[]): Record<number, Message[]> {
  const data: Record<number, Message[]> = {};
  for (const c of list) {
    const base: Message[] = [
      { id: 1, text: `你好，我是「${c.name}」`, isMine: false, time: "09:00" },
      { id: 2, text: "收到，测试滚动和切换会话用。", isMine: true, time: "09:01" },
    ];
    if (c.id % 5 === 0) base.push({ id: 3, text: "再来一条消息，看看气泡换行效果。", isMine: false, time: "09:02" });
    data[c.id] = base;
  }
  // 额外给几个种子会话更像真实聊天
  data[1] = [
    { id: 1, text: "你好！", isMine: false, time: "09:00" },
    { id: 2, text: "你好，有什么需要帮助的吗？", isMine: true, time: "09:01" },
    { id: 3, text: "我在测试 Perry 的微信 UI。", isMine: true, time: "09:02" },
  ];
  data[4] = [
    { id: 1, text: "在吗？", isMine: false, time: "10:00" },
    { id: 2, text: "在的！", isMine: true, time: "10:01" },
    { id: 3, text: "好的！", isMine: false, time: "10:02" },
  ];
  return data;
}

const chatData: Record<number, Message[]> = makeChatData(contacts);

function nowTime(): string {
  const d = new Date();
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

// ── 状态 ──────────────────────────────────────────────────────────────────────
const selectedId = State<number | null>(1);
const selectedName = State(contacts.find((c) => c.id === 1)?.name ?? "");
const messages = State<Message[]>(chatData[1] ?? []);
const msgCount = State(messages.value.length);
const inputText = State("");
const searchText = State("");
let nextMsgId = 100;
let messageFieldWidget: any = null;
let messageFieldKind: "textField" | "textArea" = "textField";

function selectContact(id: number) {
  selectedId.set(id);
  selectedName.set(contacts.find((c) => c.id === id)?.name ?? "");
  const msgs = chatData[id] ?? [];
  messages.set(msgs);
  msgCount.set(msgs.length);
}

function sendMessage() {
  const text = inputText.value.trim();
  if (!text || selectedId.value === null) return;
  const msg: Message = { id: nextMsgId++, text, isMine: true, time: nowTime() };
  const updated = [...messages.value, msg];
  chatData[selectedId.value] = updated;
  messages.set(updated);
  msgCount.set(updated.length);
  inputText.set("");
  if (messageFieldWidget) {
    if (messageFieldKind === "textArea") textareaSetString(messageFieldWidget, "");
    else textfieldSetString(messageFieldWidget, "");
  }
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
  widgetMatchParentHeight(sidebar);
  widgetSetBackgroundColor(sidebar, ...SIDEBAR_BG);
  return sidebar;
}

// ══════════════════════════════════════════════════════════════════════════════
// 中间会话列表
// ══════════════════════════════════════════════════════════════════════════════
function ContactAvatar(c: Contact) {
  const text =
    c.name === "文件传输助手"
      ? "文"
      : c.name.includes("群")
        ? "群"
        : c.name.slice(0, 1);

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

  const timeLabel = Text(c.time);
  textSetFontSize(timeLabel, 11);
  textSetColor(timeLabel, 0.6, 0.6, 0.6, 1.0);

  const muteIcon = c.muted ? Text("🔕") : Spacer();
  if (c.muted) textSetFontSize(muteIcon as any, 10);

  const rightCol = VStack(4, [timeLabel, muteIcon]);
  stackSetAlignment(rightCol, 7); // trailing / right

  const row = HStack(10, [av, nameRow, Spacer(), rightCol]);
  widgetMatchParentWidth(row);
  widgetSetEdgeInsets(row, 8, 12, 8, 12);
  widgetSetOnClick(row, () => selectContact(c.id));

  return row;
}

function buildContactList() {
  const searchField = TextField("搜索", (val: string) => searchText.set(val));
  textfieldSetFontSize(searchField, 13);
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
  widgetMatchParentWidth(searchRow);
  widgetSetEdgeInsets(searchRow, 8, 10, 8, 10);
  widgetSetBackgroundColor(searchRow, ...LIST_BG);

  const list = LazyVStack(contacts.length, (i: number) => ContactRow(contacts[i]));
  lazyvstackSetRowHeight(list, 68);
  widgetMatchParentWidth(list);
  widgetMatchParentHeight(list);
  // 点击列表空白/行时，让搜索框失焦
  widgetSetOnClick(list, () => textfieldBlurAll());

  const panel = VStack(0, [searchRow, Divider(), list]);
  widgetSetWidth(panel, 290);
  widgetMatchParentHeight(panel);
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
  widgetMatchParentWidth(row);
  widgetSetEdgeInsets(row, 4, 12, 4, 12);
  return row;
}

function buildChatArea() {
  const msgList = VStack(0, [ForEach(msgCount, (i: number) => MsgBubble(messages.value[i]))]);
  widgetMatchParentWidth(msgList);
  widgetSetBackgroundColor(msgList, ...CHAT_BG);

  const chatScroll = ScrollView();
  scrollViewSetChild(chatScroll, msgList);
  widgetMatchParentWidth(chatScroll);
  widgetMatchParentHeight(chatScroll);

  const field = TextArea("发送消息", (val: string) => inputText.set(val));
  messageFieldWidget = field;
  messageFieldKind = "textArea";
  setCornerRadius(field, 6);
  widgetSetEdgeInsets(field, 10, 10, 10, 10);
  widgetSetHeight(field, 90);

  const sendBtn = Button("发送", sendMessage);
  buttonSetBordered(sendBtn, 1);
  setCornerRadius(sendBtn, 6);
  widgetSetBackgroundColor(sendBtn, ...WX_GREEN);
  widgetSetHeight(sendBtn, 34);
  widgetSetEdgeInsets(sendBtn, 0, 14, 0, 14);

  const inputRow = HStack(8, [field, sendBtn]);
  widgetMatchParentWidth(inputRow);
  widgetSetEdgeInsets(inputRow, 8, 12, 8, 12);
  widgetSetBackgroundColor(inputRow, ...LIST_BG);

  const chatTitle = Text(`${selectedName.value}`);
  textSetFontSize(chatTitle, 15);
  textSetFontWeight(chatTitle, 15, 0.7);
  textSetColor(chatTitle, 0.1, 0.1, 0.1, 1.0);

  const topBar = HStack(0, [Spacer(), chatTitle, Spacer()]);
  widgetMatchParentWidth(topBar);
  widgetSetEdgeInsets(topBar, 12, 16, 12, 16);
  widgetSetBackgroundColor(topBar, ...WHITE);
  widgetSetHeight(topBar, 46);

  const chatPanel = VStack(0, [topBar, Divider(), chatScroll, Divider(), inputRow]);
  widgetMatchParentWidth(chatPanel);
  widgetMatchParentHeight(chatPanel);
  widgetSetBackgroundColor(chatPanel, ...CHAT_BG);
  return chatPanel;
}

const sidebar = buildSidebar();
const contactList = buildContactList();
const chatArea = buildChatArea();

// 让侧边栏/会话列表保持固定宽度，聊天区吃掉剩余空间
widgetSetHugging(sidebar, 1000);
widgetSetHugging(contactList, 1000);
widgetSetHugging(chatArea, 1);

const root = HStack(0, [sidebar, VDivider(), contactList, VDivider(), chatArea]);
widgetMatchParentWidth(root);
widgetMatchParentHeight(root);

App({
  title: "微信",
  width: 900,
  height: 680,
  body: root,
});

import type { Contact, Message } from "./types";

export function makeContacts(total: number): Contact[] {
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

export function makeChatData(list: Contact[]): Record<number, Message[]> {
  const data: Record<number, Message[]> = {};
  for (const c of list) {
    const base: Message[] = [
      { id: 1, text: `你好，我是「${c.name}」`, isMine: false, time: "09:00" },
      { id: 2, text: "收到，测试滚动和切换会话用。", isMine: true, time: "09:01" },
    ];
    if (c.id % 5 === 0) base.push({ id: 3, text: "再来一条消息，看看气泡换行效果。", isMine: false, time: "09:02" });
    data[c.id] = base;
  }

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


import {
  App,
  TextField,
  TextArea,
  VStack,
  HStack,
  Text,
  Button,
  State,
  ForEach,
  textSetFontSize,
  widgetSetWidth,
  widgetSetHeight,
  setCornerRadius,
  widgetSetEdgeInsets,
  buttonSetBordered,
} from "perry/ui";

const fieldText = State("");
const areaText = State("");

const lbl1 = Text("TextField (one-line):");
textSetFontSize(lbl1, 12);
const tf = TextField("type here", (v: string) => fieldText.set(v));
widgetSetWidth(tf, 480);

const lbl2 = Text("TextArea (multi-line):");
textSetFontSize(lbl2, 12);
const ta = TextArea("type here", (v: string) => areaText.set(v));
widgetSetWidth(ta, 480);
widgetSetHeight(ta, 120);

// 步骤1：圆角和内边距
setCornerRadius(ta, 6);
widgetSetEdgeInsets(ta, 10, 10, 10, 10);

// 步骤2：HStack 包裹 + 按钮
const sendBtn = Button("发送", () => {});
buttonSetBordered(sendBtn, 1);
const inputRow = HStack(8, [ta, sendBtn]);

// 步骤3：在输入上方添加一个由状态驱动的 ForEach（与 desktop.ts 的聊天列表匹配）
const items = State<number[]>([1, 2, 3, 4, 5]);
const list = VStack(0, [ForEach(State(5), (i: number) => Text(`row ${i}`))]);

App({
  title: "IME min repro #186 - Step 3",
  width: 540,
  height: 320,
  body: VStack(12, [list, lbl2, inputRow]),
});

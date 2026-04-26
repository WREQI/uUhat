import {
  App,
  TextField,
  TextArea,
  VStack,
  HStack,
  Text,
  Button,
  State,
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

// 步骤2：用 HStack 包裹 TextArea，旁边有一个按钮（与 desktop.ts 一致）
const sendBtn = Button("发送", () => {});
buttonSetBordered(sendBtn, 1);
const inputRow = HStack(8, [ta, sendBtn]);

App({
  title: "IME min repro #186 - Step 2",
  width: 540,
  height: 280,
  body: VStack(12, [lbl1, tf, lbl2, inputRow]),
});

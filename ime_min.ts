import {
  App,
  TextField,
  TextArea,
  VStack,
  Text,
  State,
  textSetFontSize,
  widgetSetWidth,
  widgetSetHeight,
  setCornerRadius,
  widgetSetEdgeInsets,
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

// 步骤1：添加圆角和内边距（与 desktop.ts 一致）
setCornerRadius(ta, 6);
widgetSetEdgeInsets(ta, 10, 10, 10, 10);

App({
  title: "IME min repro #186 - Step 1",
  width: 540,
  height: 280,
  body: VStack(12, [lbl1, tf, lbl2, ta]),
});


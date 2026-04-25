import { App, Text, VStack } from "perry/ui";

export function runMobileApp() {
  const title = Text("移动端 UI（占位）");
  const hint = Text("这里后续实现 iOS/Android 的页面栈 / Tab 等布局。");

  const root = VStack(12, [title, hint]);

  App({
    title: "uUhat Mobile",
    width: 390,
    height: 844,
    body: root,
  });
}

runMobileApp();


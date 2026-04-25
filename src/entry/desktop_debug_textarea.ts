import { App, TextArea, VStack } from "perry/ui";

App({
  title: "uUhat Desktop Debug TextArea",
  width: 900,
  height: 680,
  body: VStack(12, [TextArea("hint", () => {})]),
});


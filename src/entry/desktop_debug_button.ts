import { App, Button, Text, VStack } from "perry/ui";

App({
  title: "uUhat Desktop Debug Button",
  width: 900,
  height: 680,
  body: VStack(12, [Text("before"), Button("click", () => {}), Text("after")]),
});


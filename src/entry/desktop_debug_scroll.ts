import { App, ScrollView, Text, VStack, scrollViewSetChild } from "perry/ui";

const child = VStack(12, [Text("line1"), Text("line2"), Text("line3")]);
const s = ScrollView();
scrollViewSetChild(s, child);

App({
  title: "uUhat Desktop Debug Scroll",
  width: 900,
  height: 680,
  body: s,
});


import { App, State, Text, VStack } from "perry/ui";

const s = State("hello");

App({
  title: "uUhat Desktop Debug State",
  width: 900,
  height: 680,
  body: VStack(12, [Text(`state=${s.value}`)]),
});


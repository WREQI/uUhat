# IME 候选窗口问题排查步骤

## 测试方法
每完成一个步骤后：
1. 重新编译：`perry build <文件名>`
2. 运行程序
3. 在 TextArea 中输入中文（例如输入拼音 "nihao"）
4. **检查 IME 候选窗口是否正常显示**
5. 如果候选窗口失效，**停止测试** - 这就是触发点！

---

## 步骤 1：添加圆角 + 内边距
**文件**: `ime_min.ts` (已修改)

**改动**:
```typescript
setCornerRadius(ta, 6);
widgetSetEdgeInsets(ta, 10, 10, 10, 10);
```

**测试命令**:
```bash
perry build ime_min.ts
./ime_min
```

**预期**: IME 候选窗口应该仍然正常显示

---

## 步骤 2：用 HStack 包裹 TextArea + 添加按钮
**文件**: `ime_step2.ts`

**改动**:
- 添加"发送"按钮
- 用 HStack 包裹 TextArea 和按钮（间距 8）

**测试命令**:
```bash
perry build ime_step2.ts
./ime_step2
```

**预期**: IME 候选窗口应该仍然正常显示

---

## 步骤 3：在输入框上方添加 ForEach 列表
**文件**: `ime_step3.ts`

**改动**:
- 添加 ForEach 驱动的列表（模拟聊天消息列表）
- 布局：列表 → TextArea → 按钮

**测试命令**:
```bash
perry build ime_step3.ts
./ime_step3
```

**预期**: IME 候选窗口应该仍然正常显示

---

## 步骤 4：检查 desktop.ts 的 App 配置
**文件**: `src/entry/desktop.ts`

如果步骤 1-3 都正常，问题可能在于：
- App 的顶层配置
- 复杂的嵌套布局（LazyVStack + ScrollView）
- 事件处理（onClick, onHover）
- 状态管理的复杂交互

**需要检查的关键差异**:
1. `desktop.ts` 使用了 `LazyVStack` 而不是普通 `VStack`
2. `desktop.ts` 使用了 `ScrollView` 包裹消息列表
3. `desktop.ts` 有复杂的事件处理（hover, click）
4. `desktop.ts` 有多层嵌套的 HStack/VStack

---

## 报告格式
请按以下格式报告测试结果：

```
步骤 1: ✅ 正常 / ❌ 失效
步骤 2: ✅ 正常 / ❌ 失效
步骤 3: ✅ 正常 / ❌ 失效
```

**如果某个步骤失效，立即停止并报告！** 这样我们就能精确定位问题所在。

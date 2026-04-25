# uUhat (Perry / perry/ui)

[English](README.md) | 中文

一个用 **Perry**（`perry/ui`）写的原生桌面应用 Demo，目前实现了一个“微信聊天界面”风格的三栏 UI。

## 环境要求

- **macOS**（本项目当前主要在 macOS 上运行/调试）
- 已安装 **Perry CLI**：`perry`

检查是否安装成功：

```bash
perry --version
perry doctor
```

## 启动运行（开发调试）

项目入口在 `perry.toml` 里指定：

- `entry = "src/main.ts"`

直接编译并运行：

```bash
perry run src/main.ts
```

或使用 `perry.toml` 的入口（等价于上面）：

```bash
perry run
```

## 编译产物（打包/发布前）

将可执行文件编译到 `dist/`：

```bash
mkdir -p dist
perry compile src/main.ts -o dist/uUhat
```

运行编译出的二进制：

```bash
./dist/uUhat
```

## 类型检查

```bash
perry check src/main.ts
```

## 常见问题

### 中文输入法提示（预编辑/候选浮窗）不显示

目前在 `perry/ui` 的输入控件上，可能出现 **中文可输入但“预编辑提示/候选提示”显示不完整** 的情况。
本项目聊天输入框已切换为 `TextArea` 尝试改善该体验，但不同 Perry 版本/平台表现可能不同。


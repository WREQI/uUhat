# uUhat (Perry / perry/ui)

English | [中文](README.zh-CN.md)

A native desktop app demo built with **Perry** (`perry/ui`). The current UI is a 3-column “WeChat-like chat” layout.

## Requirements

- **macOS** (this project is mainly developed/tested on macOS)
- **Perry CLI** installed: `perry`

Verify your installation:

```bash
perry --version
perry doctor
```

## Run (dev)

The entry file is defined in `perry.toml`:

- `entry = "src/main.ts"`

Compile and run directly:

```bash
perry run src/main.ts
```

Or run using the `perry.toml` entry (equivalent):

```bash
perry run
```

## Build output (before packaging/release)

Compile an executable into `dist/`:

```bash
mkdir -p dist
perry compile src/main.ts -o dist/uUhat
```

Run the compiled binary:

```bash
./dist/uUhat
```

## Type check

```bash
perry check src/main.ts
```

## Troubleshooting

### Chinese IME pre-edit / candidate UI not shown

On some versions/platforms, `perry/ui` text inputs may allow Chinese typing (committed text works) but **the IME pre-edit / candidate UI is not fully shown**.
This project uses `TextArea` for the chat input to improve IME behavior, but results may vary by Perry version/platform.


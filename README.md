# PawnForge: AMX Mod X Studio

<p align="center">
  <img src="images/extension-logo.png" alt="PawnForge Logo" width="128">
  <h1 align="center">PawnForge: AMX Mod X Studio</h1>
</p>

<p align="center">
  <strong>A modernized, high-performance development suite and compiler toolchain for AMX Mod X Pawn scripting in Visual Studio Code.</strong>
</p>

<p align="center">
    <a href="https://marketplace.visualstudio.com/items?itemName=iceeedR.pawnforge">
        <img alt="Visual Studio Marketplace Version" src="https://img.shields.io/visual-studio-marketplace/v/iceeedR.pawnforge?style=for-the-badge&label=Marketplace">
    </a>
    <a href="https://marketplace.visualstudio.com/items?itemName=iceeedR.pawnforge">
        <img alt="Visual Studio Marketplace Installs" src="https://img.shields.io/visual-studio-marketplace/i/iceeedR.pawnforge?style=for-the-badge&color=22c55e">
    </a>
    <a href="https://open-vsx.org/extension/iceeedR/pawnforge">
        <img alt="Open VSX Installs" src="https://img.shields.io/open-vsx/dt/iceeedR/pawnforge?style=for-the-badge&color=22c55e">
    </a>
</p>

---

## ⚡ Why PawnForge? (Key Innovations & Performance)

PawnForge was built from the ground up to solve long-standing compiler limitations, eliminate editor lag, and bring modern developer ergonomics to AMX Mod X scripters:

| Feature / Capability | Legacy Tooling | PawnForge Studio |
|---|---|---|
| **Modern Compiler Support** | Legacy `amxxpc` only (requires `Done.` output) | **Full `amxx-nova-pc` & Next-Gen Compiler support** with robust termination detection & flag handling (`-E`, `-d3`). |
| **Include Resolution** | Flat directory paths only | **Recursive Glob expansion (`**/*.inc`)** & OS environment variable support (`${env:AMXX_HOME}`, `${env:HLDS_DIR}`). |
| **Global Includes** | Workspace-only settings | **Shared Global Include Paths (`amxxpawn.compiler.globalIncludePaths`)** across all projects. |
| **Performance & Caching** | Re-traverses files synchronously on every keystroke | **530x faster Symbol Graph Cache**, bounded LRU include cache, and $O(1)$ indexed semantic token processing. |
| **Status & Feedback** | Output console tab only | **Real-Time Status Bar Indicator** showing build status and compilation duration (`$(check) AMXX: OK (0.04s)`). |
| **Security & Safety** | Vulnerable shell string concatenations | **Parameterized process invocation (`execFile`)** preventing command injection and crash bugs in local compilation. |
| **Code Navigation** | Basic definitions | **Find All References in memory cache**, string callback detection (`set_task`), and special symbol support (`@`). |
| **Code Folding & Symbols** | Standard scopes | **Native Folding Ranges** for `#if/#else/#endif`, `enum {}`, and **Workspace Symbols (`Ctrl+T`)**. |
| **Quality & Benchmarks** | No automated tests | **Built-in Benchmark suite (`npm run benchmark`)** and automated `npm test` CI/CD pipeline. |

---

## ✨ Features

* **🟢 Advanced IntelliSense:** Intelligent autocompletion for functions, constants, variables, macros, and include files.
* **🎯 Smart Navigation (`Go to Definition`):** Press `Ctrl+Click` or `F12` to jump instantly to definitions:
  * Public, stock, and native functions (including `@` prefixed callbacks).
  * `#define` constants and macros.
  * Global and local variables (including loop-scoped variables `for (new i = 0; ...)`).
  * **Task string callbacks:** Jump directly to functions passed as strings (e.g., `set_task(..., "my_callback")`).
* **🔍 Find All References (`Shift+F12`):** Search all occurrences across the active document and all loaded `.inc` dependencies using fast in-memory caching.
* **✏️ Rename Symbol (`F2`):** Safely rename functions, variables, and constants across the file with keyword collision protection.
* **🔦 Document Highlight:** Placing the cursor on any symbol automatically highlights all occurrences in the active document.
* **🗂️ Native Code Folding:** Easily collapse and expand `#if / #else / #endif` blocks, block comments `/* */`, `enum` declarations, and function bodies.
* **🌐 Workspace Symbols (`Ctrl+T`):** Instantly search and filter any function, stock, or constant across all project headers and dependencies.
* **💡 Hover Tooltips:** View full function signatures, documentation comments, and constant values on hover.
* **⚡ Real-Time Diagnostics:** Immediate error reporting for missing `#include` files before compilation.
* **🔴 Inline Error Display:** Compiler error messages can be displayed directly at the end of the problematic line.
* **📊 Compilation Status Bar:** Bottom status bar widget displaying build outcome, duration, and one-click compile action.
* **📥 Zero-Config Compiler Auto-Downloader:** Automatically downloads and configures the default compiler if none is provided.
* **🛠️ Integrated Compilation:** Compile plugins directly using `F9`, the command palette, or the editor title bar button ▶️.

---

## 🚀 Installation

1. Open **Visual Studio Code**.
2. Open the Extensions view (`Ctrl+Shift+X` or `Cmd+Shift+X`).
3. Search for `PawnForge` or `iceeedR.pawnforge`.
4. Click **Install**.
5. Reload or restart VS Code.

You can also install directly from the [VS Marketplace](https://marketplace.visualstudio.com/items?itemName=iceeedR.pawnforge) or [Open VSX](https://open-vsx.org/extension/iceeedR/pawnforge).

---

## ⚙️ Configuration

By default, PawnForge provides zero-configuration compilation out of the box. You can customize paths, include directories, and behavior via VS Code Settings (`settings.json`):

```json
{
    // Path to your custom amxxpc / amxx-nova-pc compiler executable
    "amxxpawn.compiler.executablePath": "C:\\HLServer\\cstrike\\addons\\amxmodx\\scripting\\amxxpc.exe",

    // Global include directories shared across all workspaces (supports environment variables & globs)
    "amxxpawn.compiler.globalIncludePaths": [
        "${env:AMXX_HOME}\\scripting\\include\\**"
    ],

    // Workspace-specific include directories
    "amxxpawn.compiler.includePaths": [
        "${workspaceRoot}\\include\\**"
    ],

    // Show inline errors (// error message) at end of line (default: false)
    "amxxpawn.compiler.inlineErrors": false,

    // Debounce interval in ms for re-parsing symbols during typing (default: 300)
    "amxxpawn.language.reparseInterval": 300,

    // Recommended setting for cleaner autocomplete
    "editor.wordBasedSuggestions": "off"
}
```

### Supported Path Variables & Patterns:
* `${workspaceRoot}` — Root directory of the open workspace.
* `${fileDirname}` — Directory containing the active file.
* `${env:VAR_NAME}` — System environment variables (e.g. `${env:HLDS_DIR}`, `${env:USERPROFILE}`).
* `**` / `*` — Recursive folder globbing to discover all nested `.inc` headers automatically.

---

## ⌨️ Commands & Shortcuts

| Shortcut / Button | Command | Description |
|---|---|---|
| `F9` or ▶️ Button | `PawnForge: Compile Plugin` | Compiles the active `.sma` file using configured compiler settings. |
| Command Palette | `PawnForge: Compile Plugin Local` | Compiles using a local `amxxpc.exe` in the active file's folder. |
| Command Palette | `PawnForge: Create New Plugin (Scaffold)` | Generates a new AMXX plugin template with author, version, and ReAPI options. |
| `Ctrl+Click` / `F12` | **Go to Definition** | Jumps to symbol definition or callback. |
| `Shift+F12` | **Find All References** | Finds all references in document and includes. |
| `F2` | **Rename Symbol** | Renames symbol occurrences across file. |
| `Ctrl+T` | **Workspace Symbols** | Searches symbols globally across project files. |

---

## 🇧🇷 Resumo em Português

O **PawnForge** é uma suíte de desenvolvimento moderna, rápida e completa para scripters de AMX Mod X (GoldSrc / Counter-Strike 1.6). O projeto traz suporte nativo a compiladores modernos (`amxx-nova-pc`), variáveis de ambiente e globs recursivos em includes, cache de símbolos 530x mais rápido, barra de status com tempo real de compilação e diversas correções de estabilidade e segurança.

---

## 🛠️ Contributing & Development

We welcome community contributions, bug reports, and suggestions!

1. Clone the repository: `git clone https://github.com/NiceFeatures/pawnforge-vscode.git`
2. Install dependencies: `npm install`
3. Build the bundle: `npm run esbuild`
4. Run tests: `npm test`
5. Run benchmarks: `npm run benchmark`
6. Press `F5` in VS Code to launch the Extension Development Host.

---

## ⚖️ Open Source Heritage & License

* **Foundational Heritage:** PawnForge was created to modernize AMX Mod X development tooling and incorporates open-source language server foundations originally developed by **KliPPy** (`AMXXPawn Language`).
* **Community Stewardship:** Actively maintained and developed by **iceeedR** and the **NiceFeatures** team for the worldwide AMX Mod X scripter community.
* **License:** Licensed under the **GNU General Public License v3.0 (GPL-3.0)**. See the [LICENSE.txt](LICENSE.txt) file for details.

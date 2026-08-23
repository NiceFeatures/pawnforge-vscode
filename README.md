# AMXXPawn Language - Extended

<p align="center">
  <img src="images/extension-logo.png" alt="AMXXPawn Language Extended Logo" width="128">
  <h1 align="center">AMXXPawn Language - Extended</h1>
</p>

<p align="center">
  <strong>A modernized, high-performance, and feature-rich development environment for AMX Mod X Pawn scripting in Visual Studio Code.</strong>
</p>

<p align="center">
    <a href="https://marketplace.visualstudio.com/items?itemName=iceeedR.amxx-pawn-language-editor">
        <img alt="Visual Studio Marketplace Version" src="https://img.shields.io/visual-studio-marketplace/v/iceeedR.amxx-pawn-language-editor?style=for-the-badge&label=Marketplace">
    </a>
    <a href="https://marketplace.visualstudio.com/items?itemName=iceeedR.amxx-pawn-language-editor">
        <img alt="Visual Studio Marketplace Installs" src="https://img.shields.io/visual-studio-marketplace/i/iceeedR.amxx-pawn-language-editor?style=for-the-badge&color=blue">
    </a>
    <a href="https://open-vsx.org/extension/iceeedR/amxx-pawn-language-editor">
        <img alt="Open VSX Installs" src="https://img.shields.io/open-vsx/dt/iceeedR/amxx-pawn-language-editor?style=for-the-badge&color=blue">
    </a>
</p>

> [!IMPORTANT]
> **DISCLAIMER & FORK NOTICE:**
> This extension (**"AMXXPawn Language - Extended"**, publisher `iceeedR`) is an independently maintained, modernized **community fork** of the original [AMXXPawn Language](https://marketplace.visualstudio.com/items?itemName=KliPPy.amxxpawn-language) extension by KliPPy. It is not affiliated with or endorsed by the original author.
> 
> This fork was created to address long-standing bugs, add modern compiler compatibility (`amxx-nova-pc`), implement major performance and caching optimizations, and introduce modern LSP features for active AMX Mod X scripters.

---

## ⚡ What Makes This Fork Different? (Distinguishing Features)

| Feature / Area | Original Extension (`KliPPy`) | AMXXPawn Language - Extended (`iceeedR`) |
|---|---|---|
| **Modern Compiler Support** | Legacy `amxxpc` only (requires `Done.` output) | **Full `amxx-nova-pc` & Next-Gen Compiler support** with robust termination detection & flag handling (`-E`, `-d3`). |
| **Include Resolution** | Flat directory paths only | **Recursive Glob expansion (`**/*.inc`)** & OS environment variable support (`${env:AMXX_HOME}`, `${env:HLDS_DIR}`). |
| **Global Includes** | Workspace-only settings | **Shared Global Include Paths (`amxxpawn.compiler.globalIncludePaths`)** across all projects. |
| **Performance & Caching** | Re-traverses files synchronously on every keystroke | **530x faster Symbol Graph Cache**, bounded LRU include cache, and $O(1)$ indexed semantic token processing. |
| **Status & Feedback** | Output console tab only | **Real-Time Status Bar Indicator** showing build status and compilation duration (`$(check) AMXX: OK (0.04s)`). |
| **Security & Safety** | Vulnerable shell string concatenations | **Parameterized process invocation (`execFile`)** preventing command injection and crash bugs in `compileLocal`. |
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
3. Search for `AMXXPawn Language - Extended` or `iceeedR.amxx-pawn-language-editor`.
4. Click **Install**.
5. Reload or restart VS Code.

You can also install directly from the [VS Marketplace](https://marketplace.visualstudio.com/items?itemName=iceeedR.amxx-pawn-language-editor) or [Open VSX](https://open-vsx.org/extension/iceeedR/amxx-pawn-language-editor).

---

## ⚙️ Configuration

By default, the extension automatically provides zero-configuration compilation. You can customize paths, include directories, and behavior via VS Code Settings (`settings.json`):

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
| `F9` or ▶️ Button | `AMXXPawn: Compile Plugin` | Compiles the active `.sma` file using configured compiler settings. |
| Command Palette | `AMXXPawn: Compile Plugin Local` | Compiles using a local `amxxpc.exe` in the active file's folder. |
| Command Palette | `AMXXPawn: Create New Plugin (Scaffold)` | Generates a new AMXX plugin template with author, version, and ReAPI options. |
| `Ctrl+Click` / `F12` | **Go to Definition** | Jumps to symbol definition or callback. |
| `Shift+F12` | **Find All References** | Finds all references in document and includes. |
| `F2` | **Rename Symbol** | Renames symbol occurrences across file. |
| `Ctrl+T` | **Workspace Symbols** | Searches symbols globally across project files. |

---

## 🇧🇷 Resumo em Português

Esta extensão é uma versão modernizada e mantida pela comunidade scripter de AMX Mod X (GoldSrc / Counter-Strike 1.6). Ela traz suporte nativo a compiladores modernos como `amxx-nova-pc`, suporte a variáveis de ambiente e globs recursivos em includes, cache de símbolos ultrarrápido (530x mais ágil), barra de status com tempo de compilação e diversas correções de estabilidade e segurança em relação à extensão original.

---

## 🛠️ Contributing & Development

We welcome community contributions, bug reports, and suggestions!

1. Clone the repository: `git clone https://github.com/NiceFeatures/amxxpawn-language.git`
2. Install dependencies: `npm install`
3. Build the bundle: `npm run esbuild`
4. Run tests: `npm test`
5. Run benchmarks: `npm run benchmark`
6. Press `F5` in VS Code to launch the Extension Development Host.

---

## 🙏 Credits & Acknowledgments

* Special thanks to **KliPPy** for the original AMXXPawn Language extension and foundation.
* Maintained and developed by **iceeedR** & the **NiceFeatures** team for the AMX Mod X development community.

## 📄 License

This project is open source and licensed under the **GNU General Public License v3.0 (GPL-3.0)**. See the [LICENSE.txt](LICENSE.txt) file for details.

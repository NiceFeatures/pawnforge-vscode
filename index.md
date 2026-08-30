---
## layout: default

<div align="center">
  <img src="images/extension-logo.png" alt="AMXXPawn Language Extended Logo" width="150" />
</div>

<h1 align="center" style="border-bottom: none; margin-bottom: 0;">AMXXPawn Language - Extended</h1>

<p align="center">
  <a href="https://marketplace.visualstudio.com/items?itemName=iceeedR.amxx-pawn-language-editor">
    <img alt="Visual Studio Marketplace Version" src="https://img.shields.io/visual-studio-marketplace/v/iceeedR.amxx-pawn-language-editor?style=for-the-badge&color=2ea043">
  </a>
  <a href="https://marketplace.visualstudio.com/items?itemName=iceeedR.amxx-pawn-language-editor">
    <img alt="Visual Studio Marketplace Installs" src="https://img.shields.io/visual-studio-marketplace/i/iceeedR.amxx-pawn-language-editor?style=for-the-badge&color=blue">
  </a>
  <a href="https://open-vsx.org/extension/iceeedR/amxx-pawn-language-editor">
    <img alt="Open VSX Installs" src="https://img.shields.io/open-vsx/dt/iceeedR/amxx-pawn-language-editor?style=for-the-badge&color=blue">
  </a>
</p>

<div style="background-color: rgba(255, 165, 0, 0.1); border-left: 4px solid #ffa500; padding: 15px; margin: 20px 0; border-radius: 4px;">
  <strong style="color: #ff8c00;">⚠️ DISCLAIMER:</strong> This extension ("AMXXPawn Language - Extended") is a <strong>fork</strong> of the original <a href="https://marketplace.visualstudio.com/items?itemName=KliPPy.amxxpawn-language" style="color: #ff8c00;">AMXXPawn Language</a> extension by KliPPy. It is not affiliated with the original author. This fork includes specific enhancements for local workflows, improved compilation tasks, and targeted syntax additions.
</div>

---

<p align="center">
  <a href="/amxxpawn-language/">Página Inicial</a> | 
  <a href="/amxxpawn-language/CHANGELOG.html">Histórico de Mudanças</a>
</p>

This project revives and modernizes the development experience for **AMX Mod X** scripters. If you love creating plugins for Half-Life, Counter-Strike 1.6, and other GoldSrc mods but miss modern tools, this extension is for you.

It transforms VS Code into a powerful IDE for Pawn, bringing features that were previously exclusive to newer languages.

## ✨ What's New (v1.5.7)
### Fixed
- **Correção na Resolução de Diretórios de Include com Subpastas**: Corrigido o erro onde arquivos `.inc` localizados em subpastas de diretórios configurados (ex: `src/Helper/DataLoader.inc` com `#include <Helper/DataLoader>`) não eram encontrados pelo compilador.
- * **Include Directory Resolution Fix for Subdirectories**: Fixed an issue where `.inc` header files located in subdirectories of configured include paths (e.g. `src/Helper/DataLoader.inc` included via `#include <Helper/DataLoader>`) were not found by the compiler.*
- **Preservação de Includes Explícitos**: Diretórios de include configurados explicitamente em `amxxpawn.compiler.includePaths` e `globalIncludePaths` são sempre mantidos para compilação.
- * **Explicit Includes Preservation**: Explicit include directories configured in `amxxpawn.compiler.includePaths` and `globalIncludePaths` are always preserved for compilation.*
- **Busca Recursiva de Includes (`hasIncludeFiles`)**: Expansões com glob (`**` e `*`) agora realizam busca recursiva de cabeçalhos `.inc`, podando com segurança apenas diretórios sem nenhum arquivo include.
- * **Recursive Include Detection (`hasIncludeFiles`)**: Glob expansions (`**` & `*`) now recursively verify directories for `.inc` headers, safely pruning only folders without any includes.*
- **Autocompletion de Includes em Subpastas**: Autocomplete de `#include <...>` agora descobre e sugere arquivos `.inc` aninhados em subpastas (ex: `Helper/DataLoader`).
- * **Subdirectory Include Autocompletion**: Autocompletion for `#include <...>` now discovers and suggests nested headers (e.g. `Helper/DataLoader`).*

---

## ✨ What's New (v1.5.6)
### Added
- **Suporte a Variáveis de Ambiente (`${env:...}`)**: Use variáveis de ambiente do sistema operacional (ex: `${env:AMXX_HOME}`, `${env:USERPROFILE}`, `${env:HLDS_DIR}`) nos caminhos de includes e do compilador.
- * **Environment Variables Support (`${env:...}`)**: Use system environment variables (e.g. `${env:AMXX_HOME}`, `${env:USERPROFILE}`, `${env:HLDS_DIR}`) in include and compiler paths.*
- **Expansão Recursiva de Includes (`**` e `*`)**: Suporte a padrões glob como `${workspaceRoot}/include/**` para buscar automaticamente em todas as subpastas por arquivos `.inc`.
- * **Recursive Include Expansion (`**` & `*`)**: Support for glob patterns like `${workspaceRoot}/include/**` to automatically discover all subfolders containing `.inc` headers.*
- **Configuração de Includes Globais (`amxxpawn.compiler.globalIncludePaths`)**: Registre includes padrão no `settings.json` global do VS Code e compartilhe entre todos os seus projetos.
- * **Global Includes Setting (`amxxpawn.compiler.globalIncludePaths`)**: Register default include directories in global VS Code settings and share across all your projects.*
- **Document Highlight**: Ao selecionar ou posicionar o cursor em qualquer identificador, todas as suas ocorrências no documento atual são automaticamente destacadas.
- * **Document Highlight**: Highlighting an identifier automatically highlights all its occurrences across the active document.*
- **Folding Ranges**: Suporte nativo a recolhimento e expansão de blocos pre-processadores (`#if/#else/#endif`), comentários em bloco (`/* */`), `enum { }` e funções `{ }`.
- * **Folding Ranges**: Native code folding for preprocessor directives (`#if/#else/#endif`), block comments (`/* */`), `enum` blocks, and function braces.*
- **Workspace Symbols (`Ctrl+T`)**: Pesquisa global rápida de símbolos (funções, stocks, constantes, macros) em todos os arquivos e includes do projeto.
- * **Workspace Symbols (`Ctrl+T`)**: Global workspace symbol search across all open files and loaded `.inc` dependencies.*
- **Compatibilidade com o Compilador `amxx-nova-pc`**: Suporte nativo ao compilador moderno `amxx-nova-pc`, com detecção aprimorada de término de compilação, suporte a flags `-E`/`-d3` e estatísticas de memória.
- * **`amxx-nova-pc` Compiler Compatibility**: Native support for modern `amxx-nova-pc` compiler, featuring updated compilation termination detection, `-E`/`-d3` flags support, and memory statistics.*
- **Status Bar de Compilação**: Indicador visual de status e tempo de compilação em tempo real na barra inferior do VS Code com atalho de clique para compilar.
- * **Compilation Status Bar**: Real-time compilation status and elapsed time indicator in the VS Code status bar.*

### Performance & Optimization
- **Cache de Diretórios de Include**: Resolução de diretórios com glob (`**`) agora é cacheada em memória e reutilizada para todos os `#include`, eliminando varreduras síncronas redundantes no disco durante a digitação.
- * **Include Directory Caching**: Glob path resolution (`**`) is now cached in memory and reused across `#include` directives, eliminating redundant synchronous disk traversals.*
- **Cache de Símbolos (`getSymbols`)**: Símbolos e árvore de dependências agora são cacheados por documento, acelerando autocomplete, hover e navegação de definições (**530x mais rápido**).
- * **Symbol Graph Caching (`getSymbols`)**: Symbols and dependency graphs are now cached per document, speeding up autocomplete, hover, and definition lookups (**530x faster**).*
- **Semantic Tokens Otimizados ($O(1)$)**: Redução drástica da sobrecarga de CPU ao digitar através de mapeamento indexado de variáveis locais e verificação de coordenadas em tempo constante (~13ms para 1.700 tokens).
- * **Optimized Semantic Tokens ($O(1)$)**: Drastically reduced typing CPU overhead via indexed local variables mapping and constant-time coordinate checks (~13ms for 1,700 tokens).*
- **Find References em Memória**: Busca de referências reutiliza diretamente o cache em memória dos includes.
- * **In-Memory Find References**: Finding references now leverages in-memory include cache directly.*
- **Otimização do Pipeline de Compilação**: Cache de diretórios de include resolvidos no cliente, poda de diretórios sem arquivos `.inc` e cache do executável `amxxpc` para acelerar o acionamento do build no editor.
- * **Compilation Pipeline Optimization**: Client include directory caching, pruning of folders without `.inc` files, and compiler executable caching.*
- **Suíte de Benchmark e Histórico de Builds (`npm run benchmark`)**: Ferramenta automatizada de medição em ms que persiste o histórico de desempenho em [`benchmark-history.json`](file:///c:/Users/iceeedR/Desktop/amxxpawn-language/benchmark-history.json) e gera relatórios em [`BENCHMARKS.md`](file:///c:/Users/iceeedR/Desktop/amxxpawn-language/BENCHMARKS.md).
- * **Benchmark Suite & Build History (`npm run benchmark`)**: Automated millisecond benchmark tool persisting history in [`benchmark-history.json`](file:///c:/Users/iceeedR/Desktop/amxxpawn-language/benchmark-history.json) and generating comparison tables in [`BENCHMARKS.md`](file:///c:/Users/iceeedR/Desktop/amxxpawn-language/BENCHMARKS.md).*

### Fixed
- **Controle de Reparse (`reparseInterval`)**: Conexão da configuração ao debounce do servidor (padrão de 300ms).
- * **Reparse Interval Control**: Connected setting to server debounce with snappy 300ms default.*
- **Segurança e Testes**: Proteção contra timing attacks no hash e suite de testes automatizada `npm test`.
- * **Security & Testing**: Timing attack protection on hashes and automated `npm test` suite.*

---

## ✨ What's New (v1.5.5)
### Fixed & Security
- **Segurança de Processos e Prevenção de Crash**: Refatorada a invocação do compilador `amxxpc` e extração de arquivos para eliminar vulnerabilidades de shell e prevenir travamentos em `compileLocal`.
- * **Process Security & Crash Prevention**: Refactored `amxxpc` execution and file extraction to eliminate shell vulnerabilities and prevent `compileLocal` crashes.*

### Performance & Optimization
- **Gerenciamento de Memória (RAM)**: Implementado limite LRU para cache de arquivos `.inc` e reaproveitamento estático de `RegExp` em utilitários de texto para reduzir a pressão de Garbage Collection no Language Server.
- * **Memory Management (RAM)**: Added LRU bounds for `.inc` file caching and static `RegExp` hoisting in string utilities to reduce Garbage Collection overhead.*

---

## ✨ What's New (v1.5.4)
### Fixed
- **Intellisense em Variáveis de Loop**: Corrigida a detecção e realce semântico de variáveis declaradas dentro de loops (como `for (new i = 0; ...)`), garantindo auto-complete e "Go to Definition" corretos no corpo das funções.
- * **Loop Variable Intellisense**: Fixed detection and semantic highlighting for variables declared inside loops (such as `for (new i = 0; ...)`), ensuring correct autocomplete and "Go to Definition" within function bodies.*

---

## ✨ What's New (v1.5.3)
### Fixed
- **Nested Signature Help inside Macros**: Corrigido o bug em que o Signature Help exibia a definição de macros `#define` de forma desnecessária ao invés de manter o foco na função externa que envelopa a expressão (comportamento similar ao clangd).
- *Fixed Signature Help "hijacking" by `#define` macro calls inside function arguments, allowing the tooltip to fall through and keep showing the outer enclosing function signature help (similar to clangd).*

---

## ✨ What's New (v1.5.1)
### Fixed
- **Includes Inside Preprocessor Blocks**: Diretivas `#include` indentadas agora são corretamente reconhecidas.
- **Find All References**: Corrigido o bug onde `Shift+F12` exibia definições em duplicidade.
- **Find All References dentro de Strings (Callbacks)**: Chamadas de funções e callbacks escritas em forma de string (ex: `set_task(4.0, "@ClearResults")`) agora são perfeitamente reconhecidas e listadas no "Find All References", respeitando o comportamento típico do Pawn. Também foi adicionado o suporte adequado para funções prefixadas com `@`.
- *Fixed parsing of indented `#include` directives, corrected "Find All References" duplicate definition results, and added proper search capability for isolated identifiers (like callbacks) inside strings and special prefixed symbols (@).*

---

## ✨ What's New (v1.5.0)
### Added
- **Linux Support**: Adicionado suporte para sistemas Linux.
- *Added support for Linux systems.*
- **Official Compiler Download URL**: Alterada a URL de download automático do compilador para a URL oficial de releases do AmxModX no GitHub.
- *Switch to official AmxModX github release URL for auto compiler download.*

---

## ✨ What's New (v1.4.0)
### Added
- **Local Variable Hover & Definition**: Agora o "Go to Definition" (Ctrl+Click) e o Hover funcionam para variáveis locais e parâmetros dentro do corpo das funções.
- *Support for "Go to Definition" and Hover tooltips for local variables and parameters inside function bodies.*

### Fixed
- **Block Comment Parsing**: Corrigido um bug crítico onde chaves `{}` dentro de comentários em bloco `/* */` quebravam o rastreamento de escopo do parser.
- **Robust Comment Stripping**: O parser agora remove corretamente comentários em bloco de linha única e lida melhor com caracteres escapados.
- **Go to Definition URI Parity**: Corrigido o bug onde o "Go to Definition" poderia falhar em arquivos diferentes na mesma linha.
- **Highlighting Priority (new const)**: Resolvido o conflito de classificação de variáveis `new const` no realce semântico.
- *Fixed block comment brace tracking, improved comment stripping, and resolved symbol resolution line-collisions.*

---

## ✨ What's New (v1.3.2)
### Fixed
- **Single-character Identifiers**: O parser agora identifica corretamente funções e variáveis com apenas uma letra (ex: `new n;`, `public p(){}`).
- **Compound Variable Modifiers**: Corrigido o erro onde variáveis com múltiplos modificadores (ex: `new const TEST_ARR`) não eram corretamente reconhecidas.
- *Fixed the parser to correctly identify single-character names and variables with compound modifiers like `new const`.*

---


## ✨ What's New (v1.3.1)
### Fixed
- **Multi-line Variable Parsing**: Corrigido o parser para identificar corretamente variáveis declaradas em múltiplas linhas (ex: `new a, \n b, \n c;`) ou quando os modificadores estão em uma linha e os identificadores em outra (ex: `public stock const \n PluginName[]`).
- **String-aware Parsing (URL Fix)**: O parser agora ignora `//` dentro de aspas, evitando que URLs (como `https://...`) quebrem o reconhecimento da declaração ou causem realces semânticos incorretos (ex: destacar `https` como um tipo).
- **Semicolon Support**: Melhorado o reconhecimento de variáveis que terminam com `;` em declarações multi-linha.
- *Fixed the parser to correctly identify variables declared across multiple lines, strings with URLs, and semicolon endings.*

---

## ✨ What's New (v1.3.0)
### Added
- **Dynamic Include Autocomplete**: Scans configured directories for `#include` suggestions.
- **Semantic Usage Highlighting**: Colors variables and macros throughout function bodies.
- **Tag Type Highlighting**: Realce de cor para tags como `Float:`, `bool:`, `Trie:`, etc., em qualquer lugar do código.
### Fixed
- **Real-time Semantic Refresh**: Cores atualizam instantaneamente enquanto você digita.
- **Macro Coloring**: `#define` macros agora têm cores distintas de variáveis.

---

## ✨ What's New (v1.2.9)
### Added
- **Local Variable Autocomplete**: Variáveis locais e parâmetros agora aparecem no autocomplete dentro do escopo da função.
- *Local variables and parameters now appear in autocomplete within function scope.*
- **Preprocessor Directive Autocomplete**: Suporte para completar diretivas ao digitar `#`.
- *Added support for completing directives when typing `#`.*
### Fixed
- **Semantic Coloring**: Parâmetros de funções e variáveis locais agora recebem realce de cores corretamente via Semantic Tokens.
- *Function parameters and local variables now receive correct color highlighting via Semantic Tokens.*

---

## ✨ What's New (v1.2.8)
### Fixed
- **Parser Multi-line Arguments**: Funções com argumentos em múltiplas linhas agora são corretamente identificadas, restaurando "Go to Definition" e syntax highlighting semântico.
- * **Parser Multi-line Arguments**: Functions with arguments across multiple lines are now correctly identified, restoring "Go to Definition" and semantic syntax highlighting.*
- **TypeScript moduleResolution**: Corrigido `moduleResolution` no `tsconfig.json` de `"node"` para `"bundler"`, eliminando aviso de depreciação do TypeScript.
- * **TypeScript moduleResolution**: Fixed `moduleResolution` in `tsconfig.json` from `"node"` to `"bundler"`, eliminating TypeScript deprecation warning.*

---

## ✨ What's New (v1.2.7)
### Added
- **Configuração de Erros Inline**: Adicionada a opção `amxxpawn.compiler.inlineErrors` para ativar mensagens de erro nativas inline.
- * **Inline Errors Configuration**: Added the `amxxpawn.compiler.inlineErrors` setting to enable native inline error messages.*

---

## ✨ What's New (v1.2.6)
### Added
- **AMXXPawn: Create New Plugin (Scaffold)**: Adicionado um gerador de plugins, acessível pela Command Palette.
- * **AMXXPawn: Create New Plugin (Scaffold)**: Added a plugin generator, accessible via Command Palette.*
- **Templates Nativos**: O Scaffold oferece templates (Basic, Menu, Cvar/Command, Event Observer) com inclusão opcional do `#include <reapi>`.
- * **Native Templates**: The Scaffold offers templates (Basic, Menu, Cvar/Command, Event Observer) with optional `#include <reapi>`.*
- **Workflow Automático**: O scaffold fará o download da compilação se a pasta do compilador não for encontrada e gera o arquivo sem salvar para testes imediatos.
- * **Automatic Workflow**: The scaffold will download the compiler if the folder is not found and generates an unsaved file for immediate usage.*

---

## ✨ What's New (v1.2.5)
### Added
- **Auto-Download do Compilador**: Quando nenhum compilador está configurado, a extensão baixa automaticamente o `compiler.zip` do repositório GitHub — zero configuração.
- * **Auto-Download Compiler**: When no compiler is configured, the extension automatically downloads `compiler.zip` from the GitHub repository — zero configuration.*
- **Find All References**: `Shift+F12` em qualquer símbolo exibe todas as ocorrências no documento atual e nos includes carregados.
- * **Find All References**: `Shift+F12` on any symbol shows all occurrences in the current document and loaded includes.*
- **Rename Symbol**: `F2` em qualquer símbolo renomeia todas as ocorrências no documento atual. Keywords reservadas do Pawn são protegidas.
- * **Rename Symbol**: `F2` on any symbol renames all occurrences in the current document. Reserved Pawn keywords are protected.*
- **Inline Error Display**: Erros de compilação agora são exibidos diretamente na linha do código como texto inline, além do sublinhado vermelho.
- * **Inline Error Display**: Compilation errors are now displayed directly on the code line as inline text, alongside the traditional red underline.*
- **Botão de Compilação no Editor**: Ícone `▶️` nativo na barra de título do editor para compilar com um clique.
- * **Editor Compile Button**: Native `▶️` icon in the editor title bar to compile with a single click.*

---

## ✨ What's New (v1.2.4)
### Added
- **Identidade Visual**: Atualização do Logo e branding da extensão.
- * **Visual Identity**: Extension logo and branding update.*
- **Performance de Carregamento**: Integrado o poderoso compilador `esbuild` no core da extensão. Reduzimos a quantidade de fragmentos carregados de 276 para apenas 14 arquivos finais otimizados (`dist/`). O tempo de ativação do seu Language Server e inicialização do VSCode agora é quase instantâneo, batendo recordes de velocidade.
- * **Loading Performance**: Integrated the powerful `esbuild` bundler into the extension's core. We reduced the amount of loaded fragments from 276 strictly to 14 optimized final files (`dist/`). Start up and Language Server activation time is now nearly instantaneous, hitting record speeds.*

---

## ✨ What's New (v1.2.2)
### Fixed
- Realce semântico para `#include`: diretiva e nome do arquivo agora têm cores distintas.
- *`#include` highlighting: directive and filename now have distinct colors.*
- Enums com `{` na mesma linha não quebram mais o realce do código abaixo.
- *Enums with `{` on the same line no longer break highlighting of code below.*
- Membros de enum com tags (`bool:Member`, `Float:Value`) agora são reconhecidos corretamente.
- *Tagged enum members (`bool:Member`, `Float:Value`) are now properly recognized.*
- Múltiplas variáveis na mesma linha (`new a, b, c`) agora recebem realce individualmente.
- *Multiple variables on the same line (`new a, b, c`) are now highlighted individually.*

---

## ✨ What's New (v1.2.1)
### Added
- Suporte a **Inglês** e **Português (PT-BR)**. Mensagens, configurações e saída do compilador seguem o idioma do VS Code.
- *Added **English** and **Portuguese (PT-BR)** support. Messages, settings, and compiler output follow the VS Code language.*
- **Semantic Tokens**: funções, macros, variáveis, constantes e enums são destacados com cores distintas no editor.
- *Functions, macros, variables, constants, and enums are now highlighted with distinct colors in the editor.*

---

## ✨ What's New (v1.2.0)
### Added
- Adicionado suporte a `enum`: valores de enums agora aparecem no Autocomplete e no `Ctrl+Click` (Ir para Definição).
- *Added `enum` support: enum values now appear in Autocomplete and `Ctrl+Click` (Go to Definition).*
- Adicionados 36 snippets prontos para uso, como `plugin`, `forplayers`, `menu_create`, `sql_threadquery`, entre outros.
- *Added 36 ready-to-use snippets such as `plugin`, `forplayers`, `menu_create`, `sql_threadquery`, and more.*
### Fixed
- Melhorias significativas de performance: cache de includes, debounce de 300ms no re-parse, e monitoramento apenas de arquivos `.sma` e `.inc`.
- *Significant performance improvements: include caching, 300ms re-parse debounce, and monitoring only `.sma` and `.inc` files.*
- Corrigido bug onde strings contendo `{` ou `}` quebravam o parser (ex: `"{gold}Olá"`).
- *Fixed a bug where strings containing `{` or `}` broke the parser (e.g., `"{gold}Hello"`).*
- Corrigido vazamento de memória com arquivos `.inc` que não eram mais utilizados.
- *Fixed memory leak with `.inc` files that were no longer in use.*

---

## ✨ What's New (v1.1.9)
### Fixed
- Corrigido o Autocomplete que exibia sugestões irrelevantes (busca "fuzzy") ao digitar parâmetros de funções. A lógica foi alterada para uma busca exata ("começa com"), resultando em sugestões mais limpas e precisas.
- *Fixed Autocomplete displaying irrelevant suggestions (fuzzy search) when typing function parameters. The logic was changed to a strict "starts with" search, resulting in cleaner and more accurate suggestions.*

---

## ✨ What's New (v1.1.8)

### Fixed
- Corrigido um bug crítico onde o `Ctrl+Click` (`Ir para Definição`) não funcionava em funções que utilizavam uma tag (ex: `bool:IsVip(id)`).
- *Fixed a critical bug where `Ctrl+Click` (Go to Definition) did not work on functions using a tag (e.g., `bool:IsVip(id)`).*
### Added
- A funcionalidade de *hover* agora exibe a documentação completa da função (comentários `/** ... */`) em vez de apenas a sua assinatura.
- *Hover feature now displays the full function documentation (`/** ... */` comments) instead of just its signature.*

---

## ✨ What's New (v1.1.7)

- **Visual Bug Fix:** The extension will no longer incorrectly underline `#include` directives that contain spaces (e.g., `#include < fun >`).

---

## ✨ Key Features (Extended Version)

Unlike the original extension, this **Extended** version provides tailored optimizations focused on local custom workflows, alongside a complete **Language Server** toolset:

- **🟢 Advanced IntelliSense:** Crisp autocomplete for functions, constants, and variables.
- **🎯 Smart Code Navigation:** Press `Ctrl+Click` to instantly jump to the definition of:
  - Functions (including `public`, `stock`, `native`, and those with an `@` prefix).
  - Constants defined with `#define`.
  - Global variables.
  - **Functions in Tasks:** Navigate directly to the function when its name is passed as a string (e.g., `set_task_ex(..., "my_function", ...)`).
- **🔍 Find All References:** `Shift+F12` on any symbol to find all its occurrences across the current document and loaded includes.
- **✏️ Rename Symbol:** `F2` to rename any variable, function, or constant across the entire document — with keyword protection.
- **🔦 Document Highlight:** Automatically highlight all occurrences of the variable, function, or constant under the cursor.
- **🗂️ Folding Ranges:** Native code folding support for preprocessor directives (`#if/#else/#endif`), block comments (`/* */`), `enum { }`, and function bodies (`{ }`).
- **🌐 Workspace Symbols (`Ctrl+T`):** Search and jump across all functions, stocks, constants, and macros in the workspace and loaded include dependencies.
- **💡 Hover Information:** Hover over a function or variable to seamlessly read its full definition and documentation without leaving your current context.
- **⚡ Real-time Diagnostics:** The extension boldly warns you if an `#include` cannot be found or resolving fails, helping you fix errors long before compiling.
- **🔴 Inline Error Display:** Compilation errors appear directly on the code line as inline text, next to the red underline.
- **📊 Compilation Status Bar:** Real-time visual indicator in the VS Code status bar showing compilation result and elapsed time (`$(check) AMXX: OK (0.04s)`) with one-click compile action.
- **📥 Auto-Download Compiler:** No compiler configured? The extension automatically downloads and sets up the AMXX compiler from GitHub.
- **🏗️ Plugin Scaffold:** Create fully equipped plugins instantly (Menus, Cvars, Event Observers) using the `AMXXPawn: Create New Plugin (Scaffold)` command.
- **🛠️ Integrated & Custom Compilation:** Compile your plugins instantly from VS Code using unified tasks setup or custom local environment pathways.

## 🚀 Installation

1. Install [Visual Studio Code](https://code.visualstudio.com/).
2. Open the **Extensions** tab (`Ctrl+Shift+X`).
3. Search for `AMXXPawn Language Service`.
4. Click **Install**.
5. Reload VS Code and enjoy!

You can also install it directly from the [Marketplace page](https://marketplace.visualstudio.com/items?itemName=iceeedR.amxx-pawn-language-editor).

## ⚙️ Configuration (Optional Customization)

By default, the extension **automatically downloads and sets up the AMXX compiler for you (Zero Configuration!)**. However, if you want to use a specific, custom compiler version, custom include directories, or environment variables, you can configure them easily.

1. Open VS Code Settings (`Ctrl + ,`).
2. Click the "Open settings.json" icon in the upper-right corner.
3. Add the following properties to your `settings.json`:

```json
{
    // Path to the amxxpc compiler executable.
    // (Leave empty or undefined to use the auto-downloaded compiler)
    "amxxpawn.compiler.executablePath": "C:\\path\\to\\your\\compiler\\amxxpc.exe",

    // Global list of include folders shared across all your projects (User Settings).
    // Supports environment variables (${env:VAR}) and recursive globs (/**).
    "amxxpawn.compiler.globalIncludePaths": [
        "${env:AMXX_HOME}\\scripting\\include\\**"
    ],

    // Project/workspace-specific list of folders where the extension looks for .inc files.
    // Supports ${workspaceRoot}, environment variables (${env:VAR}), and globs (/**).
    "amxxpawn.compiler.includePaths": [
        "${workspaceRoot}\\include\\**"
    ],

    // Enables or disables inline text errors in the editor (false by default).
    // Keep it false if you use extensions like Error Lens to avoid duplicate messages.
    "amxxpawn.compiler.inlineErrors": false,

    // Debounce interval in milliseconds to reprocess symbols while typing (default: 300ms).
    "amxxpawn.language.reparseInterval": 300,

    // --- RECOMMENDED SETTING ---
    // For a cleaner and smarter autocomplete experience,
    // disable generic suggestions based on words in the file.
    "editor.wordBasedSuggestions": "off"
}
```

**Variables & Globbing Supported in Paths:**
- `${workspaceRoot}` — Workspace root folder.
- `${fileDirname}` — Directory of the current open file.
- `${env:VAR_NAME}` — Any system environment variable (e.g. `${env:HLDS_DIR}`, `${env:USERPROFILE}`).
- `**` / `*` — Recursive globbing. Using `include/**` automatically includes all nested folders.

**Practical Examples:**

```json
{
    // Example 1: Using environment variables and recursive includes
    "amxxpawn.compiler.executablePath": "${env:HLDS_PATH}/cstrike/addons/amxmodx/scripting/amxxpc.exe",
    "amxxpawn.compiler.globalIncludePaths": [
        "${env:HLDS_PATH}/cstrike/addons/amxmodx/scripting/include/**"
    ],
    "amxxpawn.compiler.includePaths": [
        "${workspaceRoot}/scripting/include/**"
    ]
}
```

## ⌨️ Available Commands

Open the Command Palette (`Ctrl+Shift+P`) and type `AMXXPawn` to see the available commands:

- **AMXXPawn: Compile Plugin** — Compiles the currently open `.sma` file using the `executablePath` defined in your settings.
- **AMXXPawn: Compile Plugin Local** — Searches for and uses an `amxxpc.exe` located in the same folder as the `.sma` file you are editing.

### Keyboard Shortcuts

| Shortcut | Action | Description |
|----------|--------|-------------|
| `Ctrl+Click` | **Go to Definition** | Jump to the definition of the symbol under the cursor |
| `Shift+F12` | **Find All References** | Find all occurrences of the symbol in the current document and includes |
| `F2` | **Rename Symbol** | Rename all occurrences of a variable, function, or constant in the document |
| `▶️ button` | **Compile Plugin** | Click the play button in the editor title bar to compile |

## 🛠️ For Developers and Contributors

This project is a modernization of a legacy codebase, now using TypeScript and the latest `vscode-languageclient` APIs. Contributions are very welcome!

**To compile and test locally:**

1. Clone the repository:  
   `git clone https://github.com/NiceFeatures/amxxpawn-language.git`
2. Install dependencies:  
   `npm install`
3. Compile the project (bundle with esbuild):  
   `npm run esbuild`
4. Open the project in VS Code and press `F5` to start a debugging session.

## 🙏 Acknowledgements

This project is a continuation and modernization of the incredible work originally done by **KliPPy**. All credit for the solid foundation and the original idea goes to him.

## 📄 License

This project is licensed under the **GPL-3.0**. See the `LICENSE` file for more details.

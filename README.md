# PawnForge: AMX Mod X Studio

<p align="center">
  <img src="images/extension-logo.png" alt="PawnForge Logo" width="128">
  <h1 align="center">PawnForge: AMX Mod X Studio</h1>
</p>

<p align="center">
  <strong>A modernized, enterprise-grade development suite, language server (LSP), and compiler toolchain for AMX Mod X Pawn scripting in Visual Studio Code.</strong>
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
    <img alt="License" src="https://img.shields.io/badge/License-GPL--3.0-blue?style=for-the-badge">
    <img alt="AMXX Compatibility" src="https://img.shields.io/badge/AMXX-1.8.2%20|%201.9%20|%201.10%20|%20ReAPI-orange?style=for-the-badge">
</p>

---

## ⚡ Por Que o PawnForge Domina o Mercado? (Why PawnForge?)

Enquanto outras extensões de AMXX Pawn para VS Code permanecem abandonadas ou presas a scripts lentos de 2017, o **PawnForge** foi completamente reestruturado, auditado e otimizado com engenharia de ponta. Ele transforma o VS Code em uma IDE moderna, eliminando gargalos de CPU, falhas de travamento e limitações arcaicas do ecossistema AMX Mod X.

### 🥊 Comparativo Definitivo: PawnForge vs Ferramentas Rivais

| Recurso / Capacidade | AMXX Studio / Extensões Legadas | PawnForge Studio (v1.5.8+) |
|---|---|---|
| **Compiladores Suportados** | Apenas `amxxpc` antigo (exige saída textual `Done.`) | **Suporte Total a Compiladores Modernos:** `amxx-nova-pc` e `amxxpc` clássico com detecção robusta de saída e flags avançadas (`-E`, `-d3`, `-O2`). |
| **Resolução de Includes** | Apenas pastas planas e diretórios fixos | **Globs Recursivos (`**/*.inc`)**, suporte a subpastas aninhadas e variáveis de sistema/ambiente. |
| **Variáveis de Caminho** | Apenas caminhos absolutos engessados | **Variáveis Dinâmicas Completas:** `${workspaceFolder}`, `${fileBasename}`, `${fileDirname}`, `${env:VAR}`, etc. |
| **Includes Globais** | Inexistente (obriga copiar pastas em todo projeto) | **Shared Global Includes (`amxxpawn.compiler.globalIncludePaths`)** compartilhados entre múltiplos repositórios. |
| **Performance de Símbolos** | Varreduras lineares $O(N)$ repetidas a cada tecla | **Indexação Hash Map $O(1)$ (530x mais rápida)** com tabelas para callables, values e constants. |
| **Captura de Erros Fatais** | Erros de `#include` ignorados na aba *Problems* | **Captura Integral de Erros Fatais (`fatal error 100`)**, warnings e erros com linha/coluna exatas. |
| **Consumo de Memória (Heap)** | Símbolos duplicados a cada header incluído | **Deduplicação Inteligente de Símbolos:** 26% menor uso de Heap RAM e zero vazamento de cache. |
| **Segurança e Estabilidade** | Concatenação vulnerável de comandos no shell | **Execução Segura sem Shell (`CP.spawn`), Watchdog de 30s** contra loops infinitos e debounce anti-concorrência. |
| **Proteção contra ReDoS** | Expressões regulares lentas que travam a IDE | **Sanitização Linear de Regexes:** Proteção absoluta contra travamentos por backtracking catastrófico. |
| **Navegação em Callbacks** | Não reconhece funções chamadas por string | **Smart Jump em `set_task`:** Pressione `F12` em strings de callback para ir direto à função de destino. |
| **Folding e Workspace** | Escopos limitados a chaves simples | **Code Folding Nativo** (`#if/#else/#endif`, `enum`, `/* */`) e **Workspace Symbols (`Ctrl+T`)**. |
| **Status em Tempo Real** | Apenas logs brutos no terminal | **Widget na Barra de Status** com duração em segundos e status visual (`$(check) AMXX: OK (0.04s)`). |

---

## 📊 Benchmarks Reais de Performance

O PawnForge possui uma suíte automatizada de medição contínua executada a cada build (`npm run benchmark`). Os resultados comprovam nossa superioridade técnica:

| Métrica Avaliada | Extensão Legada | PawnForge Studio | Ganho Real |
|---|:---:|:---:|:---:|
| **Consulta de Símbolos (`getSymbols` - 100k calls)** | 1.558,07 ms | **2,77 ms** | **~560x Mais Rápido ($O(1)$)** |
| **Reparse de Documento (~1.500 linhas)** | 38,50 ms | **4,77 ms** | **8x Mais Rápido** |
| **Coloração Semântica (1.700 tokens)** | 82,40 ms | **11,27 ms** | **7x Mais Rápido** |
| **Uso de Memória RAM (Heap)** | 47,44 MB | **35,10 MB** | **-26% de Heap Reduzido** |
| **Varredura de Diretórios com Includes** | $O(N^2)$ I/O em disco | **$O(N)$ com Memoização** | **Zero congelamentos de editor** |

---

## ✨ Funcionalidades Principais (Feature Showcase)

### 🟢 IntelliSense & Autocompletion de Próxima Geração
* **Autocompletar Contextual:** Sugestões instantâneas para funções nativas, stocks, variáveis globais, locais, constantes (`#define`) e membros de `enum`.
* **Autocomplete de Includes em Subpastas:** Ao digitar `#include <`, subdiretórios aninhados (ex: `<reapi>`, `<zombieplague/zp50_core>`) são exibidos automaticamente com cache em memória de alta velocidade.
* **Documentação Inline (PawnDoc):** Veja a descrição da documentação, parâmetros e retornos diretamente no menu de autocompletar.

### 🎯 Navegação Inteligente (`Go to Definition` - `F12`)
* Salte instantaneamente para a definição de qualquer identificador (`Ctrl+Click` ou `F12`):
  * Funções públicas, stocks e natives (incluindo callbacks com prefixo `@`).
  * Constantes e macros (`#define`).
  * Variáveis globais e locais, incluindo variáveis declaradas no cabeçalho de loops: `for (new i = 0; ...)`.
  * **Callbacks em String (`set_task`):** Salte diretamente para a função alvo quando o cursor estiver em `set_task(1.0, "MeuCallback")`.

### 🔍 Find All References (`Shift+F12`) & Rename Symbol (`F2`)
* **Localização Global de Referências:** Encontre todas as ocorrências de um símbolo no script e em todos os arquivos `.inc` carregados na árvore de dependências.
* **Renomeação Segura (`F2`):** Renomeie variáveis, constantes ou funções com proteção automática contra palavras reservadas do Pawn.

### 🗂️ Native Code Folding & Símbolos no Workspace
* **Dobramento de Código Inteligente:** Colapse blocos `#if`, `#elseif`, `#else`, `#endif`, comentários em bloco `/* ... */`, declarações de `enum { ... }` e corpos de funções.
* **Workspace Symbols (`Ctrl+T`):** Digite o nome de qualquer função ou constante para localizá-la imediatamente em qualquer arquivo do seu servidor ou projeto.

### 💡 Hover Tooltips Enriquecidos
* Posicione o cursor sobre qualquer função ou constante para visualizar:
  * Assinatura completa de código em sintaxe Pawn destacada.
  * Comentários documentais PawnDoc formatados em Markdown limpo.
  * Valor resolvido de macros `#define` e itens de `enum`.

### ⚡ Diagnósticos em Tempo Real & Marcadores Inline
* **Checagem Imediata de Includes:** Diagnósticos visuais sublinhados em vermelho caso um `#include` não seja localizado no sistema.
* **Captura de Erros Fatais do Compilador:** Suporte total a mensagens de erro fatal (`fatal error 100: cannot read from file`).
* **Erros Inline Opcionais (`inlineErrors`):** Exibe a mensagem de erro diretamente no final da linha correspondente no editor, acelerando a correção de bugs sem precisar abrir abas adicionais.

### 📊 Barra de Status & Compilação com 1 Clique
* **Widget na Barra Inferior:** Exibe o status da última compilação e a duração exata (`$(check) AMXX: OK (0.04s)` ou `$(error) AMXX: Failed`).
* **Compilação Instantânea:** Clique no widget na barra de status, pressione `F9` ou use o botão ▶️ no topo do editor para compilar.

### 📥 Auto-Downloader de Compilador Zero-Config
* Se você não possui o compilador configurado, o PawnForge oferece download automático com 1 clique do pacote oficial AMX Mod X:
  * Verificação criptográfica de integridade via **SHA-256**.
  * Configuração automática de permissão de execução (`chmod 0o755`) em distribuições Linux.
  * Pronto para uso imediato sem intervenção manual.

---

## 🗂️ Guia Completo de Variáveis de Caminho (Path & Root Variables)

O PawnForge oferece um mecanismo poderoso de expansão de variáveis e caracteres curinga (*wildcards*) em todas as opções de configuração (`executablePath`, `includePaths`, `globalIncludePaths`, `outputPath`).

| Variável | Descrição | Exemplo de Saída |
|---|---|---|
| `${workspaceFolder}` | Caminho absoluto da pasta raiz aberta no workspace do VS Code. | `C:\MeusProjetos\ZombieServer` |
| `${workspaceRoot}` | Alias retrocompatível para `${workspaceFolder}`. | `C:\MeusProjetos\ZombieServer` |
| `${workspaceFolderBasename}` | Nome apenas da pasta do workspace (sem barras). | `ZombieServer` |
| `${workspaceRootFolderName}` | Alias retrocompatível para `${workspaceFolderBasename}`. | `ZombieServer` |
| `${file}` | Caminho absoluto completo do arquivo `.sma` ou `.inc` ativo. | `C:\MeusProjetos\ZombieServer\scripting\zp_addon.sma` |
| `${relativeFile}` | Caminho do arquivo ativo relativo à raiz do workspace. | `scripting\zp_addon.sma` |
| `${fileBasename}` | Nome do arquivo ativo com extensão. | `zp_addon.sma` |
| `${fileBasenameNoExtension}` | Nome do arquivo ativo sem extensão (ideal para saída de compilação). | `zp_addon` |
| `${fileDirname}` | Diretório onde o arquivo ativo está localizado. | `C:\MeusProjetos\ZombieServer\scripting` |
| `${fileExtname}` | Extensão do arquivo ativo. | `.sma` ou `.inc` |
| `${env:NOME_VARIAVEL}` | Lê qualquer variável de ambiente do sistema operacional (Windows/Linux/macOS). | `${env:HLDS_DIR}` $\to$ `D:\HLServer` |
| `**` *(Glob Recursivo)* | Varre todas as subpastas em qualquer profundidade em busca de arquivos `.inc`. | `${workspaceFolder}\include\**` |
| `*` *(Glob Simples)* | Varre apenas o primeiro nível de subpastas. | `${workspaceFolder}\addons\*` |

---

## ⚙️ Configuração Recomendada (`settings.json`)

Você pode configurar o PawnForge globalmente ou por projeto criando o arquivo `.vscode/settings.json`:

```jsonc
{
    // Caminho para o compilador (amxxpc clássico ou amxx-nova-pc)
    "amxxpawn.compiler.executablePath": "${workspaceFolder}/scripting/amxxpc.exe",

    // Pastas de includes globais compartilhadas (suporta variáveis de ambiente e globs)
    "amxxpawn.compiler.globalIncludePaths": [
        "${env:HLDS_DIR}/cstrike/addons/amxmodx/scripting/include/**",
        "${env:USERPROFILE}/Documents/AMXX_Shared_Includes/**"
    ],

    // Pastas de includes específicas deste projeto
    "amxxpawn.compiler.includePaths": [
        "${workspaceFolder}/include/**",
        "${workspaceFolder}/scripting/include/**"
    ],

    // Argumentos adicionais para o compilador
    "amxxpawn.compiler.options": [
        "-d3" // Nível de depuração máximo com símbolos
    ],

    // Onde salvar o binário compilado (.amxx): "source" (mesma pasta do .sma) ou "path" (pasta customizada)
    "amxxpawn.compiler.outputType": "path",
    "amxxpawn.compiler.outputPath": "${workspaceFolder}/plugins",

    // Exibir erros inline diretamente ao final da linha de código (true/false)
    "amxxpawn.compiler.inlineErrors": true,

    // Exibir mensagens popup informativas de sucesso/falha
    "amxxpawn.compiler.showInfoMessages": false,

    // Alternar automaticamente o foco para o console de saída ao compilar
    "amxxpawn.compiler.switchToOutput": true,

    // Formatar e colorir a saída do compilador para facilitar a leitura
    "amxxpawn.compiler.reformatOutput": true,

    // Intervalo de debounce (ms) para reparse de símbolos durante a digitação
    "amxxpawn.language.reparseInterval": 300,

    // Habilitar links para documentação Web nas tooltips de hover
    "amxxpawn.language.webApiLinks": false,

    // Dica para VS Code: desative sugestões genéricas baseadas em palavras para ter autocompletar 100% limpo
    "editor.wordBasedSuggestions": "off"
}
```

### 📋 Tabela Completa de Opções

| Chave de Configuração | Tipo | Padrão | Descrição |
|---|:---:|:---:|---|
| `amxxpawn.compiler.executablePath` | `string` | `""` | Caminho do executável do compilador (`amxxpc` ou `amxx-nova-pc`). Suporta `${workspaceFolder}`, `${fileDirname}`, etc. |
| `amxxpawn.compiler.globalIncludePaths` | `string[]` | `[]` | Lista de pastas de include globais compartilhadas em qualquer workspace. |
| `amxxpawn.compiler.includePaths` | `string[]` | `[]` | Lista de pastas de include locais do workspace. Suporta padrões glob `**`. |
| `amxxpawn.compiler.options` | `string[]` | `[]` | Flags adicionais passadas ao compilador (ex: `["-E", "-d3", "-O2"]`). |
| `amxxpawn.compiler.outputType` | `string` | `"source"` | Destino do `.amxx`: `"source"` (mesmo diretório do `.sma`) ou `"path"` (diretório customizado). |
| `amxxpawn.compiler.outputPath` | `string` | `""` | Caminho do diretório de saída quando `outputType` for definido como `"path"`. |
| `amxxpawn.compiler.inlineErrors` | `boolean` | `false` | Se ativo, renderiza as mensagens de erro diretamente no final da linha no editor. |
| `amxxpawn.compiler.showInfoMessages`| `boolean` | `false` | Exibe popups no canto inferior direito a cada compilação realizada. |
| `amxxpawn.compiler.switchToOutput` | `boolean` | `true` | Alterna a aba do editor para o console de saída automaticamente ao compilar. |
| `amxxpawn.compiler.reformatOutput` | `boolean` | `true` | Limpa e destaca avisos e erros da saída do compilador. |
| `amxxpawn.language.reparseInterval` | `number` | `300` | Tempo de espera (em milissegundos) após digitação para atualizar a árvore de símbolos. |
| `amxxpawn.language.webApiLinks` | `boolean` | `false` | Exibe links clicáveis para documentação web nas dicas de ajuda (hover). |

---

## ⌨️ Comandos & Atalhos de Teclado (Cheat Sheet)

| Atalho / Acionamento | Identificador do Comando | Descrição da Ação |
|---|---|---|
| <kbd>F9</kbd> ou Botão ▶️ *(Editor Title)* | `amxxpawn.compile` | **PawnForge: Compile Plugin** — Compila o plugin `.sma` ativo usando as opções configuradas. |
| Paleta de Comandos (`Ctrl+Shift+P`) | `amxxpawn.compileLocal` | **PawnForge: Compile Plugin Local** — Compila usando um `amxxpc` local existente na pasta do arquivo. |
| Paleta de Comandos (`Ctrl+Shift+P`) | `amxxpawn.createPlugin` | **PawnForge: Create New Plugin (Scaffold)** — Inicia o assistente de criação de novo plugin. |
| <kbd>Ctrl+Click</kbd> ou <kbd>F12</kbd> | *Editor Action* | **Go to Definition** — Pula para a definição do símbolo, macro, variável ou callback de `set_task`. |
| <kbd>Shift+F12</kbd> | *Editor Action* | **Find All References** — Lista todas as referências do símbolo no documento e nos includes. |
| <kbd>F2</kbd> | *Editor Action* | **Rename Symbol** — Renomeia o símbolo em todas as suas ocorrências de forma segura. |
| <kbd>Ctrl+T</kbd> | *Editor Action* | **Workspace Symbols** — Busca rápida e filtro de símbolos em todo o projeto. |
| Clique na Barra de Status | *Status Bar Action* | **Compile Plugin Shortcut** — Clique direto em `$(check) AMXX: OK` para recompilar. |

---

## 🧩 Assistente de Criação de Plugins (Scaffolding Wizard)

Com o comando **`PawnForge: Create New Plugin (Scaffold)`**, você pode criar a estrutura de um plugin profissional em segundos sem precisar digitar código boilerplate:

1. **Nome, Autor e Versão:** Solicita automaticamente as metainformações do plugin.
2. **Suporte a ReAPI:** Pergunta se deseja gerar código baseado na moderna **ReAPI** (ReHLDS / ReGameDLL) ou no clássico **HamSandwich / Engine**.
3. **Modelos Disponíveis:**
   * **Basic:** Estrutura enxuta com `plugin_init` e registro básico.
   * **Menu System:** Menu moderno completo com `menu_create`, `menu_additem`, `menu_display`, controle de saída e handler de callbacks.
   * **Cvars & Commands:** Registros com `create_cvar`, `bind_pcvar_num`, `bind_pcvar_float`, `AutoExecConfig` e comando administrativo com `cmd_access`.
   * **Events & Hooks:** Hooks prontos para Player Spawn, Player Killed e Round Start (com `RegisterHookChain` em ReAPI ou `RegisterHam`/`register_event` clássicos).

---

## 🛡️ Engenharia de Robustez & Proteções Ativas

O PawnForge foi construído para servidores de produção e ambientes de desenvolvimento exigentes:

* **Watchdog de 30 Segundos no Compilador:** Se o compilador travar em loop infinito devido a macros recursivas malformadas, o processo é encerrado com segurança, sem deixar processos zumbis na máquina.
* **Prevenção de Condições de Corrida (Race Condition):** Pressionar `F9` repetidamente cancela a compilação anterior em andamento antes de iniciar a nova, prevenindo corrupção de arquivo binário (`EBUSY`).
* **Fail-Safe Dependency Manager:** Remoção e atualização de includes resilientes a exceções, garantindo que o Language Server nunca caia.
* **Isolamento de Eventos Globais:** O listener de digitação opera exclusivamente em arquivos `amxxpawn`, poupando ciclos de CPU do VS Code ao editar arquivos JSON, Markdown ou Git.

---

## 🚀 Como Começar (Quick Start)

1. Instale a extensão pelo VS Code Marketplace procurando por **PawnForge** ou `iceeedR.pawnforge`.
2. Abra uma pasta com seus scripts `.sma` ou crie um novo arquivo com extensão `.sma`.
3. Caso não possua o compilador instalado, pressione `F9`: a extensão perguntará se deseja baixá-lo automaticamente.
4. Pressione `F9` para compilar e visualize o resultado instantâneo no console de saída e na barra de status!

---

## 🛠️ Contribuição & Desenvolvimento

Contribuições da comunidade são muito bem-vindas!

```bash
# 1. Clonar o repositório
git clone https://github.com/NiceFeatures/pawnforge-vscode.git

# 2. Instalar dependências
npm install

# 3. Compilar bundle de produção
npm run esbuild

# 4. Executar suíte de testes de regressão
npm test

# 5. Executar suíte de benchmarks de performance
npm run benchmark
```

Pressione <kbd>F5</kbd> no VS Code para abrir o Host de Desenvolvimento de Extensões e testar alterações em tempo real.

---

## ⚖️ Herança Open Source & Licença

* **Herança do Projeto:** O PawnForge nasceu da necessidade de modernizar o ecossistema de AMX Mod X e incorpora bases open-source do Language Server originalmente concebidas por **KliPPy** (`AMXXPawn Language`).
* **Manutenção & Evolução:** Desenvolvido ativamente por **iceeedR** e a equipe **NiceFeatures** para a comunidade global de AMX Mod X e Counter-Strike 1.6.
* **Licença:** Distribuído sob a licença **GNU General Public License v3.0 (GPL-3.0)**. Consulte o arquivo [LICENSE.txt](LICENSE.txt) para detalhes.

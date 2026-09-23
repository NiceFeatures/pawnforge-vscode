# 🌐 PawnForge Ecosystem: Porting & Multi-IDE Architecture Plan

> **Documento de Arquitetura e Roadmap Estratégico**  
> **Objetivo:** Expandir o Language Server do PawnForge além do VS Code, levando a mesma inteligência, performance e navegação para **Sublime Text**, **Notepad++** e outros editores.

---

## 🏛️ 1. Visão Geral da Arquitetura

O **PawnForge** foi arquitetado separando estritamente a interface do usuário da inteligência de linguagem através do **Language Server Protocol (LSP)** da Microsoft:

```text
                               ┌────────────────────────────────────────────────────────┐
                               │              pawnforge-lsp (Core Engine)               │
                               │    Parser, Symbol Index O(1), Go to Def, References    │
                               │     Compilado como Executável Autônomo (.exe / ELF)    │
                               └───────────────────────────┬────────────────────────────┘
                                                           │
                 ┌─────────────────────────────────────────┼────────────────────────────────────────┐
                 ▼                                         ▼                                        ▼
    ┌──────────────────────────┐             ┌──────────────────────────┐             ┌──────────────────────────┐
    │     pawnforge-vscode     │             │       LSP-pawnforge      │             │      pawnforge-npp       │
    │    (VS Code / VSCodium)  │             │      (Sublime Text)      │             │       (Notepad++)        │
    │  Mercado atual (v1.5.9)  │             │     Package Control      │             │   NppLSPClient + UDL     │
    └──────────────────────────┘             └──────────────────────────┘             └──────────────────────────┘
```

Como o núcleo do Language Server se comunica via **`stdio` (Standard Input/Output)** seguindo a especificação JSON-RPC do LSP, **qualquer editor com cliente LSP pode usufruir de 100% das nossas funcionalidades**.

---

## 📦 2. Estrutura de Repositórios (Multi-Repo)

Usar repositórios dedicados no GitHub é mandatório para respeitar os gerenciadores de pacotes de cada editor e manter pipelines de CI/CD limpos:

| Repositório | Plataforma | Tipo de Distribuição | Papel no Ecossistema |
| :--- | :--- | :--- | :--- |
| **`NiceFeatures/pawnforge-vscode`** | VS Code / VSCodium / Cursor | `.vsix` + Open VSX + Marketplace | Extensão completa para a família VS Code (atual). |
| **`NiceFeatures/pawnforge-lsp`** | Standalone / CLI | Executáveis `.exe` (Win) / binários Linux + NPM | **O motor central**. Executável compilado que roda sem precisar de Node.js instalado. |
| **`NiceFeatures/LSP-pawnforge`** | Sublime Text 3 & 4 | Package Control oficial | Plugin leve do Sublime que registra o Pawn e executa o `pawnforge-lsp`. |
| **`NiceFeatures/pawnforge-npp`** | Notepad++ | Release `.zip` / Instalador | Configuração do plugin `NppLSPClient` + UDL Syntax XML + Script NppExec. |

---

## 🚀 3. Fase 1: O Motor Standalone (`pawnforge-lsp`)

### O Problema do Node.js
Scripters de CS 1.6 e mods GoldSrc que usam Notepad++ e Sublime Text geralmente **não são desenvolvedores web e não possuem Node.js instalado no Windows**. Obrigá-los a instalar Node.js/NPM seria uma barreira de entrada enorme.

### A Solução
Compilar o servidor em um **binário nativo autônomo (standalone)** contendo o runtime embutido.

### Ferramentas de Compilação:
1. **`bun build --compile`** ou **`pkg` / `nexe`**:
   - Gera um arquivo único `pawnforge-lsp.exe` (~35-40 MB) para Windows x64.
   - Gera um binário `pawnforge-lsp` para Linux x64.
   - O usuário baixa apenas 1 arquivo `.exe` e não instala nada no sistema operacional.

### Interface de Linha de Comando (CLI):
```bash
# Execução padrão via stdio (usada pelos editores)
pawnforge-lsp.exe --stdio

# Verificação de versão
pawnforge-lsp.exe --version

# Inicialização com porta socket TCP (opcional para debug)
pawnforge-lsp.exe --socket=5007
```

### O que o Servidor Standalone Oferece:
- Autocomplete de nativas AMXX 1.8.2 / 1.9 / 1.10 e ReAPI.
- "Go to References" (`Shift+F12`) entre múltiplos includes `.inc` e `.sma`.
- "Go to Definition" (`F12`) instantâneo $O(1)$.
- Exclusão inteligente de definições redundantes.
- Smart Jump em callbacks de strings (`set_task`).
- Diagnósticos inline de erros de compilação.
- Workspace Symbols (`Ctrl+T`).

---

## 💎 4. Fase 2: Integração com Sublime Text (`LSP-pawnforge`)

O Sublime Text possui um cliente LSP excelente e muito maduro mantido pela comunidade do Sublime: o pacote **`LSP`**.

### Arquitetura do Pacote Sublime:
Criamos um repositório chamado `LSP-pawnforge` contendo:
1. **`LSP-pawnforge.sublime-settings`**:
   ```json
   {
       "command": ["pawnforge-lsp", "--stdio"],
       "selector": "source.pawn, source.amxxpawn",
       "schemes": ["file"],
       "initializationOptions": {},
       "settings": {
           "amxxpawn.compiler.executablePath": "",
           "amxxpawn.compiler.includePaths": []
       }
   }
   ```
2. **`plugin.py`**:
   - Um script Python leve de ~30 linhas usando a API `lsp_utils`.
   - Se o usuário não tiver o `pawnforge-lsp` no PATH do sistema, o script faz download automático da última release do `pawnforge-lsp.exe` diretamente do GitHub!
3. **Submissão ao Package Control:**
   - Adicionamos o repositório na lista oficial do [Sublime Text Package Control](https://github.com/wbond/package_control_channel).
   - Qualquer usuário no mundo poderá instalar com:
     `Ctrl+Shift+P` -> `Package Control: Install Package` -> `LSP-pawnforge`.

---

## 📝 5. Fase 3: Integração com Notepad++ (`pawnforge-npp`)

Para o Notepad++, combinamos o melhor de dois mundos:

### Componente 1: Inteligência Moderna (LSP)
- **Plugin `NppLSPClient`:** Plugin open-source para Notepad++ que adiciona suporte a Language Server Protocol.
- **Configuração (`nppLSPClient.json`):**
  ```json
  {
      "pawn": {
          "command": ["C:\\PawnForge\\pawnforge-lsp.exe", "--stdio"],
          "rootPatterns": [".git", "scripting", "include"],
          "fileExtensions": [".sma", ".inc"]
      }
  }
  ```
- **Resultado no Notepad++:**
  - `Ctrl+Espaço`: Autocomplete com documentação das nativas AMXX.
  - `Alt+G` / `F12`: Go to Definition.
  - `Alt+Shift+G`: Go to References.
  - Hover de mouse: Mostra protótipo da função e descrição.

### Componente 2: Syntax Highlighting Nativo (UDL)
- Arquivo `pawn_amxx_udl.xml` pronto para importar em `Linguagem -> Definir linguagem...`.
- Cores modernas inspiradas no tema Dark do VS Code / PawnForge.
- Reconhece tags Pawn (`Float:`, `bool:`, `any:`), diretivas pre-processador e keywords ReAPI.

### Componente 3: Compilação de 1 Clique (NppExec)
- Script configurado para a tecla `F6`:
  ```text
  NPP_SAVE
  cd "$(CURRENT_DIRECTORY)"
  "C:\amxmodx\amxxpc.exe" "$(FILE_NAME)" -o"$(CURRENT_DIRECTORY)\$(NAME_PART).amxx"
  ```
- Configuração de regex de console para dar duplo-clique no erro e pular para a linha exata.

---

## 🗺️ 6. Checklist de Implementação

### Passo 1: Core Standalone (`pawnforge-lsp`)
- [ ] Criar ponto de entrada CLI para o Language Server (desacoplado do VS Code client).
- [ ] Configurar script de build standalone com empacotador de executável (`pkg` ou `bun compile`).
- [ ] Testar comunicação via `stdio` rodando o `.exe` localmente.
- [ ] Criar repositório `NiceFeatures/pawnforge-lsp` no GitHub.
- [ ] Criar workflow de CI/CD para compilar binários Windows (`.exe`) e Linux em cada tag.

### Passo 2: Sublime Text (`LSP-pawnforge`)
- [ ] Criar repositório `NiceFeatures/LSP-pawnforge`.
- [ ] Configurar mapeamento sintático e download automático do binário via `lsp_utils`.
- [ ] Testar no Sublime Text 4 (Autocomplete, Hover, Definition, References).
- [ ] Submeter Pull Request para inclusão no Package Control.

### Passo 3: Notepad++ (`pawnforge-npp`)
- [ ] Criar repositório `NiceFeatures/pawnforge-npp`.
- [ ] Exportar UDL XML com realce sintático atualizado para AMXX 1.10 e ReAPI.
- [ ] Criar pacote pré-configurado do `NppLSPClient` apontando para o `pawnforge-lsp.exe`.
- [ ] Criar instalador simples ou script `.bat` de instalação automática em 1 clique para a pasta do Notepad++.
- [ ] Publicar no AlliedModders com tutorial passo a passo e capturas de tela.

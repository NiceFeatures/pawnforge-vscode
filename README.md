# AMXXPawn Language - Extended

<p align="center">
  <img src="images/extension-logo.png" alt="AMXXPawn Language Extended Logo" width="128">
  <h1 align="center">AMXXPawn Language - Extended</h1>
</p>

<p align="center">
  <strong>Uma experiência de desenvolvimento moderna e estendida para a clássica linguagem AMXXPawn, diretamente no seu VS Code.</strong>
</p>

> [!IMPORTANT]
> **DISCLAIMER:** This extension ("AMXXPawn Language - Extended") is a **fork** of the original [AMXXPawn Language](https://marketplace.visualstudio.com/items?itemName=KliPPy.amxxpawn-language) extension by KliPPy. It is not affiliated with the original author. This fork includes specific enhancements for local workflows, improved compilation tasks, and targeted syntax additions that are not present in the original version.

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

---

Este projeto ressuscita e moderniza a experiência de desenvolvimento para scripters de **AMX Mod X**. Se você ama criar plugins para Half-Life, Counter-Strike 1.6 e outros mods GoldSrc, mas sente falta das ferramentas modernas, esta extensão é para você.

Ela transforma o VS Code em uma IDE poderosa para Pawn, trazendo funcionalidades que antes eram exclusivas de linguagens mais novas.

## ✨ Funcionalidades Principais (Versão Extended)

Diferente do original, esta versão **Extended** traz otimizações focadas em workflows locais e customizados, juntamente com todas as ferramentas de **Language Server**:

* **🟢 IntelliSense Avançado:** Autocompletar para funções, constantes e variáveis.
* **🎯 Navegação de Código Inteligente (`Go to Definition`):** Pressione `Ctrl+Click` para pular instantaneamente para a definição de:
    * Funções (incluindo `public`, `stock`, `native` e com prefixo `@`).
    * Constantes definidas com `#define`.
    * Variáveis globais.
    * **Funções em Tasks:** Navegue diretamente para a função quando o nome dela é passado como texto (ex: `set_task_ex(..., "minha_funcao", ...)`).
* **🔍 Find All References:** `Shift+F12` em qualquer símbolo para encontrar todas as ocorrências no documento atual e nos includes carregados.
* **✏️ Rename Symbol:** `F2` para renomear variáveis, funções ou constantes em todo o documento — com proteção contra renomear keywords reservadas do Pawn.
* **🔦 Document Highlight:** Ao clicar ou posicionar o cursor em uma variável, função ou constante, todas as ocorrências no arquivo acendem com destaque visual.
* **🗂️ Folding Ranges:** Suporte nativo para recolher e expandir blocos de código (`#if/#else/#endif`, comentários em bloco `/* */`, `enum { }` e corpos de funções `{ }`).
* **🌐 Workspace Symbols (`Ctrl+T`):** Pressione `Ctrl+T` para buscar instantaneamente qualquer função, stock, constante ou macro em todos os arquivos e includes do projeto.
* **💡 Informações ao Passar o Mouse (Hover):** Passe o mouse sobre uma função ou variável para ver sua definição completa sem sair do lugar.
* **⚡ Diagnósticos em Tempo Real:** A extensão avisa se um `#include` não pode ser encontrado, ajudando a corrigir erros antes mesmo de compilar.
* **🔴 Inline Error Display:** Erros de compilação aparecem diretamente na linha do código como texto inline, além do sublinhado vermelho tradicional.
* **📊 Status Bar de Compilação:** Indicador visual em tempo real na barra inferior do VS Code com tempo de compilação (`$(check) AMXX: OK (0.04s)`) e atalho de clique para compilar.
* **📥 Download Automático do Compilador (Zero Configuração):** Não configurou um compilador? A extensão baixa e configura o compilador automaticamente para você.
* **🛠️ Compilação Integrada:** Compile seus plugins diretamente do VS Code com um único comando ou pelo botão ▶️ na barra do editor.

## 🚀 Instalação

1.  Instale o [Visual Studio Code](https://code.visualstudio.com/).
2.  Abra a aba de **Extensões** (`Ctrl+Shift+X`).
3.  Procure por `AMXXPawn Language Service`.
4.  Clique em **Instalar**.
5.  Recarregue o VS Code e aproveite!

Você também pode instalar diretamente pela [página do Marketplace](https://marketplace.visualstudio.com/items?itemName=iceeedR.amxx-pawn-language-editor).

## ⚙️ Configuração (Opcional - Customização)

Por padrão, a extensão **baixa e configura automaticamente o compilador AMXX (Zero Configuração!)**. Porém, se você quiser usar um compilador próprio, pastas de includes adicionais ou variáveis de ambiente, você pode configurar facilmente.

1.  Abra as Configurações do VS Code (`Ctrl + ,`).
2.  Clique no ícone de "Abrir settings.json" no canto superior direito.
3.  Adicione as seguintes propriedades ao seu `settings.json`:

```json
{
    // ...outras configurações...

    // Caminho para o executável do compilador amxxpc.
    // (Deixe vazio ou não defina nada para usar o compilador padrão auto-baixado)
    "amxxpawn.compiler.executablePath": "C:\\caminho\\para\\seu\\compiler\\amxxpc.exe",

    // Lista global de diretórios de includes compartilhada por todos os projetos (User Settings).
    // Suporta variáveis de ambiente (${env:VAR}) e busca recursiva com glob (/**).
    "amxxpawn.compiler.globalIncludePaths": [
        "${env:AMXX_HOME}\\scripting\\include\\**"
    ],

    // Lista de pastas de include específicas deste projeto/workspace.
    // Suporta ${workspaceRoot}, variáveis de ambiente (${env:VAR}) e globs (/**).
    "amxxpawn.compiler.includePaths": [
        "${workspaceRoot}\\include\\**"
    ],

    // Habilita ou desabilita avisos de erro inline no final da linha (falso por padrão).
    // Deixe falso se você usa extensões como Error Lens para evitar mensagens duplicadas.
    "amxxpawn.compiler.inlineErrors": false,

    // Intervalo de debounce em milissegundos para reprocessamento de símbolos ao digitar (padrão: 300ms).
    "amxxpawn.language.reparseInterval": 300,

    // --- CONFIGURAÇÃO RECOMENDADA ---
    // Para uma experiência de autocomplete mais limpa e inteligente,
    // desativando sugestões genéricas baseadas em palavras do arquivo.
    "editor.wordBasedSuggestions": "off"
}
```

**Variáveis e Padrões Suportados nos Caminhos:**
- `${workspaceRoot}` — Raiz do workspace/projeto aberto.
- `${fileDirname}` — Pasta do arquivo atualmente aberto.
- `${env:NOME_DA_VARIAVEL}` — Qualquer variável de ambiente do sistema (ex: `${env:HLDS_DIR}`, `${env:USERPROFILE}`).
- `**` / `*` — Expansão recursiva. Ex: `include/**` inclui automaticamente todas as subpastas.

**Exemplo Prático com Variáveis de Ambiente e Glob:**
```json
{
    "amxxpawn.compiler.executablePath": "${env:HLDS_DIR}/cstrike/addons/amxmodx/scripting/amxxpc.exe",
    "amxxpawn.compiler.globalIncludePaths": [
        "${env:HLDS_DIR}/cstrike/addons/amxmodx/scripting/include/**"
    ],
    "amxxpawn.compiler.includePaths": [
        "${workspaceRoot}/scripting/include/**"
    ]
}
```

## ⌨️ Comandos Disponíveis

Abra a Paleta de Comandos (`Ctrl+Shift+P`) e digite `AMXXPawn` para ver os comandos disponíveis:

* **`AMXXPawn: Compile Plugin`:** Compila o arquivo `.sma` atualmente aberto usando o `executablePath` definido nas configurações.
* **`AMXXPawn: Compile Plugin Local`:** Procura e usa um `amxxpc.exe` que esteja na mesma pasta do arquivo `.sma` que você está editando.

### Atalhos de Teclado

| Atalho | Ação | Descrição |
|--------|------|----------|
| `Ctrl+Click` | **Go to Definition** | Pula para a definição do símbolo sob o cursor |
| `Shift+F12` | **Find All References** | Encontra todas as ocorrências do símbolo no documento e includes |
| `F2` | **Rename Symbol** | Renomeia todas as ocorrências de uma variável, função ou constante |
| `▶️ botão` | **Compile Plugin** | Clique no botão play na barra do editor para compilar |

## 🛠️ Para Desenvolvedores e Contribuidores

Este projeto é uma modernização de uma base de código legada, agora utilizando TypeScript e as APIs mais recentes do `vscode-languageclient`. Contribuições são muito bem-vindas!

**Para compilar e testar localmente:**

1.  Clone o repositório: `git clone https://github.com/NiceFeatures/amxxpawn-language.git`
2.  Instale as dependências: `npm install`
3.  Compile e faça o bundle (`esbuild`): `npm run esbuild`
4.  Abra o projeto no VS Code e pressione `F5` para iniciar uma sessão de depuração.

## 🙏 Agradecimentos

Este projeto é uma continuação e modernização do trabalho incrível feito originalmente por **KliPPy**. Todo o crédito pela base sólida e pela ideia original vai para ele.

## 📄 Licença

Este projeto é licenciado sob a **GPL-3.0**. Veja o arquivo `LICENSE` para mais detalhes.

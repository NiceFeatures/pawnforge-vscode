# 🚀 AMXX Pawn Extension - Performance Benchmarks & Build History

> Este arquivo é gerado e atualizado automaticamente a cada execução de `npm run benchmark`.

## 📈 Histórico Comparativo de Versões

| Versão | Data | Cursor Index (`positionToIndex`) | Reparse Completo (~1.500 linhas) | Semantic Tokens (1.700 tokens) | Símbolos / Hover (100k calls) | Heap RAM |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1.5.5 (Legacy Baseline)** | 2026-08-19 | 2043.54 ms | **38.5 ms** | **82.4 ms** | 1558.07 ms | 38.4 MB |
| **v1.5.6** | 2026-08-20 | **256.19 ms** _(split: 1811.67 ms)_ | **4.49 ms** | **10.97 ms** | **3.27 ms** _(sem cache: 1324.47 ms)_ | 25.39 MB |
| **1.5.6** | 2026-08-20 | **255.64 ms** _(split: 1790.09 ms)_ | **4.97 ms** | **10.76 ms** | **2.39 ms** _(sem cache: 1250.97 ms)_ | 35.22 MB |
| **1.5.7** | 2026-09-13 | **278.64 ms** _(split: 1899.62 ms)_ | **4.78 ms** | **10.72 ms** | **2.24 ms** _(sem cache: 1361.15 ms)_ | 47.44 MB |
| **1.5.8** | 2026-09-22 | **331.79 ms** _(split: 1934 ms)_ | **4.86 ms** | **11.31 ms** | **2.77 ms** _(sem cache: 3565.01 ms)_ | 38.31 MB |
| **1.5.9** | 2026-09-22 | **291.32 ms** _(split: 1907.94 ms)_ | **5.46 ms** | **11.23 ms** | **2.31 ms** _(sem cache: 3521.96 ms)_ | 33.5 MB |

## 🧪 Metodologia do Benchmark
- **Ambiente de Teste**: Node.js v24.13.1 (win32 x64)
- **Documento Simulado**: Script Pawn realista com 1.500 linhas, 50 variáveis globais/constantes e 100 funções públicas.
- **Métricas Monitoradas**:
  - **`positionToIndex`**: Conversão de coordenadas (linha/coluna) para índice de offset em string com 10.000 iterações.
  - **Reparse de Documento**: Parsing completo de AST e tabela de símbolos em 50 iterações.
  - **Semantic Tokens**: Extração e mapeamento semântico de escopo $O(1)$ em 50 iterações.
  - **`getSymbols`**: 100.000 consultas de árvore de símbolos (usadas em Autocomplete, Hover e Definition).

---
*Execute `npm run benchmark` no terminal a qualquer momento para rodar a suíte e atualizar esta tabela.*
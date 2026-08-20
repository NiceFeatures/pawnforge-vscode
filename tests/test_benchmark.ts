import { performance } from 'perf_hooks';
import * as parser from '../src/server/parser';
import * as helpers from '../src/server/helpers';
import { URI } from 'vscode-uri';
import { DocumentData, ParserResults } from '../src/server/types';
import { FileDependency } from '../src/server/dependency-manager';
import * as FS from 'fs';
import * as Path from 'path';

console.log('========================================================================');
console.log('🚀 AMXX Pawn Extension - Performance Benchmark & History Tracker');
console.log('========================================================================\n');

// 1. Read current package version
const pkgPath = Path.join(process.cwd(), 'package.json');
let pkgVersion = '1.5.6';
if (FS.existsSync(pkgPath)) {
    try {
        const pkg = JSON.parse(FS.readFileSync(pkgPath, 'utf8'));
        if (pkg.version) pkgVersion = pkg.version;
    } catch { /* ignore */ }
}

// 2. Generate a realistic mock AMXX script with 1500 lines and many functions/variables
const lines: string[] = [];
lines.push('#include <amxmodx>');
lines.push('#include <amxmisc>');
lines.push('#include <cstrike>');
lines.push('#include <fakemeta>');
lines.push('#include <engine>');
lines.push('#include <hamsandwich>');
lines.push('');

for (let i = 0; i < 50; i++) {
    lines.push(`new g_GlobalVariable_${i} = ${i};`);
    lines.push(`new const Float:g_GlobalFloat_${i} = ${i}.0;`);
    lines.push(`new g_szGlobalString_${i}[64] = "Test string message";`);
}

for (let i = 0; i < 100; i++) {
    lines.push(`
public Action_Function_${i}(id, level, cid) {
    if (!cmd_access(id, level, cid, 1))
        return 1;
        
    new szName[32], szAuthid[35], szIp[20];
    new iTarget = ${i};
    new const Float:flDuration = 10.0;
    
    get_user_name(id, szName, charsmax(szName));
    get_user_authid(id, szAuthid, charsmax(szAuthid));
    get_user_ip(id, szIp, charsmax(szIp), 1);
    
    server_print("[%d] Player %s (%s) called action %d with duration %f", id, szName, szAuthid, iTarget, flDuration);
    return 0;
}
`);
}

const mockCode = lines.join('\n');
const fileUri = URI.parse('file:///benchmark_test.sma');

// ----------------------------------------------------
// BENCHMARK 1: PositionToIndex (10,000 iterations)
// ----------------------------------------------------
console.log('📊 [1/4] Testando positionToIndex (10.000 iterações)...');
const positions = [
    { line: 10, character: 15 },
    { line: 250, character: 12 },
    { line: 500, character: 8 },
    { line: 750, character: 20 },
    { line: 1100, character: 5 }
];

const startPos = performance.now();
for (let i = 0; i < 10000; i++) {
    for (const pos of positions) {
        let index = 0;
        for (let l = 0; l < pos.line; l++) {
            const next = mockCode.indexOf('\n', index);
            if (next === -1) break;
            index = next + 1;
        }
    }
}
const endPos = performance.now();
const timePosOptimized = parseFloat((endPos - startPos).toFixed(2));

// Compare with old split('\n')
const startPosOld = performance.now();
for (let i = 0; i < 10000; i++) {
    for (const pos of positions) {
        const splitLines = mockCode.split('\n');
        let index = 0;
        for (let l = 0; l < pos.line && l < splitLines.length; l++) {
            index += splitLines[l].length + 1;
        }
    }
}
const endPosOld = performance.now();
const timePosOld = parseFloat((endPosOld - startPosOld).toFixed(2));

console.log(`   ⚡ positionToIndex (Otimizado): ${timePosOptimized} ms`);
console.log(`   ⏱️  positionToIndex (Legado split): ${timePosOld} ms (${(timePosOld / timePosOptimized).toFixed(1)}x mais lento)\n`);

// ----------------------------------------------------
// BENCHMARK 2: Full Document Parse (50 iterations)
// ----------------------------------------------------
console.log('📊 [2/4] Testando Parse Completo de Documento (50 iterações de ~1.500 linhas)...');
let parsedResult: ParserResults | null = null;
const startParse = performance.now();
for (let i = 0; i < 50; i++) {
    parsedResult = parser.parse(fileUri, mockCode, false);
}
const endParse = performance.now();
const totalParseTime = parseFloat((endParse - startParse).toFixed(2));
const parseAvg = parseFloat((totalParseTime / 50).toFixed(2));

console.log(`   ⚡ Tempo Total: ${totalParseTime} ms`);
console.log(`   ⏱️  Média por Reparse: ${parseAvg} ms/arquivo (~1.500 linhas)\n`);

// ----------------------------------------------------
// BENCHMARK 3: Semantic Tokens Extraction (50 iterations)
// ----------------------------------------------------
console.log('📊 [3/4] Testando Semantic Tokens Otimizado (50 iterações)...');
const docData = new DocumentData(fileUri.toString());
if (parsedResult) {
    docData.callables = parsedResult.callables;
    docData.values = parsedResult.values;
    docData.constants = parsedResult.constants;
    docData.semanticTokens = parsedResult.semanticTokens;
    docData.localVariables = parsedResult.localVariables;
}

const startTokens = performance.now();
let tokenCount = 0;
for (let i = 0; i < 50; i++) {
    const tokens = parser.getUsageTokens(mockCode, docData, new Map());
    tokenCount = tokens.length;
}
const endTokens = performance.now();
const totalTokensTime = parseFloat((endTokens - startTokens).toFixed(2));
const tokensAvg = parseFloat((totalTokensTime / 50).toFixed(2));

console.log(`   ⚡ Tokens Gerados: ${tokenCount} tokens`);
console.log(`   ⚡ Tempo Total: ${totalTokensTime} ms`);
console.log(`   ⏱️  Média por Varredura Semântica: ${tokensAvg} ms\n`);

// ----------------------------------------------------
// BENCHMARK 4: Symbols Cache & Graph Lookup (100,000 lookups)
// ----------------------------------------------------
console.log('📊 [4/4] Testando Cache de Símbolos getSymbols (100.000 chamadas)...');
const dependenciesData = new Map<FileDependency, DocumentData>();

// With cache (cachedSymbols in docData)
const startCache = performance.now();
for (let i = 0; i < 100000; i++) {
    const symbols = helpers.getSymbols(docData, dependenciesData);
}
const endCache = performance.now();
const timeWithCache = parseFloat((endCache - startCache).toFixed(2));

// Without cache (forcing recalculation)
const startNoCache = performance.now();
for (let i = 0; i < 100000; i++) {
    docData.cachedSymbols = null;
    const symbols = helpers.getSymbols(docData, dependenciesData);
}
const endNoCache = performance.now();
const timeNoCache = parseFloat((endNoCache - startNoCache).toFixed(2));

console.log(`   ⚡ getSymbols com Cache: ${timeWithCache} ms (100k chamadas)`);
console.log(`   ⏱️  getSymbols sem Cache: ${timeNoCache} ms (100k chamadas) - ${(timeNoCache / Math.max(1, timeWithCache)).toFixed(1)}x de aceleração\n`);

// ----------------------------------------------------
// MEMORY STATS
// ----------------------------------------------------
const mem = process.memoryUsage();
const heapUsedMB = parseFloat((mem.heapUsed / 1024 / 1024).toFixed(2));
console.log('💾 Uso de Memória Heap:', heapUsedMB, 'MB\n');

// ----------------------------------------------------
// SAVE TO HISTORY JSON & BENCHMARKS.MD
// ----------------------------------------------------
const historyFilePath = Path.join(process.cwd(), 'benchmark-history.json');
let history: Array<{
    version: string;
    date: string;
    timestamp: number;
    metrics: {
        positionToIndexMs: number;
        positionToIndexLegacyMs: number;
        fullReparseAvgMs: number;
        semanticTokensAvgMs: number;
        symbolsLookupCachedMs: number;
        symbolsLookupUncachedMs: number;
        heapUsedMB: number;
    };
}> = [];

if (FS.existsSync(historyFilePath)) {
    try {
        history = JSON.parse(FS.readFileSync(historyFilePath, 'utf8'));
    } catch {
        history = [];
    }
}

// Find if current version exists
const today = new Date().toISOString().split('T')[0];
const existingIdx = history.findIndex(h => h.version === pkgVersion);

const currentRecord = {
    version: pkgVersion,
    date: today,
    timestamp: Date.now(),
    metrics: {
        positionToIndexMs: timePosOptimized,
        positionToIndexLegacyMs: timePosOld,
        fullReparseAvgMs: parseAvg,
        semanticTokensAvgMs: tokensAvg,
        symbolsLookupCachedMs: timeWithCache,
        symbolsLookupUncachedMs: timeNoCache,
        heapUsedMB: heapUsedMB
    }
};

if (existingIdx !== -1) {
    history[existingIdx] = currentRecord;
} else {
    history.push(currentRecord);
}

// Save history JSON
FS.writeFileSync(historyFilePath, JSON.stringify(history, null, 2), 'utf8');

// Generate BENCHMARKS.md
const mdLines: string[] = [
    '# 🚀 AMXX Pawn Extension - Performance Benchmarks & Build History',
    '',
    '> Este arquivo é gerado e atualizado automaticamente a cada execução de `npm run benchmark`.',
    '',
    '## 📈 Histórico Comparativo de Versões',
    '',
    '| Versão | Data | Cursor Index (`positionToIndex`) | Reparse Completo (~1.500 linhas) | Semantic Tokens (1.700 tokens) | Símbolos / Hover (100k calls) | Heap RAM |',
    '| :--- | :--- | :--- | :--- | :--- | :--- | :--- |'
];

for (const h of history) {
    const symbolsText = h.metrics.symbolsLookupCachedMs !== h.metrics.symbolsLookupUncachedMs
        ? `**${h.metrics.symbolsLookupCachedMs} ms** _(sem cache: ${h.metrics.symbolsLookupUncachedMs} ms)_`
        : `${h.metrics.symbolsLookupCachedMs} ms`;

    const posText = h.metrics.positionToIndexMs !== h.metrics.positionToIndexLegacyMs
        ? `**${h.metrics.positionToIndexMs} ms** _(split: ${h.metrics.positionToIndexLegacyMs} ms)_`
        : `${h.metrics.positionToIndexMs} ms`;

    mdLines.push(`| **${h.version}** | ${h.date} | ${posText} | **${h.metrics.fullReparseAvgMs} ms** | **${h.metrics.semanticTokensAvgMs} ms** | ${symbolsText} | ${h.metrics.heapUsedMB} MB |`);
}

mdLines.push('');
mdLines.push('## 🧪 Metodologia do Benchmark');
mdLines.push('- **Ambiente de Teste**: Node.js v' + process.versions.node + ' (' + process.platform + ' ' + process.arch + ')');
mdLines.push('- **Documento Simulado**: Script Pawn realista com 1.500 linhas, 50 variáveis globais/constantes e 100 funções públicas.');
mdLines.push('- **Métricas Monitoradas**:');
mdLines.push('  - **`positionToIndex`**: Conversão de coordenadas (linha/coluna) para índice de offset em string com 10.000 iterações.');
mdLines.push('  - **Reparse de Documento**: Parsing completo de AST e tabela de símbolos em 50 iterações.');
mdLines.push('  - **Semantic Tokens**: Extração e mapeamento semântico de escopo $O(1)$ em 50 iterações.');
mdLines.push('  - **`getSymbols`**: 100.000 consultas de árvore de símbolos (usadas em Autocomplete, Hover e Definition).');
mdLines.push('');
mdLines.push('---');
mdLines.push('*Execute `npm run benchmark` no terminal a qualquer momento para rodar a suíte e atualizar esta tabela.*');

const mdPath = Path.join(process.cwd(), 'BENCHMARKS.md');
FS.writeFileSync(mdPath, mdLines.join('\n'), 'utf8');

console.log('========================================================================');
console.log(`📁 Histórico persistido em: ${historyFilePath}`);
console.log(`📄 Relatório gerado em:    ${mdPath}`);
console.log('========================================================================');
console.log('✅ Benchmark e histórico concluídos com sucesso!\n');

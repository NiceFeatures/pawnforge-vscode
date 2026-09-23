import { performance } from 'perf_hooks';
import * as FS from 'fs';
import * as Path from 'path';
import * as OS from 'os';
import { URI } from 'vscode-uri';
import { Position } from 'vscode-languageserver';
import * as parser from '../src/server/parser';
import { DocumentData } from '../src/server/types';
import { FileDependency } from '../src/server/dependency-manager';
import { findWorkspaceFiles } from '../src/common/helpers';

console.log('========================================================================');
console.log('⚡ BENCHMARK: WORKSPACE REFERENCES & DEFINITIONS PERFORMANCE');
console.log('========================================================================\n');

// -----------------------------------------------------------------------------
// 1. SETUP SIMULATED REALISTIC WORKSPACE
// -----------------------------------------------------------------------------
const tempWorkspace = FS.mkdtempSync(Path.join(OS.tmpdir(), 'pawnforge-bench-'));

try {
    const includeDir = Path.join(tempWorkspace, 'include');
    const scriptingDir = Path.join(tempWorkspace, 'scripting');
    const nodeModulesDir = Path.join(tempWorkspace, 'node_modules', 'huge_dep');
    const gitDir = Path.join(tempWorkspace, '.git', 'objects');

    FS.mkdirSync(includeDir, { recursive: true });
    FS.mkdirSync(scriptingDir, { recursive: true });
    FS.mkdirSync(nodeModulesDir, { recursive: true });
    FS.mkdirSync(gitDir, { recursive: true });

    // Populate node_modules and .git with 500 files to test ignore performance
    for (let i = 0; i < 250; i++) {
        FS.writeFileSync(Path.join(nodeModulesDir, `dep_${i}.inc`), `// dummy include ${i}`);
        FS.writeFileSync(Path.join(gitDir, `obj_${i}.sma`), `// dummy sma ${i}`);
    }

    // Populate 50 .inc files and 50 .sma files in workspace
    const workspaceUris: string[] = [];
    const contentMap = new Map<string, string>();

    // Central library header
    const mainHeaderContent = [
        '#if defined _my_lib_included',
        '    #endinput',
        '#endif',
        '#define _my_lib_included',
        '',
        'stock core_utility_function(id, param) {',
        '    return id * param;',
        '}',
        '',
        'stock rare_function_called_once(id) {',
        '    return id + 42;',
        '}'
    ].join('\n');

    const mainHeaderPath = Path.join(includeDir, 'my_lib.inc');
    FS.writeFileSync(mainHeaderPath, mainHeaderContent);
    const mainHeaderUri = URI.file(mainHeaderPath).toString();
    workspaceUris.push(mainHeaderUri);
    contentMap.set(mainHeaderUri, mainHeaderContent);

    // Create 49 other .inc files
    for (let i = 1; i <= 49; i++) {
        const usesFunc = (i % 3 === 0);
        const incContent = [
            `// Include header module ${i}`,
            `#define MODULE_VAL_${i} ${i}`,
            usesFunc ? `stock helper_${i}(id) { return core_utility_function(id, ${i}); }` : `stock helper_${i}(id) { return id + ${i}; }`
        ].join('\n');

        const incPath = Path.join(includeDir, `module_${i}.inc`);
        FS.writeFileSync(incPath, incContent);
        const incUri = URI.file(incPath).toString();
        workspaceUris.push(incUri);
        contentMap.set(incUri, incContent);
    }

    // Create 50 .sma plugin files
    for (let i = 1; i <= 50; i++) {
        const usesFunc = (i % 2 === 0);
        const smaLines: string[] = [
            '#include <amxmodx>',
            '#include <my_lib>'
        ];
        for (let j = 0; j < 30; j++) {
            smaLines.push(`new g_PluginVar_${j} = ${j};`);
        }
        smaLines.push('public plugin_init() {');
        smaLines.push(`    register_plugin("Plugin ${i}", "1.0", "Author");`);
        if (usesFunc) {
            smaLines.push('    core_utility_function(1, 100);');
        }
        smaLines.push('}');
        const smaContent = smaLines.join('\n');

        const smaPath = Path.join(scriptingDir, `plugin_${i}.sma`);
        FS.writeFileSync(smaPath, smaContent);
        const smaUri = URI.file(smaPath).toString();
        workspaceUris.push(smaUri);
        contentMap.set(smaUri, smaContent);
    }

    console.log(`📁 Workspace simulado gerado em: ${tempWorkspace}`);
    console.log(`   - 100 arquivos Pawn válidos (50 .inc + 50 .sma)`);
    console.log(`   - 500 arquivos ignorados em node_modules e .git\n`);

    // -------------------------------------------------------------------------
    // BENCHMARK 1: findWorkspaceFiles Scan Speed
    // -------------------------------------------------------------------------
    console.log('📊 [1/4] Testando findWorkspaceFiles (Varredura do Workspace)...');
    
    // Warm up
    findWorkspaceFiles(tempWorkspace);

    const startScan = performance.now();
    const ITERATIONS_SCAN = 50;
    let foundFilesCount = 0;
    for (let it = 0; it < ITERATIONS_SCAN; it++) {
        const files = findWorkspaceFiles(tempWorkspace);
        foundFilesCount = files.length;
    }
    const endScan = performance.now();
    const totalScanTime = endScan - startScan;
    const avgScanTime = (totalScanTime / ITERATIONS_SCAN).toFixed(2);

    console.log(`   ⚡ Arquivos Pawn encontrados: ${foundFilesCount} (esperado: 100)`);
    console.log(`   ⚡ Tempo total para ${ITERATIONS_SCAN} varreduras: ${totalScanTime.toFixed(2)} ms`);
    console.log(`   ⏱️  Média por varredura completa de disco: ${avgScanTime} ms\n`);

    // -------------------------------------------------------------------------
    // BENCHMARK 2: doReferences with Workspace Search (Frequent Symbol)
    // -------------------------------------------------------------------------
    console.log('📊 [2/4] Testando doReferences em símbolo comum (presente em 41 arquivos de 100)...');

    const mainHeaderParsed = parser.parse(URI.file(mainHeaderPath), mainHeaderContent, false);
    const mainHeaderData = new DocumentData(mainHeaderUri);
    mainHeaderData.callables = mainHeaderParsed.callables;
    mainHeaderData.values = mainHeaderParsed.values;
    mainHeaderData.constants = mainHeaderParsed.constants;

    const candidateUris = workspaceUris.filter(u => u !== mainHeaderUri);
    const getIncludeContent = (uri: string) => contentMap.get(uri) || null;

    // Line 5: "stock core_utility_function(id, param) {"
    const funcPos = Position.create(5, 10);

    const startRef = performance.now();
    const ITERATIONS_REF = 50;
    let totalRefsFound = 0;
    for (let it = 0; it < ITERATIONS_REF; it++) {
        const refs = parser.doReferences(
            mainHeaderContent,
            funcPos,
            mainHeaderUri,
            mainHeaderData,
            new Map(),
            getIncludeContent,
            candidateUris
        );
        totalRefsFound = refs.length;
    }
    const endRef = performance.now();
    const totalRefTime = endRef - startRef;
    const avgRefTime = (totalRefTime / ITERATIONS_REF).toFixed(2);

    console.log(`   ⚡ Referências encontradas no workspace: ${totalRefsFound}`);
    console.log(`   ⚡ Tempo total para ${ITERATIONS_REF} buscas completas: ${totalRefTime.toFixed(2)} ms`);
    console.log(`   ⏱️  Latência média por "Go To References": ${avgRefTime} ms/consulta\n`);

    // -------------------------------------------------------------------------
    // BENCHMARK 3: doReferences Fast-Path Filter Impact (Sparse Symbol)
    // -------------------------------------------------------------------------
    console.log('📊 [3/4] Testando pré-filtro string.includes em símbolo raro (presente em apenas 1 arquivo)...');

    // Line 9: "stock rare_function_called_once(id) {"
    const rarePos = Position.create(9, 10);

    const startRare = performance.now();
    const ITERATIONS_RARE = 200;
    let rareCount = 0;
    for (let it = 0; it < ITERATIONS_RARE; it++) {
        const refs = parser.doReferences(
            mainHeaderContent,
            rarePos,
            mainHeaderUri,
            mainHeaderData,
            new Map(),
            getIncludeContent,
            candidateUris
        );
        rareCount = refs.length;
    }
    const endRare = performance.now();
    const totalRareTime = endRare - startRare;
    const avgRareTime = (totalRareTime / ITERATIONS_RARE).toFixed(2);

    console.log(`   ⚡ Ocorrências encontradas: ${rareCount}`);
    console.log(`   ⚡ 200 consultas com 100 arquivos avaliados por consulta: ${totalRareTime.toFixed(2)} ms`);
    console.log(`   ⏱️  Latência média com pré-filtro: ${avgRareTime} ms/consulta (sub-milissegundo!)\n`);

    // -------------------------------------------------------------------------
    // BENCHMARK 4: doDefinition on Definition Line (Ctrl+Click link detection)
    // -------------------------------------------------------------------------
    console.log('📊 [4/4] Testando doDefinition na linha de definição (10.000 chamadas)...');

    const startDef = performance.now();
    const ITERATIONS_DEF = 10000;
    let validDefs = 0;
    for (let it = 0; it < ITERATIONS_DEF; it++) {
        const def = parser.doDefinition(mainHeaderContent, funcPos, mainHeaderData, new Map());
        if (def !== null) validDefs++;
    }
    const endDef = performance.now();
    const totalDefTime = endDef - startDef;
    const avgDefTimeUs = ((totalDefTime / ITERATIONS_DEF) * 1000).toFixed(2);

    console.log(`   ⚡ Definições resolvidas: ${validDefs}/${ITERATIONS_DEF}`);
    console.log(`   ⚡ Tempo total para ${ITERATIONS_DEF} chamadas: ${totalDefTime.toFixed(2)} ms`);
    console.log(`   ⏱️  Tempo médio por hover/Ctrl: ${avgDefTimeUs} µs (microssegundos)\n`);

} finally {
    try {
        FS.rmSync(tempWorkspace, { recursive: true, force: true });
    } catch { /* ignore */ }
}

console.log('========================================================================');
console.log('🎉 BENCHMARK CONCLUÍDO COM SUCESSO!');
console.log('========================================================================');

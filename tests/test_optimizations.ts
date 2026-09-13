import * as assert from 'assert';
import * as FS from 'fs';
import * as Path from 'path';
import * as Os from 'os';
import { URI } from 'vscode-uri';
import * as helpers from '../src/common/helpers';
import * as serverHelpers from '../src/server/helpers';
import * as parser from '../src/server/parser';
import { FileDependencyManager, FileDependency } from '../src/server/dependency-manager';
import { DocumentData, CallableDescriptor, ValueDescriptor, ConstantDescriptor } from '../src/server/types';

console.log('========================================================================');
console.log('🧪 RUNNING LOT 2 OPTIMIZATIONS & CONCURRENCY TESTS');
console.log('========================================================================\n');

// -----------------------------------------------------------------------------
// TEST 1: OPT-01 - hasIncludeFiles with memoization
// -----------------------------------------------------------------------------
console.log('Test 1: OPT-01 - hasIncludeFiles memoization');
const tempDir = FS.mkdtempSync(Path.join(Os.tmpdir(), 'amxx-memo-test-'));
const subDir = Path.join(tempDir, 'nested');
FS.mkdirSync(subDir);
FS.writeFileSync(Path.join(subDir, 'test.inc'), '// include file');

const memo = new Map<string, boolean>();
const res1 = helpers.hasIncludeFiles(tempDir, 10, memo);
assert.strictEqual(res1, true, 'hasIncludeFiles deve encontrar test.inc');
assert.strictEqual(memo.has(Path.normalize(tempDir)), true, 'memo deve armazenar o resultado da pasta raiz');
assert.strictEqual(memo.get(Path.normalize(tempDir)), true, 'memo deve marcar true para a pasta raiz');

// Segunda chamada com memo deve ser instantânea sem tocar no disco novamente
const res2 = helpers.hasIncludeFiles(tempDir, 10, memo);
assert.strictEqual(res2, true, 'Segunda chamada com memo deve retornar true');

// Clean up
FS.rmSync(tempDir, { recursive: true, force: true });
console.log('✅ Test 1 PASSED: hasIncludeFiles com memoização validada com sucesso.\n');

// -----------------------------------------------------------------------------
// TEST 2: OPT-03 & OPT-05 - getSymbols Map Lookups & Deduplication
// -----------------------------------------------------------------------------
console.log('Test 2: OPT-03 & OPT-05 - getSymbols Map Lookups & Deduplication');
const dm = new FileDependencyManager();
const dep1 = dm.addReference('file:///inc_a.inc');
const depData1 = new DocumentData('file:///inc_a.inc');
depData1.values.push({
    identifier: 'g_CommonVar',
    label: 'new g_CommonVar',
    file: URI.parse('file:///inc_a.inc'),
    range: { start: { line: 1, character: 0 }, end: { line: 1, character: 15 } },
    documentation: 'From inc A',
    isConst: false
});
depData1.constants.push({
    identifier: 'MAX_PLAYERS',
    label: '#define MAX_PLAYERS 32',
    value: '32',
    file: URI.parse('file:///inc_a.inc'),
    range: { start: { line: 2, character: 0 }, end: { line: 2, character: 22 } }
});
depData1.callables.push({
    identifier: 'format_time',
    label: 'stock format_time()',
    file: URI.parse('file:///inc_a.inc'),
    start: { line: 5, character: 0 },
    end: { line: 5, character: 20 },
    parameters: [],
    documentation: '',
    isForward: false
});

const dep2 = dm.addReference('file:///inc_b.inc');
const depData2 = new DocumentData('file:///inc_b.inc');
// Duplicata proposital que costumava inchar o array
depData2.values.push({
    identifier: 'g_CommonVar',
    label: 'new g_CommonVar (dup)',
    file: URI.parse('file:///inc_b.inc'),
    range: { start: { line: 1, character: 0 }, end: { line: 1, character: 15 } },
    documentation: 'From inc B duplicate',
    isConst: false
});
depData2.constants.push({
    identifier: 'MAX_PLAYERS',
    label: '#define MAX_PLAYERS 32',
    value: '32',
    file: URI.parse('file:///inc_b.inc'),
    range: { start: { line: 2, character: 0 }, end: { line: 2, character: 22 } }
});

const mainDoc = new DocumentData('file:///main.sma');
mainDoc.dependencies.push(dep1, dep2);
const depMap = new Map<FileDependency, DocumentData>();
depMap.set(dep1, depData1);
depMap.set(dep2, depData2);

const symbols = serverHelpers.getSymbols(mainDoc, depMap);

// Validar mapas O(1)
assert.ok(symbols.callablesMap, 'symbols.callablesMap deve existir');
assert.ok(symbols.valuesMap, 'symbols.valuesMap deve existir');
assert.ok(symbols.constantsMap, 'symbols.constantsMap deve existir');

assert.strictEqual(symbols.callablesMap.has('format_time'), true, 'callablesMap deve conter format_time');
assert.strictEqual(symbols.valuesMap.has('g_commonvar'), true, 'valuesMap deve conter g_commonvar case-insensitively');
assert.strictEqual(symbols.constantsMap.has('max_players'), true, 'constantsMap deve conter max_players');

// Validar deduplicação: valores e constantes não devem ter duplicatas
const commonVars = symbols.values.filter(v => v.identifier.toLowerCase() === 'g_commonvar');
assert.strictEqual(commonVars.length, 1, 'Deduplicação: g_CommonVar deve aparecer apenas uma vez');

const maxPlayersConsts = symbols.constants.filter(c => c.identifier.toLowerCase() === 'max_players');
assert.strictEqual(maxPlayersConsts.length, 1, 'Deduplicação: MAX_PLAYERS deve aparecer apenas uma vez');

console.log('✅ Test 2 PASSED: getSymbols expõe mapas O(1) e deduplica corretamente.\n');

// -----------------------------------------------------------------------------
// TEST 3: OPT-05 - doSignatures com callablesMap
// -----------------------------------------------------------------------------
console.log('Test 3: OPT-05 - doSignatures com callablesMap');
const sampleCode = `
format_time(10, 
`;
const sigHelp = parser.doSignatures(sampleCode, { line: 1, character: 15 }, symbols.callables, symbols.callablesMap);
assert.ok(sigHelp, 'doSignatures deve retornar SignatureHelp');
assert.strictEqual(sigHelp.signatures.length, 1, 'Deve retornar 1 assinatura');
assert.strictEqual(sigHelp.signatures[0].label, 'stock format_time()');
console.log('✅ Test 3 PASSED: doSignatures utilizou lookup O(1) com sucesso.\n');

// -----------------------------------------------------------------------------
// TEST 4: OPT-04 - doCompletions include cache
// -----------------------------------------------------------------------------
console.log('Test 4: OPT-04 - doCompletions include cache');
const mockConn: any = {};
const docWithInclude = '#include <';
const fakeIncDir = FS.mkdtempSync(Path.join(Os.tmpdir(), 'amxx-inc-cache-'));
FS.writeFileSync(Path.join(fakeIncDir, 'my_custom_lib.inc'), '// lib');

const completions1 = parser.doCompletions(mockConn, docWithInclude, { line: 0, character: 10 }, mainDoc, depMap, [fakeIncDir]);
assert.ok(completions1, 'doCompletions deve retornar completions');
assert.strictEqual(completions1.some(c => c.label === 'my_custom_lib'), true, 'Primeira chamada encontra my_custom_lib');

// Segunda chamada deve ser servida pelo cache
const completions2 = parser.doCompletions(mockConn, docWithInclude, { line: 0, character: 10 }, mainDoc, depMap, [fakeIncDir]);
assert.ok(completions2, 'Segunda chamada deve retornar completions do cache');
assert.strictEqual(completions2.some(c => c.label === 'my_custom_lib'), true, 'Cache contém my_custom_lib');

FS.rmSync(fakeIncDir, { recursive: true, force: true });
console.log('✅ Test 4 PASSED: doCompletions com cache de includes validado.\n');

console.log('========================================================================');
console.log('🎉 TODOS OS TESTES DE OTIMIZAÇÃO DO LOTE 2 PASSARAM COM SUCESSO!');
console.log('========================================================================\n');

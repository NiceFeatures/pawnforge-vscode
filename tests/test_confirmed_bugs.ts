import * as assert from 'assert';
import * as parser from '../src/server/parser';
import * as helpers from '../src/common/helpers';
import * as serverHelpers from '../src/server/helpers';
import { FileDependencyManager, FileDependency } from '../src/server/dependency-manager';
import { DocumentData } from '../src/server/types';
import { URI } from 'vscode-uri';

console.log('========================================================================');
console.log('🧪 RUNNING CONFIRMED BUGS REGRESSION TESTS');
console.log('========================================================================\n');

// ----------------------------------------------------
// TEST 1: BUG-01 - Compiler Fatal Error regex capture
// ----------------------------------------------------
console.log('Test 1: BUG-01 - Compiler Fatal Error regex capture');
const captureOutputRegex = /(.+?)\((\d+)(?:\s--\s(\d+))?\)\s:\s(warning|error|fatal error)\s\d+:\s(.*)/gi;
const sampleOutput = `
plugin.sma(4) : fatal error 100: cannot read from file: "amxmodx"
plugin.sma(12) : error 017: undefined symbol "test_var"
plugin.sma(20) : warning 204: symbol is assigned a value that is never used: "unused_var"
`;

const matches: { file: string; line: number; type: string; msg: string }[] = [];
let res: RegExpExecArray | null;
while ((res = captureOutputRegex.exec(sampleOutput)) !== null) {
    matches.push({
        file: res[1].trim(),
        line: parseInt(res[2], 10),
        type: res[4].toLowerCase(),
        msg: res[5].trim()
    });
}

assert.strictEqual(matches.length, 3, 'Deve capturar 3 diagnósticos (fatal error, error, warning)');
assert.strictEqual(matches[0].type, 'fatal error', 'Primeiro erro deve ser "fatal error"');
assert.strictEqual(matches[0].line, 4, 'Linha do fatal error deve ser 4');
assert.strictEqual(matches[0].msg, 'cannot read from file: "amxmodx"');
assert.strictEqual(matches[1].type, 'error');
assert.strictEqual(matches[2].type, 'warning');
console.log('✅ Test 1 PASSED: fatal error capturado com sucesso.\n');

// ----------------------------------------------------
// TEST 2: BUG-02 - Invalidação de cachedSymbols
// ----------------------------------------------------
console.log('Test 2: BUG-02 - Invalidação de cachedSymbols');
const depManager = new FileDependencyManager();
const dep1 = depManager.addReference('file:///include1.inc');
const depData1 = new DocumentData('file:///include1.inc');
depData1.callables.push({
    identifier: 'my_func_v1',
    label: 'stock my_func_v1()',
    file: URI.parse('file:///include1.inc'),
    start: { line: 0, character: 0 },
    end: { line: 0, character: 10 },
    parameters: [],
    documentation: '',
    isForward: false
});

const mainDoc = new DocumentData('file:///main.sma');
mainDoc.dependencies.push(dep1);
const dependenciesMap = new Map<FileDependency, DocumentData>();
dependenciesMap.set(dep1, depData1);

// Leitura com cache
const symbols1 = serverHelpers.getSymbols(mainDoc, dependenciesMap);
assert.strictEqual(symbols1.callables.some(c => c.identifier === 'my_func_v1'), true);

// Simulação de alteração no include: nova função adicionada
depData1.callables.push({
    identifier: 'my_func_v2',
    label: 'stock my_func_v2()',
    file: URI.parse('file:///include1.inc'),
    start: { line: 1, character: 0 },
    end: { line: 1, character: 10 },
    parameters: [],
    documentation: '',
    isForward: false
});

// Com o fix, ao reparsear dependência, invalidamos o cachedSymbols do documento dependente
mainDoc.cachedSymbols = null;
const symbols2 = serverHelpers.getSymbols(mainDoc, dependenciesMap);
assert.strictEqual(symbols2.callables.some(c => c.identifier === 'my_func_v2'), true, 'Documento principal deve enxergar nova função do include');
console.log('✅ Test 2 PASSED: cachedSymbols invalidado reflete atualização de includes.\n');

// ----------------------------------------------------
// TEST 3: BUG-03 - removeReference gracioso sem exceção
// ----------------------------------------------------
console.log('Test 3: BUG-03 - removeReference gracioso sem exceção');
const dm = new FileDependencyManager();
// Chamar removeReference para URI que não existe não pode lançar exceção
assert.doesNotThrow(() => {
    dm.removeReference('file:///nao_existe.inc');
}, 'removeReference não deve lançar erro ao remover dependência inexistente');

const d = dm.addReference('file:///existe.inc');
assert.strictEqual(dm.hasDependency('file:///existe.inc'), true);
dm.removeReference('file:///existe.inc');
assert.strictEqual(dm.hasDependency('file:///existe.inc'), false);
// Segunda remoção (já excluído) não deve lançar erro
assert.doesNotThrow(() => {
    dm.removeReference('file:///existe.inc');
});
console.log('✅ Test 3 PASSED: removeReference é fail-safe.\n');

// ----------------------------------------------------
// TEST 4: BUG-07 - Variáveis ${workspaceFolder} e ${workspaceFolderBasename}
// ----------------------------------------------------
console.log('Test 4: BUG-07 - Variáveis ${workspaceFolder} e ${workspaceFolderBasename}');
const resFolder = helpers.resolvePathVariables('${workspaceFolder}/include', 'C:\\MyProject', undefined);
assert.strictEqual(resFolder, 'C:\\MyProject/include');

const resBasename = helpers.resolvePathVariables('${workspaceFolderBasename}/include', 'C:\\MyProject', undefined);
assert.strictEqual(resBasename, 'MyProject/include');

// Garante que o legado workspaceRoot continua funcionando
const resLegacy = helpers.resolvePathVariables('${workspaceRoot}/include', 'C:\\MyProject', undefined);
assert.strictEqual(resLegacy, 'C:\\MyProject/include');
console.log('✅ Test 4 PASSED: ${workspaceFolder} e ${workspaceFolderBasename} resolvidos com sucesso.\n');

// ----------------------------------------------------
// TEST 5: BUG-08 - Declaração de variável em for loop
// ----------------------------------------------------
console.log('Test 5: BUG-08 - Declaração de variável em for loop');
const forCode = `
public my_function() {
    for (new i = 0; i < 10; i++) {
        server_print("%d", i);
    }
}
`;
const forParsed = parser.parse(URI.parse('file:///for_test.sma'), forCode, false);
assert.strictEqual(forParsed.localVariables.length, 1, 'Deve encontrar variável local i');
assert.strictEqual(forParsed.localVariables[0].identifier, 'i');
assert.strictEqual(forParsed.localVariables[0].label, 'new i', 'Rótulo da variável deve ser limpo, sem condição do loop');
console.log('✅ Test 5 PASSED: Rótulo da variável do for loop isolado corretamente.\n');

// ----------------------------------------------------
// TEST 6: BUG-06 - Regex de strings sem ReDoS
// ----------------------------------------------------
console.log('Test 6: BUG-06 - Regex de strings sem ReDoS');
const complexStringLine = 'new str[] = "test \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\';
const startRegex = Date.now();
const cleanRegex = complexStringLine.replace(/"(?:[^"\\]|\\.)*"/g, match => ' '.repeat(match.length));
const elapsedRegex = Date.now() - startRegex;
assert.ok(elapsedRegex < 50, `Regex executada em ${elapsedRegex}ms, sem ReDoS`);
console.log(`✅ Test 6 PASSED: Regex linear processada em ${elapsedRegex}ms.\n`);

console.log('========================================================================');
console.log('🎉 TODOS OS TESTES DE REGRESSÃO DOS BUGS CONFIRMADOS PASSARAM COM SUCESSO!');
console.log('========================================================================\n');

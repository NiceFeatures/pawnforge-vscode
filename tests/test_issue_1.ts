import * as assert from 'assert';
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
console.log('🧪 RUNNING ISSUE #1 REGRESSION & FEATURE TESTS');
console.log('========================================================================\n');

// -----------------------------------------------------------------------------
// Test 1: doDefinition on definition line must return valid Location (for Ctrl+Click)
// -----------------------------------------------------------------------------
console.log('Test 1: doDefinition on definition line returns Location (Ctrl+Click support)');
{
    const code = [
        '#define MY_CONST 42',
        'new g_GlobalVar = 100;',
        '',
        'public MyFunc(param)',
        '{',
        '    new localVar = param + 1;',
        '    return localVar + g_GlobalVar + MY_CONST;',
        '}'
    ].join('\n');

    const fileUri = URI.parse('file:///test_def.sma');
    const parseResults = parser.parse(fileUri, code, false);
    const docData = new DocumentData(fileUri.toString());
    docData.callables = parseResults.callables;
    docData.values = parseResults.values;
    docData.constants = parseResults.constants;
    docData.localVariables = parseResults.localVariables;
    const depsData = new Map<FileDependency, DocumentData>();

    // 1.1: Callable definition line (line 3, "MyFunc")
    const funcPos = Position.create(3, 9);
    const funcLoc = parser.doDefinition(code, funcPos, docData, depsData);
    assert.ok(funcLoc !== null, 'doDefinition on callable declaration line should NOT be null');
    assert.strictEqual(funcLoc.range.start.line, 3, 'Location should point to definition line 3');

    // 1.2: Global variable definition line (line 1, "g_GlobalVar")
    const globalVarPos = Position.create(1, 6);
    const globalVarLoc = parser.doDefinition(code, globalVarPos, docData, depsData);
    assert.ok(globalVarLoc !== null, 'doDefinition on global variable declaration line should NOT be null');
    assert.strictEqual(globalVarLoc.range.start.line, 1, 'Location should point to line 1');

    // 1.3: Constant definition line (line 0, "MY_CONST")
    const constPos = Position.create(0, 10);
    const constLoc = parser.doDefinition(code, constPos, docData, depsData);
    assert.ok(constLoc !== null, 'doDefinition on constant declaration line should NOT be null');
    assert.strictEqual(constLoc.range.start.line, 0, 'Location should point to line 0');

    // 1.4: Local variable definition line (line 5, "localVar")
    const localVarPos = Position.create(5, 10);
    const localVarLoc = parser.doDefinition(code, localVarPos, docData, depsData);
    assert.ok(localVarLoc !== null, 'doDefinition on local variable declaration line should NOT be null');
    assert.strictEqual(localVarLoc.range.start.line, 5, 'Location should point to line 5');

    console.log('✅ Test 1 PASSED: All symbol definitions return their Location on definition line.');
}

// -----------------------------------------------------------------------------
// Test 2: findWorkspaceFiles ignores build/git/node_modules and finds .inc and .sma
// -----------------------------------------------------------------------------
console.log('\nTest 2: findWorkspaceFiles recursively discovers .inc and .sma in workspace');
{
    const tempDir = FS.mkdtempSync(Path.join(OS.tmpdir(), 'pawnforge-issue1-test-'));

    try {
        const includeDir = Path.join(tempDir, 'include');
        const nodeModulesDir = Path.join(tempDir, 'node_modules', 'some_pkg');
        const gitDir = Path.join(tempDir, '.git');

        FS.mkdirSync(includeDir, { recursive: true });
        FS.mkdirSync(nodeModulesDir, { recursive: true });
        FS.mkdirSync(gitDir, { recursive: true });

        FS.writeFileSync(Path.join(tempDir, 'test.sma'), '// plugin');
        FS.writeFileSync(Path.join(includeDir, 'test_include.inc'), '// include 1');
        FS.writeFileSync(Path.join(includeDir, 'test_include2.inc'), '// include 2');
        FS.writeFileSync(Path.join(nodeModulesDir, 'ignored.inc'), '// ignored');
        FS.writeFileSync(Path.join(gitDir, 'ignored.sma'), '// ignored');

        const foundFiles = findWorkspaceFiles(tempDir);
        const basenames = foundFiles.map(f => Path.basename(f)).sort();

        assert.strictEqual(foundFiles.length, 3, 'Should find exactly 3 workspace files');
        assert.deepStrictEqual(basenames, ['test.sma', 'test_include.inc', 'test_include2.inc'].sort());

        console.log('✅ Test 2 PASSED: findWorkspaceFiles correctly filtered files and ignored blacklisted dirs.');
    } finally {
        FS.rmSync(tempDir, { recursive: true, force: true });
    }
}

// -----------------------------------------------------------------------------
// Test 3: Issue #1 Core Scenario - References between .inc without opening .sma
// -----------------------------------------------------------------------------
console.log('\nTest 3: doReferences across .inc files without opening .sma beforehand');
{
    const inc2Content = [
        'inc_function2()',
        '{',
        '',
        '}'
    ].join('\n');

    const inc1Content = [
        '#include <test_include2>',
        '',
        'inc_function()',
        '{',
        '    inc_function2()',
        '}'
    ].join('\n');

    const smaContent = [
        '#include <test_include>',
        '',
        'public plugin_init()',
        '{',
        '    function()',
        '}',
        '',
        'function()',
        '{',
        '    inc_function()',
        '}'
    ].join('\n');

    const inc2Uri = URI.parse('file:///workspace/include/test_include2.inc').toString();
    const inc1Uri = URI.parse('file:///workspace/include/test_include.inc').toString();
    const smaUri = URI.parse('file:///workspace/test.sma').toString();

    // Editor was opened with ONLY test_include2.inc!
    const inc2Parse = parser.parse(URI.parse(inc2Uri), inc2Content, false);
    const inc2Data = new DocumentData(inc2Uri);
    inc2Data.callables = inc2Parse.callables;
    inc2Data.values = inc2Parse.values;
    inc2Data.constants = inc2Parse.constants;

    // dependenciesData is empty because test_include2.inc doesn't include anything
    const emptyDepsData = new Map<FileDependency, DocumentData>();

    // Candidate URIs discovered from workspace
    const candidateUris = [inc1Uri, smaUri];

    // File content provider (reading from disk or cache)
    const contentMap = new Map<string, string>();
    contentMap.set(inc2Uri, inc2Content);
    contentMap.set(inc1Uri, inc1Content);
    contentMap.set(smaUri, smaContent);
    const getIncludeContent = (uri: string) => contentMap.get(uri) || null;

    // 3.1: Cursor on definition of "inc_function2" at line 0, char 2 in test_include2.inc
    // The definition itself must be EXCLUDED from the list because cursor is at the definition!
    const posDef = Position.create(0, 2);
    const refsFromDef = parser.doReferences(
        inc2Content,
        posDef,
        inc2Uri,
        inc2Data,
        emptyDepsData,
        getIncludeContent,
        candidateUris
    );

    assert.strictEqual(refsFromDef.length, 1, `Expected 1 reference (usage only), found ${refsFromDef.length}`);
    const hasInc2DefFromDef = refsFromDef.some(r => r.uri === inc2Uri && r.range.start.line === 0);
    const hasInc1UsageFromDef = refsFromDef.some(r => r.uri === inc1Uri && r.range.start.line === 4);
    assert.strictEqual(hasInc2DefFromDef, false, 'References invoked from definition must NOT include definition itself');
    assert.ok(hasInc1UsageFromDef, 'References must include usage in test_include.inc');

    // 3.2: Cursor on usage of "inc_function2" at line 4, char 6 in test_include.inc
    // The definition MUST be included when invoked from a usage site!
    const inc1Parse = parser.parse(URI.parse(inc1Uri), inc1Content, false);
    const inc1Data = new DocumentData(inc1Uri);
    inc1Data.callables = inc1Parse.callables;
    inc1Data.values = inc1Parse.values;
    inc1Data.constants = inc1Parse.constants;

    const posUsage = Position.create(4, 6);
    const refsFromUsage = parser.doReferences(
        inc1Content,
        posUsage,
        inc1Uri,
        inc1Data,
        emptyDepsData,
        getIncludeContent,
        [inc2Uri, smaUri]
    );

    assert.strictEqual(refsFromUsage.length, 2, `Expected 2 references (def + usage), found ${refsFromUsage.length}`);
    const hasInc2DefFromUsage = refsFromUsage.some(r => r.uri === inc2Uri && r.range.start.line === 0);
    const hasInc1UsageFromUsage = refsFromUsage.some(r => r.uri === inc1Uri && r.range.start.line === 4);
    assert.ok(hasInc2DefFromUsage, 'References invoked from usage MUST include definition in test_include2.inc');
    assert.ok(hasInc1UsageFromUsage, 'References invoked from usage MUST include call site in test_include.inc');

    console.log('✅ Test 3 PASSED: Definition excluded when invoked at definition, and included when invoked at usage.');
}

// -----------------------------------------------------------------------------
// Test 4: Local variable references are strictly scoped to the enclosing function
// -----------------------------------------------------------------------------
console.log('\nTest 4: Local variable references are strictly scoped to the enclosing function');
{
    const code = [
        'public func1()',
        '{',
        '    new count = 1;',
        '    count++;',
        '}',
        '',
        'public func2()',
        '{',
        '    new count = 10;',
        '    count++;',
        '}'
    ].join('\n');

    const fileUri = URI.parse('file:///test_scope.sma');
    const parseResults = parser.parse(fileUri, code, false);
    const docData = new DocumentData(fileUri.toString());
    docData.localVariables = parseResults.localVariables;
    const depsData = new Map<FileDependency, DocumentData>();

    // 4.1: Cursor on local variable declaration line (line 2) -> excludes declaration, returns 1 usage
    const posDecl = Position.create(2, 9);
    const refsFromDecl = parser.doReferences(code, posDecl, fileUri.toString(), docData, depsData);
    assert.strictEqual(refsFromDecl.length, 1, `Expected 1 reference from declaration, found ${refsFromDecl.length}`);
    assert.strictEqual(refsFromDecl[0].range.start.line, 3);

    // 4.2: Cursor on local variable usage line (line 3) -> includes declaration and usage (2 references)
    const posUse = Position.create(3, 5);
    const refsFromUse = parser.doReferences(code, posUse, fileUri.toString(), docData, depsData);
    assert.strictEqual(refsFromUse.length, 2, `Expected 2 references from usage, found ${refsFromUse.length}`);
    assert.ok(refsFromUse.every(r => r.range.start.line === 2 || r.range.start.line === 3));

    console.log('✅ Test 4 PASSED: Local variable references correctly scoped and filtered.');
}


console.log('\n========================================================================');
console.log('🎉 ALL ISSUE #1 TESTS PASSED SUCCESSFULLY!');
console.log('========================================================================\n');

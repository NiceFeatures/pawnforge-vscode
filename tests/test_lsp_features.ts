import * as parser from '../src/server/parser';
import { URI } from 'vscode-uri';
import { DocumentData } from '../src/server/types';
import { FileDependency } from '../src/server/dependency-manager';
import * as assert from 'assert';

console.log('=== RUNNING LSP FEATURES TESTS ===\n');

// 1. Test Folding Ranges
console.log('Test 1: Folding Ranges');
const codeForFolding = `
#if defined DEBUG
    #define LOG_MSG "debugging"
#else
    #define LOG_MSG "release"
#endif

/*
    Multi-line block comment
    testing folding
*/

public MyFunction(id) {
    if (id > 0) {
        server_print("Hello");
    }
}
`;

const foldingRanges = parser.doFoldingRanges(codeForFolding);
console.log('Folding Ranges detected:', foldingRanges.length);
assert.ok(foldingRanges.length >= 3, 'Should detect at least 3 folding ranges (preprocessor, comment, functions/braces)');
console.log('✅ Folding Ranges Test PASSED');

// 2. Test Document Highlights
console.log('\nTest 2: Document Highlight');
const codeForHighlight = `
new g_MyCounter = 0;

public Increment() {
    g_MyCounter++;
    server_print("Counter is %d", g_MyCounter);
}
`;

const fileUri = URI.parse('file:///test_highlight.sma');
const parseResults = parser.parse(fileUri, codeForHighlight, false);
const docData = new DocumentData(fileUri.toString());
docData.values = parseResults.values;
docData.callables = parseResults.callables;
docData.constants = parseResults.constants;

const depsData = new Map<FileDependency, DocumentData>();

// Cursor at g_MyCounter at line 1, col 5
const highlights = parser.doDocumentHighlight(codeForHighlight, { line: 1, character: 5 }, docData, depsData);
console.log('Document Highlights found:', highlights.length);
assert.strictEqual(highlights.length, 3, 'Should find 3 occurrences of g_MyCounter (declaration + 2 usages)');
console.log('✅ Document Highlight Test PASSED');

// 3. Test Workspace Symbols
console.log('\nTest 3: Workspace Symbols');
const openDocs = new Map<string, DocumentData>();
openDocs.set(fileUri.toString(), docData);

const foundSymbols = parser.doWorkspaceSymbols('Counter', openDocs, depsData);
console.log('Workspace Symbols found for "Counter":', foundSymbols.map(s => s.name));
assert.strictEqual(foundSymbols.length, 1);
assert.strictEqual(foundSymbols[0].name, 'g_MyCounter');

const foundFuncs = parser.doWorkspaceSymbols('Increment', openDocs, depsData);
console.log('Workspace Symbols found for "Increment":', foundFuncs.map(s => s.name));
assert.strictEqual(foundFuncs.length, 1);
assert.strictEqual(foundFuncs[0].name, 'Increment');
console.log('✅ Workspace Symbols Test PASSED');

console.log('\n🎉 ALL LSP FEATURE TESTS PASSED SUCCESSFULLY!');

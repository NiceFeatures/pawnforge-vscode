import * as Parser from './src/server/parser';
import * as Types from './src/server/types';
import { URI } from 'vscode-uri';

// =================================================================
// TEST 1: new const variable should NOT be classified as enumMember
// =================================================================
console.log("=== TEST 1: new const variable classification ===\n");

const content1 = `
new const TEST_ARR[5][5] = {
    "ONE",
    "TWO",
    "THREE",
};

main() {
    server_print(TEST_ARR[0]);
}
`;

const fileUri = URI.parse('file://test.sma');
const results1 = Parser.parse(fileUri, content1, false);

console.log("Values (should contain TEST_ARR):");
results1.values.forEach(v => console.log(`  ${v.identifier} isConst=${v.isConst}`));

console.log("\nConstants (should NOT contain TEST_ARR):");
results1.constants.forEach(c => console.log(`  ${c.identifier} label="${c.label}"`));

const data1 = new Types.DocumentData(fileUri.toString());
data1.callables = results1.callables;
data1.values = results1.values;
data1.constants = results1.constants;
data1.semanticTokens = results1.semanticTokens;
data1.localVariables = results1.localVariables;

console.log("\nUsage tokens for TEST_ARR:");
const tokens1 = Parser.getUsageTokens(content1, data1, new Map());
const testArrTokens = tokens1.filter(t => {
    const lines = content1.split('\n');
    const line = lines[t.line];
    return line && line.substring(t.char, t.char + t.length) === 'TEST_ARR';
});
testArrTokens.forEach(t => {
    const typeName = Types.SemanticTokenTypes[t.tokenType];
    console.log(`  Line ${t.line}: type=${t.tokenType}(${typeName}) modifier=${t.tokenModifiers}`);
    if (t.tokenType === 3) {
        console.log("  ❌ FAIL: Classified as enumMember!");
    } else if (t.tokenType === 2) {
        console.log("  ✅ PASS: Classified as variable");
    }
});

// =================================================================
// TEST 2: Functions inside /* */ should be ignored
// =================================================================
console.log("\n=== TEST 2: Block comment /* */ should skip functions ===\n");

const content2 = `
/*
public Func1 (){

}

public Func2 (){

}*/

public Func3() {

}
`;

const results2 = Parser.parse(fileUri, content2, false);

console.log("Parsed callables:");
results2.callables.forEach(c => console.log(`  ${c.identifier}`));

const hasFunc1 = results2.callables.some(c => c.identifier === 'Func1');
const hasFunc2 = results2.callables.some(c => c.identifier === 'Func2');
const hasFunc3 = results2.callables.some(c => c.identifier === 'Func3');

console.log(`\nFunc1 parsed: ${hasFunc1} ${hasFunc1 ? '❌ FAIL (should be skipped)' : '✅ PASS (skipped)'}`);
console.log(`Func2 parsed: ${hasFunc2} ${hasFunc2 ? '❌ FAIL (should be skipped)' : '✅ PASS (skipped)'}`);
console.log(`Func3 parsed: ${hasFunc3} ${hasFunc3 ? '✅ PASS (should be parsed)' : '❌ FAIL (should be parsed)'}`);

// =================================================================
// TEST 3: Variables inside /* */ should be ignored
// =================================================================
console.log("\n=== TEST 3: Variables inside /* */ should be ignored ===\n");

const content3 = `
/*
new g_CommentedVar = 5;
*/
new g_RealVar = 10;
`;

const results3 = Parser.parse(fileUri, content3, false);

console.log("Parsed values:");
results3.values.forEach(v => console.log(`  ${v.identifier}`));

const hasCommentedVar = results3.values.some(v => v.identifier === 'g_CommentedVar');
const hasRealVar = results3.values.some(v => v.identifier === 'g_RealVar');

console.log(`\ng_CommentedVar parsed: ${hasCommentedVar} ${hasCommentedVar ? '❌ FAIL' : '✅ PASS'}`);
console.log(`g_RealVar parsed: ${hasRealVar} ${hasRealVar ? '✅ PASS' : '❌ FAIL'}`);

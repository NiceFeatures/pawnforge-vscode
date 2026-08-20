import * as parser from './src/server/parser';
import * as VSCLS from 'vscode-languageserver';
import { URI } from 'vscode-uri';

const code = `
#include <amxmodx>

native format(output[], len, const format[], any:...);
native get_user_name(index, name[], len);

new Array:Exclusions;
static Bad_Words_Count = 0;
static Exclusions_Count = 0;

public plugin_init() {
    new Config_Path[96];
    format (Config_Path, charsmax(Config_Path), "an string");
    
    if (true) {
        return 1;
    }
    return 0;
}
`;

console.log("Starting tests...");
const data = parser.parse(URI.parse('file:///test_orchestrate.sma'), code, false);
console.log("Parsing succeeded. Found callables: " + data.callables.length);

// Test 1: format parameters in doSignatures
const formatPos = VSCLS.Position.create(12, 53); // Line 12 (0-indexed 12 is line 13), but in the string it's:
// Line 11: "    format (Config_Path, charsmax(Config_Path), "an string");"
// Let's use parser to find the exact index.
const lines = code.split('\n');
const lineIndex = lines.findIndex(l => l.includes('format (Config_Path'));
const charIndex = lines[lineIndex].indexOf('"an string"');
const formatPosDynamic = VSCLS.Position.create(lineIndex, charIndex + 2);

const sigHelp = parser.doSignatures(code, formatPosDynamic, data.callables);
console.log("Signature active parameter for 'format': " + (sigHelp ? sigHelp.activeParameter : "null"));

// Test 2: return keyword hover
const returnLine = lines.findIndex(l => l.includes('return 1;'));
const returnChar = lines[returnLine].indexOf('return');
const returnPos = VSCLS.Position.create(returnLine, returnChar + 2);

const hover = parser.doHover(code, returnPos, data as any, new Map());
console.log("Hover for 'return': " + (hover ? "Found" : "Ignored correctly"));

// Test 3: return keyword definition
const def = parser.doDefinition(code, returnPos, data as any, new Map());
console.log("Definition for 'return': " + (def ? "Found" : "Ignored correctly"));

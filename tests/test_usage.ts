import * as parser from '../src/server/parser';
import { URI } from 'vscode-uri';
import { DocumentData } from '../src/server/types';

const code = `
new const TEST_ARR[5][5] = {
    "ONE",
    "TWO",
    "THREE",
};

public plugin_init() {
    server_print("%s", TEST_ARR[0]);
}
`;

const fileUri = URI.parse('file:///test.sma');
const data = new DocumentData(fileUri.toString());
const results = parser.parse(fileUri, code, false);
data.values = results.values;
data.constants = results.constants;
data.callables = results.callables;
data.semanticTokens = results.semanticTokens;

const deps = new Map();
const usageTokens = parser.getUsageTokens(code, data, deps);

console.log("Usage Tokens:");
console.log(JSON.stringify(usageTokens, null, 2));

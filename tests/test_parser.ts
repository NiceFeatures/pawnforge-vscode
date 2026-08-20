import * as parser from '../src/server/parser';
import { URI } from 'vscode-uri';

const code = `
new const TEST_ARR[5][5] = {
    "ONE",
    "TWO",
    "THREE",
};
`;

const results = parser.parse(URI.parse('file:///test.sma'), code, false);
console.log(JSON.stringify(results, null, 2));

import { Location, Position } from 'vscode-languageserver';

function findIdentifierOccurrences(content: string, identifier: string, searchInStrings: boolean = false) {
    const lines = content.split(/\r?\n/);
    const escapedId = identifier.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(?<![a-zA-Z0-9_@])${escapedId}(?![a-zA-Z0-9_@])`, 'g');
    
    let inBlockComment = false;
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        
        let cleanLine = line.replace(/\/\/.*/, match => ' '.repeat(match.length));
        if (!searchInStrings) {
            cleanLine = cleanLine.replace(/"([^"\\]*(?:\\.[^"\\]*)*)"/g, match => ' '.repeat(match.length));
            cleanLine = cleanLine.replace(/'([^'\\]*(?:\\.[^'\\]*)*)'/g, match => ' '.repeat(match.length));
        }

        let match;
        while ((match = regex.exec(cleanLine)) !== null) {
            console.log(`Match found at line ${i}, col ${match.index} (searchInStrings=${searchInStrings})`);
        }
    }
}

const content = `
new my_var = 10;
public my_func() {
    my_var = 20;
    server_print("my_var = %d", my_var);
}
`;

console.log("Without searchInStrings:");
findIdentifierOccurrences(content, "my_var", false);

console.log("\\nWith searchInStrings:");
findIdentifierOccurrences(content, "my_var", true);

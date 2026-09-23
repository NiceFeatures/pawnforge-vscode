import * as Path from 'path';
import * as FS from 'fs';
import { URI } from 'vscode-uri';

function substituteVariables(variable: string, workspacePath: string | undefined, filePath: string | undefined): string | undefined {
    if (variable.startsWith('env:')) {
        const envName = variable.slice('env:'.length);
        return process.env[envName];
    }

    switch(variable) {
        case 'workspaceRoot':
        case 'workspaceFolder':
            return workspacePath;
        case 'workspaceRootFolderName':
        case 'workspaceFolderBasename':
            return workspacePath !== undefined ? Path.win32.basename(workspacePath) : undefined;
        case 'file': return filePath;
        case 'relativeFile':
            if (workspacePath === undefined || filePath === undefined) return undefined;
            return workspacePath.includes('\\') || filePath.includes('\\')
                ? Path.win32.relative(workspacePath, filePath)
                : Path.relative(workspacePath, filePath);
        case 'fileBasename': return filePath !== undefined ? Path.win32.basename(filePath) : undefined;
        case 'fileBasenameNoExtension': {
            if (filePath === undefined) return undefined;
            const base = Path.win32.basename(filePath);
            const extIndex = base.lastIndexOf('.');
            if (extIndex > 0) {
                return base.substring(0, extIndex);
            }
            return base;
        }
        case 'fileDirname': return filePath !== undefined ? (filePath.includes('\\') ? Path.win32.dirname(filePath) : Path.dirname(filePath)) : undefined;
        case 'fileExtname': return filePath !== undefined ? (filePath.includes('\\') ? Path.win32.extname(filePath) : Path.extname(filePath)) : undefined;
        default: return undefined;
    }
}

export function resolvePathVariables(path: string, workspacePath: string | undefined, filePath: string | undefined): string {
    let index = 0;
    let finalPath = '';

    while(index < path.length) {
        if(path[index] === '$' && path[index + 1] === '{') {
            const startIndex = index;
            index += 2;
            const endIndex = path.indexOf('}', index);
            
            if (endIndex === -1) { // Não encontrou '}'
                finalPath += path.substring(startIndex);
                break;
            }

            const variableName = path.substring(index, endIndex).trim();
            const substitution = substituteVariables(variableName, workspacePath, filePath);

            if(substitution !== undefined) {
                finalPath += substitution;
            } else {
                finalPath += path.substring(startIndex, endIndex + 1); // Mantém a variável se não for resolvida
            }
            index = endIndex + 1;
        } else {
            finalPath += path[index++];
        }
    }

    return finalPath;
}

export function resolvePathPattern(path: string): string[] {
    if (!path.includes('*')) {
        return FS.existsSync(path) ? [path] : [];
    }

    const isAbsolute = Path.isAbsolute(path);
    const root = isAbsolute ? Path.parse(path).root : '';
    const relativePart = isAbsolute ? path.slice(root.length) : path;
    const segments = relativePart.split(/[\\/]/).filter((s) => s.length > 0);
    const initialBase = isAbsolute ? root : '.';

    return expand(segments, initialBase).sort();
}

function expand(segments: string[], base: string): string[] {
    if (segments.length === 0) {
        return isDirectory(base) ? [base] : [];
    }

    const [segment, ...rest] = segments;

    if (segment === '**') {
        let entries: FS.Dirent[];
        try {
            entries = FS.readdirSync(base, { withFileTypes: true });
        } catch {
            return [];
        }

        const results: string[] = [];
        // Considera a base atual (0 níveis)
        results.push(...expand(rest, base));
        // Recursão para cada subdiretório
        for (const entry of entries) {
            if (!entry.isDirectory()) continue;
            if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
            results.push(...expand(segments, Path.join(base, entry.name)));
        }
        return results;
    }

    if (segment === '*') {
        let entries: FS.Dirent[];
        try {
            entries = FS.readdirSync(base, { withFileTypes: true });
        } catch {
            return [];
        }

        const results: string[] = [];
        for (const entry of entries) {
            if (!entry.isDirectory()) continue;
            if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
            results.push(...expand(rest, Path.join(base, entry.name)));
        }
        return results;
    }

    const nextBase = Path.join(base, segment);
    if (!isDirectory(nextBase)) {
        return [];
    }
    return expand(rest, nextBase);
}

function isDirectory(p: string): boolean {
    try {
        return FS.statSync(p).isDirectory();
    } catch {
        return false;
    }
}

export function hasIncludeFiles(dirPath: string, maxDepth: number = 10, memo?: Map<string, boolean>): boolean {
    if (maxDepth < 0) return false;
    const normalized = Path.normalize(dirPath);
    if (memo && memo.has(normalized)) {
        return memo.get(normalized)!;
    }
    try {
        const entries = FS.readdirSync(dirPath, { withFileTypes: true });
        for (const entry of entries) {
            if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
            if (entry.isFile() && entry.name.toLowerCase().endsWith('.inc')) {
                if (memo) memo.set(normalized, true);
                return true;
            }
            if (entry.isDirectory()) {
                if (hasIncludeFiles(Path.join(dirPath, entry.name), maxDepth - 1, memo)) {
                    if (memo) memo.set(normalized, true);
                    return true;
                }
            }
        }
        if (memo) memo.set(normalized, false);
        return false;
    } catch {
        if (memo) memo.set(normalized, false);
        return false;
    }
}

export function resolveIncludeDirectories(
    rawIncludePaths: string[],
    workspacePath: string | undefined,
    filePath: string | undefined
): string[] {
    const resultDirs: string[] = [];
    const memo = new Map<string, boolean>();

    for (const rawPath of rawIncludePaths) {
        if (!rawPath || typeof rawPath !== 'string') continue;
        const resolvedPath = resolvePathVariables(rawPath, workspacePath, filePath);
        if (!resolvedPath) continue;

        if (!rawPath.includes('*')) {
            // Explicit path: keep if it exists and is a directory
            if (FS.existsSync(resolvedPath)) {
                try {
                    if (FS.statSync(resolvedPath).isDirectory()) {
                        resultDirs.push(Path.normalize(resolvedPath));
                    }
                } catch { /* ignore */ }
            }
        } else {
            // Wildcard pattern: expand and filter directories containing .inc files (directly or in subdirectories)
            const expandedDirs = resolvePathPattern(resolvedPath);
            for (const dir of expandedDirs) {
                if (hasIncludeFiles(dir, 10, memo)) {
                    resultDirs.push(Path.normalize(dir));
                }
            }
        }
    }

    return [...new Set(resultDirs)];
}

const IGNORED_DIRECTORIES = new Set([
    'node_modules',
    'build',
    'dist',
    'out',
    'bin',
    '.git',
    '.vscode',
    '.agent',
    '.agents',
    '.system_generated'
]);

export function findWorkspaceFiles(workspacePath: string, maxDepth: number = 10, maxFiles: number = 2000): string[] {
    const results: string[] = [];
    if (!workspacePath || !FS.existsSync(workspacePath)) return results;

    function walk(currentDir: string, currentDepth: number) {
        if (currentDepth > maxDepth || results.length >= maxFiles) return;

        let entries: FS.Dirent[];
        try {
            entries = FS.readdirSync(currentDir, { withFileTypes: true });
        } catch {
            return;
        }

        for (const entry of entries) {
            if (results.length >= maxFiles) break;

            if (entry.isDirectory()) {
                if (entry.name.startsWith('.') || IGNORED_DIRECTORIES.has(entry.name.toLowerCase())) {
                    continue;
                }
                walk(Path.join(currentDir, entry.name), currentDepth + 1);
            } else if (entry.isFile()) {
                const lower = entry.name.toLowerCase();
                if (lower.endsWith('.sma') || lower.endsWith('.inc')) {
                    results.push(Path.normalize(Path.join(currentDir, entry.name)));
                }
            }
        }
    }

    try {
        const stat = FS.statSync(workspacePath);
        if (stat.isDirectory()) {
            walk(workspacePath, 0);
        }
    } catch { /* ignore */ }

    return results;
}

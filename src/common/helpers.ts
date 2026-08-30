import * as Path from 'path';
import * as FS from 'fs';
import { URI } from 'vscode-uri';

function substituteVariables(variable: string, workspacePath: string | undefined, filePath: string | undefined): string | undefined {
    if (variable.startsWith('env:')) {
        const envName = variable.slice('env:'.length);
        return process.env[envName];
    }

    switch(variable) {
        case 'workspaceRoot': return workspacePath;
        case 'workspaceRootFolderName': return workspacePath !== undefined ? Path.basename(workspacePath) : undefined;
        case 'file': return filePath;
        case 'relativeFile': return (workspacePath !== undefined && filePath !== undefined) ? Path.relative(workspacePath, filePath) : undefined;
        case 'fileBasename': return filePath !== undefined ? Path.basename(filePath) : undefined;
        case 'fileBasenameNoExtension':
            if(filePath === undefined) return undefined;

            const extIndex = filePath.lastIndexOf('.');
            if(extIndex > 0) {
                return Path.basename(filePath.substring(0, extIndex));
            }
            return Path.basename(filePath);
        case 'fileDirname': return filePath !== undefined ? Path.dirname(filePath) : undefined;
        case 'fileExtname': return filePath !== undefined ? Path.extname(filePath) : undefined;
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
    const segments = path.split(/[\\/]/).filter((s) => s.length > 0);
    const initialBase = isAbsolute ? Path.parse(path).root : '.';

    return expand(segments.slice(isAbsolute ? 1 : 0), initialBase).sort();
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

export function hasIncludeFiles(dirPath: string, maxDepth: number = 10): boolean {
    if (maxDepth < 0) return false;
    try {
        const entries = FS.readdirSync(dirPath, { withFileTypes: true });
        for (const entry of entries) {
            if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
            if (entry.isFile() && entry.name.toLowerCase().endsWith('.inc')) {
                return true;
            }
            if (entry.isDirectory()) {
                if (hasIncludeFiles(Path.join(dirPath, entry.name), maxDepth - 1)) {
                    return true;
                }
            }
        }
        return false;
    } catch {
        return false;
    }
}

export function resolveIncludeDirectories(
    rawIncludePaths: string[],
    workspacePath: string | undefined,
    filePath: string | undefined
): string[] {
    const resultDirs: string[] = [];

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
                if (hasIncludeFiles(dir)) {
                    resultDirs.push(Path.normalize(dir));
                }
            }
        }
    }

    return [...new Set(resultDirs)];
}
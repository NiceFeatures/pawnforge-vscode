import * as assert from 'assert';
import * as FS from 'fs';
import * as Path from 'path';
import * as OS from 'os';
import { resolveIncludeDirectories, hasIncludeFiles, resolvePathVariables, resolvePathPattern } from '../src/common/helpers';
import * as parser from '../src/server/parser';
import { URI } from 'vscode-uri';
import { DocumentData } from '../src/server/types';
import { FileDependency } from '../src/server/dependency-manager';

console.log('=== RUNNING INCLUDE RESOLUTION & SUBDIRECTORY TESTS ===\n');

const tempDir = FS.mkdtempSync(Path.join(OS.tmpdir(), 'amxx-include-test-'));

try {
    // Setup test directory structure matching client report:
    // workspaceRoot/
    //   plugin.sma
    //   src/
    //     Helper/
    //       DataLoader.inc
    //   assets/
    //     sprites/
    //       logo.spr
    const workspaceRoot = tempDir;
    const srcDir = Path.join(workspaceRoot, 'src');
    const helperDir = Path.join(srcDir, 'Helper');
    const assetsDir = Path.join(workspaceRoot, 'assets', 'sprites');
    const pluginPath = Path.join(workspaceRoot, 'plugin.sma');

    FS.mkdirSync(helperDir, { recursive: true });
    FS.mkdirSync(assetsDir, { recursive: true });

    FS.writeFileSync(Path.join(helperDir, 'DataLoader.inc'), 'stock load() {}\n');
    FS.writeFileSync(Path.join(assetsDir, 'logo.spr'), 'sprite data\n');
    FS.writeFileSync(pluginPath, '#include <amxmodx>\n#include <Helper/DataLoader>\npublic plugin_init() { load(); }\n');

    console.log('Test 1: hasIncludeFiles checks direct and nested subdirectories');
    assert.strictEqual(hasIncludeFiles(srcDir), true, 'src directory contains nested .inc in Helper/');
    assert.strictEqual(hasIncludeFiles(helperDir), true, 'Helper directory directly contains DataLoader.inc');
    assert.strictEqual(hasIncludeFiles(assetsDir), false, 'assets directory has no .inc files');
    console.log('✅ Test 1 PASSED: hasIncludeFiles correctly identified nested .inc files');

    console.log('\nTest 2: Explicit configured include path "${workspaceRoot}/src" without root .inc');
    const resolvedExplicit = resolveIncludeDirectories(['${workspaceRoot}/src'], workspaceRoot, pluginPath);
    console.log('Resolved explicit paths:', resolvedExplicit);
    assert.strictEqual(resolvedExplicit.length, 1);
    assert.strictEqual(Path.normalize(resolvedExplicit[0]), Path.normalize(srcDir));
    console.log('✅ Test 2 PASSED: Explicit path preserved for compilation');

    console.log('\nTest 3: Glob include path "${workspaceRoot}/src/**"');
    const resolvedGlob = resolveIncludeDirectories(['${workspaceRoot}/src/**'], workspaceRoot, pluginPath);
    console.log('Resolved glob paths:', resolvedGlob);
    assert.ok(resolvedGlob.map(p => Path.normalize(p)).includes(Path.normalize(srcDir)), 'Should include src root');
    assert.ok(resolvedGlob.map(p => Path.normalize(p)).includes(Path.normalize(helperDir)), 'Should include Helper subdir');
    console.log('✅ Test 3 PASSED: Glob pattern resolved both root and nested subdirectories');

    console.log('\nTest 4: Workspace wide glob "${workspaceRoot}/**" prunes dead directories');
    const resolvedWorkspaceGlob = resolveIncludeDirectories(['${workspaceRoot}/**'], workspaceRoot, pluginPath);
    console.log('Resolved workspace glob paths:', resolvedWorkspaceGlob);
    const normalizedWorkspaceGlob = resolvedWorkspaceGlob.map(p => Path.normalize(p));
    assert.ok(normalizedWorkspaceGlob.includes(Path.normalize(srcDir)), 'Should include src');
    assert.ok(normalizedWorkspaceGlob.includes(Path.normalize(helperDir)), 'Should include Helper');
    assert.ok(!normalizedWorkspaceGlob.includes(Path.normalize(assetsDir)), 'Should NOT include assets/sprites (no .inc files)');
    console.log('✅ Test 4 PASSED: Dead directories successfully pruned from wildcard expansions');

    console.log('\nTest 5: Subdirectory include autocompletion');
    const docData = new DocumentData(URI.file(pluginPath).toString());
    const depsData = new Map<FileDependency, DocumentData>();
    const mockConnection: any = {};

    const completionCode = '#include <';
    const completions = parser.doCompletions(
        mockConnection,
        completionCode,
        { line: 0, character: 10 },
        docData,
        depsData,
        [srcDir]
    );

    assert.ok(completions !== null, 'Completions should not be null');
    const labels = completions.map(c => c.label);
    console.log('Include completion labels found:', labels);
    assert.ok(labels.includes('Helper/DataLoader'), 'Should suggest Helper/DataLoader from src directory');
    console.log('✅ Test 5 PASSED: Autocomplete offers nested include paths');

    console.log('\n🎉 ALL INCLUDE RESOLUTION TESTS PASSED SUCCESSFULLY!');
} finally {
    // Cleanup temporary directory
    try {
        FS.rmSync(tempDir, { recursive: true, force: true });
    } catch { /* ignore */ }
}

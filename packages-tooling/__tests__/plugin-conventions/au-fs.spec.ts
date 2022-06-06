// import { AuFileSystem } from '@aurelia/plugin-conventions';
// import * as assert from 'assert';
// import { createMockFs } from './mock-fs';

// describe('plugin-conventions/au-filesystem.spec.ts', function () {
//   it('creates project with all files when given a file', function () {
//     const filePath = 'my-file.ts';
//     const relevantPaths = ['my-file.html', 'my-file.css', 'my-file.view.html'];

//     const auFs = new AuFileSystem(createMockFs({
//       statSync: (path: string) => ({ isFile: () => true }) as any,
//       existsSync: (path: string) => relevantPaths.includes(path),
//       readdirSync: () => [filePath, ...relevantPaths].map(p => p) as any,
//     }));

//     const project = auFs.createProject(filePath);
//     assert.deepStrictEqual({ basePath: project.basePath, files: project.files }, {
//       basePath: filePath,
//       files: [
//         { path: 'my-file.ts', ext: '.ts', type: 'code' },
//         { path: 'my-file.html', ext: '.html', type: 'template' },
//         { path: 'my-file.css', ext: '.css', type: 'styles' },
//         { path: 'my-file.view.html', ext: '.html', type: 'view' },
//       ]
//     });
//   });

//   it('creates project with all files when given a directory', function () {
//     const dirPath = 'dir';
//     const relevantPaths = ['my-file.ts', 'your-file.html', 'nothing']
//       .map(p => `dir/${p}`);

//     const auFs = new AuFileSystem(createMockFs({
//       statSync: (path: string) => ({ isFile: () => false }) as any,
//       existsSync: (path: string) => relevantPaths.includes(path),
//       readdirSync: () => relevantPaths.map(p => p) as any,
//     }));

//     const project = auFs.createProject(dirPath);
//     assert.deepStrictEqual({ basePath: project.basePath, files: project.files }, {
//       basePath: dirPath,
//       files: [
//         { path: 'dir/my-file.ts', ext: '.ts', type: 'code' },
//         { path: 'dir/your-file.html', ext: '.html', type: 'template' },
//         { path: 'dir/nothing', ext: '', type: 'unknown' }
//       ]
//     });
//   });
// });

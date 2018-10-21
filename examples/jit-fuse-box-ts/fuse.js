const { FuseBox, HTMLPlugin, EnvPlugin, UglifyJSPlugin, QuantumPlugin, WebIndexPlugin } = require("fuse-box");
const { src, task } = require("fuse-box/sparky");

let run = (production) => {
    const fuse = FuseBox.init({
        target: "browser@es6",
        homeDir: 'src',
        output: 'dist/$name.js',
        runAllMatchedPlugins: true,
        plugins: [
            production && UglifyJSPlugin(),
            production && QuantumPlugin(),
            EnvPlugin({
                devMode: !production
            }),
            HTMLPlugin(),
            WebIndexPlugin({
                template: './index.html'
            })
        ]
    });
    fuse.bundle("vendor")
        .cache(true)
        .instructions('~ startup.ts');
    if (!production) {
        fuse.bundle("app")
            .instructions(" > [startup.ts]")
            .hmr()
            .watch();
        fuse.dev();
    } else {
        fuse.bundle('app').instructions(" > [startup.ts]")
    }
    fuse.run();
};

task('clean', async () => await src('dist/*').clean('dist').exec());
task("dev",     ['clean'], () => run(false));
task("prod",    ['clean'], () => run(true));
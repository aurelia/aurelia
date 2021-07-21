const ncu = require('npm-check-updates');

var exec = require('child_process').execSync;

async function prepareDockerVolume() {
    // Check if docker volume js-framework-benchmark exists and create it if not
    try {
        let r: string[] = [];
        exec('docker volume inspect js-framework-benchmark', {
            stdio: r
        });
        console.log("docker volume js-framework-benchmark exists already");
    } catch (e) {
        let r: string[] = [];
        if (e.message.indexOf("No such volume: js-framework-benchmark")>-1) {
            console.log("Volume not found. Creating volume: docker volume create js-framework-benchmark");
            exec('docker volume create js-framework-benchmark', {
                stdio: r
            });
        } else {
            console.log("Unknown error checking volume ", e);
        }
    }
}

async function clearDockerVolume() {
    try {
        let r: string[] = [];
        exec('docker volume inspect js-framework-benchmark', {
            stdio: r
        });
    } catch (e) {
        console.log("docker volume js-framework-benchmark not found");
        return;
    }
    console.log("Remove docker volume js-framework-benchmark");
    let r: string[] = [];
    exec('docker volume rm js-framework-benchmark', {
        stdio: r
    });
}

async function stopContainerIfRunnning() {
    console.log("checking if js-framework-benchmark container runs.");
    let r : string[] = [];
    let res = exec('docker ps', {
        stdio: r
    });
    if (res.indexOf('js-framework-benchmark')>-1) {
        console.log("js-framework-benchmark container runs. Stopping this container.");
        exec('docker stop js-framework-benchmark', {
            stdio: r
        });
    }
}

async function startDocker() {
    console.log("starting docker");
    exec('docker run --rm -d -i --name js-framework-benchmark -p 8080:8080 --volume js-framework-benchmark:/build js-framework-benchmark-centos', {
        stdio: 'inherit'
    });
}

function copyFileToBuild(file: string) {
    exec(`docker cp ${file} js-framework-benchmark:/build`, {
        stdio: 'inherit'
    });
}
function dockerRootExec(cmd: string) {
    return exec(`docker exec -it -u root js-framework-benchmark ${cmd}`, {
        stdio: 'inherit'
    });
}

async function copyFilesToDocker() {
    try {
        console.log('copying build files to docker volume');
        copyFileToBuild("../build.js");
        copyFileToBuild("../css");
        copyFileToBuild("../package.json");
        copyFileToBuild("../frameworks");
        dockerRootExec('npm install');
        dockerRootExec('chown -R user:user /build');
    } catch (e) {
        console.log("copy files to docker failed. Trying to stop container js-framework-benchmark");
        stopContainerIfRunnning();
        throw e;
    }
}

async function runBuildInDocker() {
    console.log("executing npm install and node build.js in docker container");
    exec('docker exec -it -w /build js-framework-benchmark npm install', {
        stdio: 'inherit'
    });

    exec('docker exec -it -w /build js-framework-benchmark node build.js --benchmarks_only', {
        stdio: 'inherit'
    });
}

async function main() {
    stopContainerIfRunnning();
    startDocker();
    copyFilesToDocker();
    runBuildInDocker();
}

main()
    .then(text => {
    })
    .catch(err => {
        console.log('error', err);
    });

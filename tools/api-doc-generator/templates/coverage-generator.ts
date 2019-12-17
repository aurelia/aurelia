export function generateCoverage(tsconfig: string, destination: string) {
    if (destination && destination.length > 0) {
        if (destination[destination.length - 1] === '/') {
            destination = destination.substring(0, destination.length - 1);
        }
    }
}
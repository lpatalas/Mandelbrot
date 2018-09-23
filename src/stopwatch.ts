class Stopwatch {
    constructor(private readonly label: string) {
        console.time(label);
    }

    stop() {
        console.timeEnd(this.label);
    }
}
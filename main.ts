
import {Transform, Readable} from 'stream';

const alphaTransform = new class extends Transform {
    constructor() {
        super({
            objectMode: true,
            transform: (chunk: string | Buffer, encoding: string, callback: Function) => {
                let transformed: IterableIterator<string>;
                if (Buffer.isBuffer(chunk)) {
                    transformed = function* () {
                        for (const val of chunk) {
                            yield String.fromCharCode(val);
                        }
                    }();
                } else {
                    transformed = chunk[Symbol.iterator]();
                }
                callback(null,
                    Array.from(transformed).map(s => s.toUpperCase()).join(''));
            }
        });
    }
}

class LoggingStream extends Transform {
    private pending: () => void;
    private isReady = false;

    constructor(message: string) {
        super({
            objectMode: true,
            transform: (chunk: string | Buffer, encoding: string, callback: Function) => {
                if (!this.isReady) {
                    this.pending = () => {
                        console.log(message);
                        if (Buffer.isBuffer(chunk)) {
                            console.log(`[${new Date().toTimeString()}]: ${chunk.toString('utf-8')}`);
                        } else {
                            console.log(`[${new Date().toTimeString()}]: ${chunk}`);
                        }
                        callback(null, chunk);
                    }
                } else {
                    console.log(message);
                    if (Buffer.isBuffer(chunk)) {
                        console.log(`[${new Date().toTimeString()}]: ${chunk.toString('utf-8')}`);
                    } else {
                        console.log(`[${new Date().toTimeString()}]: ${chunk}`);
                    }
                    callback(null, chunk);
                }
            }
        });

        this.on('pipe', this.pauseOnPipe);
    }

    private pauseOnPipe() {
        this.removeListener('pipe', this.pauseOnPipe);
        setTimeout(() => {
            this.isReady = true;
            if (this.pending) {
                this.pending();
            }
        }, 3000);
    }
}

const reader = new class extends Readable {
    constructor(private content?: string | Buffer) {
        super({
            read: (size?: number) => {
                if (!this.content) {
                    this.push(null);
                } else {
                    this.push(this.content.slice(0, size));
                    this.content = this.content.slice(size);
                }
            }
        });
    }
} (new Buffer('The quick brown fox jumps over the lazy dog.\n'));

reader.pipe(new LoggingStream("Before transformation:"))
    .pipe(alphaTransform)
    .pipe(new LoggingStream("After transformation:"))
    .pipe(process.stdout);


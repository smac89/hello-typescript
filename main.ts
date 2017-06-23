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

let spyingAlphaTransformStream =  new class extends Transform {
    constructor() {
        super({
            objectMode: true,
            transform: (chunk: string | Buffer, encoding: string, callback: Function) => {
                console.log('Before transform:');
                if (Buffer.isBuffer(chunk)) {
                    console.log(chunk.toString('utf-8'));
                    alphaTransform.write(chunk);
                } else {
                    console.log(chunk);
                    alphaTransform.write(chunk, encoding);
                }
                callback(null, alphaTransform.read());
            }
        });

        this.on('data', (transformed) => {
            console.log('After transform:\n', transformed);
        });
    }
}

let reader = new class extends Readable {
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

reader.pipe(spyingAlphaTransformStream)
    .pipe(process.stdout);


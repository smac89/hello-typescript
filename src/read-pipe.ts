import {Readable, PassThrough} from 'stream';

export function doRead() {
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
	} (new Buffer(`This Pangram contains four a’s, one b, two c’s, one d, thirty e’s, six f’s, five g’s, seven h’s, eleven i’s, one j, one k, two l’s, two m’s, eighteen n’s, fifteen o’s, two p’s, one q, five r’s, twenty-seven s’s, eighteen t’s, two u’s, seven v’s, eight w’s, two x’s, three y’s, & one z.\n`));

	// let piped = false;

	const passReader = new PassThrough({
		objectMode: true,
		read: (size?: number) => {
			// console.log("read called!!");
			passReader.push(reader.read(size));
			// if (!piped) {
			// 	reader.pipe(passReader);
			// 	piped = true;
			// }
		}
	});

	passReader.pipe(process.stdout);
}

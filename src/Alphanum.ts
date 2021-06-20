export default function alphanum(a: string, b: string) {
	let aa = make_chunks(a.toLowerCase());
	let bb = make_chunks(b.toLowerCase());

	for (let x = 0; aa[x] && bb[x]; x++) {
		if (aa[x] !== bb[x]) {
			let c = Number(aa[x]),
				d = Number(bb[x]);
			if (c == aa[x] && d == bb[x]) {
				return c - d;
			} else return aa[x] > bb[x] ? 1 : -1;
		}
	}
	return aa.length - bb.length;
}

function make_chunks(t: string) {
	let tz = [];
	let i: number, j: string;
	let x = 0,
		y = -1,
		n = false;

	while ((i = (j = t.charAt(x++)).charCodeAt(0))) {
		let m = i === 46 || (i >= 48 && i <= 57);
		if (m !== n) {
			tz[++y] = "";
			n = m;
		}
		tz[y] += j;
	}
	return tz;
}

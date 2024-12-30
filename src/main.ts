import 'temporal-polyfill/global'

type Sub = {
	start: Temporal.Duration
	end: Temporal.Duration
	text: string[]
}
type SourcedSub = Sub & { source: Source }
type Source = 'a' | 'b'

function parseTs(ts: string) {
	const [ms, s, m, h] = ts.split(/\D+/).reverse().map(Number)
	return new Temporal.Duration(0, 0, 0, 0, h, m, s, ms)
}

function parse(srt: string): Sub[] {
	srt = srt.replaceAll(/\r?\n/g, '\n')
	const subs = [...new Set(srt.trim().split(/\n{2,}/))]

	return subs
		.map((sub) => {
			const lines = sub.split(/\n/).map((x) => x.trim())

			while (lines[0] != null) {
				if (lines[0].includes('-->')) {
					break
				} else {
					lines.shift()
				}
			}

			const [timings, ...text] = lines
			const [start, end] = timings.split(/\s*-->\s*/).map(parseTs)

			return { start, end, text }
		})
}

function overlaps(a: SourcedSub, b: SourcedSub, tolerance: number) {
	if (a.source === b.source) return false
	return Math.abs(a.start.total('millisecond') - b.start.total('millisecond')) <= tolerance
}

export function multiplex(a: string, b: string, tolerance: number) {
	const asubs = parse(a).map((x) => ({ ...x, source: 'a' as const }))
	const bsubs = parse(b).map((x) => ({ ...x, source: 'b' as const }))
	const inSubs = [...asubs, ...bsubs]
		.sort((a, b) => b.start.total('millisecond') - a.start.total('millisecond'))

	const outSubs: SourcedSub[] = []
	let next: SourcedSub

	while ((next = inSubs.pop()!) != null) {
		const prev = outSubs.at(-1)

		if (prev != null && overlaps(prev, next, tolerance)) {
			prev.text[prev.source === 'a' ? 'push' : 'unshift'](...next.text)
		} else {
			outSubs.push(next)
		}
	}

	return outSubs.map(({ source: _, ...x }) => x)
}

export function format(subs: Sub[]) {
	const pad = (digits: number) => (n: number) => n.toString().padStart(digits, '0')
	const pad2 = pad(2)
	const pad3 = pad(3)

	return subs
		.map(({ start, end, text }, idx) => {
			return [
				String(idx + 1),
				[start, end].map((d) => {
					const hours = pad2(d.hours)
					const minutes = pad2(d.minutes)
					const seconds = pad2(d.seconds)
					const milliseconds = pad3(d.milliseconds)

					return `${hours}:${minutes}:${seconds},${milliseconds}`
				}).join(' --> '),
				...text,
			].join('\n')
		})
		.join('\n\n') + '\n'
}

if (import.meta.main) {
	if (Deno.args.length !== 3) {
		throw new Error(`Wrong number of args: expected [aPath, bPath, outPath], got ${Deno.args.length}`)
	}

	const TOLERANCE = 500
	const [aPath, bPath, outPath] = Deno.args

	const a = await Deno.readTextFile(aPath)
	const b = await Deno.readTextFile(bPath)

	await Deno.writeTextFile(outPath, format(multiplex(a, b, TOLERANCE)))
}

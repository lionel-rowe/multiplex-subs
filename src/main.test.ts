import { assertEquals } from '@std/assert'
import { format, multiplex } from './main.ts'

const a =
	`3\n00:03:42,514 --> 00:03:44,473\nCan I have some money?\n\n4\n00:03:47,769 --> 00:03:49,187\nI said, "Can I have some money?"\n\n5\n00:03:49,396 --> 00:03:52,648\nKid, how many times do I have to tell you?\nI don't have money.\n\n6\n00:03:55,611 --> 00:03:57,695\nWith a car like this?\n\n7\n00:03:57,905 --> 00:04:00,531\nDo you know how many days I worked\nto buy this car?\n\n8\n00:04:01,325 --> 00:04:04,285\n- Whose cat is that?\n- It's mine.\n\n9\n00:04:06,205 --> 00:04:08,331\n2,191 days.`

const b =
	`7\n00:03:42,410 --> 00:03:44,320\n能赏我几个钱吗？\n\n\n8\n00:03:47,660 --> 00:03:49,120\n我说，能赏我几个钱吗？\n\n\n9\n00:03:49,250 --> 00:03:52,500\n孩子，要我给你说多少次？我没有钱\n\n\n10\n00:03:55,500 --> 00:03:57,630\n有钱坐汽车没钱给小孩吗？\n\n\n11\n00:03:57,750 --> 00:04:00,380\n你知道我为了买这辆车花了多少天吗？\n\n\n12\n00:04:01,200 --> 00:04:04,120\n- 谁的猫？\n- 我的\n\n13\n00:04:06,120 --> 00:04:08,200\n花了我2191天\n\n`

Deno.test('multiplex', () => {
	const out = format(multiplex(a, b, 500))

	assertEquals(
		out,
		`1\n00:03:42,410 --> 00:03:44,320\nCan I have some money?\n能赏我几个钱吗？\n\n2\n00:03:47,660 --> 00:03:49,120\nI said, "Can I have some money?"\n我说，能赏我几个钱吗？\n\n3\n00:03:49,250 --> 00:03:52,500\nKid, how many times do I have to tell you?\nI don't have money.\n孩子，要我给你说多少次？我没有钱\n\n4\n00:03:55,500 --> 00:03:57,630\nWith a car like this?\n有钱坐汽车没钱给小孩吗？\n\n5\n00:03:57,750 --> 00:04:00,380\nDo you know how many days I worked\nto buy this car?\n你知道我为了买这辆车花了多少天吗？\n\n6\n00:04:01,200 --> 00:04:04,120\n- Whose cat is that?\n- It's mine.\n- 谁的猫？\n- 我的\n\n7\n00:04:06,120 --> 00:04:08,200\n2,191 days.\n花了我2191天\n`,
	)
})

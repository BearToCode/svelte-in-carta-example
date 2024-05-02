import type { Listener, Plugin, UnifiedTransformer } from 'carta-md'
import type { Plugin as UnifiedPlugin } from 'unified'
import type * as hast from 'hast'
import { SKIP, visit } from 'unist-util-visit'
import Hashtag from './Hashtag.svelte'

export const hashtag = (): Plugin => ({
	transformers: [hashtagTransformer],
	listeners: [convertHashtags]
})

const hashtagTransformer: UnifiedTransformer<'sync'> = {
	execution: 'sync',
	type: 'rehype',
	transform({ processor }) {
		processor.use(unifiedPlugin)
	}
}

const unifiedPlugin: UnifiedPlugin<[], hast.Root> = () => {
	return function (tree) {
		visit(tree, (node, index, parent) => {
			// Skip code blocks and their children
			if (node.type === 'element' && node.tagName === 'pre') return [SKIP]
			// Skip non-text nodes
			if (node.type !== 'text') return
			const text = node as hast.Text

			// Parse the text node and replace hashtags with spans
			const regex = /#(\w+)/g
			const children: (hast.Element | hast.Text)[] = []
			let lastIndex = 0
			let match
			while ((match = regex.exec(text.value))) {
				const before = text.value.slice(lastIndex, match.index)
				if (before) {
					children.push({ type: 'text', value: before })
				}
				children.push({
					type: 'element',
					tagName: 'span',
					properties: { type: 'hashtag', value: match[1] },
					children: [{ type: 'text', value: match[0] }]
				})
				lastIndex = regex.lastIndex
			}
			if (lastIndex < text.value.length) {
				children.push({ type: 'text', value: text.value.slice(lastIndex) })
			}

			// Replace the text node with all the children
			parent!.children.splice(index!, 1, ...children)

			// Skip the children
			return [SKIP, index! + children.length]
		})
	}
}

const convertHashtags: Listener<'carta-render'> = [
	'carta-render',
	function onRender({ detail: { carta } }) {
		const rendererContainer = carta.renderer?.container
		if (!rendererContainer) return

		// Find all hashtag spans and replace them with Svelte components
		const hashtagSpans = rendererContainer.querySelectorAll('span[type="hashtag"]')
		for (const span of hashtagSpans) {
			const hashtag = span.getAttribute('value') ?? ''

			new Hashtag({
				target: span.parentElement!,
				anchor: span,
				props: { value: hashtag }
			})

			span.remove()
		}
	}
]

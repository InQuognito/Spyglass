import { integer } from '@spyglassmc/core'
import {
	any,
	as,
	boolean,
	dispatch,
	extract,
	having,
	int,
	listOf,
	literal,
	opt,
	pick,
	record,
	ref,
	resource,
	simpleString,
	string,
} from '@spyglassmc/json/lib/checker/primitives/index.js'
import {
	deprecated,
	nbt,
	nbtPath,
	stringColor,
	uuid,
	versioned,
} from '../util/index.js'

const Keybinds = [
	'key.jump',
	'key.sneak',
	'key.sprint',
	'key.left',
	'key.right',
	'key.back',
	'key.forward',
	'key.attack',
	'key.pickItem',
	'key.use',
	'key.drop',
	'key.hotbar.1',
	'key.hotbar.2',
	'key.hotbar.3',
	'key.hotbar.4',
	'key.hotbar.5',
	'key.hotbar.6',
	'key.hotbar.7',
	'key.hotbar.8',
	'key.hotbar.9',
	'key.inventory',
	'key.swapOffhand',
	'key.loadToolbarActivator',
	'key.saveToolbarActivator',
	'key.playerlist',
	'key.chat',
	'key.command',
	'key.socialInteractions',
	'key.advancements',
	'key.spectatorOutlines',
	'key.screenshot',
	'key.smoothCamera',
	'key.fullscreen',
	'key.togglePerspective',
]

const text_component_object = as('text_component', (node, ctx) =>
	record({
		...having(node, ctx, {
			text: {
				text: simpleString,
			},
			translate: {
				translate: simpleString,
				with: opt(listOf(text_component), []),
			},
			selector: {
				selector: simpleString, // TODO: entity selector
				separator: opt(versioned(ctx, '1.17', text_component)),
			},
			score: {
				score: record({
					name: simpleString, // TODO: score holder
					objective: simpleString, // TODO: objective
					value: opt(simpleString),
				}),
			},
			keybind: {
				keybind: literal(Keybinds),
			},
			nbt: () => ({
				nbt: simpleString,
				...having(node, ctx, {
					block: {
						block: simpleString, // TODO: block pos
						nbt: nbtPath({ registry: 'block' }),
					},
					entity: {
						entity: simpleString, // TODO: entity selector
						nbt: nbtPath({
							registry:
								'entity_type', /* FIXME: import { getTypesFromEntity } from '../../../../mcfunction/checker'; ids: getTypesFromEntity(somehowGetTheNodeHere, ctx) */
						}),
					},
					storage: {
						storage: resource('storage'),
						nbt: nbtPath({
							registry:
								'storage', /* FIXME:, id: extract('storage', props) */
						}),
					},
				}),
				interpret: opt(boolean, false),
				separator: opt(versioned(ctx, '1.17', text_component)),
			}),
		}),
		color: opt(stringColor()),
		font: opt(simpleString),
		bold: opt(boolean),
		italic: opt(boolean),
		underlined: opt(boolean),
		strikethrough: opt(boolean),
		obfuscated: opt(boolean),
		insertion: opt(simpleString),
		clickEvent: opt(
			dispatch('action', (action) =>
				record({
					action: literal([
						'open_url',
						'open_file',
						'run_command',
						'suggest_command',
						'change_page',
						'copy_to_clipboard',
					]),
					value: simpleString,
					...pick(action, {
						run_command: {
							value: string(
								'command',
								ctx.meta.getParserLazily('mcfunction:command'),
								ctx.meta.getChecker('mcfunction:command'),
							),
						},
						change_page: {
							value: string(
								'number',
								integer({ pattern: /\d+/, min: 0 }),
							),
						},
					}),
				})),
		),
		hoverEvent: opt(
			dispatch('action', (action, _, ctx) =>
				record({
					action: literal(['show_text', 'show_item', 'show_entity']),
					...pick(action, {
						show_text: {
							value: deprecated(ctx, '1.16', text_component),
							contents: opt(versioned(ctx, '1.16', text_component)),
						},
						show_item: {
							value: deprecated(
								ctx,
								'1.16',
								nbt({
									definition:
										'::minecraft::util::invitem::InventoryItem',
								}),
							),
							contents: opt(
								versioned(
									ctx,
									'1.16',
									dispatch((props) =>
										record({
											id: resource('item'),
											count: opt(int),
											tag: opt(
												nbt({
													registry: 'item',
													id: extract('id', props),
												}),
											),
										})
									),
								),
							),
						},
						show_entity: {
							value: deprecated(
								ctx,
								'1.16',
								record({
									name: opt(simpleString),
									type: opt(resource('entity_type')),
									id: opt(uuid),
								}),
							),
							contents: opt(
								versioned(
									ctx,
									'1.16',
									record({
										name: opt(text_component),
										type: opt(resource('entity_type')),
										id: opt(uuid),
									}),
								),
							),
						},
					}),
				})),
		),
		extra: opt(listOf(text_component)),
	})(node, ctx))

export const text_component = as(
	'text_component',
	any([
		simpleString,
		text_component_object,
		listOf(ref(() => text_component)),
	]),
)

import {
	any,
	as,
	boolean,
	dispatch,
	extractNested,
	float,
	floatRange,
	intRange,
	listOf,
	literal,
	opt,
	pick,
	record,
	resource,
	simpleString,
	when,
} from '@spyglassmc/json/lib/checker/index.js'
import { nbt, versioned } from '../util/index.js'
import { block_state, height_provider, HeightmapType } from './common.js'
import { configured_feature_ref, placed_feature_ref } from './feature.js'

export const rule_test = as(
	'rule_test',
	dispatch('predicate_type', (type) =>
		record({
			predicate_type: resource('rule_test'),
			...pick(type, {
				block_match: {
					block: resource('block'),
				},
				blockstate_match: {
					block_state: block_state,
				},
				random_block_match: {
					block: resource('block'),
					probability: floatRange(0, 1),
				},
				random_blockstate_match: {
					block_state: block_state,
					probability: floatRange(0, 1),
				},
				tag_match: {
					tag: resource('tag/block'),
				},
			}),
		})),
)

export const pos_rule_test = as(
	'pos_rule_test',
	dispatch('predicate_type', (type) =>
		record({
			predicate_type: resource('pos_rule_test'),
			...pick(type, {
				axis_aligned_linear_pos: {
					axis: literal(['x', 'y', 'z']),
					min_dist: opt(intRange(0, 255)),
					max_dist: opt(intRange(0, 255)),
					min_chance: opt(floatRange(0, 1)),
					max_chance: opt(floatRange(0, 1)),
				},
			}),
			...when(type, ['axis_aligned_linear_pos', 'linear_pos'], {}),
		})),
)

const processor_rule = as(
	'processor_rule',
	dispatch((props) =>
		record({
			position_predicate: opt(pos_rule_test, {
				predicate_type: 'always_true',
			}),
			input_predicate: rule_test,
			location_predicate: rule_test,
			output_state: block_state,
			output_nbt: opt(
				nbt({
					registry: 'block',
					id: extractNested('output_state', 'Name', props),
				}),
			),
		})
	),
)

const processor = as(
	'processor',
	dispatch('processor_type', (type) =>
		record({
			processor_type: resource('worldgen/structure_processor'),
			...pick(type, {
				block_age: {
					mossiness: float,
				},
				block_ignore: {
					blocks: listOf(block_state),
				},
				block_rot: {
					integrity: floatRange(0, 1),
				},
				gravity: {
					heightmap: literal(HeightmapType),
				},
				protected_blocks: {
					value: resource('tag/block'),
				},
				rule: {
					rules: listOf(processor_rule),
				},
			}),
		})),
)

export const processor_list = as(
	'processor_list',
	any([
		record({
			processors: listOf(processor),
		}),
		listOf(processor),
	]),
)

export const processor_list_ref = as(
	'processor_list',
	any([resource('worldgen/processor_list'), processor_list]),
)

const template_element = as(
	'template_element',
	dispatch('element_type', (type, _, ctx) =>
		record({
			element_type: resource('worldgen/structure_pool_element'),
			...when(
				type,
				['empty_pool_element'],
				{},
				{
					projection: literal(['rigid', 'terrain_matching']),
				},
			),
			...pick(type, {
				feature_pool_element: {
					feature: versioned(
						ctx,
						configured_feature_ref,
						'1.18',
						placed_feature_ref,
					),
				},
				legacy_single_pool_element: {
					location: resource('structure'),
					processors: processor_list_ref,
				},
				list_pool_element: {
					elements: listOf(template_element),
				},
				single_pool_element: {
					location: resource('structure'),
					processors: processor_list_ref,
				},
			}),
		})),
)

export const template_pool = as(
	'template_pool',
	record({
		name: simpleString,
		fallback: resource('worldgen/template_pool'),
		elements: listOf(
			record({
				weight: intRange(1, undefined),
				element: template_element,
			}),
		),
	}),
)

export const template_pool_ref = any([
	resource('worldgen/template_pool'),
	template_pool,
])

export const configured_structure_feature = as(
	'structure_feature',
	dispatch('type', (type) =>
		record({
			type: resource('worldgen/structure_feature'),
			config: record({
				...when(
					type,
					['bastion_remnant', 'pillager_outpost', 'village'],
					{
						start_pool: template_pool_ref,
						size: intRange(0, 7),
					},
					pick(type, {
						buried_treasure: {
							probability: floatRange(0, 1),
						},
						mineshaft: {
							type: literal(['normal', 'mesa']),
							probability: floatRange(0, 1),
						},
						nether_fossil: {
							height: height_provider,
						},
						ocean_ruin: {
							biome_temp: literal(['cold', 'warm']),
							large_probability: floatRange(0, 1),
							cluster_probability: floatRange(0, 1),
						},
						ruined_portal: {
							portal_type: literal([
								'standard',
								'desert',
								'jungle',
								'mountain',
								'nether',
								'ocean',
								'swamp',
							]),
						},
						shipwreck: {
							is_beached: opt(boolean, false),
						},
					}),
				),
			}),
		})),
)

import { FileType } from '../types/ClientCache'

export const GeneralPathPattern = 'data/**/*.{json,mcfunction,nbt}'

export const PathPatterns: Record<FileType, string> = {
    advancement: 'data/*/advancements/**/*.json',
    dimension: 'data/*/dimension/**/*.json',
    dimension_type: 'data/*/dimension_type/**/*.json',
    function: 'data/*/functions/**/*.mcfunction',
    item_modifier: 'data/*/item_modifiers/**/*.json',
    loot_table: 'data/*/loot_tables/**/*.json',
    predicate: 'data/*/predicates/**/*.json',
    recipe: 'data/*/recipes/**/*.json',
    structure: 'data/*/structures/**/*.nbt',
    'tag/block': 'data/*/tags/blocks/**/*.json',
    'tag/entity_type': 'data/*/tags/entity_types/**/*.json',
    'tag/fluid': 'data/*/tags/fluids/**/*.json',
    'tag/function': 'data/*/tags/functions/**/*.json',
    'tag/game_event': 'data/*/tags/game_events/**/*.json',
    'tag/item': 'data/*/tags/items/**/*.json',
    'tag/worldgen/biome': 'data/*/tags/worldgen/biome/**/*.json',
    'tag/worldgen/configured_carver': 'data/*/tags/worldgen/configured_carver/**/*.json',
    'tag/worldgen/configured_decorator': 'data/*/tags/worldgen/configured_decorator/**/*.json',
    'tag/worldgen/configured_feature': 'data/*/tags/worldgen/configured_feature/**/*.json',
    'tag/worldgen/configured_structure_feature': 'data/*/tags/worldgen/configured_structure_feature/**/*.json',
    'tag/worldgen/configured_surface_builder': 'data/*/tags/worldgen/configured_surface_builder/**/*.json',
    'tag/worldgen/density_function': 'data/*/tags/worldgen/density_function/**/*.json',
    'tag/worldgen/noise': 'data/*/tags/worldgen/noise/**/*.json',
    'tag/worldgen/noise_settings': 'data/*/tags/worldgen/noise_settings/**/*.json',
    'tag/worldgen/placed_feature': 'data/*/tags/worldgen/placed_feature/**/*.json',
    'tag/worldgen/processor_list': 'data/*/tags/worldgen/processor_list/**/*.json',
    'tag/worldgen/structure_set': 'data/*/tags/worldgen/structure_set/**/*.json',
    'tag/worldgen/template_pool': 'data/*/tags/worldgen/template_pool/**/*.json',
    'worldgen/biome': 'data/*/worldgen/biome/**/*.json',
    'worldgen/configured_carver': 'data/*/worldgen/configured_carver/**/*.json',
    'worldgen/configured_decorator': 'data/*/worldgen/configured_decorator/**/*.json',
    'worldgen/configured_feature': 'data/*/worldgen/configured_feature/**/*.json',
    'worldgen/configured_structure_feature': 'data/*/worldgen/configured_structure_feature/**/*.json',
    'worldgen/configured_surface_builder': 'data/*/worldgen/configured_surface_builder/**/*.json',
    'worldgen/density_function': 'data/*/worldgen/density_function/**/*.json',
    'worldgen/noise': 'data/*/worldgen/noise/**/*.json',
    'worldgen/noise_settings': 'data/*/worldgen/noise_settings/**/*.json',
    'worldgen/placed_feature': 'data/*/worldgen/placed_feature/**/*.json',
    'worldgen/processor_list': 'data/*/worldgen/processor_list/**/*.json',
    'worldgen/structure_set': 'data/*/worldgen/structure_set/**/*.json',
    'worldgen/template_pool': 'data/*/worldgen/template_pool/**/*.json'
}

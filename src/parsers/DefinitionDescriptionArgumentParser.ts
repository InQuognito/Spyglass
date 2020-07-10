import { locale } from '../locales'
import { CacheCategory, isDefinitionType } from '../types/ClientCache'
import { ArgumentParserResult } from '../types/Parser'
import { ParsingError } from '../types/ParsingError'
import { Token, TokenModifier, TokenType } from '../types/Token'
import { StringReader } from '../utils/StringReader'
import { ArgumentParser } from './ArgumentParser'

export class DefinitionDescriptionArgumentParser extends ArgumentParser<string> {
    static identity = 'DefinitionDescription'
    readonly identity = 'string'

    constructor(
        private readonly type: string,
        private readonly id: string
    ) {
        super()
    }

    parse(reader: StringReader): ArgumentParserResult<string> {
        const start = reader.cursor
        const description = reader.readRemaining()
        const ans: ArgumentParserResult<string> = {
            data: description,
            tokens: [Token.from(start, reader, TokenType.string, new Set([TokenModifier.documentation]))],
            errors: [],
            cache: {},
            completions: []
        }
        if (description) {
            if (isDefinitionType(this.type)) {
                if (this.id) {
                    const key = this.type
                    ans.cache[key] = {}
                    const category = ans.cache[key] as CacheCategory
                    category[this.id] = {
                        doc: description,
                        def: [],
                        ref: []
                    }
                }
            }
        } else {
            ans.errors = [
                new ParsingError({ start, end: start + 1 }, locale('expected-got',
                    locale('string'),
                    locale('nothing')
                ))
            ]
        }
        return ans
    }

    getExamples(): string[] {
        return ['_Whatever description here_']
    }
}

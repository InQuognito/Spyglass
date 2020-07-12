import { DiagnosticSeverity } from 'vscode-languageserver'
import { locale } from '../locales'
import { getCompletions, getSafeCategory } from '../types/ClientCache'
import { ArgumentParserResult } from '../types/Parser'
import { ParsingContext } from '../types/ParsingContext'
import { ParsingError } from '../types/ParsingError'
import { Token, TokenModifier, TokenType } from '../types/Token'
import { StringReader } from '../utils/StringReader'
import { ArgumentParser } from './ArgumentParser'

export class ObjectiveArgumentParser extends ArgumentParser<string> {
    static identity = 'Objective'
    readonly identity = 'objective'

    constructor(
        private readonly isDefinition = false
    ) {
        super()
    }

    parse(reader: StringReader, ctx: ParsingContext): ArgumentParserResult<string> {
        const ans: ArgumentParserResult<string> = {
            data: '',
            tokens: [],
            errors: [],
            cache: {},
            completions: []
        }
        const category = getSafeCategory(ctx.cache, 'objective')
        //#region Data
        const start = reader.cursor
        const value = reader.readUnquotedString()
        ans.data = value
        //#endregion
        //#region Completions
        if (start <= ctx.cursor && ctx.cursor <= reader.cursor) {
            ans.completions.push(...getCompletions(ctx.cache, 'objective', start, reader.cursor))
        }
        //#endregion
        //#region Tokens
        if (this.isDefinition) {
            ans.tokens.push(Token.from(start, reader, TokenType.variable, new Set([TokenModifier.declaration])))
        } else {
            ans.tokens.push(Token.from(start, reader, TokenType.variable))
        }
        //#endregion
        //#region Errors & Cache
        if (!value) {
            ans.errors.push(new ParsingError(
                { start, end: start + 1 },
                locale('expected-got',
                    locale('objective'),
                    locale('nothing')
                ),
                false
            ))
        } else {
            if (this.isDefinition) {
                ans.cache = {
                    objective: {
                        [value]: {
                            def: [{ start, end: reader.cursor }],
                            ref: []
                        }
                    }
                }
            } else {
                if (Object.keys(category).includes(value)) {
                    ans.cache = {
                        objective: {
                            [value]: {
                                def: [],
                                ref: [{ start, end: start + value.length }]
                            }
                        }
                    }
                } else if (ctx.config.lint.strictObjectiveCheck) {
                    ans.errors.push(new ParsingError(
                        { start, end: start + value.length },
                        locale('undefined-objective', locale('punc.quote', value)),
                        undefined,
                        DiagnosticSeverity.Warning
                    ))
                }
            }
            if (value.length > 16) {
                ans.errors.push(new ParsingError(
                    { start, end: start + value.length },
                    locale('too-long', locale('punc.quote', value), locale('objective'), 16)
                ))
            }
        }
        //#endregion
        return ans
    }

    getExamples(): string[] {
        return ['objective']
    }
}

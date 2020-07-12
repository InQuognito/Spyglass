import { locale } from '../locales'
import { ArgumentParserResult } from '../types/Parser'
import { ParsingContext } from '../types/ParsingContext'
import { ParsingError } from '../types/ParsingError'
import { Token, TokenType } from '../types/Token'
import { arrayToCompletions, arrayToMessage } from '../utils'
import { StringReader } from '../utils/StringReader'
import { ArgumentParser } from './ArgumentParser'

export class LiteralArgumentParser extends ArgumentParser<string> {
    static identity = 'Literal'
    readonly identity = 'literal'

    protected readonly literals: string[]
    private readonly extraChars: string[] = []

    constructor(...literals: string[]) {
        super()
        this.literals = literals
        for (const literal of literals) {
            if (!StringReader.canInUnquotedString(literal)) {
                for (const char of literal) {
                    if (!this.extraChars.includes(char) && !StringReader.canInUnquotedString(char)) {
                        this.extraChars.push(char)
                    }
                }
            }
        }
    }

    parse(reader: StringReader, { cursor: cursor }: ParsingContext): ArgumentParserResult<string> {
        const ans: ArgumentParserResult<string> = {
            data: '',
            tokens: [],
            errors: [],
            cache: {},
            completions: []
        }
        const start = reader.cursor
        //#region Data
        let remaningLiterals = this.literals
        let value = ''
        while (reader.canRead() && (StringReader.canInUnquotedString(reader.peek()) || this.extraChars.includes(reader.peek()))) {
            const nextValue = `${value}${reader.peek()}`
            const nextRemaningLiterals = remaningLiterals.filter(v => v.startsWith(nextValue))
            if (remaningLiterals.includes(value) && nextRemaningLiterals.length === 0) {
                break
            }
            reader.skip()
            value = nextValue
            remaningLiterals = nextRemaningLiterals
        }
        ans.data = value
        //#endregion
        //#region Completions.
        if (start <= cursor && cursor <= reader.cursor) {
            ans.completions.push(...arrayToCompletions(this.literals, start, reader.cursor))
        }
        //#endregion
        //#region Tokens.
        ans.tokens.push(Token.from(start, reader, TokenType.literal))
        //#endregion
        //#region Get errors.
        if (!this.literals.includes(value)) {
            if (value.length > 0) {
                ans.errors = [new ParsingError(
                    { start: start, end: start + value.length },
                    locale('expected-got',
                        arrayToMessage(this.literals, true, 'or'),
                        locale('punc.quote', value)
                    ),
                    false
                )]
            } else {
                ans.errors = [new ParsingError(
                    { start: start, end: start + 1 },
                    locale('expected-got',
                        arrayToMessage(this.literals, true, 'or'),
                        locale('nothing')
                    ),
                    false
                )]
            }
        }
        //#endregion

        return ans
    }

    toHint(_: string, optional: boolean): string {
        let ans: string
        if (optional) {
            ans = `[${this.literals.join('|')}]`
        } else {
            if (this.literals.length === 1) {
                ans = this.literals[0]
            } else {
                ans = this.literals.join('|')
            }
        }

        return ans
    }

    getExamples(): string[] {
        return this.literals
    }
}

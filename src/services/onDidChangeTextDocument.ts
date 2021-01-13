import { TextDocument } from 'vscode-languageserver-textdocument'
import { Position, Range, TextDocumentContentChangeEvent } from 'vscode-languageserver/node'
import { getSelectedNode } from '../nodes'
import { LanguageConfig } from '../plugins/LanguageConfigImpl'
import { Uri } from '../types'
import { Config } from '../types/Config'
import { McfunctionDocument } from '../types/DatapackDocument'
import { getStringLines, parseSyntaxComponents } from './common'
import { DatapackLanguageService } from './DatapackLanguageService'

function isIncrementalChange(val: TextDocumentContentChangeEvent): val is { range: Range, text: string } {
    return !!(val as any).range
}

export async function onDidChangeTextDocument({ textDoc, uri, doc, version, contentChanges, config, service, languageConfigs }: { uri: Uri, doc: McfunctionDocument, textDoc: TextDocument, version: number, contentChanges: TextDocumentContentChangeEvent[], config: Config, service: DatapackLanguageService, languageConfigs: Map<string, LanguageConfig> }) {
    const lineAmount = getStringLines(textDoc.getText()).length
    // eslint-disable-next-line prefer-const
    let lineDelta = 0
    let nodeChange: { nodeStart: number, nodeStop: number, lineStart: number, lineStop: number } | undefined
    for (const change of contentChanges) {
        if (isIncrementalChange(change)) {
            let { index: nodeStart, node: startNode } = getSelectedNode(doc.nodes, textDoc.offsetAt(change.range.start))
            const { index: nodeStop, node: stopNode } = getSelectedNode(doc.nodes, textDoc.offsetAt(change.range.end))
            if (nodeStart !== -1 && nodeStop !== -1 && startNode && stopNode) {
                //#region Move to the former node.
                nodeStart = Math.max(0, nodeStart - 1)
                startNode = doc.nodes[nodeStart]
                //#endregion
                const lineStart = textDoc.positionAt(startNode.range.start).line
                const lineStop = textDoc.positionAt(stopNode.range.end).line
                nodeChange = nodeChange ?? { nodeStart, nodeStop, lineStart, lineStop }
                nodeChange.nodeStart = Math.min(nodeChange.nodeStart, nodeStart)
                nodeChange.nodeStop = Math.max(nodeChange.nodeStop, nodeStop)
                nodeChange.lineStart = Math.min(nodeChange.lineStart, lineStart)
                nodeChange.lineStop = Math.max(nodeChange.lineStop, lineStop)
                lineDelta += getStringLines(change.text).length - (change.range.end.line + 1 - change.range.start.line)
                continue
            }
        }
        lineDelta = 0
        nodeChange = { nodeStart: 0, nodeStop: doc.nodes.length - 1, lineStart: 0, lineStop: lineAmount - 1 }
        break
    }
    nodeChange = nodeChange ?? { nodeStart: 0, nodeStop: doc.nodes.length - 1, lineStart: 0, lineStop: lineAmount - 1 }

    // Update `document`.
    TextDocument.update(textDoc, contentChanges, version)

    // FIXME: only parse the changed node in the future, instead of all nodes following the changed node.
    nodeChange.nodeStop = doc.nodes.length - 1
    nodeChange.lineStop = lineAmount - 1

    // Update `lines`.
    const commandTree = await service.getCommandTree(config)
    const vanillaData = await service.getVanillaData(config)
    const jsonSchemas = await service.getJsonSchemas(config, vanillaData)
    const changedNodes = parseSyntaxComponents(
        service,
        textDoc,
        textDoc.offsetAt(Position.create(nodeChange.lineStart, 0)),
        textDoc.offsetAt(Position.create(nodeChange.lineStop + lineDelta, Infinity)),
        config, uri, undefined, commandTree, vanillaData, jsonSchemas, languageConfigs
    )
    doc.nodes.splice(nodeChange.nodeStart, nodeChange.nodeStop - nodeChange.nodeStart + 1, ...changedNodes)
}

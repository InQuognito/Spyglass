import { WorkspaceFolder } from 'vscode-languageserver'
import { Uri } from '../../types/handlers'
import { getRootUri } from './common'

export function onDidChangeWorkspaceFolders({ folders, roots, uris, urisOfIds }: { folders: WorkspaceFolder[] | null, roots: Uri[], uris: Map<string, Uri>, urisOfIds: Map<string, Uri | null> }) {
    roots.splice(0)
    urisOfIds.clear()

    if (folders) {
        for (let i = folders.length - 1; i >= 0; i--) {
            const { uri: uriString } = folders[i]
            roots.push(getRootUri(uriString, uris))
        }
    }
}

import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

const CONFIG_NAMESPACE = 'timestampFile';
const EXTENSION_ID = 'timestamp-file';
const COMMAND_ID = `${EXTENSION_ID}.newTimestampFile`;

const PATH_VARIABLE_REGEX = {
	userHome: /\$\{userhome\}/gi,
	workspaceFolder: /\$\{workspacefolder\}/gi,
	fileDirname: /\$\{filedirname\}/gi,
};

export interface TimestampFileConfig {
	baseDirectory: string;
	subDirectory: string;
	fileExtension: string;
}

const getUserHome = (): string => process.env.HOME || process.env.USERPROFILE || '';


/**
 * Main logic: create and open a new timestamp-named file
 */
export async function createAndOpenTimestampFile(): Promise<void> {
	try {

		const { baseDirectory, subDirectory, fileExtension } = getTimestampFileConfig();
		const resolvedBaseDir = resolvePathVariables(baseDirectory);
		const targetDirectory = path.join(resolvedBaseDir, subDirectory);

		ensureDirectoryExists(targetDirectory);

		const fileName = generateTimestampFileName(fileExtension);
		const filePath = path.join(targetDirectory, fileName);

		fs.writeFileSync(filePath, '', { encoding: 'utf8', flag: 'wx' });

		const document = await vscode.workspace.openTextDocument(filePath);
		await vscode.window.showTextDocument(document, { preview: false });

	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		vscode.window.showErrorMessage(`Failed to create timestamp file: ${errorMessage}`);
		console.error(`[${EXTENSION_ID}]`, error);
	}
}


/**
 * Activates the extension
 * @param context - VS Code extension context
 */
export function activate(context: vscode.ExtensionContext) {
	console.log('Extension "timestamp-file" is now active!');

	const createFileCommand = vscode.commands.registerCommand(
		COMMAND_ID,
		createAndOpenTimestampFile
	);

	context.subscriptions.push(createFileCommand);
}

/**
 * Resolves VS Code built-in variables in a path string
 * Supported variables: ${workspaceFolder}, ${userHome}, ${fileDirname}
 * @param rawPath The original path string with variables
 * @returns Resolved absolute path
 */
export function resolvePathVariables(rawPath: string): string {
	if (!rawPath) { return getUserHome(); }
	let resolvedPath = rawPath.trim();
	const userHome = getUserHome();

	resolvedPath = resolvedPath.replace(PATH_VARIABLE_REGEX.userHome, userHome);

	if (PATH_VARIABLE_REGEX.workspaceFolder.test(resolvedPath)) {
		const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
		if (!workspaceRoot) {
			vscode.window.showWarningMessage('If the workspace is not open, the user\'s home directory will be used.');
		}
		resolvedPath = resolvedPath.replace(
			PATH_VARIABLE_REGEX.workspaceFolder,
			workspaceRoot || userHome
		);
	}

	if (PATH_VARIABLE_REGEX.fileDirname.test(resolvedPath)) {

		const activeFileDir = (vscode.window.activeTextEditor && vscode.window.activeTextEditor.document.uri.fsPath && !vscode.window.activeTextEditor.document.isUntitled)
			? path.dirname(vscode.window.activeTextEditor.document.uri.fsPath)
			: undefined;

		resolvedPath = resolvedPath.replace(
			PATH_VARIABLE_REGEX.fileDirname,
			activeFileDir || userHome
		);
	}

	return resolvedPath;
}


/**
 * Creates directory recursively if it does not exist
 * @param dirPath - Target directory path
 */
export function ensureDirectoryExists(dirPath: string): void {
	try {
		if (!fs.existsSync(dirPath)) {
			fs.mkdirSync(dirPath, { recursive: true, mode: 0o755 });
		}
	} catch (err) {
		throw new Error(`Directory creation failed:${(err as Error).message}`);
	}
}

/**
 * Generates a filename based on the current ISO timestamp
 * @param extension - File extension to append
 * @returns Formatted timestamp filename
 */
export function generateTimestampFileName(extension: string): string {
	const normalizedExt = extension.startsWith('.') ? extension : `.${extension}`;

	const timestamp = new Date()
		.toISOString()
		.replace(/[:T]/g, '-')
		.slice(0, 19);

	return `${timestamp}${normalizedExt}`;
}

/**
 * Retrieves extension configuration settings
 * @returns Configuration object for the timestamp file extension
 */
export function getTimestampFileConfig(): TimestampFileConfig {
	const config = vscode.workspace.getConfiguration(CONFIG_NAMESPACE);
	return {
		baseDirectory: config.get<string>('baseDirectory') ?? '${workspaceFolder}',
		subDirectory: config.get<string>('subDirectory') ?? '',
		fileExtension: config.get<string>('fileExtension') ?? '.txt'
	};
}


export function deactivate() { }

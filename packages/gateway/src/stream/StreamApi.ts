import { FunctionObject, PartialApply1All } from '../common';
import { ID, RequestContext, Scope, StreamWSRequest, StreamCommandRequest } from '../streamsheets';
import { Stream } from './types';

export interface StreamApi extends FunctionObject {
	findById(context: RequestContext, scope: Scope, id: ID): Promise<Stream | null>;
	findAllStreams(context: RequestContext, scope: Scope): Promise<Array<Stream>>;
	executeStreamCommand(context: RequestContext, scope: Scope, command: StreamCommandRequest['cmd']): Promise<any>;
	saveStream(context: RequestContext, scope: Scope, stream: Stream): Promise<any>;
	deleteStream(context: RequestContext, scope: Scope, id: ID): Promise<any>;
	reloadStreams(context: RequestContext, scope: Scope, streams: ID[]): Promise<any>;
}
export type StreamApiApplied = PartialApply1All<StreamApi>;

export const StreamApi: StreamApi = {
	findAllStreams: async ({ auth, streamRepo }: RequestContext, scope: Scope) => {
		const validScope = auth.isValidScope(scope);
		if (!validScope) {
			return [];
		}
		const streams: Stream[] = await streamRepo.findAllStreams();
		const streamsInScope = streams.filter((stream) => auth.isInScope(scope, stream) || stream.className === 'ProviderConfiguration');
		return streamsInScope;
	},
	findById: async ({ auth, streamRepo }, scope: Scope, id: ID) => {
		const validScope = auth.isValidScope(scope);
		if (!validScope) {
			return null;
		}
		const stream = await streamRepo.findById(id);
		return auth.isInScope(scope, stream) ? stream : null;
	},
	executeStreamCommand: async ({ auth, streamRepo }, scope, command) => {
		const validScope = auth.isValidScope(scope);
		if (!validScope) {
			return null;
		}
		const stream = await streamRepo.findById(command.streamId);
		if (!auth.isInScope(scope, stream)) {
			return null;
		}
		const result = await streamRepo.executeStreamCommand(command);
		return result;
	},
	saveStream: async ({ auth, streamRepo }, scope: Scope, stream: Stream) => {
		const validScope = auth.isValidScope(scope);
		if (!validScope) {
			return null;
		}
		stream.scope = scope;
		const result = await streamRepo.saveStream(stream);
		return result;
	},
	deleteStream: async ({ auth, streamRepo }, scope: Scope, id: ID) => {
		const validScope = auth.isValidScope(scope);
		if (!validScope) {
			return null;
		}
		const stream = await streamRepo.findById(id);
		if (!auth.isInScope(scope, stream)) {
			return null;
		}
		const result = await streamRepo.deleteStream(id);
		return result;
	},
	reloadStreams: async ({ auth, streamRepo }, scope: Scope, toReload) => {
		const validScope = auth.isValidScope(scope);
		if (!validScope) {
			return null;
		}
		const streams: Stream[] = await streamRepo.findAllStreams();
		const allowedToReload = streams
			.filter((stream) => auth.isInScope(scope, stream) && toReload.includes(stream.name))
			.map((stream) => stream.id);
		if (streams.length > 0) {
			await streamRepo.reloadStreams(allowedToReload);
		}
	}
};

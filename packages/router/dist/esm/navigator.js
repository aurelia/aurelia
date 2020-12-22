import { Queue } from './queue.js';
import { Navigation } from './navigation.js';
import { Runner } from './runner.js';
/**
 * @internal - Shouldn't be used directly
 */
export class Navigator {
    constructor() {
        this.entries = [];
        this.options = {
            statefulHistoryLength: 0,
        };
        this.isActive = false;
        this.processNavigations = (qEntry) => {
            const entry = qEntry;
            const navigationFlags = {
                first: false,
                new: false,
                refresh: false,
                forward: false,
                back: false,
                replace: false,
            };
            if (this.currentEntry === this.uninitializedEntry) { // Refresh or first entry
                this.loadState();
                if (this.currentEntry !== this.uninitializedEntry) {
                    navigationFlags.refresh = true;
                }
                else {
                    navigationFlags.first = true;
                    navigationFlags.new = true;
                    // TODO: Should this really be created here? Shouldn't it be in the viewer?
                    this.currentEntry = new Navigation({
                        index: 0,
                        instruction: '',
                        fullStateInstruction: '',
                    });
                    this.entries = [];
                }
            }
            if (entry.index !== void 0 && !entry.replacing && !entry.refreshing) { // History navigation
                entry.historyMovement = entry.index - (this.currentEntry.index !== void 0 ? this.currentEntry.index : 0);
                entry.instruction = this.entries[entry.index] !== void 0 && this.entries[entry.index] !== null ? this.entries[entry.index].fullStateInstruction : entry.fullStateInstruction;
                entry.replacing = true;
                if (entry.historyMovement > 0) {
                    navigationFlags.forward = true;
                }
                else if (entry.historyMovement < 0) {
                    navigationFlags.back = true;
                }
            }
            else if (entry.refreshing || navigationFlags.refresh) { // Refreshing
                entry.index = this.currentEntry.index;
            }
            else if (entry.replacing) { // Replacing
                navigationFlags.replace = true;
                navigationFlags.new = true;
                entry.index = this.currentEntry.index;
            }
            else { // New entry
                navigationFlags.new = true;
                entry.index = this.currentEntry.index !== void 0 ? this.currentEntry.index + 1 : this.entries.length;
            }
            this.invokeCallback(entry, navigationFlags, this.currentEntry);
        };
        this.uninitializedEntry = new Navigation({
            instruction: 'NAVIGATOR UNINITIALIZED',
            fullStateInstruction: '',
        });
        this.currentEntry = this.uninitializedEntry;
        this.pendingNavigations = new Queue(this.processNavigations);
    }
    get queued() {
        return this.pendingNavigations.length;
    }
    start(router, options) {
        if (this.isActive) {
            throw new Error('Navigator has already been started');
        }
        this.isActive = true;
        this.router = router;
        this.options = { ...options };
    }
    stop() {
        if (!this.isActive) {
            throw new Error('Navigator has not been started');
        }
        this.pendingNavigations.clear();
        this.isActive = false;
    }
    async navigate(entry) {
        return this.pendingNavigations.enqueue(entry);
    }
    async refresh() {
        const entry = this.currentEntry;
        if (entry === this.uninitializedEntry) {
            return Promise.reject();
        }
        entry.replacing = true;
        entry.refreshing = true;
        return this.navigate(entry);
    }
    async go(movement) {
        const newIndex = (this.currentEntry.index !== undefined ? this.currentEntry.index : 0) + movement;
        if (newIndex >= this.entries.length) {
            return Promise.reject();
        }
        const entry = this.entries[newIndex];
        return this.navigate(entry);
    }
    async setEntryTitle(title) {
        this.currentEntry.title = title;
        return this.saveState();
    }
    get titles() {
        if (this.currentEntry === this.uninitializedEntry) {
            return [];
        }
        const index = this.currentEntry.index !== void 0 ? this.currentEntry.index : 0;
        return this.entries.slice(0, index + 1).filter((value) => !!value.title).map((value) => value.title ? value.title : '');
    }
    // Get the stored navigator state (json okay)
    getState() {
        const state = this.options.store ? { ...this.options.store.state } : {};
        const entries = (state.entries ?? []);
        const currentEntry = (state.currentEntry ?? null);
        return { state, entries, currentEntry };
    }
    // Load a stored state into Navigation entries
    loadState() {
        const state = this.getState();
        this.entries = state.entries.map(entry => new Navigation(entry));
        this.currentEntry = state.currentEntry !== null
            ? new Navigation(state.currentEntry)
            : this.uninitializedEntry;
    }
    // Save storeable versions of Navigation entries
    async saveState(push = false) {
        if (this.currentEntry === this.uninitializedEntry) {
            return Promise.resolve();
        }
        const storedEntry = this.currentEntry.toStored();
        this.entries[storedEntry.index !== void 0 ? storedEntry.index : 0] = new Navigation(storedEntry);
        // If preserving history, serialize entries that aren't preserved
        if (this.options.statefulHistoryLength > 0) {
            const index = this.entries.length - this.options.statefulHistoryLength;
            for (let i = 0; i < index; i++) {
                const entry = this.entries[i];
                if (typeof entry.instruction !== 'string' || typeof entry.fullStateInstruction !== 'string') {
                    await this.serializeEntry(entry, this.entries.slice(index));
                }
            }
        }
        if (!this.options.store) {
            return Promise.resolve();
        }
        const state = {
            entries: (this.entries ?? []).map((entry) => this.toStoreableEntry(entry)),
            currentEntry: this.toStoreableEntry(storedEntry),
        };
        // for (const entry of this.entries) {
        //   state.entries.push(this.toStoreableEntry(entry));
        // }
        if (state.currentEntry.title !== void 0) {
            this.options.store.setTitle(state.currentEntry.title);
        }
        if (push) {
            return this.options.store.pushNavigatorState(state);
        }
        else {
            return this.options.store.replaceNavigatorState(state);
        }
    }
    toStoredEntry(entry) {
        const { previous, fromBrowser, origin, replacing, refreshing, untracked, historyMovement, navigation, scope, resolve, reject, ...storableEntry } = entry;
        return storableEntry;
    }
    async finalize(instruction) {
        this.currentEntry = instruction;
        let index = this.currentEntry.index !== undefined ? this.currentEntry.index : 0;
        if (this.currentEntry.untracked) {
            if (instruction.fromBrowser && this.options.store) {
                await this.options.store.popNavigatorState();
            }
            index--;
            this.currentEntry.index = index;
            this.entries[index] = this.currentEntry;
            await this.saveState();
        }
        else if (this.currentEntry.replacing) {
            this.entries[index] = this.currentEntry;
            await this.saveState();
        }
        else { // New entry (add and discard later entries)
            if (this.options.serializeCallback !== void 0 && this.options.statefulHistoryLength > 0) {
                // Need to clear the instructions we discard!
                const indexPreserve = this.entries.length - this.options.statefulHistoryLength;
                for (const entry of this.entries.slice(index)) {
                    if (typeof entry.instruction !== 'string' || typeof entry.fullStateInstruction !== 'string') {
                        await this.options.serializeCallback(entry, this.entries.slice(indexPreserve, index));
                    }
                }
            }
            this.entries = this.entries.slice(0, index);
            this.entries.push(this.currentEntry);
            await this.saveState(true);
        }
        if (this.currentEntry.resolve) {
            this.currentEntry.resolve();
        }
    }
    async cancel(instruction) {
        if (instruction.fromBrowser && this.options.store) {
            if (instruction.navigation && instruction.navigation.new) {
                await this.options.store.popNavigatorState();
            }
            else {
                await this.options.store.go(-(instruction.historyMovement || 0), true);
            }
        }
        if (this.currentEntry.resolve) {
            this.currentEntry.resolve();
        }
    }
    invokeCallback(entry, navigationFlags, previousEntry) {
        const instruction = new Navigation({ ...entry });
        instruction.navigation = navigationFlags;
        instruction.previous = previousEntry;
        if (this.options.callback) {
            this.options.callback(instruction);
        }
    }
    toStoreableEntry(entry) {
        const storeable = entry instanceof Navigation ? entry.toStored() : entry;
        storeable.instruction = this.router.instructionResolver.stringifyViewportInstructions(storeable.instruction);
        storeable.fullStateInstruction = this.router.instructionResolver.stringifyViewportInstructions(storeable.fullStateInstruction);
        if (typeof storeable.scope !== 'string') {
            storeable.scope = null;
        }
        return storeable;
    }
    async serializeEntry(entry, preservedEntries) {
        const instructionResolver = this.router.instructionResolver;
        let excludeComponents = [];
        // Components in preserved entries should not be serialized/freed
        for (const preservedEntry of preservedEntries) {
            if (typeof preservedEntry.instruction !== 'string') {
                excludeComponents.push(...instructionResolver.flattenViewportInstructions(preservedEntry.instruction)
                    .filter(instruction => instruction.viewport !== null)
                    .map(instruction => instruction.componentInstance));
            }
            if (typeof preservedEntry.fullStateInstruction !== 'string') {
                excludeComponents.push(...instructionResolver.flattenViewportInstructions(preservedEntry.fullStateInstruction)
                    .filter(instruction => instruction.viewport !== null)
                    .map(instruction => instruction.componentInstance));
            }
        }
        // Make unique
        excludeComponents = excludeComponents.filter((component, i, arr) => component !== null && arr.indexOf(component) === i);
        let instructions = [];
        // The instructions, one or two, with possible components to free
        if (typeof entry.fullStateInstruction !== 'string') {
            instructions.push(...entry.fullStateInstruction);
            entry.fullStateInstruction = instructionResolver.stringifyViewportInstructions(entry.fullStateInstruction);
        }
        if (typeof entry.instruction !== 'string') {
            instructions.push(...entry.instruction);
            entry.instruction = instructionResolver.stringifyViewportInstructions(entry.instruction);
        }
        // Process only those with instances and make unique
        instructions = instructions.filter((instruction, i, arr) => instruction !== null
            && instruction.componentInstance !== null
            && arr.indexOf(instruction) === i);
        // Already freed components (updated when component is freed)
        const alreadyDone = [];
        for (const instruction of instructions) {
            await this.freeInstructionComponents(instruction, excludeComponents, alreadyDone);
        }
    }
    freeInstructionComponents(instruction, excludeComponents, alreadyDone) {
        const component = instruction.componentInstance;
        const viewport = instruction.viewport;
        if (component === null || viewport === null || alreadyDone.some(done => done === component)) {
            return;
        }
        if (!excludeComponents.some(exclude => exclude === component)) {
            return Runner.run(() => viewport.freeContent(component), () => {
                alreadyDone.push(component);
            });
        }
        if (instruction.nextScopeInstructions !== null) {
            for (const nextInstruction of instruction.nextScopeInstructions) {
                return Runner.run(() => this.freeInstructionComponents(nextInstruction, excludeComponents, alreadyDone));
            }
        }
    }
}
//# sourceMappingURL=navigator.js.map
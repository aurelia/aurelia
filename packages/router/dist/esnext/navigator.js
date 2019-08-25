import { Reporter } from '@aurelia/kernel';
import { Queue } from './queue';
export class Navigator {
    constructor() {
        this.entries = [];
        this.options = {};
        this.isActive = false;
        this.processNavigations = (qEntry) => {
            const entry = qEntry;
            const navigationFlags = {};
            if (this.currentEntry === this.uninitializedEntry) { // Refresh or first entry
                this.loadState();
                if (this.currentEntry !== this.uninitializedEntry) {
                    navigationFlags.refresh = true;
                }
                else {
                    navigationFlags.first = true;
                    navigationFlags.new = true;
                    // TODO: Should this really be created here? Shouldn't it be in the viewer?
                    this.currentEntry = {
                        index: 0,
                        instruction: '',
                        fullStateInstruction: '',
                    };
                    this.entries = [];
                }
            }
            if (entry.index !== undefined && !entry.replacing && !entry.refreshing) { // History navigation
                entry.historyMovement = entry.index - (this.currentEntry.index !== undefined ? this.currentEntry.index : 0);
                entry.instruction = entry.fullStateInstruction;
                entry.replacing = true;
                if (entry.historyMovement > 0) {
                    navigationFlags.forward = true;
                }
                else if (entry.historyMovement < 0) {
                    navigationFlags.back = true;
                }
            }
            else { // New entry
                navigationFlags.new = true;
                entry.index = (entry.replacing ? entry.index : this.entries.length);
            }
            this.invokeCallback(entry, navigationFlags, this.currentEntry);
        };
        this.uninitializedEntry = {
            instruction: 'NAVIGATOR UNINITIALIZED',
            fullStateInstruction: '',
        };
        this.currentEntry = this.uninitializedEntry;
        this.pendingNavigations = new Queue(this.processNavigations);
    }
    get queued() {
        return this.pendingNavigations.length;
    }
    activate(options) {
        if (this.isActive) {
            throw new Error('Navigator has already been activated');
        }
        this.isActive = true;
        this.options = { ...options };
    }
    deactivate() {
        if (!this.isActive) {
            throw new Error('Navigator has not been activated');
        }
        this.pendingNavigations.clear();
        this.isActive = false;
    }
    navigate(entry) {
        return this.pendingNavigations.enqueue(entry);
    }
    refresh() {
        const entry = this.currentEntry;
        if (entry === this.uninitializedEntry) {
            return Promise.reject();
        }
        entry.replacing = true;
        entry.refreshing = true;
        return this.navigate(entry);
    }
    go(movement) {
        const newIndex = (this.currentEntry.index !== undefined ? this.currentEntry.index : 0) + movement;
        if (newIndex >= this.entries.length) {
            return Promise.reject();
        }
        const entry = this.entries[newIndex];
        return this.navigate(entry);
    }
    setEntryTitle(title) {
        this.currentEntry.title = title;
        return this.saveState();
    }
    get titles() {
        if (this.currentEntry == this.uninitializedEntry) {
            return [];
        }
        const index = this.currentEntry.index !== void 0 ? this.currentEntry.index : 0;
        return this.entries.slice(0, index + 1).filter((value) => !!value.title).map((value) => value.title ? value.title : '');
    }
    getState() {
        const state = this.options.store ? { ...this.options.store.state } : {};
        const entries = (state.entries || []);
        const currentEntry = (state.currentEntry || this.uninitializedEntry);
        return { state, entries, currentEntry };
    }
    loadState() {
        const state = this.getState();
        this.entries = state.entries;
        this.currentEntry = state.currentEntry;
    }
    saveState(push = false) {
        if (this.currentEntry === this.uninitializedEntry) {
            return Promise.resolve();
        }
        const storedEntry = this.toStorableEntry(this.currentEntry);
        this.entries[storedEntry.index !== undefined ? storedEntry.index : 0] = storedEntry;
        const state = {
            entries: this.entries,
            currentEntry: storedEntry,
        };
        if (!this.options.store) {
            return Promise.resolve();
        }
        if (push) {
            return this.options.store.pushNavigatorState(state);
        }
        else {
            return this.options.store.replaceNavigatorState(state);
        }
    }
    toStorableEntry(entry) {
        const { previous, fromBrowser, replacing, refreshing, untracked, historyMovement, navigation, resolve, reject, ...storableEntry } = entry;
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
            this.entries[index] = this.toStorableEntry(this.currentEntry);
            await this.saveState();
        }
        else if (this.currentEntry.replacing) {
            this.entries[index] = this.toStorableEntry(this.currentEntry);
            await this.saveState();
        }
        else { // New entry (add and discard later entries)
            this.entries = this.entries.slice(0, index);
            this.entries.push(this.toStorableEntry(this.currentEntry));
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
        const instruction = { ...entry };
        instruction.navigation = navigationFlags;
        instruction.previous = this.toStorableEntry(previousEntry);
        Reporter.write(10000, 'callback', instruction, instruction.previous, this.entries);
        if (this.options.callback) {
            this.options.callback(instruction);
        }
    }
}
//# sourceMappingURL=navigator.js.map
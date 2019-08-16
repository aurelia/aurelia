import { Reporter } from '@aurelia/kernel';
import { Queue } from './queue';
export class Navigator {
    constructor() {
        this.processNavigations = (qEntry) => {
            const entry = qEntry;
            const navigationFlags = {};
            if (!this.currentEntry) { // Refresh or first entry
                this.loadState();
                if (this.currentEntry) {
                    navigationFlags.refresh = true;
                }
                else {
                    navigationFlags.first = true;
                    navigationFlags.new = true;
                    // TODO: Should this really be created here? Shouldn't it be in the viewer?
                    this.currentEntry = {
                        index: 0,
                        instruction: null,
                        fullStateInstruction: null,
                    };
                    this.entries = [];
                }
            }
            if (entry.index !== undefined && !entry.replacing && !entry.refreshing) { // History navigation
                entry.historyMovement = entry.index - this.currentEntry.index;
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
        this.currentEntry = null;
        this.entries = null;
        this.pendingNavigations = new Queue(this.processNavigations);
        this.options = null;
        this.isActive = false;
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
        if (!entry) {
            return Promise.reject();
        }
        entry.replacing = true;
        entry.refreshing = true;
        return this.navigate(entry);
    }
    go(movement) {
        const newIndex = this.currentEntry.index + movement;
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
        return (this.entries ? this.entries.slice(0, this.currentEntry.index + 1).map((value) => value.title) : []);
    }
    getState() {
        const state = { ...this.options.store.state };
        const entries = (state.entries || []);
        const currentEntry = state.currentEntry;
        return { state, entries, currentEntry };
    }
    loadState() {
        const state = this.getState();
        this.entries = state.entries || [];
        this.currentEntry = state.currentEntry;
    }
    saveState(push = false) {
        const storedEntry = this.toStorableEntry(this.currentEntry);
        this.entries[storedEntry.index] = storedEntry;
        const state = {
            entries: this.entries,
            currentEntry: storedEntry,
        };
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
        if (this.currentEntry.untracked) {
            if (instruction.fromBrowser) {
                await this.options.store.popNavigatorState();
            }
            this.currentEntry.index--;
            this.entries[this.currentEntry.index] = this.toStorableEntry(this.currentEntry);
            await this.saveState();
        }
        else if (this.currentEntry.replacing) {
            this.entries[this.currentEntry.index] = this.toStorableEntry(this.currentEntry);
            await this.saveState();
        }
        else { // New entry (add and discard later entries)
            this.entries = this.entries.slice(0, this.currentEntry.index);
            this.entries.push(this.toStorableEntry(this.currentEntry));
            await this.saveState(true);
        }
        this.currentEntry.resolve();
    }
    async cancel(instruction) {
        if (instruction.fromBrowser) {
            if (instruction.navigation.new) {
                await this.options.store.popNavigatorState();
            }
            else {
                await this.options.store.go(-instruction.historyMovement, true);
            }
        }
        this.currentEntry.resolve();
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
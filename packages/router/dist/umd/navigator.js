(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel", "./queue"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const kernel_1 = require("@aurelia/kernel");
    const queue_1 = require("./queue");
    class Navigator {
        constructor() {
            this.entries = [];
            this.options = {
                statefulHistoryLength: 0,
            };
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
            this.uninitializedEntry = {
                instruction: 'NAVIGATOR UNINITIALIZED',
                fullStateInstruction: '',
            };
            this.currentEntry = this.uninitializedEntry;
            this.pendingNavigations = new queue_1.Queue(this.processNavigations);
        }
        get queued() {
            return this.pendingNavigations.length;
        }
        activate(router, options) {
            if (this.isActive) {
                throw new Error('Navigator has already been activated');
            }
            this.isActive = true;
            this.router = router;
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
        async saveState(push = false) {
            if (this.currentEntry === this.uninitializedEntry) {
                return Promise.resolve();
            }
            const storedEntry = this.toStoredEntry(this.currentEntry);
            this.entries[storedEntry.index !== undefined ? storedEntry.index : 0] = storedEntry;
            if (this.options.serializeCallback !== void 0 && this.options.statefulHistoryLength > 0) {
                const index = this.entries.length - this.options.statefulHistoryLength;
                for (let i = 0; i < index; i++) {
                    const entry = this.entries[i];
                    if (typeof entry.instruction !== 'string' || typeof entry.fullStateInstruction !== 'string') {
                        this.entries[i] = await this.options.serializeCallback(entry, this.entries.slice(index));
                    }
                }
            }
            if (!this.options.store) {
                return Promise.resolve();
            }
            const state = {
                entries: [],
                currentEntry: { ...this.toStoreableEntry(storedEntry) },
            };
            for (const entry of this.entries) {
                state.entries.push(this.toStoreableEntry(entry));
            }
            if (push) {
                return this.options.store.pushNavigatorState(state);
            }
            else {
                return this.options.store.replaceNavigatorState(state);
            }
        }
        toStoredEntry(entry) {
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
                this.entries[index] = this.toStoredEntry(this.currentEntry);
                await this.saveState();
            }
            else if (this.currentEntry.replacing) {
                this.entries[index] = this.toStoredEntry(this.currentEntry);
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
                this.entries.push(this.toStoredEntry(this.currentEntry));
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
            instruction.previous = this.toStoredEntry(previousEntry);
            kernel_1.Reporter.write(10000, 'callback', instruction, instruction.previous, this.entries);
            if (this.options.callback) {
                this.options.callback(instruction);
            }
        }
        toStoreableEntry(entry) {
            const storeable = { ...entry };
            if (storeable.instruction && typeof storeable.instruction !== 'string') {
                storeable.instruction = this.router.instructionResolver.stringifyViewportInstructions(storeable.instruction);
            }
            if (storeable.fullStateInstruction && typeof storeable.fullStateInstruction !== 'string') {
                storeable.fullStateInstruction = this.router.instructionResolver.stringifyViewportInstructions(storeable.fullStateInstruction);
            }
            return storeable;
        }
    }
    exports.Navigator = Navigator;
});
//# sourceMappingURL=navigator.js.map
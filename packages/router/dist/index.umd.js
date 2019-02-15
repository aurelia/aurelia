(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@aurelia/kernel'), require('@aurelia/runtime')) :
  typeof define === 'function' && define.amd ? define(['exports', '@aurelia/kernel', '@aurelia/runtime'], factory) :
  (global = global || self, factory(global.router = {}, global.kernel, global.runtime));
}(this, function (exports, kernel, runtime) { 'use strict';

  class QueuedBrowserHistory {
      constructor() {
          this.handlePopstate = async (ev) => {
              return this.enqueue(this, 'popstate', [ev]);
          };
          this.window = window;
          this.history = window.history;
          this.queue = [];
          this.isActive = false;
          this.currentHistoryActivity = null;
          this.callback = null;
          this.goResolve = null;
          this.suppressPopstateResolve = null;
      }
      activate(callback) {
          if (this.isActive) {
              throw kernel.Reporter.error(2003);
          }
          this.isActive = true;
          this.callback = callback;
          kernel.PLATFORM.ticker.add(this.dequeue, this);
          this.window.addEventListener('popstate', this.handlePopstate);
      }
      deactivate() {
          this.window.removeEventListener('popstate', this.handlePopstate);
          kernel.PLATFORM.ticker.remove(this.dequeue, this);
          this.callback = null;
          this.isActive = false;
      }
      get length() {
          return this.history.length;
      }
      // tslint:disable-next-line:no-any - typed according to DOM
      get state() {
          return this.history.state;
      }
      get scrollRestoration() {
          return this.history.scrollRestoration;
      }
      async go(delta, suppressPopstate = false) {
          if (!suppressPopstate) {
              return this.enqueue(this, '_go', [delta], true);
          }
          const promise = this.enqueue(this, 'suppressPopstate', [], true);
          this.enqueue(this.history, 'go', [delta]).catch(error => { throw error; });
          return promise;
      }
      back() {
          return this.go(-1);
      }
      forward() {
          return this.go(1);
      }
      // tslint:disable-next-line:no-any - typed according to DOM
      async pushState(data, title, url) {
          return this.enqueue(this.history, 'pushState', [data, title, url]);
      }
      // tslint:disable-next-line:no-any - typed according to DOM
      async replaceState(data, title, url) {
          return this.enqueue(this.history, 'replaceState', [data, title, url]);
      }
      async popstate(ev) {
          if (!this.suppressPopstateResolve) {
              if (this.goResolve) {
                  const resolve = this.goResolve;
                  this.goResolve = null;
                  resolve();
                  await Promise.resolve();
              }
              this.callback(ev);
          }
          else {
              const resolve = this.suppressPopstateResolve;
              this.suppressPopstateResolve = null;
              resolve();
          }
      }
      _go(delta, resolve) {
          this.goResolve = resolve;
          this.history.go(delta);
      }
      suppressPopstate(resolve) {
          this.suppressPopstateResolve = resolve;
      }
      enqueue(target, methodName, parameters, resolveInParameters = false) {
          let _resolve;
          // tslint:disable-next-line:promise-must-complete
          const promise = new Promise((resolve) => {
              _resolve = resolve;
          });
          if (resolveInParameters) {
              parameters.push(_resolve);
              _resolve = null;
          }
          this.queue.push({
              target: target,
              methodName: methodName,
              parameters: parameters,
              resolve: _resolve,
          });
          return promise;
      }
      async dequeue(delta) {
          if (!this.queue.length || this.currentHistoryActivity !== null) {
              return;
          }
          this.currentHistoryActivity = this.queue.shift();
          const method = this.currentHistoryActivity.target[this.currentHistoryActivity.methodName];
          kernel.Reporter.write(10000, 'DEQUEUE', this.currentHistoryActivity.methodName, this.currentHistoryActivity.parameters);
          method.apply(this.currentHistoryActivity.target, this.currentHistoryActivity.parameters);
          const resolve = this.currentHistoryActivity.resolve;
          this.currentHistoryActivity = null;
          if (resolve) {
              resolve();
          }
      }
  }

  class HistoryBrowser {
      constructor() {
          this.pathChanged = async () => {
              const path = this.getPath();
              const search = this.getSearch();
              kernel.Reporter.write(10000, 'path changed to', path, this.activeEntry, this.currentEntry);
              const navigationFlags = {};
              let previousEntry;
              let historyEntry = this.getState('HistoryEntry');
              if (this.activeEntry && this.activeEntry.path === path) { // Only happens with new history entries (including replacing ones)
                  navigationFlags.isNew = true;
                  const index = (this.isReplacing ? this.currentEntry.index : this.history.length - this.historyOffset);
                  previousEntry = this.currentEntry;
                  this.currentEntry = this.activeEntry;
                  this.currentEntry.index = index;
                  if (this.isReplacing) {
                      this.lastHistoryMovement = 0;
                      this.historyEntries[this.currentEntry.index] = this.currentEntry;
                      if (this.isRefreshing) {
                          navigationFlags.isRefresh = true;
                          this.isRefreshing = false;
                      }
                      else {
                          navigationFlags.isReplace = true;
                      }
                      this.isReplacing = false;
                  }
                  else {
                      this.lastHistoryMovement = 1;
                      this.historyEntries = this.historyEntries.slice(0, this.currentEntry.index);
                      this.historyEntries.push(this.currentEntry);
                  }
                  await this.setState({
                      'HistoryEntries': this.historyEntries,
                      'HistoryOffset': this.historyOffset,
                      'HistoryEntry': this.currentEntry
                  });
              }
              else { // Refresh, history navigation, first navigation, manual navigation or cancel
                  this.historyEntries = (this.historyEntries || this.getState('HistoryEntries') || []);
                  // tslint:disable-next-line:strict-boolean-expressions
                  this.historyOffset = (this.historyOffset || this.getState('HistoryOffset') || 0);
                  if (!historyEntry && !this.currentEntry) {
                      navigationFlags.isNew = true;
                      navigationFlags.isFirst = true;
                      this.historyOffset = this.history.length;
                  }
                  else if (!historyEntry) {
                      navigationFlags.isNew = true;
                  }
                  else if (!this.currentEntry) {
                      navigationFlags.isRefresh = true;
                  }
                  else if (this.currentEntry.index < historyEntry.index) {
                      navigationFlags.isForward = true;
                  }
                  else if (this.currentEntry.index > historyEntry.index) {
                      navigationFlags.isBack = true;
                  }
                  if (!historyEntry) {
                      // TODO: max history length of 50, find better new index
                      historyEntry = {
                          path: path,
                          fullStatePath: null,
                          index: this.history.length - this.historyOffset,
                          query: search,
                      };
                      if (navigationFlags.isFirst) {
                          historyEntry.firstEntry = true;
                      }
                      this.historyEntries = this.historyEntries.slice(0, historyEntry.index);
                      this.historyEntries.push(historyEntry);
                      await this.setState({
                          'HistoryEntries': this.historyEntries,
                          'HistoryOffset': this.historyOffset,
                          'HistoryEntry': historyEntry
                      });
                  }
                  this.lastHistoryMovement = (this.currentEntry ? historyEntry.index - this.currentEntry.index : 0);
                  previousEntry = this.currentEntry;
                  this.currentEntry = historyEntry;
              }
              this.activeEntry = null;
              kernel.Reporter.write(10000, 'navigated', this.getState('HistoryEntry'), this.historyEntries, this.getState('HistoryOffset'));
              this.callback(this.currentEntry, navigationFlags, previousEntry);
          };
          this.location = window.location;
          this.history = new QueuedBrowserHistory();
          this.currentEntry = null;
          this.historyEntries = null;
          this.historyOffset = null;
          this.replacedEntry = null;
          this.activeEntry = null;
          this.options = null;
          this.isActive = false;
          this.lastHistoryMovement = null;
          this.isReplacing = false;
          this.isRefreshing = false;
      }
      activate(options) {
          if (this.isActive) {
              throw kernel.Reporter.error(0); // TODO: create error code for 'History has already been activated.'
          }
          this.isActive = true;
          this.options = Object.assign({}, options);
          this.history.activate(this.pathChanged);
          return Promise.resolve().then(() => {
              this.setPath(this.getPath(), true).catch(error => { throw error; });
          });
      }
      deactivate() {
          this.history.deactivate();
          this.isActive = false;
      }
      goto(path, title, data) {
          this.activeEntry = {
              path: path,
              fullStatePath: null,
              title: title,
              data: data,
          };
          return this.setPath(path);
      }
      replace(path, title, data) {
          this.isReplacing = true;
          this.activeEntry = {
              path: path,
              fullStatePath: null,
              title: title,
              data: data,
          };
          return this.setPath(path, true);
      }
      async refresh() {
          if (!this.currentEntry) {
              return;
          }
          this.isRefreshing = true;
          return this.replace(this.currentEntry.path, this.currentEntry.title, this.currentEntry.data);
      }
      back() {
          return this.history.go(-1);
      }
      forward() {
          return this.history.go(1);
      }
      cancel() {
          const movement = this.lastHistoryMovement;
          if (movement) {
              this.lastHistoryMovement = 0;
              return this.history.go(-movement, true);
          }
          else {
              return this.replace(this.replacedEntry.path, this.replacedEntry.title, this.replacedEntry.data);
          }
      }
      async pop() {
          await this.history.go(-1, true);
          const path = this.location.toString();
          const state = this.history.state;
          // TODO: Fix browser forward bug after pop on first entry
          if (!state.HistoryEntry.firstEntry) {
              await this.history.go(-1, true);
              return this.history.pushState(state, null, path);
          }
      }
      async setState(key, value) {
          const { pathname, search, hash } = this.location;
          let state = Object.assign({}, this.history.state);
          if (typeof key === 'string') {
              state[key] = JSON.parse(JSON.stringify(value));
          }
          else {
              state = Object.assign({}, state, JSON.parse(JSON.stringify(key)));
          }
          return this.history.replaceState(state, null, `${pathname}${search}${hash}`);
      }
      getState(key) {
          const state = Object.assign({}, this.history.state);
          return state[key];
      }
      setEntryTitle(title) {
          this.currentEntry.title = title;
          this.historyEntries[this.currentEntry.index] = this.currentEntry;
          return this.setState({
              'HistoryEntries': this.historyEntries,
              'HistoryEntry': this.currentEntry,
          });
      }
      replacePath(path, fullStatePath, entry) {
          if (entry.index !== this.currentEntry.index) {
              // TODO: Store unresolved in localStorage to set if we should ever navigate back to it
              // tslint:disable-next-line:no-console
              console.warn('replacePath: entry not matching currentEntry', entry, this.currentEntry);
              return;
          }
          const newHash = `#/${path}`;
          const { pathname, search, hash } = this.location;
          // tslint:disable-next-line:possible-timing-attack
          if (newHash === hash && this.currentEntry.path === path && this.currentEntry.fullStatePath === fullStatePath) {
              return;
          }
          this.currentEntry.path = path;
          this.currentEntry.fullStatePath = fullStatePath;
          const state = Object.assign({}, this.history.state, {
              'HistoryEntry': this.currentEntry,
              'HistoryEntries': this.historyEntries,
          });
          return this.history.replaceState(state, null, `${pathname}${search}${newHash}`);
      }
      setHash(hash) {
          if (!hash.startsWith('#')) {
              hash = `#${hash}`;
          }
          this.location.hash = hash;
      }
      get titles() {
          return (this.historyEntries ? this.historyEntries.slice(0, this.currentEntry.index + 1).map((value) => value.title) : []);
      }
      getPath() {
          const hash = this.location.hash.substring(1);
          return hash.split('?')[0];
      }
      async setPath(path, replace = false) {
          // More checks, such as parameters, needed
          if (this.currentEntry && this.currentEntry.path === path && !this.isRefreshing) {
              return;
          }
          const { pathname, search } = this.location;
          const hash = `#${path}`;
          if (replace) {
              this.replacedEntry = this.currentEntry;
              await this.history.replaceState({}, null, `${pathname}${search}${hash}`);
          }
          else {
              // tslint:disable-next-line:no-commented-code
              // this.location.hash = hash;
              await this.history.pushState({}, null, `${pathname}${search}${hash}`);
          }
          return this.pathChanged();
      }
      getSearch() {
          const hash = this.location.hash.substring(1);
          const hashSearches = hash.split('?');
          hashSearches.shift();
          return hashSearches.length > 0 ? hashSearches.shift() : '';
      }
      callback(currentEntry, navigationFlags, previousEntry) {
          const instruction = Object.assign({}, currentEntry, navigationFlags);
          instruction.previous = previousEntry;
          kernel.Reporter.write(10000, 'callback', currentEntry, navigationFlags);
          if (this.options.callback) {
              this.options.callback(instruction);
          }
      }
  }

  /**
   * Class responsible for handling interactions that should trigger navigation.
   */
  class LinkHandler {
      constructor() {
          this.isActive = false;
          this.handler = (e) => {
              const info = LinkHandler.getEventInfo(e);
              if (info.shouldHandleEvent) {
                  e.preventDefault();
                  this.options.callback(info);
              }
          };
          this.document = document;
      }
      /**
       * Gets the href and a "should handle" recommendation, given an Event.
       *
       * @param event The Event to inspect for target anchor and href.
       */
      static getEventInfo(event) {
          const info = {
              shouldHandleEvent: false,
              href: null,
              anchor: null
          };
          const target = LinkHandler.closestAnchor(event.target);
          if (!target || !LinkHandler.targetIsThisWindow(target)) {
              return info;
          }
          if (target.hasAttribute('external')) {
              return info;
          }
          if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
              return info;
          }
          const href = target.getAttribute('href');
          info.anchor = target;
          info.href = href;
          const leftButtonClicked = event.which === 1;
          info.shouldHandleEvent = leftButtonClicked;
          return info;
      }
      /**
       * Finds the closest ancestor that's an anchor element.
       *
       * @param el The element to search upward from.
       * @returns The link element that is the closest ancestor.
       */
      static closestAnchor(el) {
          while (el) {
              if (el.tagName === 'A') {
                  return el;
              }
              el = el.parentNode;
          }
      }
      /**
       * Gets a value indicating whether or not an anchor targets the current window.
       *
       * @param target The anchor element whose target should be inspected.
       * @returns True if the target of the link element is this window; false otherwise.
       */
      static targetIsThisWindow(target) {
          const targetWindow = target.getAttribute('target');
          const win = LinkHandler.window;
          return !targetWindow ||
              targetWindow === win.name ||
              targetWindow === '_self';
      }
      /**
       * Activate the instance.
       *
       */
      activate(options) {
          if (this.isActive) {
              throw kernel.Reporter.error(2004);
          }
          this.isActive = true;
          this.options = Object.assign({}, options);
          this.document.addEventListener('click', this.handler, true);
      }
      /**
       * Deactivate the instance. Event handlers and other resources should be cleaned up here.
       */
      deactivate() {
          this.document.removeEventListener('click', this.handler, true);
          this.isActive = false;
      }
  }

  class ViewportInstruction {
      constructor(component, viewport, parameters) {
          this.initialize(component, viewport, parameters);
      }
      initialize(component, viewport, parameters) {
          if (typeof component === 'string') {
              this.componentName = component;
              this.component = null;
          }
          else {
              this.component = component;
              this.componentName = component.description.name;
          }
          if (typeof viewport === 'string') {
              this.viewportName = viewport;
              this.viewport = null;
          }
          else {
              this.viewport = viewport;
              if (viewport) {
                  this.viewportName = viewport.name;
              }
          }
          if (typeof parameters === 'string') {
              this.parametersString = parameters;
              // TODO: Initialize parameters better and more of them and just fix this
              this.parameters = { id: parameters };
          }
          else {
              this.parameters = parameters;
              // TODO: Create parametersString
          }
          // TODO: Deal with parametersList
      }
      componentType(context) {
          if (this.component !== null) {
              return this.component;
          }
          const container = context.get(kernel.IContainer);
          const resolver = container.getResolver(runtime.CustomElementResource.keyFrom(this.componentName));
          if (resolver !== null) {
              return resolver.getFactory(container).Type;
          }
          return null;
      }
      viewportInstance(router) {
          if (this.viewport !== null) {
              return this.viewport;
          }
          return router.allViewports()[this.viewportName];
      }
      sameComponent(other, compareParameters = false, compareType = false) {
          if (compareParameters && this.parametersString !== other.parametersString) {
              return false;
          }
          return compareType ? this.component === other.component : this.componentName === other.componentName;
      }
  }

  class NavRoute {
      constructor(nav, route) {
          this.active = '';
          this.nav = nav;
          Object.assign(this, {
              title: route.title,
              children: null,
              meta: route.meta,
              active: '',
          });
          this.instructions = this.parseRoute(route.route);
          this.link = this._link(this.instructions);
          this.linkActive = route.consideredActive ? this._link(this.parseRoute(route.consideredActive)) : this.link;
          this.observerLocator = this.nav.router.container.get(runtime.IObserverLocator);
          this.observer = this.observerLocator.getObserver(0 /* none */, this.nav.router, 'activeComponents');
          this.observer.subscribe(this);
      }
      get hasChildren() {
          return (this.children && this.children.length ? 'nav-has-children' : '');
      }
      handleChange() {
          if (this.link && this.link.length) {
              this.active = this._active();
          }
          else {
              this.active = (this.active === 'nav-active' ? 'nav-active' : (this.activeChild() ? 'nav-active-child' : ''));
          }
      }
      _active() {
          const components = this.nav.router.instructionResolver.viewportInstructionsFromString(this.linkActive);
          const activeComponents = this.nav.router.activeComponents.map((state) => this.nav.router.instructionResolver.parseViewportInstruction(state));
          for (const component of components) {
              if (!activeComponents.find((active) => active.sameComponent(component))) {
                  return '';
              }
          }
          return 'nav-active';
      }
      toggleActive() {
          this.active = (this.active.startsWith('nav-active') ? '' : 'nav-active');
      }
      _link(instructions) {
          return this.nav.router.instructionResolver.viewportInstructionsToString(instructions);
      }
      parseRoute(routes) {
          if (!Array.isArray(routes)) {
              return this.parseRoute([routes]);
          }
          const instructions = [];
          for (const route of routes) {
              if (typeof route === 'string') {
                  instructions.push(this.nav.router.instructionResolver.parseViewportInstruction(route));
              }
              else if (route instanceof ViewportInstruction) {
                  instructions.push(route);
              }
              else if (route['component']) {
                  const viewportComponent = route;
                  instructions.push(new ViewportInstruction(viewportComponent.component, viewportComponent.viewport, viewportComponent.parameters));
              }
              else {
                  instructions.push(new ViewportInstruction(route));
              }
          }
          return instructions;
      }
      activeChild() {
          if (this.children) {
              for (const child of this.children) {
                  if (child.active.startsWith('nav-active') || child.activeChild()) {
                      return true;
                  }
              }
          }
          return false;
      }
  }

  class Nav {
      constructor(router, name) {
          this.router = router;
          this.name = name;
          this.routes = [];
      }
      addRoutes(routes) {
          for (const route of routes) {
              this.addRoute(this.routes, route);
          }
      }
      addRoute(routes, route) {
          const newRoute = new NavRoute(this, route);
          routes.push(newRoute);
          if (route.children) {
              newRoute.children = [];
              for (const child of route.children) {
                  this.addRoute(newRoute.children, child);
              }
          }
      }
  }

  class HandlerEntry {
      constructor(handler, names) {
          this.handler = handler;
          this.names = names;
      }
  }
  /*
  * An object that is indexed and used for route generation, particularly for dynamic routes.
  */
  class RouteGenerator {
      constructor(segments, handlers) {
          this.segments = segments;
          this.handlers = handlers;
      }
  }
  class TypesRecord {
      constructor() {
          this.statics = 0;
          this.dynamics = 0;
          this.stars = 0;
      }
  }
  class RecognizeResult {
      constructor(handler, params, isDynamic) {
          this.handler = handler;
          this.params = params;
          this.isDynamic = isDynamic;
      }
  }
  class CharSpec {
      constructor(invalidChars, validChars, repeat) {
          this.invalidChars = invalidChars;
          this.validChars = validChars;
          this.repeat = repeat;
      }
      equals(other) {
          return this.validChars === other.validChars && this.invalidChars === other.invalidChars;
      }
  }
  class State {
      constructor(charSpec) {
          this.charSpec = charSpec;
          this.nextStates = [];
      }
      put(charSpec) {
          let state = this.nextStates.find(s => s.charSpec.equals(charSpec));
          if (state === undefined) {
              state = new State(charSpec);
              this.nextStates.push(state);
              if (charSpec.repeat) {
                  state.nextStates.push(state);
              }
          }
          return state;
      }
  }
  const specials = [
      '/', '.', '*', '+', '?', '|',
      '(', ')', '[', ']', '{', '}', '\\'
  ];
  const escapeRegex = new RegExp(`(\\${specials.join('|\\')})`, 'g');
  // A Segment represents a segment in the original route description.
  // Each Segment type provides an `eachChar` and `regex` method.
  //
  // The `eachChar` method invokes the callback with one or more character
  // specifications. A character specification consumes one or more input
  // characters.
  //
  // The `regex` method returns a regex fragment for the segment. If the
  // segment is a dynamic or star segment, the regex fragment also includes
  // a capture.
  //
  // A character specification contains:
  //
  // * `validChars`: a String with a list of all valid characters, or
  // * `invalidChars`: a String with a list of all invalid characters
  // * `repeat`: true if the character specification can repeat
  class StaticSegment {
      constructor(str, caseSensitive) {
          this.name = str;
          this.string = str;
          this.caseSensitive = caseSensitive;
          this.optional = false;
      }
      eachChar(callback) {
          const s = this.string;
          const len = s.length;
          let i = 0;
          let ch = '';
          if (this.caseSensitive) {
              for (; i < len; ++i) {
                  ch = s.charAt(i);
                  callback(new CharSpec(null, ch, false));
              }
          }
          else {
              for (; i < len; ++i) {
                  ch = s.charAt(i);
                  callback(new CharSpec(null, ch.toUpperCase() + ch.toLowerCase(), false));
              }
          }
      }
      regex() {
          return this.string.replace(escapeRegex, '\\$1');
      }
      generate(params, consumed) {
          return this.string;
      }
  }
  class DynamicSegment {
      constructor(name, optional) {
          this.name = name;
          this.optional = optional;
      }
      eachChar(callback) {
          callback(new CharSpec('/', null, true));
      }
      regex() {
          return '([^/]+)';
      }
      generate(params, consumed) {
          consumed[this.name] = true;
          return params[this.name];
      }
  }
  class StarSegment {
      constructor(name) {
          this.name = name;
          this.optional = false;
      }
      eachChar(callback) {
          callback(new CharSpec('', null, true));
      }
      regex() {
          return '(.+)';
      }
      generate(params, consumed) {
          consumed[this.name] = true;
          return params[this.name];
      }
  }
  class EpsilonSegment {
      eachChar(callback) {
          return;
      }
      regex() {
          return '';
      }
      generate(params, consumed) {
          return '';
      }
  }
  /**
   * Class that parses route patterns and matches path strings.
   */
  class RouteRecognizer {
      constructor() {
          this.rootState = new State();
          this.names = {};
          this.routes = new Map();
      }
      /**
       * Parse a route pattern and add it to the collection of recognized routes.
       *
       * @param route The route to add.
       */
      add(route) {
          if (Array.isArray(route)) {
              route.forEach(r => {
                  this.add(r);
              });
              return;
          }
          let currentState = this.rootState;
          const skippableStates = [];
          let regex = '^';
          const types = new TypesRecord();
          const names = [];
          const routeName = route.handler.name;
          let isEmpty = true;
          let normalizedRoute = route.path;
          if (normalizedRoute.charAt(0) === '/') {
              normalizedRoute = normalizedRoute.slice(1);
          }
          const segments = [];
          const splitRoute = normalizedRoute.split('/');
          let part;
          let segment;
          for (let i = 0, ii = splitRoute.length; i < ii; ++i) {
              part = splitRoute[i];
              // Try to parse a parameter :param?
              let match = part.match(/^:([^?]+)(\?)?$/);
              if (match) {
                  const [, name, optional] = match;
                  if (name.indexOf('=') !== -1) {
                      throw new Error(`Parameter ${name} in route ${route} has a default value, which is not supported.`);
                  }
                  segments.push(segment = new DynamicSegment(name, !!optional));
                  names.push(name);
                  types.dynamics++;
              }
              else {
                  // Try to parse a star segment *whatever
                  match = part.match(/^\*(.+)$/);
                  if (match) {
                      segments.push(segment = new StarSegment(match[1]));
                      names.push(match[1]);
                      types.stars++;
                  }
                  else if (part === '') {
                      segments.push(new EpsilonSegment());
                      continue;
                  }
                  else {
                      segments.push(segment = new StaticSegment(part, route.caseSensitive));
                      types.statics++;
                  }
              }
              // Add a representation of the segment to the NFA and regex
              const firstState = currentState.put(new CharSpec(null, '/', false));
              let nextState = firstState;
              segment.eachChar(ch => {
                  nextState = nextState.put(ch);
              });
              // add the first part of the next segment to the end of any skipped states
              for (let j = 0, jj = skippableStates.length; j < jj; j++) {
                  skippableStates[j].nextStates.push(firstState);
              }
              // If the segment was optional we don't fast forward to the end of the
              // segment, but we do hold on to a reference to the end of the segment
              // for adding future segments. Multiple consecutive optional segments
              // will accumulate.
              if (segment.optional) {
                  skippableStates.push(nextState);
                  regex += `(?:/${segment.regex()})?`;
                  // Otherwise, we fast forward to the end of the segment and remove any
                  // references to skipped segments since we don't need them anymore.
              }
              else {
                  currentState = nextState;
                  regex += `/${segment.regex()}`;
                  skippableStates.length = 0;
                  isEmpty = false;
              }
          }
          // An "all optional" path is technically empty since currentState is this.rootState
          if (isEmpty) {
              currentState = currentState.put(new CharSpec(null, '/', false));
              regex += '/?';
          }
          const handlers = [new HandlerEntry(route.handler, names)];
          this.routes.set(route.handler, new RouteGenerator(segments, handlers));
          if (routeName) {
              const routeNames = Array.isArray(routeName) ? routeName : [routeName];
              for (let i = 0; i < routeNames.length; i++) {
                  if (!(routeNames[i] in this.names)) {
                      this.names[routeNames[i]] = new RouteGenerator(segments, handlers);
                  }
              }
          }
          // Any trailing skipped states need to be endpoints and need to have
          // handlers attached.
          for (let i = 0; i < skippableStates.length; i++) {
              const state = skippableStates[i];
              state.handlers = handlers;
              state.regex = new RegExp(`${regex}$`, route.caseSensitive ? '' : 'i');
              state.types = types;
          }
          currentState.handlers = handlers;
          currentState.regex = new RegExp(`${regex}$`, route.caseSensitive ? '' : 'i');
          currentState.types = types;
          return currentState;
      }
      /**
       * Retrieve a RouteGenerator for a route by name or RouteConfig (RouteHandler).
       *
       * @param nameOrRoute The name of the route or RouteConfig object.
       * @returns The RouteGenerator for that route.
       */
      getRoute(nameOrRoute) {
          return typeof (nameOrRoute) === 'string' ? this.names[nameOrRoute] : this.routes.get(nameOrRoute);
      }
      /**
       * Retrieve the handlers registered for the route by name or RouteConfig (RouteHandler).
       *
       * @param nameOrRoute The name of the route or RouteConfig object.
       * @returns The handlers.
       */
      handlersFor(nameOrRoute) {
          const route = this.getRoute(nameOrRoute);
          if (!route) {
              throw new Error(`There is no route named ${nameOrRoute}`);
          }
          return [...route.handlers];
      }
      /**
       * Check if this RouteRecognizer recognizes a route by name or RouteConfig (RouteHandler).
       *
       * @param nameOrRoute The name of the route or RouteConfig object.
       * @returns True if the named route is recognized.
       */
      hasRoute(nameOrRoute) {
          return !!this.getRoute(nameOrRoute);
      }
      /**
       * Generate a path and query string from a route name or RouteConfig (RouteHandler) and params object.
       *
       * @param nameOrRoute The name of the route or RouteConfig object.
       * @param params The route params to use when populating the pattern.
       *  Properties not required by the pattern will be appended to the query string.
       * @returns The generated absolute path and query string.
       */
      generate(nameOrRoute, params) {
          const route = this.getRoute(nameOrRoute);
          if (!route) {
              throw new Error(`There is no route named ${nameOrRoute}`);
          }
          const handler = route.handlers[0].handler;
          if (handler.generationUsesHref) {
              return handler.href;
          }
          const routeParams = Object.assign({}, params);
          const segments = route.segments;
          const consumed = {};
          let output = '';
          for (let i = 0, l = segments.length; i < l; i++) {
              const segment = segments[i];
              if (segment instanceof EpsilonSegment) {
                  continue;
              }
              const segmentValue = segment.generate(routeParams, consumed);
              if (segmentValue === null || segmentValue === undefined) {
                  if (!segment.optional) {
                      throw new Error(`A value is required for route parameter '${segment.name}' in route '${nameOrRoute}'.`);
                  }
              }
              else {
                  output += '/';
                  output += segmentValue;
              }
          }
          if (output.charAt(0) !== '/') {
              output = `/${output}`;
          }
          // remove params used in the path and add the rest to the querystring
          for (const param in consumed) {
              Reflect.deleteProperty(routeParams, param);
          }
          const queryString = kernel.buildQueryString(routeParams);
          output += queryString ? `?${queryString}` : '';
          return output;
      }
      /**
       * Match a path string against registered route patterns.
       *
       * @param path The path to attempt to match.
       * @returns Array of objects containing `handler`, `params`, and
       *  `isDynamic` values for the matched route(s), or undefined if no match
       *  was found.
       */
      recognize(path) {
          let states = [this.rootState];
          let queryParams = {};
          let isSlashDropped = false;
          let normalizedPath = path;
          const queryStart = normalizedPath.indexOf('?');
          if (queryStart !== -1) {
              const queryString = normalizedPath.slice(queryStart + 1);
              normalizedPath = normalizedPath.slice(0, queryStart);
              queryParams = kernel.parseQueryString(queryString);
          }
          normalizedPath = decodeURI(normalizedPath);
          if (normalizedPath.charAt(0) !== '/') {
              normalizedPath = `/${normalizedPath}`;
          }
          let pathLen = normalizedPath.length;
          if (pathLen > 1 && normalizedPath.charAt(pathLen - 1) === '/') {
              normalizedPath = normalizedPath.slice(0, -1);
              isSlashDropped = true;
              --pathLen;
          }
          for (let i = 0; i < pathLen; ++i) {
              const nextStates = [];
              const ch = normalizedPath.charAt(i);
              states.forEach(state => {
                  state.nextStates.forEach(nextState => {
                      if (nextState.charSpec.validChars !== null) {
                          if (nextState.charSpec.validChars.indexOf(ch) !== -1) {
                              nextStates.push(nextState);
                          }
                      }
                      else if (nextState.charSpec.invalidChars !== null
                          && nextState.charSpec.invalidChars.indexOf(ch) === -1) {
                          nextStates.push(nextState);
                      }
                  });
              });
              states = nextStates;
              if (states.length === 0) {
                  break;
              }
          }
          const solutions = [];
          for (let i = 0, l = states.length; i < l; i++) {
              if (states[i].handlers) {
                  solutions.push(states[i]);
              }
          }
          // This is a somewhat naive strategy, but should work in a lot of cases
          // A better strategy would properly resolve /posts/:id/new and /posts/edit/:id.
          //
          // This strategy generally prefers more static and less dynamic matching.
          // Specifically, it
          //
          //  * prefers fewer stars to more, then
          //  * prefers using stars for less of the match to more, then
          //  * prefers fewer dynamic segments to more, then
          //  * prefers more static segments to more
          solutions.sort((a, b) => {
              if (a.types.stars !== b.types.stars) {
                  return a.types.stars - b.types.stars;
              }
              if (a.types.stars) {
                  if (a.types.statics !== b.types.statics) {
                      return b.types.statics - a.types.statics;
                  }
                  if (a.types.dynamics !== b.types.dynamics) {
                      return b.types.dynamics - a.types.dynamics;
                  }
              }
              if (a.types.dynamics !== b.types.dynamics) {
                  return a.types.dynamics - b.types.dynamics;
              }
              if (a.types.statics !== b.types.statics) {
                  return b.types.statics - a.types.statics;
              }
              return 0;
          });
          const solution = solutions[0];
          if (solution && solution.handlers) {
              // if a trailing slash was dropped and a star segment is the last segment
              // specified, put the trailing slash back
              if (isSlashDropped && solution.regex.source.slice(-5) === '(.+)$') {
                  normalizedPath = `${normalizedPath}/`;
              }
              const captures = normalizedPath.match(solution.regex);
              let currentCapture = 1;
              const result = [];
              result.queryParams = queryParams;
              solution.handlers.forEach(handler => {
                  const params = {};
                  handler.names.forEach(name => {
                      params[name] = captures[currentCapture++];
                  });
                  result.push(new RecognizeResult(handler.handler, params, handler.names.length > 0));
              });
              return result;
          }
      }
  }

  class InstructionResolver {
      activate(options) {
          this.separators = Object.assign({
              viewport: '@',
              sibling: '+',
              scope: '/',
              ownsScope: '!',
              parameters: '=',
              add: '+',
              clear: '-',
              action: '.',
          }, options.separators);
      }
      get clearViewportInstruction() {
          return this.separators.clear;
      }
      parseViewportInstruction(instruction) {
          let component, viewport, parameters;
          const [componentPart, rest] = instruction.split(this.separators.viewport);
          if (rest === undefined) {
              [component, parameters] = componentPart.split(this.separators.parameters);
          }
          else {
              component = componentPart;
              [viewport, parameters] = rest.split(this.separators.parameters);
          }
          return new ViewportInstruction(component, viewport, parameters);
      }
      stringifyViewportInstruction(instruction) {
          let instructionString = instruction.componentName;
          if (instruction.viewportName) {
              instructionString += this.separators.viewport + instruction.viewportName;
          }
          if (instruction.parametersString) {
              // TODO: Review parameters in ViewportInstruction
              instructionString += this.separators.parameters + instruction.parametersString;
          }
          return instructionString;
      }
      buildScopedLink(scopeContext, href) {
          if (scopeContext) {
              href = `/${scopeContext}${this.separators.scope}${href}`;
          }
          return href;
      }
      shouldClearViewports(path) {
          const clearViewports = (path === this.separators.clear || path.startsWith(this.separators.clear + this.separators.add));
          const newPath = path.startsWith(this.separators.clear) ? path.substring(1) : path;
          return { clearViewports, newPath };
      }
      findViews(path) {
          const views = {};
          // TODO: Let this govern start of scope
          if (path.startsWith('/')) {
              path = path.substring(1);
          }
          const sections = path.split(this.separators.sibling);
          // TODO: Remove this once multi level recursiveness is fixed
          // Expand with instances for all containing views
          // const expandedSections: string[] = [];
          // while (sections.length) {
          //   const part = sections.shift();
          //   const parts = part.split(this.separators.scope);
          //   for (let i = 1; i <= parts.length; i++) {
          //     expandedSections.push(parts.slice(0, i).join(this.separators.scope));
          //   }
          // }
          // sections = expandedSections;
          let index = 0;
          while (sections.length) {
              const view = sections.shift();
              const scopes = view.split(this.separators.scope);
              const leaf = scopes.pop();
              const parts = leaf.split(this.separators.viewport);
              // Noooooo?
              const component = parts[0];
              scopes.push(parts.length ? parts.join(this.separators.viewport) : `?${index++}`);
              const name = scopes.join(this.separators.scope);
              if (component) {
                  views[name] = component;
              }
          }
          return views;
      }
      viewportInstructionsToString(instructions) {
          const stringInstructions = [];
          for (const instruction of instructions) {
              stringInstructions.push(this.stringifyViewportInstruction(instruction));
          }
          return stringInstructions.join(this.separators.sibling);
      }
      viewportInstructionsFromString(instructionsString) {
          const instructions = [];
          const instructionStrings = instructionsString.split(this.separators.sibling);
          for (const instructionString of instructionStrings) {
              instructions.push(this.parseViewportInstruction(instructionString));
          }
          return instructions;
      }
      removeStateDuplicates(states) {
          let sorted = states.slice().sort((a, b) => b.split(this.separators.scope).length - a.split(this.separators.scope).length);
          sorted = sorted.map((value) => `${this.separators.scope}${value}${this.separators.scope}`);
          let unique = [];
          if (sorted.length) {
              unique.push(sorted.shift());
              while (sorted.length) {
                  const state = sorted.shift();
                  if (unique.find((value) => {
                      return value.indexOf(state) === -1;
                  })) {
                      unique.push(state);
                  }
              }
          }
          unique = unique.map((value) => value.substring(1, value.length - 1));
          unique.sort((a, b) => a.split(this.separators.scope).length - b.split(this.separators.scope).length);
          return unique;
      }
      stateStringsToString(stateStrings, clear = false) {
          const strings = stateStrings.slice();
          if (clear) {
              strings.unshift(this.clearViewportInstruction);
          }
          return strings.join(this.separators.sibling);
      }
  }

  function parseQuery(query) {
      const parameters = {};
      const list = [];
      if (!query || !query.length) {
          return { parameters: parameters, list: list };
      }
      const params = query.replace('+', ' ').split('&');
      for (const param of params) {
          const kv = param.split('=');
          const key = decodeURIComponent(kv.shift());
          if (!kv.length) {
              list.push(key);
              continue;
          }
          const value = decodeURIComponent(kv.shift());
          parameters[key] = value;
          // TODO: Deal with complex parameters such as lists and objects
      }
      return { parameters: parameters, list: list };
  }
  function mergeParameters(parameters, query, specifiedParameters) {
      const parsedQuery = parseQuery(query);
      const parsedParameters = parseQuery(parameters);
      const params = Object.assign({}, parsedQuery.parameters, parsedParameters.parameters);
      const list = [...parsedQuery.list, ...parsedParameters.list];
      if (list.length && specifiedParameters && specifiedParameters.length) {
          for (const param of specifiedParameters) {
              // TODO: Support data types
              params[param] = list.shift();
          }
      }
      if (list.length && Object.keys(params).length) {
          params['-unnamed'] = list.splice(0, list.length);
      }
      let merged;
      if (list.length) {
          merged = list;
      }
      else {
          merged = params;
      }
      return {
          namedParameters: params,
          parameterList: list,
          merged: merged,
      };
  }

  var ContentStatus;
  (function (ContentStatus) {
      ContentStatus[ContentStatus["none"] = 0] = "none";
      ContentStatus[ContentStatus["loaded"] = 1] = "loaded";
      ContentStatus[ContentStatus["initialized"] = 2] = "initialized";
      ContentStatus[ContentStatus["entered"] = 3] = "entered";
      ContentStatus[ContentStatus["added"] = 4] = "added";
  })(ContentStatus || (ContentStatus = {}));
  class ViewportContent {
      constructor(content = null, parameters = null, instruction = null, context = null) {
          // Can be a (resolved) type or a string (to be resolved later)
          this.content = content;
          this.parameters = parameters;
          this.instruction = instruction;
          this.component = null;
          this.contentStatus = 0 /* none */;
          this.fromCache = false;
          // If we've got a container, we're good to resolve type
          if (this.content !== null && typeof this.content === 'string' && context !== null) {
              this.content = this.componentType(context);
          }
      }
      isChange(other) {
          return ((typeof other.content === 'string' && this.componentName() !== other.content) ||
              (typeof other.content !== 'string' && this.content !== other.content) ||
              this.parameters !== other.parameters ||
              !this.instruction || this.instruction.query !== other.instruction.query);
      }
      isCacheEqual(other) {
          return ((typeof other.content === 'string' && this.componentName() === other.content) ||
              (typeof other.content !== 'string' && this.content === other.content)) &&
              this.parameters === other.parameters;
      }
      loadComponent(context, element) {
          // Don't load cached content
          if (!this.fromCache) {
              this.component = this.componentInstance(context);
              const host = element;
              const container = context;
              this.component.$hydrate(0 /* none */, container, host);
          }
          this.contentStatus = 1 /* loaded */;
          return Promise.resolve();
      }
      unloadComponent() {
          // TODO: We might want to do something here eventually, who knows?
          if (this.contentStatus !== 1 /* loaded */) {
              return;
          }
          // Don't unload components when stateful
          this.contentStatus = 0 /* none */;
      }
      initializeComponent() {
          // Don't initialize cached content
          if (!this.fromCache) {
              this.component.$bind(512 /* fromStartTask */ | 2048 /* fromBind */, null);
          }
          this.contentStatus = 2 /* initialized */;
      }
      terminateComponent(stateful = false) {
          if (this.contentStatus !== 2 /* initialized */) {
              return;
          }
          // Don't terminate cached content
          if (!stateful) {
              this.component.$unbind(1024 /* fromStopTask */ | 4096 /* fromUnbind */);
              this.contentStatus = 1 /* loaded */;
          }
      }
      addComponent(element) {
          this.component.$attach(512 /* fromStartTask */);
          if (this.fromCache) {
              const elements = Array.from(element.getElementsByTagName('*'));
              for (const el of elements) {
                  if (el.hasAttribute('au-element-scroll')) {
                      const [top, left] = el.getAttribute('au-element-scroll').split(',');
                      el.removeAttribute('au-element-scroll');
                      el.scrollTo(+left, +top);
                  }
              }
          }
          this.contentStatus = 4 /* added */;
      }
      removeComponent(element, stateful = false) {
          if (this.contentStatus !== 4 /* added */) {
              return;
          }
          if (stateful) {
              const elements = Array.from(element.getElementsByTagName('*'));
              for (const el of elements) {
                  if (el.scrollTop > 0 || el.scrollLeft) {
                      el.setAttribute('au-element-scroll', `${el.scrollTop},${el.scrollLeft}`);
                  }
              }
          }
          this.component.$detach(1024 /* fromStopTask */);
          this.contentStatus = 4 /* added */;
      }
      async freeContent(element, stateful = false) {
          switch (this.contentStatus) {
              case 4 /* added */:
                  this.removeComponent(element, stateful);
              case 3 /* entered */:
                  if (this.component.leave) {
                      await this.component.leave();
                  }
                  this.contentStatus = 2 /* initialized */;
              case 2 /* initialized */:
                  this.terminateComponent(stateful);
              case 1 /* loaded */:
                  this.unloadComponent();
          }
          this.contentStatus = 0 /* none */;
      }
      componentName() {
          if (this.content === null) {
              return null;
          }
          else if (typeof this.content === 'string') {
              return this.content;
          }
          else {
              return (this.content).description.name;
          }
      }
      componentType(context) {
          if (this.content === null) {
              return null;
          }
          else if (typeof this.content !== 'string') {
              return this.content;
          }
          else {
              const container = context.get(kernel.IContainer);
              const resolver = container.getResolver(runtime.CustomElementResource.keyFrom(this.content));
              if (resolver !== null) {
                  return resolver.getFactory(container).Type;
              }
              return null;
          }
      }
      componentInstance(context) {
          if (this.content === null) {
              return null;
          }
          // TODO: Remove once "local registration is fixed"
          const component = this.componentName();
          const container = context.get(kernel.IContainer);
          if (typeof component !== 'string') {
              return container.get(component);
          }
          else {
              return container.get(runtime.CustomElementResource.keyFrom(component));
          }
      }
  }

  class Viewport {
      constructor(router, name, element, context, owningScope, scope, options) {
          this.router = router;
          this.name = name;
          this.element = element;
          this.context = context;
          this.owningScope = owningScope;
          this.scope = scope;
          this.options = options;
          this.clear = false;
          this.content = new ViewportContent();
          this.nextContent = null;
          this.elementResolve = null;
          this.previousViewportState = null;
          this.cache = [];
          this.enabled = true;
      }
      setNextContent(content, instruction) {
          let parameters;
          this.clear = false;
          if (typeof content === 'string') {
              if (content === this.router.instructionResolver.clearViewportInstruction) {
                  this.clear = true;
                  content = null;
              }
              else {
                  const cp = content.split(this.router.instructionResolver.separators.parameters);
                  content = cp.shift();
                  parameters = cp.length ? cp.join(this.router.instructionResolver.separators.parameters) : null;
              }
          }
          // Can have a (resolved) type or a string (to be resolved later)
          this.nextContent = new ViewportContent(content, parameters, instruction, this.context);
          if (this.options.stateful) {
              // TODO: Add a parameter here to decide required equality
              const cached = this.cache.find((item) => this.nextContent.isCacheEqual(item));
              if (cached) {
                  this.nextContent = cached;
                  this.nextContent.fromCache = true;
              }
              else {
                  this.cache.push(this.nextContent);
              }
          }
          return this.content.isChange(this.nextContent) || instruction.isRefresh;
      }
      setElement(element, context, options) {
          // First added viewport with element is always scope viewport (except for root scope)
          if (this.scope && this.scope.parent && !this.scope.viewport) {
              this.scope.viewport = this;
          }
          if (this.scope && !this.scope.element) {
              this.scope.element = element;
          }
          if (this.element !== element) {
              // TODO: Restore this state on navigation cancel
              this.previousViewportState = Object.assign({}, this);
              this.clearState();
              this.element = element;
              if (options && options.usedBy) {
                  this.options.usedBy = options.usedBy;
              }
              if (options && options.default) {
                  this.options.default = options.default;
              }
              if (options && options.noLink) {
                  this.options.noLink = options.noLink;
              }
              if (options && options.noHistory) {
                  this.options.noHistory = options.noHistory;
              }
              if (options && options.stateful) {
                  this.options.stateful = options.stateful;
              }
              if (this.elementResolve) {
                  this.elementResolve();
              }
          }
          if (this.context !== context) {
              this.context = context;
          }
          if (!this.content.component && (!this.nextContent || !this.nextContent.component) && this.options.default) {
              this.router.addProcessingViewport(this.options.default, this);
          }
      }
      remove(element, context) {
          if (this.element === element && this.context === context) {
              if (this.content.component) {
                  this.content.freeContent(this.element, this.options.stateful).catch(error => { throw error; });
              }
              return true;
          }
          return false;
      }
      async canLeave() {
          if (!this.content.component) {
              return true;
          }
          const component = this.content.component;
          if (!component.canLeave) {
              return true;
          }
          kernel.Reporter.write(10000, 'viewport canLeave', component.canLeave(this.content.instruction, this.nextContent.instruction));
          return component.canLeave(this.content.instruction, this.nextContent.instruction);
      }
      async canEnter() {
          if (this.clear) {
              return true;
          }
          if (!this.nextContent.content) {
              return false;
          }
          await this.waitForElement();
          await this.nextContent.loadComponent(this.context, this.element);
          if (!this.nextContent.component) {
              return false;
          }
          const component = this.nextContent.component;
          if (!component.canEnter) {
              return true;
          }
          const result = component.canEnter(this.nextContent.instruction, this.content.instruction);
          kernel.Reporter.write(10000, 'viewport canEnter', result);
          if (typeof result === 'boolean') {
              return result;
          }
          if (typeof result === 'string') {
              return [new ViewportInstruction(result, this)];
          }
          return result;
      }
      async enter() {
          kernel.Reporter.write(10000, 'Viewport enter', this.name);
          if (this.clear) {
              return true;
          }
          if (!this.nextContent.component) {
              return false;
          }
          if (this.nextContent.component.enter) {
              const merged = mergeParameters(this.nextContent.parameters, this.nextContent.instruction.query, this.nextContent.content.parameters);
              this.nextContent.instruction.parameters = merged.namedParameters;
              this.nextContent.instruction.parameterList = merged.parameterList;
              await this.nextContent.component.enter(merged.merged, this.nextContent.instruction, this.content.instruction);
              this.nextContent.contentStatus = 3 /* entered */;
          }
          this.nextContent.initializeComponent();
          return true;
      }
      async loadContent() {
          kernel.Reporter.write(10000, 'Viewport loadContent', this.name);
          if (this.content.component) {
              if (this.content.component.leave) {
                  await this.content.component.leave(this.content.instruction, this.nextContent.instruction);
              }
              // No need to wait for next component activation
              if (!this.nextContent.component) {
                  this.content.removeComponent(this.element, this.options.stateful);
                  this.content.terminateComponent(this.options.stateful);
                  this.content.unloadComponent();
              }
          }
          if (this.nextContent.component) {
              // Only when next component activation is done
              if (this.content.component) {
                  this.content.removeComponent(this.element, this.options.stateful);
                  this.content.terminateComponent(this.options.stateful);
                  this.content.unloadComponent();
              }
              this.nextContent.addComponent(this.element);
              this.content = this.nextContent;
          }
          if (this.clear) {
              this.content = new ViewportContent(null, null, this.nextContent.instruction);
          }
          this.nextContent = null;
          return true;
      }
      finalizeContentChange() {
          this.previousViewportState = null;
      }
      async abortContentChange() {
          await this.nextContent.freeContent(this.element, this.options.stateful);
          if (this.previousViewportState) {
              Object.assign(this, this.previousViewportState);
          }
      }
      description(full = false) {
          if (this.content.content) {
              const component = this.content.componentName();
              const newScope = this.scope ? this.router.instructionResolver.separators.ownsScope : '';
              const parameters = this.content.parameters ? this.router.instructionResolver.separators.parameters + this.content.parameters : '';
              if (full || newScope.length || this.options.forceDescription) {
                  return `${component}${this.router.instructionResolver.separators.viewport}${this.name}${newScope}${parameters}`;
              }
              const viewports = {};
              viewports[component] = component;
              const found = this.owningScope.findViewports(viewports);
              if (!found) {
                  return `${component}${this.router.instructionResolver.separators.viewport}${this.name}${newScope}${parameters}`;
              }
              return `${component}${parameters}`;
          }
      }
      scopedDescription(full = false) {
          const descriptions = [this.owningScope.scopeContext(full), this.description(full)];
          return descriptions.filter((value) => value && value.length).join(this.router.instructionResolver.separators.scope);
      }
      // TODO: Deal with non-string components
      wantComponent(component) {
          let usedBy = this.options.usedBy || [];
          if (typeof usedBy === 'string') {
              usedBy = usedBy.split(',');
          }
          return usedBy.indexOf(component) >= 0;
      }
      // TODO: Deal with non-string components
      acceptComponent(component) {
          if (component === '-' || component === null) {
              return true;
          }
          let usedBy = this.options.usedBy;
          if (!usedBy || !usedBy.length) {
              return true;
          }
          if (typeof usedBy === 'string') {
              usedBy = usedBy.split(',');
          }
          if (usedBy.indexOf(component) >= 0) {
              return true;
          }
          if (usedBy.filter((value) => value.indexOf('*') >= 0).length) {
              return true;
          }
          return false;
      }
      binding(flags) {
          if (this.content.component) {
              this.content.initializeComponent();
          }
      }
      attaching(flags) {
          kernel.Reporter.write(10000, 'ATTACHING viewport', this.name, this.content, this.nextContent);
          this.enabled = true;
          if (this.content.component) {
              this.content.addComponent(this.element);
          }
      }
      detaching(flags) {
          kernel.Reporter.write(10000, 'DETACHING viewport', this.name);
          if (this.content.component) {
              this.content.removeComponent(this.element, this.options.stateful);
          }
          this.enabled = false;
      }
      unbinding(flags) {
          if (this.content.component) {
              this.content.terminateComponent(this.options.stateful);
          }
      }
      clearState() {
          this.options = {};
          this.content = new ViewportContent();
          this.cache = [];
      }
      async waitForElement() {
          if (this.element) {
              return Promise.resolve();
          }
          // tslint:disable-next-line:promise-must-complete
          return new Promise((resolve) => {
              this.elementResolve = resolve;
          });
      }
  }

  class Scope {
      constructor(router, element, context, parent) {
          this.router = router;
          this.element = element;
          this.context = context;
          this.parent = parent;
          this.viewport = null;
          this.children = [];
          this.viewports = [];
          this.scopeViewportParts = {};
          this.availableViewports = null;
          if (this.parent) {
              this.parent.addChild(this);
          }
      }
      getEnabledViewports() {
          return this.viewports.filter((viewport) => viewport.enabled).reduce((viewports, viewport) => {
              viewports[viewport.name] = viewport;
              return viewports;
          }, {});
      }
      // TODO: Reduce complexity (currently at 45)
      findViewports(viewports) {
          const componentViewports = [];
          let viewportsRemaining = false;
          // Get a shallow copy of all available viewports (clean if it's the first find)
          if (viewports) {
              this.availableViewports = {};
              this.scopeViewportParts = {};
          }
          this.availableViewports = Object.assign({}, this.getEnabledViewports(), this.availableViewports);
          // Get the parts for this scope (pointing to the rest)
          for (const viewport in viewports) {
              const parts = viewport.split(this.router.instructionResolver.separators.scope);
              const vp = parts.shift();
              if (!this.scopeViewportParts[vp]) {
                  this.scopeViewportParts[vp] = [];
              }
              this.scopeViewportParts[vp].push(parts);
          }
          // Configured viewport is ruling
          for (const viewportPart in this.scopeViewportParts) {
              const parameters = viewportPart.split(this.router.instructionResolver.separators.parameters);
              const componentViewportPart = parameters.shift();
              const component = componentViewportPart.split(this.router.instructionResolver.separators.viewport).shift();
              const componentParameters = component + (parameters.length ? this.router.instructionResolver.separators.parameters + parameters.join(this.router.instructionResolver.separators.parameters) : '');
              for (const name in this.availableViewports) {
                  const viewport = this.availableViewports[name];
                  // TODO: Also check if (resolved) component wants a specific viewport
                  if (viewport && viewport.wantComponent(component)) {
                      const found = this.foundViewport(viewports, this.scopeViewportParts, viewportPart, componentParameters, viewport);
                      componentViewports.push(...found.componentViewports);
                      viewportsRemaining = viewportsRemaining || found.viewportsRemaining;
                      this.availableViewports[name] = null;
                      Reflect.deleteProperty(this.scopeViewportParts, viewportPart);
                      break;
                  }
              }
          }
          // Next in line is specified viewport
          for (const viewportPart in this.scopeViewportParts) {
              const parameters = viewportPart.split(this.router.instructionResolver.separators.parameters);
              const componentViewportPart = parameters.shift();
              const parts = componentViewportPart.split(this.router.instructionResolver.separators.viewport);
              const component = parts.shift();
              const componentParameters = component + (parameters.length ? this.router.instructionResolver.separators.parameters + parameters.join(this.router.instructionResolver.separators.parameters) : '');
              let name = parts.shift();
              if (!name || !name.length || name.startsWith('?')) {
                  continue;
              }
              let newScope = false;
              if (name.endsWith(this.router.instructionResolver.separators.ownsScope)) {
                  newScope = true;
                  name = name.substring(0, name.length - 1);
              }
              if (!this.getEnabledViewports()[name]) {
                  this.addViewport(name, null, null, { scope: newScope, forceDescription: true });
                  this.availableViewports[name] = this.getEnabledViewports()[name];
              }
              const viewport = this.availableViewports[name];
              if (viewport && viewport.acceptComponent(component)) {
                  const found = this.foundViewport(viewports, this.scopeViewportParts, viewportPart, componentParameters, viewport);
                  componentViewports.push(...found.componentViewports);
                  viewportsRemaining = viewportsRemaining || found.viewportsRemaining;
                  this.availableViewports[name] = null;
                  Reflect.deleteProperty(this.scopeViewportParts, viewportPart);
              }
          }
          // Finally, only one accepting viewport left?
          for (const viewportPart in this.scopeViewportParts) {
              const parameters = viewportPart.split(this.router.instructionResolver.separators.parameters);
              const componentViewportPart = parameters.shift();
              const component = componentViewportPart.split(this.router.instructionResolver.separators.viewport).shift();
              const componentParameters = component + (parameters.length ? this.router.instructionResolver.separators.parameters + parameters.join(this.router.instructionResolver.separators.parameters) : '');
              const remainingViewports = [];
              for (const name in this.availableViewports) {
                  const viewport = this.availableViewports[name];
                  if (viewport && viewport.acceptComponent(component)) {
                      remainingViewports.push(viewport);
                  }
              }
              if (remainingViewports.length === 1) {
                  const viewport = remainingViewports.shift();
                  const found = this.foundViewport(viewports, this.scopeViewportParts, viewportPart, componentParameters, viewport);
                  componentViewports.push(...found.componentViewports);
                  viewportsRemaining = viewportsRemaining || found.viewportsRemaining;
                  this.availableViewports[viewport.name] = null;
                  Reflect.deleteProperty(this.scopeViewportParts, viewportPart);
                  break;
              }
          }
          viewportsRemaining = viewportsRemaining || Object.keys(this.scopeViewportParts).length > 0;
          // If it's a repeat there might be remaining viewports in scope children
          if (!viewports) {
              for (const child of this.children) {
                  const found = child.findViewports();
                  componentViewports.push(...found.componentViewports);
                  viewportsRemaining = viewportsRemaining || found.viewportsRemaining;
              }
          }
          return {
              componentViewports: componentViewports,
              viewportsRemaining: viewportsRemaining,
          };
      }
      foundViewport(viewports, scopeViewportParts, viewportPart, component, viewport) {
          const componentViewports = [{ component: component, viewport: viewport }];
          let viewportsRemaining = false;
          if (scopeViewportParts[viewportPart].length) {
              const scope = viewport.scope || viewport.owningScope;
              for (const remainingParts of scopeViewportParts[viewportPart]) {
                  if (remainingParts.length) {
                      const remaining = remainingParts.join(this.router.instructionResolver.separators.scope);
                      const vps = {};
                      vps[remaining] = viewports[viewportPart + this.router.instructionResolver.separators.scope + remaining];
                      const scoped = scope.findViewports(vps);
                      componentViewports.push(...scoped.componentViewports);
                      viewportsRemaining = viewportsRemaining || scoped.viewportsRemaining;
                  }
              }
          }
          return {
              componentViewports: componentViewports,
              viewportsRemaining: viewportsRemaining,
          };
      }
      addViewport(name, element, context, options) {
          let viewport = this.getEnabledViewports()[name];
          // Each au-viewport element has its own Viewport
          if (element && viewport && viewport.element !== null && viewport.element !== element) {
              viewport.enabled = false;
              viewport = this.viewports.find(vp => vp.name === name && vp.element === element);
              if (viewport) {
                  viewport.enabled = true;
              }
          }
          if (!viewport) {
              let scope;
              if (options.scope) {
                  scope = new Scope(this.router, element, context, this);
                  this.router.scopes.push(scope);
              }
              viewport = new Viewport(this.router, name, null, null, this, scope, options);
              this.viewports.push(viewport);
          }
          // TODO: Either explain why || instead of && here (might only need one) or change it to && if that should turn out to not be relevant
          if (element || context) {
              viewport.setElement(element, context, options);
          }
          return viewport;
      }
      removeViewport(viewport, element, context) {
          if ((!element && !context) || viewport.remove(element, context)) {
              if (viewport.scope) {
                  this.router.removeScope(viewport.scope);
              }
              this.viewports.splice(this.viewports.indexOf(viewport), 1);
          }
          return Object.keys(this.viewports).length;
      }
      removeScope() {
          for (const child of this.children) {
              child.removeScope();
          }
          const viewports = this.getEnabledViewports();
          for (const name in viewports) {
              this.router.removeViewport(viewports[name], null, null);
          }
      }
      renderViewport(viewport) {
          return viewport.canEnter().then(() => viewport.loadContent());
      }
      addChild(child) {
          if (this.children.indexOf(child) < 0) {
              this.children.push(child);
          }
      }
      removeChild(child) {
          this.children.splice(this.children.indexOf(child), 1);
      }
      viewportStates(full = false, active = false) {
          const states = [];
          for (const vp in this.getEnabledViewports()) {
              const viewport = this.getEnabledViewports()[vp];
              if ((viewport.options.noHistory || (viewport.options.noLink && !full)) && !active) {
                  continue;
              }
              states.push(viewport.scopedDescription(full));
          }
          for (const scope of this.children) {
              states.push(...scope.viewportStates(full));
          }
          return states.filter((value) => value && value.length);
      }
      allViewports() {
          const viewports = this.viewports.filter((viewport) => viewport.enabled);
          for (const scope of this.children) {
              viewports.push(...scope.allViewports());
          }
          return viewports;
      }
      scopeContext(full = false) {
          if (!this.element || !this.parent) {
              return '';
          }
          const parents = [];
          if (this.viewport) {
              parents.unshift(this.viewport.description(full));
          }
          let viewport = this.parent.closestViewport(this.context.get(kernel.IContainer).parent);
          while (viewport && viewport.owningScope === this.parent) {
              parents.unshift(viewport.description(full));
              viewport = this.closestViewport(viewport.context.get(kernel.IContainer).parent);
          }
          parents.unshift(this.parent.scopeContext(full));
          return parents.filter((value) => value && value.length).join(this.router.instructionResolver.separators.scope);
      }
      closestViewport(container) {
          const viewports = Object.values(this.getEnabledViewports());
          while (container) {
              const viewport = viewports.find((item) => item.context.get(kernel.IContainer) === container);
              if (viewport) {
                  return viewport;
              }
              container = container.parent;
          }
          return null;
      }
  }

  function closestCustomElement(element) {
      while (element) {
          if ((element).$customElement) {
              break;
          }
          element = element.parentElement;
      }
      return element;
  }

  class Router {
      constructor(container) {
          this.container = container;
          this.scopes = [];
          this.navs = {};
          this.activeComponents = [];
          this.addedViewports = [];
          this.isActive = false;
          this.pendingNavigations = [];
          this.processingNavigation = null;
          this.lastNavigation = null;
          this.linkCallback = (info) => {
              let href = info.href;
              if (href.startsWith('#')) {
                  href = href.substring(1);
              }
              if (!href.startsWith('/')) {
                  const scope = this.closestScope(info.anchor);
                  const context = scope.scopeContext();
                  href = this.instructionResolver.buildScopedLink(context, href);
              }
              this.historyBrowser.setHash(href);
          };
          this.historyBrowser = new HistoryBrowser();
          this.linkHandler = new LinkHandler();
          this.instructionResolver = new InstructionResolver();
      }
      get isNavigating() {
          return this.processingNavigation !== null;
      }
      activate(options) {
          if (this.isActive) {
              throw kernel.Reporter.error(2001);
          }
          this.isActive = true;
          this.options = Object.assign({
              callback: (navigationInstruction) => {
                  this.historyCallback(navigationInstruction);
              }
          }, options);
          this.instructionResolver.activate({ separators: this.options.separators });
          this.linkHandler.activate({ callback: this.linkCallback });
          return this.historyBrowser.activate(this.options).catch(error => { throw error; });
      }
      deactivate() {
          if (!this.isActive) {
              throw kernel.Reporter.error(2000);
          }
          this.linkHandler.deactivate();
          this.historyBrowser.deactivate();
      }
      historyCallback(instruction) {
          this.pendingNavigations.push(instruction);
          this.processNavigations().catch(error => { throw error; });
      }
      // TODO: Reduce complexity (currently at 46)
      async processNavigations() {
          if (this.processingNavigation !== null || !this.pendingNavigations.length) {
              return Promise.resolve();
          }
          const instruction = this.pendingNavigations.shift();
          this.processingNavigation = instruction;
          if (this.options.reportCallback) {
              this.options.reportCallback(instruction);
          }
          let fullStateInstruction = false;
          if ((instruction.isBack || instruction.isForward) && instruction.fullStatePath) {
              instruction.path = instruction.fullStatePath;
              fullStateInstruction = true;
              // tslint:disable-next-line:no-commented-code
              // if (!confirm('Perform history navigation?')) {
              //   this.historyBrowser.cancel();
              //   this.processingNavigation = null;
              //   return Promise.resolve();
              // }
          }
          let path = instruction.path;
          if (this.options.transformFromUrl && !fullStateInstruction) {
              path = this.options.transformFromUrl(path, this);
              if (Array.isArray(path)) {
                  path = this.instructionResolver.viewportInstructionsToString(path);
              }
          }
          const { clearViewports, newPath } = this.instructionResolver.shouldClearViewports(path);
          if (clearViewports) {
              path = newPath;
          }
          const parsedQuery = parseQuery(instruction.query);
          instruction.parameters = parsedQuery.parameters;
          instruction.parameterList = parsedQuery.list;
          const views = this.instructionResolver.findViews(path);
          if (!views && !Object.keys(views).length && !clearViewports) {
              this.processingNavigation = null;
              return this.processNavigations();
          }
          const usedViewports = (clearViewports ? this.allViewports().filter((value) => value.content.component !== null) : []);
          const defaultViewports = this.allViewports().filter((value) => value.options.default && value.content.component === null);
          const updatedViewports = [];
          // TODO: Take care of cancellations down in subsets/iterations
          let { componentViewports, viewportsRemaining } = this.rootScope.findViewports(views);
          let guard = 100;
          while (componentViewports.length || viewportsRemaining || defaultViewports.length) {
              // Guard against endless loop
              if (!guard--) {
                  throw kernel.Reporter.error(2002);
              }
              const changedViewports = [];
              for (const componentViewport of componentViewports) {
                  const { component, viewport } = componentViewport;
                  if (viewport.setNextContent(component, instruction)) {
                      changedViewports.push(viewport);
                  }
                  const usedIndex = usedViewports.findIndex((value) => value === viewport);
                  if (usedIndex >= 0) {
                      usedViewports.splice(usedIndex, 1);
                  }
                  const defaultIndex = defaultViewports.findIndex((value) => value === viewport);
                  if (defaultIndex >= 0) {
                      defaultViewports.splice(defaultIndex, 1);
                  }
              }
              for (const viewport of usedViewports) {
                  if (viewport.setNextContent(this.instructionResolver.clearViewportInstruction, instruction)) {
                      changedViewports.push(viewport);
                  }
              }
              // TODO: Support/review viewports not found in first iteration
              let vp;
              while (vp = defaultViewports.shift()) {
                  if (vp.setNextContent(vp.options.default, instruction)) {
                      changedViewports.push(vp);
                  }
              }
              let results = await Promise.all(changedViewports.map((value) => value.canLeave()));
              if (results.findIndex((value) => value === false) >= 0) {
                  return this.cancelNavigation([...changedViewports, ...updatedViewports], instruction);
              }
              results = await Promise.all(changedViewports.map(async (value) => {
                  const canEnter = await value.canEnter();
                  if (typeof canEnter === 'boolean') {
                      if (canEnter) {
                          return value.enter();
                      }
                      else {
                          return false;
                      }
                  }
                  for (const cvp of canEnter) {
                      // TODO: Abort content change in the viewports
                      this.addProcessingViewport(cvp.component, cvp.viewport);
                  }
                  value.abortContentChange().catch(error => { throw error; });
                  return true;
              }));
              if (results.some(result => result === false)) {
                  return this.cancelNavigation([...changedViewports, ...updatedViewports], instruction);
              }
              // TODO: Should it be kept here?
              // await Promise.all(changedViewports.map((value) => value.loadContent()));
              // TODO: Remove this once multi level recursiveness has been fixed
              // results = await Promise.all(changedViewports.map((value) => value.loadContent()));
              // if (results.findIndex((value) => value === false) >= 0) {
              //   return this.historyBrowser.cancel();
              // }
              for (const viewport of changedViewports) {
                  if (!updatedViewports.find((value) => value === viewport)) {
                      updatedViewports.push(viewport);
                  }
              }
              // TODO: Fix multi level recursiveness!
              const remaining = this.rootScope.findViewports();
              componentViewports = [];
              let addedViewport;
              while (addedViewport = this.addedViewports.shift()) {
                  // TODO: Should this overwrite instead? I think so.
                  if (!remaining.componentViewports.find((value) => value.viewport === addedViewport.viewport)) {
                      componentViewports.push(addedViewport);
                  }
              }
              componentViewports = [...componentViewports, ...remaining.componentViewports];
              viewportsRemaining = remaining.viewportsRemaining;
          }
          await Promise.all(updatedViewports.map((value) => value.loadContent()));
          await this.replacePaths(instruction);
          // Remove history entry if no history viewports updated
          if (!instruction.isFirst && !instruction.isRepeat && updatedViewports.every(viewport => viewport.options.noHistory)) {
              await this.historyBrowser.pop();
          }
          updatedViewports.forEach((viewport) => {
              viewport.finalizeContentChange();
          });
          this.lastNavigation = this.processingNavigation;
          if (this.lastNavigation.isRepeat) {
              this.lastNavigation.isRepeat = false;
          }
          this.processingNavigation = null;
          this.processNavigations().catch(error => { throw error; });
      }
      addProcessingViewport(component, viewport) {
          if (this.processingNavigation) {
              if (typeof viewport === 'string') {
                  // TODO: Deal with not yet existing viewports
                  viewport = this.allViewports().find((vp) => vp.name === viewport);
              }
              this.addedViewports.push({ viewport: viewport, component: component });
          }
          else if (this.lastNavigation) {
              this.pendingNavigations.unshift({ path: '', fullStatePath: '', isRepeat: true });
              // Don't wait for the (possibly slow) navigation
              this.processNavigations().catch(error => { throw error; });
          }
      }
      // public findViewport(name: string): Viewport {
      //   return this.rootScope.findViewport(name);
      // }
      findScope(element) {
          this.ensureRootScope();
          return this.closestScope(element);
      }
      // Called from the viewport custom element in attached()
      addViewport(name, element, context, options) {
          kernel.Reporter.write(10000, 'Viewport added', name, element);
          const parentScope = this.findScope(element);
          return parentScope.addViewport(name, element, context, options);
      }
      // Called from the viewport custom element
      removeViewport(viewport, element, context) {
          // TODO: There's something hinky with remove!
          const scope = viewport.owningScope;
          if (!scope.removeViewport(viewport, element, context)) {
              this.removeScope(scope);
          }
      }
      allViewports() {
          this.ensureRootScope();
          return this.rootScope.allViewports();
      }
      removeScope(scope) {
          if (scope !== this.rootScope) {
              scope.removeScope();
              const index = this.scopes.indexOf(scope);
              if (index >= 0) {
                  this.scopes.splice(index, 1);
              }
          }
      }
      goto(pathOrViewports, title, data) {
          if (typeof pathOrViewports === 'string') {
              return this.historyBrowser.goto(pathOrViewports, title, data);
          }
          // else {
          //   this.view(pathOrViewports, title, data);
          // }
      }
      replace(pathOrViewports, title, data) {
          if (typeof pathOrViewports === 'string') {
              return this.historyBrowser.replace(pathOrViewports, title, data);
          }
      }
      refresh() {
          return this.historyBrowser.refresh();
      }
      back() {
          return this.historyBrowser.back();
      }
      forward() {
          return this.historyBrowser.forward();
      }
      setNav(name, routes) {
          const nav = this.findNav(name);
          if (nav) {
              nav.routes = [];
          }
          this.addNav(name, routes);
      }
      addNav(name, routes) {
          let nav = this.navs[name];
          if (!nav) {
              nav = this.navs[name] = new Nav(this, name);
          }
          nav.addRoutes(routes);
      }
      findNav(name) {
          return this.navs[name];
      }
      async cancelNavigation(updatedViewports, instruction) {
          // TODO: Take care of disabling viewports when cancelling and stateful!
          updatedViewports.forEach((viewport) => {
              viewport.abortContentChange().catch(error => { throw error; });
          });
          if (instruction.isNew) {
              await this.historyBrowser.pop();
          }
          else {
              await this.historyBrowser.cancel();
          }
          this.processingNavigation = null;
          this.processNavigations().catch(error => { throw error; });
      }
      ensureRootScope() {
          if (!this.rootScope) {
              const root = this.container.get(runtime.Aurelia).root();
              this.rootScope = new Scope(this, root.$host, root.$context, null);
              this.scopes.push(this.rootScope);
          }
      }
      closestScope(element) {
          const el = closestCustomElement(element);
          let container = el.$customElement.$context.get(kernel.IContainer);
          while (container) {
              const scope = this.scopes.find((item) => item.context.get(kernel.IContainer) === container);
              if (scope) {
                  return scope;
              }
              container = container.parent;
          }
      }
      replacePaths(instruction) {
          this.activeComponents = this.rootScope.viewportStates(true, true);
          this.activeComponents = this.instructionResolver.removeStateDuplicates(this.activeComponents);
          let viewportStates = this.rootScope.viewportStates();
          viewportStates = this.instructionResolver.removeStateDuplicates(viewportStates);
          let state = this.instructionResolver.stateStringsToString(viewportStates);
          if (this.options.transformToUrl) {
              state = this.options.transformToUrl(this.instructionResolver.viewportInstructionsFromString(state), this);
          }
          let fullViewportStates = this.rootScope.viewportStates(true);
          fullViewportStates = this.instructionResolver.removeStateDuplicates(fullViewportStates);
          const query = (instruction.query && instruction.query.length ? `?${instruction.query}` : '');
          return this.historyBrowser.replacePath(state + query, this.instructionResolver.stateStringsToString(fullViewportStates, true) + query, instruction);
      }
  }
  Router.inject = [kernel.IContainer];

  /*! *****************************************************************************
  Copyright (c) Microsoft Corporation. All rights reserved.
  Licensed under the Apache License, Version 2.0 (the "License"); you may not use
  this file except in compliance with the License. You may obtain a copy of the
  License at http://www.apache.org/licenses/LICENSE-2.0

  THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
  KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
  WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
  MERCHANTABLITY OR NON-INFRINGEMENT.

  See the Apache Version 2.0 License for specific language governing permissions
  and limitations under the License.
  ***************************************************************************** */

  function __decorate(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
  }

  class ViewportCustomElement {
      constructor(router, element, renderingEngine) {
          this.router = router;
          this.element = element;
          this.renderingEngine = renderingEngine;
          this.name = 'default';
          this.scope = null;
          this.usedBy = null;
          this.default = null;
          this.noLink = null;
          this.noHistory = null;
          this.stateful = null;
          this.viewport = null;
      }
      render(flags, host, parts, parentContext) {
          const Type = this.constructor;
          const dom = parentContext.get(runtime.IDOM);
          const template = this.renderingEngine.getElementTemplate(dom, Type.description, parentContext, Type);
          template.renderContext = runtime.createRenderContext(dom, parentContext, Type.description.dependencies, Type);
          template.render(this, host, parts);
      }
      // public created(...rest): void {
      //   console.log('Created', rest);
      //   const booleanAttributes = {
      //     'scope': 'scope',
      //     'no-link': 'noLink',
      //     'no-history': 'noHistory',
      //   };
      //   const valueAttributes = {
      //     'used-by': 'usedBy',
      //     'default': 'default',
      //   };
      //   const name = this.element.hasAttribute('name') ? this.element.getAttribute('name') : 'default';
      //   const options: IViewportOptions = {};
      //   for (const attribute in booleanAttributes) {
      //     if (this.element.hasAttribute[attribute]) {
      //       options[booleanAttributes[attribute]] = true;
      //     }
      //   }
      //   for (const attribute in valueAttributes) {
      //     if (this.element.hasAttribute(attribute)) {
      //       const value = this.element.getAttribute(attribute);
      //       if (value && value.length) {
      //         options[valueAttributes[attribute]] = value;
      //       }
      //     }
      //   }
      //   this.viewport = this.router.addViewport(name, this.element, (this as any).$context.get(IContainer), options);
      // }
      bound() {
          this.connect();
      }
      unbound() {
          this.disconnect();
      }
      connect() {
          const options = { scope: this.element.hasAttribute('scope') };
          if (this.usedBy && this.usedBy.length) {
              options.usedBy = this.usedBy;
          }
          if (this.default && this.default.length) {
              options.default = this.default;
          }
          if (this.element.hasAttribute('no-link')) {
              options.noLink = true;
          }
          if (this.element.hasAttribute('no-history')) {
              options.noHistory = true;
          }
          if (this.element.hasAttribute('stateful')) {
              options.stateful = true;
          }
          this.viewport = this.router.addViewport(this.name, this.element, this.$context, options);
      }
      disconnect() {
          this.router.removeViewport(this.viewport, this.element, this.$context);
      }
      binding(flags) {
          if (this.viewport) {
              this.viewport.binding(flags);
          }
      }
      attaching(flags) {
          if (this.viewport) {
              this.viewport.attaching(flags);
          }
      }
      detaching(flags) {
          if (this.viewport) {
              this.viewport.detaching(flags);
          }
      }
      unbinding(flags) {
          if (this.viewport) {
              this.viewport.unbinding(flags);
          }
      }
  }
  ViewportCustomElement.inject = [Router, runtime.INode, runtime.IRenderingEngine];
  __decorate([
      runtime.bindable
  ], ViewportCustomElement.prototype, "name", void 0);
  __decorate([
      runtime.bindable
  ], ViewportCustomElement.prototype, "scope", void 0);
  __decorate([
      runtime.bindable
  ], ViewportCustomElement.prototype, "usedBy", void 0);
  __decorate([
      runtime.bindable
  ], ViewportCustomElement.prototype, "default", void 0);
  __decorate([
      runtime.bindable
  ], ViewportCustomElement.prototype, "noLink", void 0);
  __decorate([
      runtime.bindable
  ], ViewportCustomElement.prototype, "noHistory", void 0);
  __decorate([
      runtime.bindable
  ], ViewportCustomElement.prototype, "stateful", void 0);
  // tslint:disable-next-line:no-invalid-template-strings
  runtime.CustomElementResource.define({ name: 'au-viewport', template: '<template><div class="viewport-header"> Viewport: <b>${name}</b> </div></template>' }, ViewportCustomElement);

  // NOTE: this file is currently not in use
  exports.NavCustomElement = class NavCustomElement {
      constructor(router) {
          this.router = router;
          this.name = null;
          this.routes = null;
          this.level = 0;
      }
      get navRoutes() {
          const nav = this.router.findNav(this.name);
          return (nav ? nav.routes : []);
      }
      active(route) {
          return 'Active';
      }
  };
  __decorate([
      runtime.bindable
  ], exports.NavCustomElement.prototype, "name", void 0);
  __decorate([
      runtime.bindable
  ], exports.NavCustomElement.prototype, "routes", void 0);
  __decorate([
      runtime.bindable
  ], exports.NavCustomElement.prototype, "level", void 0);
  exports.NavCustomElement = __decorate([
      kernel.inject(Router, Element),
      runtime.customElement({
          name: 'au-nav', template: `<template>
  <nav if.bind="name" class="\${name}">
    <au-nav routes.bind="navRoutes" containerless></au-nav>
  </nav>
  <ul if.bind="routes" class="nav-level-\${level}">
    <li repeat.for="route of routes" class="\${route.active} \${route.hasChildren}">
      <a if.bind="route.link && route.link.length" href="\${route.link}">\${route.title}</a>
      <a if.bind="!route.link || !route.link.length" click.delegate="route.toggleActive()" href="">\${route.title}</a>
      <au-nav if.bind="route.children" routes.bind="route.children" level.bind="level + 1" containerless></au-nav>
    </li>
  </ul>
</template>`
      })
  ], exports.NavCustomElement);

  exports.HistoryBrowser = HistoryBrowser;
  exports.LinkHandler = LinkHandler;
  exports.Nav = Nav;
  exports.QueuedBrowserHistory = QueuedBrowserHistory;
  exports.HandlerEntry = HandlerEntry;
  exports.RouteGenerator = RouteGenerator;
  exports.TypesRecord = TypesRecord;
  exports.RecognizeResult = RecognizeResult;
  exports.CharSpec = CharSpec;
  exports.State = State;
  exports.StaticSegment = StaticSegment;
  exports.DynamicSegment = DynamicSegment;
  exports.StarSegment = StarSegment;
  exports.EpsilonSegment = EpsilonSegment;
  exports.RouteRecognizer = RouteRecognizer;
  exports.Router = Router;
  exports.Scope = Scope;
  exports.Viewport = Viewport;
  exports.ViewportCustomElement = ViewportCustomElement;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=index.umd.js.map

declare module 'libui-napi' {
	export const enum textWeight {
		minimum = 0,
		thin = 100,
		ultraLight = 200,
		light = 300,
		book = 350,
		normal = 400,
		medium = 500,
		semiBold = 600,
		bold = 700,
		ultraBold = 800,
		heavy = 900,
		ultraHeavy = 950,
		maximum = 1000
	}
	export const enum textItalic {
		normal = 0,
		oblique = 1,
		italic = 2
	}
	export const enum textStretch {
		ultraCondensed = 0,
		extraCondensed = 1,
		condensed = 2,
		semiCondensed = 3,
		normal = 4,
		semiExpanded = 5,
		expanded = 6,
		extraExpanded = 7,
		ultraExpanded = 8
	}
	export const enum textAttributeType {
		family = 0,
		size = 1,
		weight = 2,
		italic = 3,
		stretch = 4,
		color = 5,
		background = 6,
		underline = 7,
		underlineColor = 8,
		features = 9
	}
	export const enum textUnderline {
		none = 0,
		single = 1,
		double = 2,
		suggestion = 3
	}
	export const enum textUnderlineColor {
		custom = 0,
		spelling = 1,
		grammar = 2,
		auxiliary = 3
	}
	export const enum textAlign {
		left = 0,
		center = 1,
		right = 2
	}
	export const enum forEach {
		continue = 0,
		stop = 1
	}
	export const enum brushType {
		solid = 0,
		linearGradient = 1,
		radialGradient = 2
		// IMPL uiDrawBrushTypeImage = 3
	}
	export const enum lineCap {
		flat = 0,
		round = 1,
		square = 2
	}
	export const enum lineJoin {
		miter = 0,
		round = 1,
		bevel = 2
	}
	export const enum fillMode {
		winding = 0,
		alternate = 1
	}
	export const enum modifierKeys {
		ctrl = 1 << 0,
		alt = 1 << 1,
		shift = 1 << 2,
		super = 1 << 3
	}
	export const enum extKeys {
		escape = 1,
		insert = 2, // equivalent to "Help" on Apple keyboards
		delete = 3,
		home = 4,
		end = 5,
		pageUp = 6,
		pageDown = 7,
		up = 8,
		down = 9,
		left = 10,
		right = 11,
		f1 = 12, // F1..F12 are guaranteed to be consecutive
		f2 = 13,
		f3 = 14,
		f4 = 15,
		f5 = 16,
		f6 = 17,
		f7 = 18,
		f8 = 19,
		f9 = 20,
		f10 = 21,
		f11 = 22,
		f12 = 23,
		n0 = 24, // numpad keys; independent of Num Lock state
		n1 = 25, // N0..N9 are guaranteed to be consecutive
		n2 = 26,
		n3 = 27,
		n4 = 28,
		n5 = 29,
		n6 = 30,
		n7 = 31,
		n8 = 32,
		n9 = 33,
		nDot = 34,
		nEnter = 35,
		nAdd = 36,
		nSubtract = 37,
		nMultiply = 38,
		nDivide = 39
	}
	export function stopLoop(): void;
	export function startLoop(): void;
	export class FontAttribute {
		constructor(other: FontAttribute);
		static newUnderlineColor(
			type: textUnderlineColor,
			color: Color): FontAttribute;
		static getFamily(): string | null;
		static getSize(): number | null;
		static getWeight(): textWeight | null;
		static getItalic(): textItalic | null;
		static getStretch(): textStretch | null;
		static getColor(): Color | null;
		static getUnderline(): textUnderline | null;
		static getUnderlineColor(): {
			type: textAttributeType;
			color: Color | null;
		} | null;
		static getOTFeatures(): OpenTypeFeatures | null;
	}
	export class OpenTypeFeatures {
		add(tag: string, value: number): void;
		remove(tag: string): void;
		get(tag: string): number;
		forEach(
			cb: (feat: OpenTypeFeatures, str: string, val: number) => void): void;
		static clone(feat: OpenTypeFeatures): OpenTypeFeatures;
	}
	export class Color {
		public r: number;
		public g: number;
		public b: number;
		public a: number;
		constructor(r: number, g: number, b: number, a: number);
		constructor(other: Color);
	}
	export class Point {
		public x: number;
		public y: number;
		constructor(x: number, y: number);
		constructor(other: Point);
	}
	export class Size {
		public w: number;
		public h: number;
		constructor(w: number, h: number);
	}
	export class PointDouble {
		public x: number;
		public y: number;
		constructor(x: number, y: number);
		constructor(other: PointDouble);
	}
	export class SizeDouble {
		public w: number;
		public h: number;
		constructor(w: number, h: number);
	}
	export class BrushGradientStop {
		public pos: number;
		public color: Color;
		constructor(pos: number, color: Color);
	}
	export class AttributedString {
		constructor(str: string);
		toString(): string;
		toStringLen(): number;
		appendAttributed(str: string): void;
		appendUnattributed(str: string): void;
		insertAttributed(str: string, start: number): void;
		insertUnattributed(str: string, at: number): void;
		deleteString(start: number, end: number): void;
		setAttribute(attr: FontAttribute, start: number, end: number): void;
		// TODO: add cb parameters
		forEach(cb: () => void): void;
		numGraphemes(): number;
		byteIndexToGrapheme(pos: number): number;
		graphemeToByteIndex(pos: number): number;
	}

	export class UiControl {
		/**
		* Set or return whether the control is enabled.
		*/
		enabled: boolean;
		/**
		* Set or return whether the control is visible.
		*/
		visible: boolean;
		/**
		* Set or return whether the control is a top level one.
		*/
		toplevel: boolean;
		/**
		 * Create a new UiControl object.
		 */
		constructor(handle: any);
		/**
		 * Ensure this UI control is instance of  expectedConstructor
		 */
		_ensureType(expectedContructor: Function, argName: string): void;
	}

	/**
	 * A static text label.
	 */
	export class UiLabel extends UiControl {

		constructor(label?: string);
	}

	/**
	 * A container that organizes children as labeled fields.
	 */
	export class UiForm extends UiControl {
		/**
		 * Create a new UiForm object.
		 */
		constructor();

		/**
		 * If true, the container inserts some space between children.
		 */
		padded: boolean;

		/**
		 * Append a new child control as the last field with the specified label.
		 * @param label - the text to use as label of the field.
		 * @param control - the control to add as child.
		 * @param stretchy - whether the control should fill all the available space.
		 */
		append(label: string, control: UiControl, stretchy: boolean): void;

		/**
		 * Remove a child control at the specified position.
		 * @param index - the index of the control to remove
		 */
		deleteAt(index: number): void;
	}

	/**
	 * A base class for text related entries.
	 * @extends UiControl
	 */
	export abstract class UiEntryBase extends UiControl {

		/**
		 * Set or return the the content of the entry.
		 */
		text: string;

		/**
		 * Whether the user is allowed to change the entry's contents.
		 */
		readOnly: boolean;
		/**
		 * Add a listener to the `changed` event. Emitted whenever the entry contents
		 * changed.
		 * @param callback - callback to execute when the event is fired.
		 */
		onChanged(callback: () => any): void;
	}

	/**
	 * A simple, single line text entry control.
	 */
	export class UiEntry extends UiEntryBase {
		constructor();
	}

	/**
	 * A multiline text entry.
	 */
	export class UiMultilineEntry extends UiControl {
		/**
		 * Create a new UiMultilineEntry object.
		 * @param  {boolean} wrapping - whether the multiline entry wrap text. Defaults to false.
		 */
		constructor(wrapping?: boolean);

		/**
		 * Set or return the the content of the multiline entry.
		 */
		text: string;

		/**
		 * Whether the user is allowed to change the entry's contents.
		 */
		readOnly: boolean;

		/**
		 * Append the specified text to the entry's contents.
		 * @param text - the text to append.
		 */
		append(text: string): void;

		/**
		 * Add a listener to the `changed` event. Emitted whenever the entry's contents changed.
		 *
		 * @param callback - callback to execute when the event is fired.
		 */
		onChanged(callback: () => any): void;
	}


	/**
	 * @abstract
	 * Base class for vertical and horizontal boxes
	 */
	export class UiBox extends UiControl {
		/**
		 * If true, the container inserts some space between children.
		 */
		padded: boolean;

		/**
		 * Append a new child control as the last child.
		 * @param control - the control to add as a child.
		 * @param stretchy - whever the control should fill all the available space.
		 */
		append(control: UiControl, stretchy: boolean): void;

		/**
		 * Remove a child control at specified position.
		 * @param index - the index of the control to remove
		 */
		deleteAt(index: number): void;
	}

	/**
	 * A container that stacks its chidren horizontally.
	 */
	export class UiHorizontalBox extends UiBox {
		constructor();
	}

	/**
	 * A container that stacks its children vertically.
	 */
	export class UiVerticalBox extends UiBox {
		constructor();
	}

	/**
	 * A container for a single control that provides a caption and visually groups
	 * it's child.
	 */
	export class UiGroup extends UiControl {

		/**
		 * Create a new UiGroup object.
		 *
		 * @param title - text to show in Group title bar. Default is `''`
		 */
		constructor(title?: string);

		/**
		 * Set or return the text to show in group caption.
		 */
		title: string;

		/**
		 * Set the control to show in this group content area.
		 * UiGroup instances can contain only one control. If you need
		 * more, you have to use [Containers](containers.md).
		 *
		 * @param control - the control to add as child.
		 * @param stretchy - whever the control should fill all the
		 * available space.
		 */
		setChild(control: UiControl, stretchy: boolean): void;

		/**
		 * When true, an internal margin is added to the group.
		 */
		margined: boolean;
	}

	/**
	 * A powerful container that allow to specify size and position of each children.
	 */
	export class UiGrid extends UiControl {

		static align: {
			fill: 0;
			start: 1;
			center: 2;
			end: 3;
		};

		/**
		 * Enum defining poistion where to add / insert a control into a grid
		 */
		static at: {
			leading: 0,
			top: 1,
			trailing: 2,
			bottom: 3,
		};

		/**
		 * If true, the container inserts some space between children.
		 */
		padded: boolean;

		/**
		 * Insert a new child control before specified control.
		 * @param child - the control to insert
		 * @param before - the control will be inserted before this position
		 * @param at      [description]
		 * @param xspan - How many columns the component takes off.
		 * @param yspan - How many rows the component takes off.
		 * @param hexpand - whether the component can expand horizontally.
		 * @param halign - whether the component is aligned with the other components in the column.
		 * @param vexpand - whether the component can expand vertically.
		 * @param valign - whether the component is aligned with the other components in the row.
		 */
		insertAt(child: UiControl, before: UiControl, at: number, xspan: number, yspan: number, hexpand: number, halign: number, vexpan, valign: number): void;

		/**
		 * Insert a new child control.
		 *
		 * > UIGrid expand does not work correctly when both align horizontal and align
		 * vertical are set. You must choose one so libui knows which direction to expand.
		 *
		 * @param child - the control to add as child.
		 * @param left - What column the component resides in.
		 * @param top - What row the component resides in.
		 * @param xspan - How many columns the component takes off.
		 * @param yspan - How many rows the component takes off.
		 * @param hexpand - whether the component can expand horizontally.
		 * @param halign - whether the component is aligned with the other components in the column.
		 * @param vexpand - whether the component can expand vertically.
		 * @param valign - whether the component is aligned with the other components in the row.
		 */
		append(child: UiControl, left: number, top: number, xspan: number, yspan: number, hexpand: number, halign: number, vexpand: number, valign: number): void;
	}

	/**
	 * A container that show each chidren in a separate tab.
	 */
	export class UiTab extends UiControl {

		constructor();

		/**
		 * Return whether an internal margin is added to a page of the tab.
		 * @param index - the index of the page to check.
		 * @return `true` - whether the page has margins
		 */
		getMargined(index: number): boolean;

		/**
		 * Add an internal margin to a page of the Tab.
		 * @param index - the index of the page to set the margin on.
		 * @param value - whether to enable or disable the margin.
		 */
		setMargined(index: number, value: boolean): void;

		/**
		 * Append a new child control as last tab page.
		 * @param label - the text to show for the new page caption.
		 * @param control - the control to add as a child.
		 */
		append(label: string, control: UiControl): void;

		/**
		 * Insert a new child control before specified position.
		 * @param label - the text to show for the new page caption.
		 * @param before - the control will be inserted before this position
		 * @param control - the control to insert
		 */
		insertAt(label: string, before: number, control: UiControl): void;

		/**
		 * Return the total number of tab pages contained in the control.
		 */
		numPages(): number;

		/**
		 * Remove the tab and control at specified position.
		 * @param index - the index of the tab to remove.
		 */
		deleteAt(index: number): void
	}

	/**
	 * The UiWindow class is responsible for showing and managing native windows.
	 * A UiWindow instance can contain only one child. If you need
	 * more than one, you have to use [Containers](containers.md).
	 */
	export class UiWindow {
		/**
		 * Create a new UiWindow object.
		 *
		 * @param title - text to show in window title bar.
		 * @param width - width of window in pixels.
		 * @param height -  height of window in pixels.
		 * @param hasMenubar - whether this window has a menu bar.
		 * See [Menu](#menubar).
		 */
		constructor(title: string, width: number, height: number, hasMenubar: boolean);

		/**
		 * Show the window.
		 * LibUi always returns null
		 */
		show(): void;

		/**
		 * Add a listener to the `closing` event. This event is emitted when the OS
		 * window close button is clicked. You are responsible for closing the
		 * window in response to this event.
		 *
		 * @param callback - callback to execute when the event is fired.
		 */
		onClosing(callback: () => any): void;

		/**
		 * Add a listener to the `contentSizeChanged` event. This event is emitted
		 * when window content size change.
		 *
		 * @param callback - callback to execute when the event is fired.
		 */
		onContentSizeChanged(callback: Function): void;

		/**
		 * Close the window.
		 */
		close(): void

		/**
		 * Set or return the text to show in window title bar.
		 */
		title: string;

		/**
		 * Set or return the size in pixel of the content area of the window
		 * (excluding the size of the window decoration). This mean that if you set window
		 * size to 0,0 you still see title bar and OS window buttons.
		 */
		contentSize: { width: number; height: number };

		/**
		 * Set the control to show in this window content area.
		 * UiWindow instances can contain only one child. If you need
		 * more, you have to use [Containers](containers.md).
		 *
		 * @param control - the control to add as child.
		 * @param stretchy - whever the control should fill all the available space.
		 */
		setChild(control: UiControl, stretchy: boolean): void;

		/**
		 * When true, an internal margin is added to the window.
		 */
		margined: boolean;

		/**
		 * When true, the window is displayed without a border.
		 */
		borderless: boolean;

		/**
		 * When true, the window is displayed in full screen mode.
		 */
		fullscreen: boolean;
	}

	/**
	 * A simple button.
	 */
	export class UiButton extends UiControl {
		/**
		 * Create a new UiButton object.
		 */
		constructor(label?: string);

		/**
		 * Set or return the text of the button.
		 */
		text: string;

		/**
		 * Emitted when the button is clicked
		 *
		 * @param callback - callback to execute when the event is fired.
		 */
		onClicked(callback: () => any): void;
	}

	/**
	 * A checkbox control.
	 */
	export class UiCheckbox extends UiControl {
		/**
		 * Create a new UiCheckbox object.
		 */
		constructor(label?: string);

		/**
		 * Set or return the text label for the checkbox.
		 */
		text: string;

		/**
		 * Whether the control is checked.
		 */
		checked: boolean;

		/**
		 * Add a listener to the `toggled` event. Emitted whenever the control
		 * `checked` state change.
		 * @param callback - callback to execute when the event is fired.
		 */
		onToggled(callback: () => any): void;
	}

	/**
	 * A drop down combo box that allow list selection only.
	 */
	export class UiCombobox extends UiControl {
		/**
		 * Create a new UiCombobox object.
		 */
		constructor();

		/**
		 * Return or set the current selected item by index.
		 */
		selected: number;

		/**
		 * Append a new text item to the drop down list.
		 * @param text - the item to append.
		 */
		append(text: string): void;

		/**
		 * Add a listener to the `selected` event. Emitted whenever the selected
		 * item changes.
		 *
		 * @param callback - callback to execute when the event is fired.
		 */
		onSelected(callback: () => any): void;
	}

	/**
	 * Horizontal slider to set numerical values.
	 */
	export class UiSlider extends UiControl {
		/**
		 * Create a new UiSlider object.
		 * @param min - minimum value of the slider.
		 * @param max - maximum value of the slider.
		 */
		constructor(min?: number, max?: number);

		/**
		 * Set or return the the content of the slider.
		 */
		value: number;

		/**
		 * Add a listener to the `changed` event. Emitted whenever the slider value changed.
		 *
		 * @param callback - callback to execute when the event is fired.
		 */
		onChanged(callback: () => any): void;
	}
}

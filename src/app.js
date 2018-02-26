import { Observer } from "./framework/binding/property-observation";
import { Template } from "./framework/templating/template";
import { hydrateBindings } from "./framework/generated";
class $App {
    constructor() {
        this.$observer = {
            name: new Observer(""),
            computedName: new Observer(""),
            submit: new Observer("")
        };
    }
    applyTo(element) {
        return this;
    }
    get name() { return this.$observer.getValue(); }
    set name(v) { this.$observer.setValue(v); }
    get computedName() { return this.$observer.getValue(); }
    set computedName(v) { this.$observer.setValue(v); }
    get submit() { return this.$observer.getValue(); }
    set submit(v) { this.$observer.setValue(v); }
}
$App.$html = new Template("<div class=\"au\"><au-marker class=\"au\"></au-marker> </div>\n  <input class=\"au\" />\n  <button class=\"au\"></button>\n");
$App.$binding = hydrateBindings([
    [0, 1, [8, "name", 0], "class", 1],
    [0, 1, [8, "computedName", 0], "textcontent", 1],
    [1, 4, [20, [[19, "\n    Name tag: "], [8, "computedName", 0], [19, "\n  "]]]],
    [2, 1, [8, "name", 0], "value", 2],
    [3, 2, [11, "submit", [], 0], "click", 2]
]);
export class App extends $App {
    submit() {
    }
}

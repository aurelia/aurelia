export class Viewport {
    public content: string;
    public nextContent: string;

    constructor(public name: string, public controller: any) {
    }

    public canEnter(): Promise<boolean> {
        let result = this.controller.canEnter();
        if (typeof result === 'boolean') {
            return Promise.resolve(result);
        }
        return result;
    }
    public canLeave(): Promise<boolean> {
        let result = this.controller.canLeave();
        if (typeof result === 'boolean') {
            return Promise.resolve(result);
        }
        return result;
    }

    public setNextContent(content: string): boolean {
        if (this.content === content) {
            return false;
        }
        this.nextContent = content;
        return true;
    }

    public loadContent(): Promise<boolean> {
        console.log('Loading', this.name, this.nextContent);
        return this.controller.load(this.nextContent);
    }

    public mountContent(): Promise<boolean> {
        console.log('Mounting', this.name, this.nextContent);
        this.content = this.nextContent;
        return this.controller.mount();
    }
}

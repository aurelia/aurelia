export class Missing {
    public static parameters: string[] = ['id'];
    public missingComponent: string;

    public load(parameters) {
        this.missingComponent = parameters.id;
    }
}

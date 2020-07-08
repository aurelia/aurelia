export class Missing {
    public static parameters: string[] = ['id'];
    public missingComponent: string;

    public enter(parameters) {
        this.missingComponent = parameters.id;
    }
}

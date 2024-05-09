export default class read {
    private _properties!: string[];
    public get properties(): string[] {
        return this._properties;
    }
    public set properties(v: string[]) {
        this._properties = v;
    }
}

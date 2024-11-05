export class Protocol {
	public interfaceId: string;
	public config: any;

	public constructor(config: any, interfaceId: string) {
		this.config = config;
		this.interfaceId = interfaceId;
	}

	public closed() {}

	public toString() {
		return `${this.constructor.name} (${this.interfaceId})`;
	}
}

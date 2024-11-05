import { ProtocolIds } from "@airswap/utils";
import type { OrderERC20 } from "@airswap/utils";
import { result } from "../utils";

import { Protocol } from "./protocol";

export class IndexingERC20 extends Protocol {
	public orders: OrderERC20[] = [];

	public constructor(config: any) {
		super(config, ProtocolIds.IndexingERC20);
	}

	public async received(id: any, method: any, params: any, respond: any) {
		switch (method) {
			case "addOrderERC20":
				this.orders.push(params);
				respond(result(id, true));
				break;
			case "getOrdersERC20":
				respond(result(id, this.orders));
				break;
		}
	}
}

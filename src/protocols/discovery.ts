import * as swapDeploys from "@airswap/swap-erc20/deploys.js";
import { ProtocolIds } from "@airswap/utils";
import { result } from "../utils";
import { Protocol } from "./protocol";

export class Discovery extends Protocol {
	public protocols: any;

	public constructor(config: any, protocols: any) {
		super(config, ProtocolIds.Discovery);
		this.protocols = protocols.slice();
	}

	public async received(id: any, method: any, params: any, respond: any) {
		let res: any;
		switch (method) {
			case "getProtocols":
				res = [
					{
						interfaceId: this.interfaceId,
						params: {},
					},
				];
				for (const idx in this.protocols) {
					res.push({
						interfaceId: this.protocols[idx].interfaceId,
						params: {
							chainId: this.config.chainId,
							swapContractAddress: swapDeploys[this.config.chainId],
							walletAddress: this.config.wallet.address,
						},
					});
				}
				respond(result(id, res));
				break;
		}
	}
}

import {
	ProtocolIds,
	explorerUrls,
	orderERC20ToParams,
	parseCheckResult,
} from "@airswap/utils";
import type WebSocket from "ws";
import { error, result } from "../utils";
import { Protocol } from "./protocol";

export class LastLookERC20 extends Protocol {
	public subscribers: WebSocket[] = [];

	public constructor(config: any) {
		super(config, ProtocolIds.LastLookERC20);
		setInterval(() => {
			for (const idx in this.subscribers) {
				this.subscribers[idx].send(
					JSON.stringify({
						jsonrpc: "2.0",
						method: "setPricingERC20",
						params: [config.levels],
					}),
				);
			}
		}, 1000);
	}

	public unsubscribe(subscriber: WebSocket) {
		const idx = this.subscribers.findIndex(
			(ws: WebSocket) => ws === subscriber,
		);
		this.subscribers.splice(idx, 1);
	}

	public async received(
		id: any,
		method: any,
		params: any,
		respond: any,
		ws: WebSocket,
	) {
		switch (method) {
			case "getPricingERC20":
			case "getAllPricingERC20":
				respond(result(id, this.config.levels));
				break;
			case "subscribePricingERC20":
			case "subscribeAllPricingERC20":
				this.subscribers.push(ws);
				respond(result(id, this.config.levels));
				break;
			case "unsubscribePricingERC20":
			case "unsubscribeAllPricingERC20":
				this.unsubscribe(ws);
				respond(result(id, true));
				break;
			case "considerOrderERC20":
				this.config.swapContract
					.check(this.config.wallet.address, ...orderERC20ToParams(params))
					.then(async (errors: string[]) => {
						if (!errors.length) {
							const gasPrice = await this.config.wallet.getGasPrice();
							console.log(
								"No errors; taking...",
								`(gas price ${gasPrice / 10 ** 9})`,
							);
							this.config.swapContract
								.swapLight(...orderERC20ToParams(params), { gasPrice })
								.then((tx: any) => {
									respond(result(id, true));
									console.log(
										"Submitted...",
										`${explorerUrls[tx.chainId]}/tx/${tx.hash}`,
									);
									tx.wait(this.config.confirmations).then(() => {
										console.log(
											"Mined ✨",
											`${explorerUrls[tx.chainId]}/tx/${tx.hash}`,
										);
									});
								})
								.catch((error: any) => {
									console.log(error.message);
									respond(error(id, -32603, error.message));
								});
						} else {
							console.log("Errors...", parseCheckResult(errors));
							respond(error(id, -33604, errors));
						}
					});
		}
	}
}

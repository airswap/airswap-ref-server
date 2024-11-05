import * as swapDeploys from "@airswap/swap-erc20/deploys.js";
import { ProtocolIds } from "@airswap/utils";
import WebSocket from "ws";

export default class WS {
	public constructor(config: any, server: any, protocols: any) {
		const wss = new WebSocket.Server({ server });

		wss.on("connection", (ws: any, req: any) => {
			console.log("Connection", req.socket.remoteAddress);
			ws.on("message", async (message: any) => {
				try {
					const { id, method, params } = JSON.parse(message);
					for (const idx in protocols) {
						protocols[idx].received(
							id,
							method,
							params,
							(response: any) => {
								ws.send(response);
							},
							ws,
						);
					}
				} catch (e) {
					console.log("Failed to parse JSON-RPC message", message);
					return;
				}
			});
			ws.on("close", () => {
				for (const idx in protocols) {
					if (typeof protocols[idx].closed === "function") {
						protocols[idx].closed(ws);
					}
				}
			});
			ws.send(
				JSON.stringify({
					jsonrpc: "2.0",
					method: "setProtocols",
					params: [
						[
							{
								name: ProtocolIds.LastLookERC20,
								version: "1.0.0",
								params: {
									senderWallet: config.wallet.address,
									swapContract: swapDeploys[config.chainId],
								},
							},
						],
					],
				}),
			);
		});
	}
}

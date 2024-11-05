import {
	createOrderERC20,
	createOrderERC20Signature,
	getPriceForAmount,
	toAtomicString,
	toDecimalString,
} from "@airswap/utils";
import { ProtocolIds } from "@airswap/utils";

import { decimals, error, result } from "../utils";
import { Protocol } from "./protocol";

export class RequestForQuoteERC20 extends Protocol {
	public constructor(config: any) {
		super(config, ProtocolIds.RequestForQuoteERC20);
	}

	public async received(id: any, method: any, params: any, respond: any) {
		if (
			method === "getSignerSideOrderERC20" ||
			method === "getSenderSideOrderERC20"
		) {
			const { signerToken, senderWallet, senderToken, swapContract } = params;
			if (!signerToken || !senderToken || !senderWallet || !swapContract) {
				respond(error(id, -33604, "Invalid request params"));
				return;
			}
			if (Number(params.chainId) !== this.config.chainId) {
				respond(error(id, -33601, "Not serving chain"));
				return;
			}
			if (swapContract !== this.config.swapContract.address) {
				respond(
					error(
						id,
						-33604,
						`Using swap contract ${this.config.swapContract.address}`,
					),
				);
				return;
			}

			const signerDecimals = decimals[signerToken.toLowerCase()];
			const senderDecimals = decimals[senderToken.toLowerCase()];

			let signerAmount: string;
			let senderAmount: string;

			try {
				switch (method) {
					case "getSignerSideOrderERC20":
						senderAmount = toDecimalString(params.senderAmount, senderDecimals);
						signerAmount = getPriceForAmount(
							"buy",
							senderAmount,
							senderToken,
							signerToken,
							this.config.levels,
						);
						break;
					case "getSenderSideOrderERC20":
						signerAmount = toDecimalString(params.signerAmount, signerDecimals);
						senderAmount = getPriceForAmount(
							"sell",
							signerAmount,
							signerToken,
							senderToken,
							this.config.levels,
						);
						break;
					default:
						respond(error(id, -33603, "Invalid method"));
						return;
				}
			} catch (e: any) {
				respond(error(id, -33603, e.message));
				return;
			}

			if (signerAmount && senderAmount) {
				const order = createOrderERC20({
					nonce: String(Date.now()),
					expiry: String(
						Math.floor(Date.now() / 1000) + Number(process.env.EXPIRY),
					),
					protocolFee: String(process.env.PROTOCOL_FEE),
					signerWallet: this.config.wallet.address,
					signerToken,
					signerAmount: toAtomicString(signerAmount, signerDecimals),
					senderWallet,
					senderToken,
					senderAmount: toAtomicString(senderAmount, senderDecimals),
				});

				const signature = await createOrderERC20Signature(
					order,
					`0x${process.env.PRIVATE_KEY}`,
					this.config.swapContract.address,
					this.config.chainId,
					this.config.domainVersion,
					this.config.domainName,
				);

				console.log("Making...", {
					...order,
					...signature,
				});

				respond(
					result(id, {
						...order,
						...signature,
					}),
				);
			} else {
				respond(error(id, -33601, "Not serving pair"));
			}
		}
	}
}

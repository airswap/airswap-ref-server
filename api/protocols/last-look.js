'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var ws_1 = __importDefault(require("ws"));
var lightDeploys = require('@airswap/light/deploys.js');
var start = function (config) {
    var wss = new ws_1.default.Server({ server: config.server });
    var subscribers = [];
    function removeSubscriber(subscriber) {
        var idx = subscribers.findIndex(function (ws) { if (ws === subscriber)
            return true; });
        subscribers.splice(idx, 1);
    }
    setInterval(function () {
        for (var idx in subscribers) {
            subscribers[idx].send(JSON.stringify({
                jsonrpc: '2.0',
                method: 'updatePricing',
                params: config.levels,
            }));
        }
    }, 1000);
    wss.on('connection', function (ws) {
        ws.on('message', function (message) {
            var json;
            try {
                json = JSON.parse(message);
            }
            catch (e) {
                console.log('Failed to parse JSON-RPC message', message);
                return;
            }
            switch (json.method) {
                case 'subscribe':
                case 'subscribeAll':
                    subscribers.push(ws);
                    break;
                case 'unsubscribe':
                case 'unsubscribeAll':
                    removeSubscriber(ws);
                    break;
                case 'consider':
                    ws.send(JSON.stringify({
                        jsonrpc: '2.0',
                        id: json.id,
                        result: 'true'
                    }));
                    console.log('Taking...', json.params);
                    break;
            }
        });
        ws.on('close', function () {
            removeSubscriber(ws);
        });
        ws.send(JSON.stringify({
            jsonrpc: '2.0',
            method: 'initialize',
            params: [[{
                        name: 'last-look',
                        version: '1.0.0',
                        params: {
                            senderWallet: config.wallet.address,
                            swapContract: lightDeploys[config.chainId],
                        },
                    }]]
        }));
    });
};
exports.default = start;

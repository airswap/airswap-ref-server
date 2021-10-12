#!/usr/bin/env ts-node-script
'use strict';
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("@airswap/utils");
var body_parser_1 = __importDefault(require("body-parser"));
var cors_1 = __importDefault(require("cors"));
var utils_2 = require("../utils");
var lightDeploys = require('@airswap/light/deploys.js');
var start = function (config) {
    var _this = this;
    function initMiddleware(middleware) {
        return function (req, res) {
            return new Promise(function (resolve, reject) {
                middleware(req, res, function (result) {
                    if (result instanceof Error) {
                        return reject(result);
                    }
                    return resolve(result);
                });
            });
        };
    }
    var cors = initMiddleware((0, cors_1.default)({
        methods: ['GET', 'POST', 'OPTIONS'],
    }));
    config.app.use(body_parser_1.default.json());
    config.app.get('*', function (req, res) {
        res.statusCode = 200;
        res.send(JSON.stringify({
            wallet: config.wallet.address,
            chainId: process.env.CHAIN_ID,
            pricing: config.levels,
        }));
    });
    config.app.options('*', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, cors(req, res)];
                case 1:
                    _a.sent();
                    res.statusCode = 200;
                    res.end();
                    return [2 /*return*/];
            }
        });
    }); });
    config.app.post('*', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var _a, signerToken, senderWallet, senderToken, signerAmount, senderAmount, senderDecimals, signerDecimals, found, i, order, signature;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, cors(req, res)];
                case 1:
                    _b.sent();
                    _a = req.body.params, signerToken = _a.signerToken, senderWallet = _a.senderWallet, senderToken = _a.senderToken;
                    senderDecimals = utils_2.decimals[senderToken];
                    signerDecimals = utils_2.decimals[signerToken];
                    found = false;
                    for (i in config.levels) {
                        if (config.levels[i].baseToken.toLowerCase() === senderToken.toLowerCase()) {
                            if (config.levels[i].quoteToken.toLowerCase() === signerToken.toLowerCase()) {
                                found = true;
                                if (req.body.method === 'getSignerSideOrder') {
                                    senderAmount = req.body.params.senderAmount;
                                    signerAmount = (0, utils_1.calculateCostFromLevels)((0, utils_1.toDecimalString)(senderAmount, senderDecimals), config.levels[i].levels);
                                    signerAmount = (0, utils_1.toAtomicString)(signerAmount, signerDecimals);
                                }
                                else {
                                    signerAmount = req.body.params.signerAmount;
                                    senderAmount = (0, utils_1.calculateCostFromLevels)((0, utils_1.toDecimalString)(signerAmount, signerDecimals), config.levels[i].levels);
                                    senderAmount = (0, utils_1.toAtomicString)(senderAmount, senderDecimals);
                                }
                            }
                        }
                    }
                    console.info("Received request: " + JSON.stringify(req.body));
                    if (!!found) return [3 /*break*/, 2];
                    res.statusCode = 200;
                    res.json({
                        jsonrpc: '2.0',
                        id: req.body.id,
                        error: {
                            code: -33601,
                            message: 'Not serving pair'
                        },
                    });
                    return [3 /*break*/, 4];
                case 2:
                    order = (0, utils_1.createLightOrder)({
                        nonce: String(Date.now()),
                        expiry: String(Math.floor(Date.now() / 1000) + Number(process.env.EXPIRY)),
                        signerFee: String(process.env.SIGNER_FEE),
                        signerWallet: config.wallet.address,
                        signerToken: signerToken,
                        signerAmount: signerAmount,
                        senderWallet: senderWallet,
                        senderToken: senderToken,
                        senderAmount: senderAmount,
                    });
                    return [4 /*yield*/, (0, utils_1.createLightSignature)(order, "0x" + process.env.PRIVATE_KEY, lightDeploys[config.chainId], config.chainId)];
                case 3:
                    signature = _b.sent();
                    res.statusCode = 200;
                    res.json({
                        jsonrpc: '2.0',
                        id: req.body.id,
                        result: __assign(__assign({}, order), signature),
                    });
                    _b.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    }); });
};
exports.default = start;

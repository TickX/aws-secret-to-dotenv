"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const aws_sdk_1 = require("aws-sdk");
const fs_1 = __importDefault(require("fs"));
const secretsManager = new aws_sdk_1.SecretsManager({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_DEFAULT_REGION
});
const write = (key, value, to) => {
    core.setSecret(value);
    core.exportVariable(key, value);
    fs_1.default.appendFileSync(to, `${key}=${value}\n`);
};
secretsManager.getSecretValue({ SecretId: core.getInput('secret') }).promise()
    .then(response => {
    const secretString = response.SecretString;
    if (!secretString) {
        core.warning(`${response.Name} has no secret values`);
        return;
    }
    const secret = JSON.parse(secretString);
    const envPath = core.getInput('envPath');
    const key = core.getInput('key');
    key
        ? write(core.getInput('as') || key, secret[key], envPath)
        : Object.entries(secret).forEach(([key, value]) => write(key, value, envPath));
})
    .catch(error => {
    core.setFailed(error);
});

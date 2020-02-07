import * as core from '@actions/core'
import { SecretsManager } from "aws-sdk";
import * as sinon from "sinon";

jest.mock('@actions/core');
jest.mock('aws-sdk');

const runAction = () => {
    const main = require('../src/main');
    return main.run();
};

describe('Action run', () => {
    it('should fail if AWS request failed', async () => {
        const error = new Error('wtf');
        SecretsManager.prototype.getSecretValue = jest.fn().mockReturnValue({
            promise: jest.fn().mockRejectedValue(error)
        });

        await runAction();

        expect(core.setFailed).toHaveBeenCalledWith(error);
    });

    it('should warn user if secret is empty', async () => {
        SecretsManager.prototype.getSecretValue = jest.fn().mockReturnValue({
            promise: jest.fn().mockResolvedValue('')
        });

        await runAction();

        expect(core.warning).toHaveBeenCalled();
    });
});

describe('Action run', () => {
    const fs = require('fs');
    const envPath = __dirname + '/.env';
    const secret = require('./inputs/secret.json');
    const getInputStub = sinon.stub(core, 'getInput');

    beforeEach(() => {
        if (fs.existsSync(envPath)) {
            fs.unlinkSync(envPath);
        }

        SecretsManager.prototype.getSecretValue = jest.fn().mockReturnValue({
            promise: jest.fn().mockResolvedValue({
                SecretString: JSON.stringify(secret)
            })
        });
    });

    it('should write secret to env', async () => {
        getInputStub.withArgs('envPath').returns(envPath);

        await runAction();

        const expected = fs.readFileSync(__dirname + '/results/expected.env');
        const actual = fs.readFileSync(envPath);

        expect(expected.equals(actual)).toBe(true);
    });

    it('should write key to env when `key` input is present', async () => {
        getInputStub.withArgs('envPath').returns(envPath);
        getInputStub.withArgs('key').returns('KEY_2');

        await runAction();

        const expected = fs.readFileSync(__dirname + '/results/expected-key.env');
        const actual = fs.readFileSync(envPath);

        expect(expected.equals(actual)).toBe(true);
    });

    it('should write aliased key to env when `key` and `as` inputs are present', async () => {
        getInputStub.withArgs('envPath').returns(envPath);
        getInputStub.withArgs('key').returns('KEY_2');
        getInputStub.withArgs('as').returns('KEY_2_ALIAS');

        await runAction();

        const expected = fs.readFileSync(__dirname + '/results/expected-key-as.env');
        const actual = fs.readFileSync(envPath);

        expect(expected.equals(actual)).toBe(true);
    });
});

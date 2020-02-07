import * as core from '@actions/core'
import { SecretsManager } from "aws-sdk";
import * as sinon from "sinon";

jest.mock('@actions/core');
jest.mock('aws-sdk');

const runAction = () => require('../src/main').run();

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

        expect(core.warning).toHaveBeenCalledTimes(1);
    });
});

describe('Action run', () => {
    const envPath = __dirname + '/.env';

    const fs = require('fs');
    const secret = require('./inputs/secret.json');

    let expectedFilePath: string;

    beforeEach(() => {
        if (fs.existsSync(envPath)) {
            fs.unlinkSync(envPath);
        }

        sinon.restore();
        SecretsManager.prototype.getSecretValue = jest.fn().mockReturnValue({
            promise: jest.fn().mockResolvedValue({
                SecretString: JSON.stringify(secret)
            })
        });
    });

    afterEach(() => {
        const expected = fs.readFileSync(expectedFilePath);
        const actual = fs.readFileSync(envPath);

        expect(expected.equals(actual)).toBe(true);
    });

    it('should write secret to env', async () => {
        expectedFilePath = __dirname + '/results/expected.env';

        sinon.stub(core, 'getInput').withArgs('envPath').returns(envPath);

        await runAction();
    });

    it('should write key to env when `key` input is present', async () => {
        expectedFilePath = __dirname + '/results/expected-key.env';

        sinon.stub(core, 'getInput')
            .withArgs('envPath').returns(envPath)
            .withArgs('key').returns('KEY_2');

        await runAction();
    });

    it('should write aliased key to env when `key` and `as` inputs are present', async () => {
        expectedFilePath = __dirname + '/results/expected-key-as.env';

        sinon.stub(core, 'getInput')
            .withArgs('envPath').returns(envPath)
            .withArgs('key').returns('KEY_2')
            .withArgs('as').returns('KEY_2_ALIAS');

        await runAction();
    });

    it('should overwrite existing values with the same key', async () => {
        expectedFilePath = __dirname + '/results/expected-2.env';

        sinon.stub(core, 'getInput').withArgs('envPath').returns(envPath);

        await runAction();

        const secret2 = require('./inputs/secret-2.json');
        SecretsManager.prototype.getSecretValue = jest.fn().mockReturnValue({
            promise: jest.fn().mockResolvedValue({
                SecretString: JSON.stringify(secret2)
            })
        });

        await runAction();
    });
});

![](https://github.com/TickX/aws-secret-to-dotenv/workflows/Test/badge.svg)

# AWS Secret to Dotenv

A GitHub action that appends an AWS Secret value(s) to a dotenv file.

The following environment variables need to bet set in order for the action to be able to access AWS:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_DEFAULT_REGION`

## Usage

```yaml
steps:
  - name: Append AWS Secret to .env
    uses: tickx/aws-secret-to-dotenv
    with:
      secret: 'service-tickx/production' # [Required] This is the AWS secret name
      key: 'DB_URI' # [Optional] You can specify a specific key to fetch from the specified secret
      as: 'DB' # [Optional] You can provide an alternate name for the value retrieved using the specified `key`
      envPath: '.env' # [Optional] The path to the dotenv file (defaults to `.env`)
```

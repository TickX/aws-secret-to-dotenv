![](https://github.com/TickX/aws-secret-to-dotenv/workflows/Test/badge.svg)
![GitHub license](https://img.shields.io/github/license/TickX/aws-secret-to-dotenv)

# AWS Secret to Dotenv

A GitHub action that appends an AWS Secret value(s) to a dotenv file.

## Usage

```yaml
steps:
  - uses: TickX/aws-secret-to-dotenv@v1.0.0
    with:
      secret: 'service-tickx/production' # [Required] This is the AWS secret name
      key: 'DB_URI' # [Optional] You can specify a specific key to fetch from the specified secret
      as: 'DB' # [Optional] You can provide an alternate name for the value retrieved using the specified `key`
      envPath: '.env' # [Optional] The path to the dotenv file (defaults to `.env`)
```

## Requirements

The following environment variables must be set as the corresponding IAM user credentials:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_DEFAULT_REGION`

The user must also have the following policy assigned to them:
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": "secretsmanager:GetSecretValue",
            "Resource": "*"
        }
    ]
}
```

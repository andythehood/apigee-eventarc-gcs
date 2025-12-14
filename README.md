# Apigee Eventarc for GCS

[![Apache 2.0](https://img.shields.io/badge/license-apache%202.0-blue.svg)](LICENSE)
<!-- ![LastCommit](https://img.shields.io/github/last-commit/apigee/apigeelint/main.svg)
![CommitActivity](https://img.shields.io/github/commit-activity/4w/apigee/apigeelint) -->

<!-- [Apigeelint](https://github.com/apigee/apigeelint) is a Static code analysis tool for Apigee Proxy and SharedFlow bundles to encourage API developers to use best practices and avoid anti-patterns.

This repo contains a set of [External Plugins](https://github.com/apigee/apigeelint#using-external-plugins) for apigeelint that can help identify potential API misconfigurations by checking whether proxies contain required policies. -->

## Rules

<!-- The following rules are currently available:

| Code     | Name                            | Description                                                                                                                                                                                        |
| -------- | ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| EX-BN001 | MisconfigurationCheckAuth       | Check for the presence of `OAuthV2` and/or `VerifyAPIKey` policies in each Proxy Endpoint's PreFlow                                                                                                |
| EX-BN002 | MisconfigurationCheckCORS       | Check for the presence of a `CORS` policy in each Proxy Endpoint's PreFlow                                                                                                                         |
| EX-BN003 | MisconfigurationCheckThreat     | Check for the presence of `JSONThreatProtection` and/or `XMLThreatProtection` policies in each Proxy Endpoint's PreFlow                                                                            |
| EX-BN004 | MisconfigurationCheckMediation  | Check for the presence of `OASValidation` and/or `MessageValidation` policies in each Proxy Endpoint's PreFlow                                                                                     |
| EX-PF001 | RequirePoliciesPreFlowRequest   | Check for the presence of a set of specific named policies in each Proxy Endpoint's PreFlow. This can be used to enforce a naming convention for policies in addition to requiring the policy type |
| EX-PF002 | RequireSharedFlowPreFlowRequest | Check for the usage of specific Shared Flow Bundles called from FlowCallout policies in each Proxy Endpoint's PreFlow                                                                              | -->

## Requirements
<!-- 
These plugins require apigeelint to be installed. This can be installed using the command:

`npm install --location=global apigeelint`

See https://www.npmjs.com/package/apigeelint for additional details. -->

## Usage

#### Standalone

<!-- To use, clone or download this repository and run `apigeelint` with the `-x` or `--externalPluginsDirectory` option to specify the relative or full path to the `externalPlugins` directory from this repo, e.g.

```
apigeelint -x ./externalPlugins -s path/to/your/apiproxy -f table.js 
```
-->

#### VS Code

<!-- If you are using VScode, then you can also use these plugins with the [Apigeelint 4 VS Code](https://marketplace.visualstudio.com/items?itemName=andythehood.apigeelint4vscode) extension by selecting the following extension setting:

- `apigeelint.externalPluginsDirectory`: Full path to an external plugins directory (default: none) -->

## Known Issues

None yet!

## Limitations



## Support

If you find issues, file a ticket here on Github. Keep in mind that there is no
service level agreement (SLA) for responses to these issues. Assume all
responses are on an ad-hoc, volunteer basis.

<!-- If you simply have questions, we recommend asking on the [Apigee
forum](https://www.googlecloudcommunity.com/gc/Apigee/bd-p/cloud-apigee/) on
GoogleCloudCommunity. Apigee experts regularly check that forum. -->

Apigee customers should use [formal Google support channels](https://cloud.google.com/apigee/support) for Apigee product related concerns.

## License and Copyright

This material is [Copyright (c) 2025 Aviato Consulting](./NOTICE).
and is licensed under the [Apache 2.0 License](LICENSE).

## Disclaimer

These plugins do not form part of Apigee or any other officially supported Google Product.

export const authConfig = {
  defaultCodeTtl: 30, // 30 seconds
  defaultTokenTtl: 7 * 60 * 60, // 7 days
};

export enum AccountTypes {
  Contract = "Contract",
  Key = "Key",
}

export enum AccountStates {
  UnDeployed = "UnDeployed",
  Deployed = "Deployed",
}

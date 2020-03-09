import { Asset, Server } from "stellar-sdk";
import TOML from "toml";
export default async function approvalServerForAsset(
  asset: Asset
): Promise<string> {
  const server = new Server("https://horizon-testnet.stellar.org");
  const issuerAccount = await server.loadAccount(asset.getIssuer());
  const homeDomain: string = (issuerAccount as any).home_domain;
  const tomlURL = new URL(homeDomain);
  tomlURL.pathname = "/.well-known/stellar.toml";
  const tomlText = await fetch(tomlURL.toString()).then(r => r.text());
  const toml = TOML.parse(tomlText);

  const tomlCurrency = toml.CURRENCIES.find(c => c.code === asset.getCode());
  if (!tomlCurrency || !tomlCurrency.approval_server)
    throw "No approval server for asset";
  return tomlCurrency.approval_server;
}

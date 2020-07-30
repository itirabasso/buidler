import debug from "debug";
import {
  BuidlerNetworkConfig,
  EthereumProvider,
  HDAccountsConfig,
  HttpNetworkConfig,
  IEthereumProvider,
  NetworkConfig,
  NetworkConfigAccounts,
  ProjectPaths
} from "../../../types";
import { BUIDLEREVM_NETWORK_NAME } from "../../constants";

import { HttpProvider } from "./http";
import { createImpersonatedAccountProvider } from "./accounts";

const log = debug("buidler:core:providers:http");

export function createFakeProvider(
  networkName: string,
  networkConfig: NetworkConfig,
  solcVersion?: string,
  paths?: ProjectPaths
): IEthereumProvider {
  let provider: EthereumProvider;

  if (networkName === BUIDLEREVM_NETWORK_NAME) {
    const buidlerNetConfig = networkConfig as BuidlerNetworkConfig;

    const {
      BuidlerEVMProvider
    } = require("../../buidler-evm/provider/provider");

    provider = new BuidlerEVMProvider(
      buidlerNetConfig.hardfork!,
      BUIDLEREVM_NETWORK_NAME,
      buidlerNetConfig.chainId!,
      buidlerNetConfig.chainId!,
      buidlerNetConfig.blockGasLimit!,
      buidlerNetConfig.throwOnTransactionFailures!,
      buidlerNetConfig.throwOnCallFailures!,
      buidlerNetConfig.accounts,
      solcVersion,
      paths
    );
  } else {
    const httpNetConfig = networkConfig as HttpNetworkConfig;
    log('creating fake http provider')
    provider = new HttpProvider(
      httpNetConfig.url!,
      networkName,
      undefined,
      httpNetConfig.timeout
    );
  }

  return wrapEthereumProvider(provider, networkConfig);
}

function wrapEthereumProvider(
  provider: IEthereumProvider,
  netConfig: Partial<NetworkConfig>
): IEthereumProvider {
  // These dependencies are lazy-loaded because they are really big.
  // We use require() instead of import() here, because we need it to be sync.

  const { createSenderProvider } = require("./accounts");

  const {
    createAutomaticGasPriceProvider,
    createAutomaticGasProvider,
    createFixedGasPriceProvider,
    createFixedGasProvider
  } = require("./gas-providers");

  const { createChainIdValidationProvider } = require("./chainId");

  const isHttpNetworkConfig = "url" in netConfig;

  if (isHttpNetworkConfig) {
    const httpNetConfig = netConfig as Partial<HttpNetworkConfig>;

    const accounts = httpNetConfig.accounts as string[];
    // console.log('impersonated accounts', accounts)
    provider = createImpersonatedAccountProvider(provider, accounts);

    // TODO: Add some extension mechanism for account plugins here

    const { createGanacheGasMultiplierProvider } = require("./gas-providers");

    if (typeof httpNetConfig.gas !== "number") {
      provider = createGanacheGasMultiplierProvider(provider);
    }
  }

  provider = createSenderProvider(provider, netConfig.from);

  if (netConfig.gas === undefined || netConfig.gas === "auto") {
    console.log('auto gasssssssssss')
    provider = createAutomaticGasProvider(provider, netConfig.gasMultiplier);
  } else {
    console.log('fixed gassssss', netConfig.gas)
    provider = createFixedGasProvider(provider, netConfig.gas);
  }

  if (netConfig.gasPrice === undefined || netConfig.gasPrice === "auto") {
    console.log('auto gaspriceeeeeeeeeee')
    provider = createAutomaticGasPriceProvider(provider);
  } else {
    console.log('fixed gassssss priceeeeeeeee', netConfig.gasPrice)
    provider = createFixedGasPriceProvider(provider, netConfig.gasPrice);
  }

  if (isHttpNetworkConfig) {
    if (netConfig.chainId !== undefined) {
      return createChainIdValidationProvider(provider, netConfig.chainId);
    }
  }
  console.log('your fake provider is ready')
  return provider;
}

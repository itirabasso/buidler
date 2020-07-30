import { MethodNotFoundError } from "../errors";
import { optionalBlockTag, rpcAddress, validateParams } from "../input";
import { BuidlerNode } from "../node";

// tslint:disable only-buidler-error

export class BuidlerModule {
  constructor(private readonly _node: BuidlerNode) {}

  public async processRequest(
    method: string,
    params: any[] = []
  ): Promise<any> {
    switch (method) {
      case "buidler_getStackTraceFailuresCount":
        return this._getStackTraceFailuresCountAction(
          ...this._getStackTraceFailuresCountParams(params)
        );

      case "buidler_impersonateAccount":
        return this._impersonateAccountAction(
          this._impersonateAccountParams(params)
        );
    }

    throw new MethodNotFoundError(`Method ${method} not found`);
  }

  // buidler_getStackTraceFailuresCount

  private _getStackTraceFailuresCountParams(params: any[]): [] {
    return validateParams(params);
  }

  private async _getStackTraceFailuresCountAction(): Promise<number> {
    return this._node.getStackTraceFailuresCount();
  }

  // buidler_impersonateAccount

  // should return something? throw on re-impersionation cases?
  private _impersonateAccountAction(account: Buffer): boolean {
    return this._node.impersonateAccount(account);
  }

  private _impersonateAccountParams(params: any[]): Buffer {
    const [account] = validateParams(params, rpcAddress);
    return account;
  }
}

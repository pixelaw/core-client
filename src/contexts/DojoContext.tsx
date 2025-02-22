import { createContext, type ReactNode, useContext, useMemo } from "react";
import { type BurnerAccount, type BurnerManager, useBurnerManager } from "@dojoengine/create-burner";
import { Account } from "starknet";
import { dojoConfig } from "@/libs/dojo/config";
import { DojoProvider } from "@dojoengine/core";
import { client } from "@/libs/dojo/typescript/contracts.gen";
import { useAccount } from "@starknet-react/core";

interface DojoContextType {
  masterAccount: Account;
  client: ReturnType<typeof client>;
  account: BurnerAccount;
  connectedAccount: Account | undefined;
}

export const DojoContext = createContext<DojoContextType | null>(null);

export const DojoContextProvider = ({
  children,
  burnerManager,
}: {
  children: ReactNode;
  burnerManager: BurnerManager;
}) => {
  const currentValue = useContext(DojoContext);
  if (currentValue) {
    throw new Error("DojoProvider can only be used once");
  }

  const dojoProvider = new DojoProvider(dojoConfig.manifest, dojoConfig.rpcUrl);

  const masterAccount = useMemo(
    () => new Account(dojoProvider.provider, dojoConfig.masterAddress, dojoConfig.masterPrivateKey, "1"),
    [],
  );

  const { account: connectedAccount } = useAccount();

  const burnerManagerData = useBurnerManager({ burnerManager });

  return (
    <DojoContext.Provider
      value={{
        masterAccount,
        client: client(dojoProvider),
        account: {
          ...burnerManagerData,
          account: connectedAccount ? (connectedAccount as Account) : burnerManagerData.account || masterAccount,
        },
        connectedAccount: connectedAccount as Account,
      }}
    >
      {children}
    </DojoContext.Provider>
  );
};

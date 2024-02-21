// import { createAgent, IResolver } from "@veramo/core";

// import { DIDResolverPlugin } from "@veramo/did-resolver";
// import { Resolver } from "did-resolver";
// import { getResolver as ethrDidResolver } from "ethr-did-resolver";
// import { getResolver as webDidResolver } from "web-did-resolver";

// const INFURA_PROJECT_ID = "9411575f49c84289a51a7dab811049cb";

// export const agent = createAgent<IResolver>({
//   plugins: [
//     new DIDResolverPlugin({
//       resolver: new Resolver({
//         ...ethrDidResolver({ infuraProjectId: INFURA_PROJECT_ID }),
//         ...webDidResolver()
//       })
//     })
//   ]
// });

//   // const { agent } = useVeramo();
//   // const resolvedDids = useCallback(async () => {
//   //   const resolvedDid = await agent?.resolveDid("did:web:example.com");
//   //   console.log("createdIdentifier -->", { resolvedDid, identifiers });
//   // }, [agent]);

//   // useEffect(() => {
//   //   if (agent) {
//   //     const resolveDids = resolvedDids();
//   //     console.log({ resolveDids });
//   //   }
//   // }, [agent]);
export {};

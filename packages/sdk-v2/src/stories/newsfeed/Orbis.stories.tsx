// import React from "react";
// import { ComponentStory, ComponentMeta } from "@storybook/react";
// import { View, Button } from "react-native";
// import { W3Wrapper } from "../W3Wrapper";

// /** Import Orbis SDK */
// import { Orbis } from "@orbisclub/orbis-sdk";
// import { OrbisCachedFeed } from "../../sdk/newsfeed/OrbisCachedFeed";
// import { IpfsStorage } from "../../sdk";
// import { defaultIPFS } from "../../contexts/";

// const Web3Component = () => {
//   /** Initialize the Orbis class object */
//   const orbis = new Orbis();

//   const feed = new OrbisCachedFeed(
//     { context: "kjzl6cwe1jw147bfd2hn7f3j2sdsq6708xnb3a217iz1m18a35v25kgxna3s0os" },
//     defaultIPFS
//   );

//   const syncFeed = async () => {
//     await feed.syncPosts();
//     const posts = await feed.getPosts();
//     console.log({ posts });
//   };
//   const connect = async () => {
//     await orbis.connect_v2({ provider: null, chain: "ethereum", lit: false });
//     const connected = await orbis.isConnected();
//     console.log({ connected });
//   };

//   const setAccess = async () => {
//     const {
//       data: { content }
//     } = await orbis.getContext("kjzl6cwe1jw149ao1fmo5ip9866yqmyt2wpf6zaeinam7w02s00pdeitldtmjxc");
//     console.log({ content });
//     const result = await orbis.updateContext("kjzl6cwe1jw149ao1fmo5ip9866yqmyt2wpf6zaeinam7w02s00pdeitldtmjxc", {
//       ...content,
//       accessRules: [
//         {
//           type: "did",
//           authorizedUsers: [
//             {
//               did: "did:key:z6Mkjboxsh1VE1HniwNZnc3A8dDjiwBz2SdzboMqeoncoiwm"
//             },
//             {
//               did: "did:key:z6MkjL1zc5ZB5m3CS8n4Ymzxo4zEiv6pEtw11jHzpDpUgjBd"
//             },
//             {
//               did: "did:pkh:eip155:122:0x66582d24fead72555adac681cc621cacbb208324"
//             }
//           ]
//         }
//       ]
//     });
//     console.log({ result });
//   };
//   const getPosts = async () => {
//     const context = await orbis.getContext("kjzl6cwe1jw147bfd2hn7f3j2sdsq6708xnb3a217iz1m18a35v25kgxna3s0os");
//     console.log({ context });
//     const post = await orbis.getPost("kjzl6cwe1jw1472riz0il9lj9h4fa5au7v4za7wi25oudyogeapomcc2rg89j5o");
//     console.log({ post });
//     const posts = await orbis.getPosts({
//       context: "kjzl6cwe1jw147bfd2hn7f3j2sdsq6708xnb3a217iz1m18a35v25kgxna3s0os",
//       tag: "publishWallet"
//     });
//     console.log({ posts });
//   };
//   const post = async () => {
//     const result = await orbis.createPost({
//       context: "kjzl6cwe1jw149ao1fmo5ip9866yqmyt2wpf6zaeinam7w02s00pdeitldtmjxc",
//       body: "hello",
//       title: "test post",
//       tags: [{ slug: "publishWallet" }],
//       media: [{ url: "https://google.com/image.png" }]
//     });
//     console.log({ result });
//   };
//   return (
//     <View style={{ width: "50%" }}>
//       <Button onPress={connect} title="Connect V2" />
//       <Button onPress={post} title="Post" />
//       <Button onPress={getPosts} title="Get posts" />
//       <Button onPress={setAccess} title="Set context accessrules" />
//       <Button onPress={syncFeed} title="Sync orbis feed" />
//     </View>
//   );
// };
// const Page = (params: object) => (
//   <W3Wrapper withMetaMask={false}>
//     <Web3Component {...params} />
//   </W3Wrapper>
// );

// export default {
//   title: "Orbis test example",
//   component: Page
// } as ComponentMeta<typeof Page>;

// const Template: ComponentStory<typeof Page> = Page;

// export const OrbisTest = Template.bind({});
export {};

import React from "react";
import Head from "next/head";

export default function HeadComponent() {
  return (
    <Head>
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      <meta name="theme-color" content="#000000" />

      <title>Solana Store</title>
      <meta name="title" content="Solana Store" />
      <meta name="description" content="Silk Road of the brave new world" />

      {/* Github 
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content="https://buildspace.so/" />
      <meta property="twitter:title" content="Solana Store" />
      <meta property="twitter:description" content="Silk Road of the brave new world" />
      <meta property="twitter:image" content="https://cdn.buildspace.so/courses/solana-pay/metadata.png" />
  */}
    </Head>
  );
}

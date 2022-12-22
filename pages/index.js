import { PublicKey } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import dynamic from "next/dynamic";
import HeadComponent from '../components/Head';
import React, { useEffect, useState } from 'react';
import Product from "../components/Product";
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

// Constants
const GITHUB_HANDLE = "sanshigo345";
const GITHUB_LINK = `https://github.com/${GITHUB_HANDLE}`;

const App = () => {
  // Dynamic import `WalletMultiButton` to prevent hydration error
  const WalletMultiButtonDynamic = dynamic(
    async () =>
      (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
    { ssr: false }
  );

  // This will fetch the users' public key (wallet address) from any wallet we support
  const { publicKey } = useWallet();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (publicKey) {
      fetch(`/api/fetchProducts`)
        .then(response => response.json())
        .then(data => {
          setProducts(data);
          console.log("Products", data);
        });
    }
  }, [publicKey]);
  
  const renderNotConnectedContainer = () => (
    <div className="button-container">
      <WalletMultiButton className="cta-button connect-wallet-button" />
    </div>
  );

  const renderItemBuyContainer = () => (
    <div className="products-container">
      {products.map((product) => (
        <Product key={product.id} product={product} />
      ))}
    </div>
  );
  
  return (
    <div className="App">
      <HeadComponent/>
      <div className="container">
        <header className="header-container">
          <p className="header"> Solana Store for ALL your NFT Needs 😉 </p>
          <p className="sub-text">Silk Road of the brave new digital world</p>
        </header>

        <main>
          {publicKey ? renderItemBuyContainer() : renderNotConnectedContainer()}
        </main>

        <div className="footer-container">
          <img alt="Github Logo" className="twitter-logo" src="github-mark.svg" />
          <a
            className="footer-text"
            href={GITHUB_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built for fun by @${GITHUB_HANDLE} with buildspace`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;

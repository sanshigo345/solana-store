import React, { useState, useEffect, useMemo } from "react";
import { Keypair, Transaction } from "@solana/web3.js";
import { findReference, FindReferenceError } from "@solana/pay";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { InfinitySpin } from "react-loader-spinner";
import IPFSDownload from "./IpfsDownload";
import { addOrder } from '../lib/api';

const STATUS = {
    Initial: "Initial",
    Submitted: "Submitted",
    Paid: "Paid",
  };

export default function Buy({ itemID }) {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const orderID = useMemo(() => Keypair.generate().publicKey, []); // Public key used to identify the order

  const [loading, setLoading] = useState(false); 
  const [status, setStatus] = useState(STATUS.Initial);
  
  // useMemo is a React hook that only computes the value if the dependencies change
  const order = useMemo(
    () => ({
      buyer: publicKey.toString(),
      orderID: orderID.toString(),
      itemID: itemID,
    }),
    [publicKey, orderID, itemID]
  );

  // Fetch the transaction object from the server 
  const processTransaction = async () => {
    setLoading(true);
    const txResponse = await fetch("../api/createTransaction", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(order),
    });
    const txData = await txResponse.json();
    
    const tx = Transaction.from(Buffer.from(txData.transaction, "base64"));
    console.log("Tx data is", tx);
    
    try {
      const txHash = await sendTransaction(tx, connection);
      console.log(`Transaction sent: https://solscan.io/tx/${txHash}?cluster=devnet`);
      setStatus(STATUS.Submitted);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if transaction was confirmed
    if (status === STATUS.Submitted) {
      setLoading(true);
      const interval = setInterval(async () => {
        try {
          const result = await findReference(connection, orderID);
          console.log("Finding transaction reference", result.confirmationStatus);
          if (result.confirmationStatus === "confirmed" || result.confirmationStatus === "finalized") {
            clearInterval(interval);
            setStatus(STATUS.Paid);
            setLoading(false);
            addOrder(order);
            alert("Thank you for your purchase! \nYou will probably not regret it ;)");
          }
        } catch (e) {
          if (e instanceof FindReferenceError) {
            return null;
          }
          console.error("Unknown error", e);
        } finally {
          setLoading(false);
        }
      }, 1000);
      return () => {
        clearInterval(interval);
      };
    }
  }, [status]);

  if (!publicKey) {
    return (
      <div>
        <p>Connect your wallet if you want the goods!</p>
      </div>
    );
  }

  if (loading) {
    return <InfinitySpin color="green" />;
  }

  return (
    <div>
      {status === STATUS.Paid ? (
        <IPFSDownload filename="sanshitoken.png" hash="QmPTYB87oHXHtiSfMuyUgBi5yFwxFZrvhqMdBd5vqXCCc4" cta="Download the goods!"/>
      ) : (
        <button disabled={loading} className="buy-button" onClick={processTransaction}>
          Buy now 🠚
        </button>
      )}
    </div>
  );
}
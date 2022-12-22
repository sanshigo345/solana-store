import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  clusterApiUrl,
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { createTransferCheckedInstruction, getAssociatedTokenAddress, getMint } from "@solana/spl-token";
import BigNumber from "bignumber.js";
import products from "./products.json";


const usdcAddress = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
const sellerAddress = 'F452TDdjkx2XmVmx4fXRfJfA48P2KzK5cwENnXYABLV1'
const sellerPublicKey = new PublicKey(sellerAddress);

const createTransaction = async (req, res) => {
  try {
    // Extract the transaction data from the request body
    const { buyer, orderID, itemID } = req.body;

    // If no order or buyer, stop!
    if (!buyer) {
      return res.status(400).json({
        message: "Missing buyer address",
      });
    }

    if (!orderID) {
      return res.status(400).json({
        message: "Missing order ID",
      });
    }

    // Fetch item price from products.json using itemID
    const itemPrice = products.find((item) => item.id === itemID).price;

    // If no item, stop!
    if (!itemPrice) {
      return res.status(404).json({
        message: "Item not found. please check item ID",
      });
    }
    
    // Convert our price to the correct format
    const bigAmount = BigNumber(itemPrice);
    const buyerPublicKey = new PublicKey(buyer);
    const network = WalletAdapterNetwork.Mainnet;
    const endpoint = clusterApiUrl(network);
    const connection = new Connection(endpoint);

    const buyerUsdcAddress = await getAssociatedTokenAddress(usdcAddress, buyerPublicKey);
    const shopUsdcAddress = await getAssociatedTokenAddress(usdcAddress, sellerPublicKey);

    // A blockhash is sort of like an ID for a block. It lets you identify each block.
    const { blockhash } = await connection.getLatestBlockhash("finalized");

    const usdcMint = await getMint(connection, usdcAddress);
    
    // The first two things we need - a recent block ID 
    // and the public key of the fee payer 
    const tx = new Transaction({ // new Transaction
      recentBlockhash: blockhash,
      feePayer: buyerPublicKey,
    });

    const transferInstruction = createTransferCheckedInstruction(
        buyerUsdcAddress, 
        usdcAddress,     // This is the address of the token we want to transfer
        shopUsdcAddress, 
        buyerPublicKey, 
        bigAmount.toNumber() * 10 ** (await usdcMint).decimals, 
        usdcMint.decimals // The token could have any number of decimals
      );

    // We're adding more instructions to the transaction
    transferInstruction.keys.push({
      // We'll use our OrderId to find this transaction later
      pubkey: new PublicKey(orderID), 
      isSigner: false,
      isWritable: false,
    });

    tx.add(transferInstruction);
  
    const serializedTransaction = tx.serialize({
      requireAllSignatures: false,
    });
    const base64 = serializedTransaction.toString("base64");

    res.status(200).json({
      transaction: base64,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({ error: "error creating transaction" });
    return;
  }
}

export default function handler(req, res) {
  if (req.method === "POST") {
    createTransaction(req, res);
  } else {
    res.status(405).end();
  }
}
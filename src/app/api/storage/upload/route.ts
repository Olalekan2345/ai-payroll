import { NextRequest, NextResponse } from "next/server";

const INDEXER_URL = "https://indexer-storage-testnet-turbo.0g.ai";

export async function POST(req: NextRequest) {
  try {
    const { attendance } = await req.json();
    if (!attendance) {
      return NextResponse.json({ error: "Missing attendance data" }, { status: 400 });
    }

    // Server-side 0G SDK usage
    const { Indexer, MemData } = await import("@0glabs/0g-ts-sdk");
    const { ethers } = await import("ethers");

    const jsonData = JSON.stringify(attendance);
    const encoder = new TextEncoder();
    const dataBytes = encoder.encode(jsonData);
    const file = new MemData(dataBytes);

    const [tree, err] = await file.merkleTree();
    if (err) {
      console.error("Merkle tree error:", err);
      return NextResponse.json({ rootHash: "", txHash: "", warning: "merkle_error" });
    }

    // For server-side upload, we need a funded signer from env
    const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
    if (!privateKey) {
      return NextResponse.json({
        rootHash: tree?.rootHash() || "",
        txHash: "",
        warning: "no_signer",
      });
    }

    const provider = new ethers.JsonRpcProvider("https://evmrpc-testnet.0g.ai");
    const signer = new ethers.Wallet(
      privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`,
      provider
    );

    const indexer = new Indexer(INDEXER_URL);
    const [result, uploadErr] = await indexer.upload(
      file,
      "https://evmrpc-testnet.0g.ai",
      signer as any
    );
    if (uploadErr) {
      console.error("Upload error:", uploadErr);
      return NextResponse.json({ rootHash: tree?.rootHash() || "", txHash: "", warning: "upload_error" });
    }

    return NextResponse.json({ rootHash: result?.rootHash || "", txHash: result?.txHash || "" });
  } catch (error: any) {
    console.error("Storage API error:", error);
    return NextResponse.json({ error: error.message, rootHash: "", txHash: "" }, { status: 500 });
  }
}

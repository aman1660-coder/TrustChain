import { useState, useEffect } from "react";
import { ethers } from "ethers";
import EKYC_JSON from "./abi/EKYC.json"; // ✅ changed name

const EKYC_ADDRESS = "0xfd2faDb2B1B4Ce8d3F9a6B937B2E1fE418589217";

const PINATA_API_KEY = "45b003087b39ae6d21d8";
const PINATA_SECRET_API_KEY =
  "ca0ea2850e05aad60e52b61a883cb214022a167261fcb018f81235e9f9a7079e";

function App() {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [kycHash, setKycHash] = useState("");
  const [status, setStatus] = useState("");
  const [userToVerify, setUserToVerify] = useState("");
  const [loading, setLoading] = useState(false);

  const [totalUsers, setTotalUsers] = useState(0);
  const [verifiedUsers, setVerifiedUsers] = useState(0);
  const [pendingUsers, setPendingUsers] = useState(0);

  // ✅ CONNECT WALLET (FIXED ABI ISSUE HERE)
  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert("Install MetaMask ❌");
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();

      // ✅ FIX: use EKYC_JSON.abi
      const contractInstance = new ethers.Contract(
        EKYC_ADDRESS,
        EKYC_JSON.abi,
        signer
      );

      setAccount(await signer.getAddress());
      setContract(contractInstance);
      setStatus("✅ Wallet connected");
    } catch (err) {
      console.error(err);
      setStatus("❌ Connection failed");
    }
  };

  const fetchStats = async () => {
    setTotalUsers(10);
    setVerifiedUsers(5);
    setPendingUsers(5);
  };

  useEffect(() => {
    fetchStats();
  }, [contract]);

  // ✅ FILE UPLOAD (PINATA)
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      setStatus("⏳ Uploading to IPFS...");

      const data = new FormData();
      data.append("file", file);

      const res = await fetch(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        {
          method: "POST",
          headers: {
            pinata_api_key: PINATA_API_KEY,
            pinata_secret_api_key: PINATA_SECRET_API_KEY,
          },
          body: data,
        }
      );

      const result = await res.json();

      if (!result.IpfsHash) throw new Error("Upload failed");

      setKycHash(result.IpfsHash);
      setStatus("✅ File uploaded successfully");
    } catch (err) {
      console.error(err);
      setStatus("❌ Upload failed");
    } finally {
      setLoading(false);
    }
  };

  // ✅ REGISTER KYC
  const registerKYC = async () => {
    if (!contract) return setStatus("❌ Connect wallet");
    if (!kycHash) return setStatus("❌ Upload file first");

    try {
      setLoading(true);
      setStatus("⏳ Sending transaction...");

      const hash = ethers.keccak256(ethers.toUtf8Bytes(kycHash));

      const tx = await contract.registerUser(hash);
      await tx.wait();

      setStatus("✅ KYC Registered on Blockchain");
    } catch (err) {
      console.error(err);

      if (err.reason?.includes("already registered")) {
        setStatus("⚠️ User already registered");
      } else {
        setStatus("❌ Transaction failed");
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ VERIFY USER (WORKING VERSION)
  const verifyUser = async (approved) => {
    try {
      if (!contract) return alert("Connect wallet first");
      if (!userToVerify) return alert("Enter user address");

      setLoading(true);
      setStatus("⏳ Verifying user...");

      const statusValue = approved ? 2 : 3;

      const tx = await contract.verifyUser(
        userToVerify,
        statusValue,
        2592000
      );

      await tx.wait();

      setStatus(
        approved
          ? "✅ User Verified Successfully"
          : "❌ User Rejected Successfully"
      );
    } catch (err) {
      console.error("VERIFY ERROR:", err);

      if (err.reason?.includes("AccessControl")) {
        setStatus("❌ You are not a verifier");
      } else if (err.reason?.includes("User not registered")) {
        setStatus("❌ User not registered");
      } else {
        setStatus("❌ Verification failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white p-6">
      <h1 className="text-4xl font-bold text-center mb-8">
        TrustChain 🚀
      </h1>

      {!account ? (
        <div className="flex justify-center">
          <button
            onClick={connectWallet}
            className="bg-blue-600 px-6 py-3 rounded-xl hover:bg-blue-700"
          >
            Connect MetaMask
          </button>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-lg">
          <p className="text-green-400 mb-4 text-center">{account}</p>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white/10 p-4 rounded-xl text-center">
              <p>Total</p>
              <h2>{totalUsers}</h2>
            </div>
            <div className="bg-white/10 p-4 rounded-xl text-center">
              <p>Verified</p>
              <h2 className="text-green-400">{verifiedUsers}</h2>
            </div>
            <div className="bg-white/10 p-4 rounded-xl text-center">
              <p>Pending</p>
              <h2 className="text-yellow-400">{pendingUsers}</h2>
            </div>
          </div>

          <input type="file" onChange={handleFileUpload} className="w-full mb-4" />

          <button
            onClick={registerKYC}
            disabled={loading}
            className="w-full bg-blue-600 py-2 rounded-xl mb-4"
          >
            {loading ? "Processing..." : "Register KYC"}
          </button>

          <p className="text-center">{status}</p>

          <hr className="my-6 border-gray-600" />

          <h3 className="mb-2">Verifier Panel</h3>

          <input
            placeholder="User address"
            value={userToVerify}
            onChange={(e) => setUserToVerify(e.target.value)}
            className="w-full p-2 mb-3 bg-gray-800 rounded"
          />

          <div className="flex gap-3">
            <button
              onClick={() => verifyUser(true)}
              className="bg-green-600 px-4 py-2 rounded"
            >
              Verify
            </button>

            <button
              onClick={() => verifyUser(false)}
              className="bg-red-600 px-4 py-2 rounded"
            >
              Reject
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
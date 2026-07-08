import React, { useState } from 'react';
import { motion } from 'motion/react';
import { PlusCircle, Info, Sparkles, Image, Loader2, ArrowRight } from 'lucide-react';
import { useWeb3 } from '../context/Web3Context';
import toast from 'react-hot-toast';

interface CreateAuctionProps {
  onSuccess: (id: number) => void;
}

export const CreateAuction: React.FC<CreateAuctionProps> = ({ onSuccess }) => {
  const { createAuction, isConnected, connectWallet } = useWeb3();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startingPrice, setStartingPrice] = useState("0.05");
  const [duration, setDuration] = useState("3600"); // default 1 hour in seconds
  const [imageUri, setImageUri] = useState("");
  const [isPending, setIsPending] = useState(false);

  // Quick preset premium mock images
  const PRESET_IMAGES = [
    { name: "Node Matrix", url: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=600&auto=format&fit=crop" },
    { name: "Chrono Watch", url: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=600&auto=format&fit=crop" },
    { name: "Neon Tokyo", url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop" },
    { name: "Fluid Hologram", url: "https://images.unsplash.com/photo-1644024541299-cf30e20b336a?q=80&w=600&auto=format&fit=crop" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) {
      toast.error("Please connect your wallet first!");
      connectWallet('virtual');
      return;
    }

    if (!title.trim()) {
      toast.error("Please provide a title");
      return;
    }

    if (parseFloat(startingPrice) <= 0) {
      toast.error("Starting price must be strictly greater than 0 ETH");
      return;
    }

    setIsPending(true);
    try {
      const selectedImg = imageUri || PRESET_IMAGES[Math.floor(Math.random() * PRESET_IMAGES.length)].url;
      const newId = await createAuction(
        title,
        description,
        selectedImg,
        startingPrice,
        parseInt(duration)
      );
      
      // Reset form
      setTitle("");
      setDescription("");
      setStartingPrice("0.05");
      setDuration("3600");
      setImageUri("");
      
      // Callback to view details
      onSuccess(newId);
    } catch (err: any) {
      toast.error(err.message || "Failed to create auction");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="py-6 px-4 max-w-3xl mx-auto space-y-8 relative">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <PlusCircle className="h-5.5 w-5.5 text-indigo-400 shrink-0" />
          Launch New smart contract Listing
        </h2>
        <p className="text-xs text-gray-400">Deploy a trustless English auction in real-time to the virtual blockchain.</p>
      </div>

      {/* Info Warning */}
      <div className="rounded-xl border border-indigo-500/10 bg-indigo-500/5 p-4 flex gap-3 text-xs text-indigo-300">
        <Info className="h-4.5 w-4.5 text-indigo-400 shrink-0 mt-0.5" />
        <div className="space-y-1 leading-relaxed">
          <strong className="text-white font-semibold">Deployment Parameters:</strong>
          <p>
            Launching an item triggers a mock contract state change and adds a diagnostic transaction block log. For immediate testing, you can select <span className="text-white font-medium">5 Minutes</span> or <span className="text-white font-medium">10 Minutes</span> to witness the bidding countdown reach zero and test the settlement features!
          </p>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="bg-[#0F172A]/70 border border-white/5 rounded-2xl p-6 md:p-8 space-y-6 backdrop-blur">
        {/* Title */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-300 block">Auction Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Limited Edition Cyber-Node Key"
            className="w-full rounded-xl bg-[#070B14] border border-white/10 py-3 px-4 text-xs font-medium text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all"
            required
            disabled={isPending}
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-300 block">Item Specification / Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Outline structural materials, virtual asset parameters, smart contract capabilities..."
            rows={4}
            className="w-full rounded-xl bg-[#070B14] border border-white/10 py-3 px-4 text-xs font-medium text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all leading-relaxed"
            required
            disabled={isPending}
          />
        </div>

        {/* Price and Duration Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Starting Price */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-300 block">Starting Reserve Price (ETH)</label>
            <input
              type="number"
              step="0.001"
              min="0.001"
              value={startingPrice}
              onChange={(e) => setStartingPrice(e.target.value)}
              className="w-full rounded-xl bg-[#070B14] border border-white/10 py-3 px-4 text-xs font-medium text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all font-mono"
              required
              disabled={isPending}
            />
          </div>

          {/* Duration Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-300 block">Auction Lifetime Duration</label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full rounded-xl bg-[#070B14] border border-white/10 py-3 px-4 text-xs font-semibold text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all cursor-pointer"
              disabled={isPending}
            >
              <option value="120">2 Minutes (Super Fast Testing)</option>
              <option value="300">5 Minutes (Fast Testing)</option>
              <option value="600">10 Minutes (Demo)</option>
              <option value="3600">1 Hour (Standard)</option>
              <option value="86400">24 Hours (Long-term)</option>
              <option value="604800">7 Days (Full Cycle)</option>
            </select>
          </div>
        </div>

        {/* Image Selection Block */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-gray-300 block">Aesthetic Visual Cover Image</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {PRESET_IMAGES.map((img) => (
              <button
                key={img.name}
                type="button"
                onClick={() => setImageUri(img.url)}
                className={`group relative aspect-video rounded-xl overflow-hidden border transition-all ${imageUri === img.url ? 'border-indigo-500 scale-[1.02] ring-2 ring-indigo-500/25' : 'border-white/5 opacity-60 hover:opacity-100'}`}
              >
                <img src={img.url} alt={img.name} className="h-full w-full object-cover" />
                <span className="absolute inset-0 bg-[#070B14]/65 flex items-center justify-center text-[10px] font-bold text-white uppercase group-hover:bg-[#070B14]/40 transition-colors">
                  {img.name}
                </span>
              </button>
            ))}
          </div>

          <div className="h-[1px] w-full bg-white/5 my-2" />

          {/* Manual Input url */}
          <div className="space-y-1.5">
            <span className="text-[10px] text-gray-500 block">Or paste custom image address URL:</span>
            <input
              type="url"
              value={imageUri}
              onChange={(e) => setImageUri(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              className="w-full rounded-xl bg-[#070B14] border border-white/10 py-2.5 px-3 text-[11px] font-medium text-white focus:outline-none focus:border-indigo-500 transition-colors"
              disabled={isPending}
            />
          </div>
        </div>

        {/* Submit Actions */}
        <div className="pt-4 flex items-center justify-end border-t border-white/5">
          <button
            type="submit"
            disabled={isPending}
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold uppercase tracking-wider text-white rounded-xl shadow-lg shadow-indigo-600/15 hover:shadow-indigo-500/25 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Broadcasting to EVM...</span>
              </>
            ) : (
              <>
                <span>Launch Smart Listing</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

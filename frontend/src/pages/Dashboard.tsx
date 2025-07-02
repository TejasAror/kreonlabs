import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { createClient } from '@supabase/supabase-js';

import AppNavbar from "@/components/AppNavbar";
import AppSidebar from "@/components/AppSideBar";
import AssetCard from "@/components/AssetCard";
import LoadingScreen from "@/components/LoadingScreen";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

function Dashboard() {
  const { address, isDisconnected } = useAccount();
  const [assets, setAssets] = useState<any[]>([]);  // Fix: explicitly an array type and initial value
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAssets() {
      if (!address || isDisconnected) {
        setAssets([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('walletid', address)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching assets:', error);
        setAssets([]);
      } else {
        setAssets(data || []);
      }
      setIsLoading(false);
    }

    fetchAssets();
  }, [address, isDisconnected]);

 

  return (
    <AppSidebar>
      <AppNavbar title="Dashboard" />
       {isLoading ? <LoadingScreen text="Loading..."/> : (
        <div className="flex justify-center m-5 flex-wrap gap-4">
        {assets.length === 0 ? (
          <p>No assets found for your wallet.</p>
        ) : (
          assets.map((asset) => (
            <AssetCard
              key={asset.id}
              imgPath={asset.publicurl || ''}
              title={asset.title || 'Untitled'}
              description={asset.description || 'No description available'}
              createdAt={asset.created_at}
              c2paURL={asset.c2paurl}
              watermarkedURL={asset.watermarkedurl}
              storyExplorerURL={`https://aeneid.explorer.story.foundation/ipa/${asset.ipassetid}`}
            />
          ))
        )}
      </div>
       )}
      
    </AppSidebar>
  );
}

export default Dashboard;

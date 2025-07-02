import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router";
import './index.css'
import App from './App.tsx'

//Web3 Providers
import { getDefaultConfig, TomoEVMKitProvider, lightTheme } from '@tomo-inc/tomo-evm-kit';
import { WagmiProvider } from 'wagmi';
import { storyAeneid } from 'wagmi/chains';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { metaMaskWallet, rainbowWallet, walletConnectWallet } from '@tomo-inc/tomo-evm-kit/wallets';

//Tomo Config
const config = getDefaultConfig({
  clientId: import.meta.env.VITE_TOMO_CLIENT_ID, // Replace with your clientId
  appName: 'Kreon',
  appIcon: "https://family.co/logo.png", // your app's icon, no bigger than 1024x1024px (max. 1MB)
  projectId: import.meta.env.VITE_WALLETCONNECT__PROJECT_ID!, // Note: Every dApp that relies on WalletConnect now needs to obtain a projectId from WalletConnect Cloud.
  chains: [storyAeneid],
   wallets: [
    {
      groupName: 'Popular',
      wallets: [
        metaMaskWallet, 
        rainbowWallet, 
        walletConnectWallet, // Add other wallets if needed
      ],
    },
  ],
});

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <TomoEVMKitProvider theme={lightTheme({
        accentColor: '#637AFA',
        accentColorForeground: 'white',
        borderRadius: 'medium',
      })}>
          <BrowserRouter>
            <App/>
          </BrowserRouter>
        </TomoEVMKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
)

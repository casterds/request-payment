import React, { useCallback, useEffect, useMemo } from 'react';
import logo from './logo.svg';
import './App.css';
import '@rainbow-me/rainbowkit/styles.css';
import 'react-toastify/dist/ReactToastify.css';
import { WagmiConfig, configureChains, createConfig, useAccount, useWalletClient } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public'
import { goerli } from 'wagmi/chains';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'

import Home from './pages/home';
import { getDefaultWallets } from '@rainbow-me/rainbowkit';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import RequestView from './pages/view';
import Layout from './pages/layout';
import RequestContext from './context/RequestContext'
import { RequestNetwork } from '@requestnetwork/request-client.js';
import { Web3SignatureProvider } from '@requestnetwork/web3-signature';
import { ToastContainer } from 'react-toastify';


const { chains, publicClient } = configureChains(
  [goerli],
  [publicProvider()]
)

const { connectors } = getDefaultWallets({
  appName: 'Crypto Payments',
  chains
})

const wagmiConfig = createConfig({
  connectors,
  publicClient,
  autoConnect: true,
})

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />
      },
      {
        path: '/view/:requestId',
        element: <RequestView />
      }
    ]
  }
])

function Router() {
  const { data: walletClient } = useWalletClient()
  const requestClient = useMemo(() => {
    if (!walletClient)
      return new RequestNetwork({
        nodeConnectionConfig: { baseURL: "https://goerli.gateway.request.network/" },
      })
    return new RequestNetwork({
      nodeConnectionConfig: { baseURL: "https://goerli.gateway.request.network/" },
      signatureProvider: new Web3SignatureProvider(walletClient)
    })
  }, [walletClient])

  return <RequestContext value={requestClient}>
    <RouterProvider router={router} />
  </RequestContext>
}

function App() {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains}>
        <Router />
        <ToastContainer />
      </RainbowKitProvider>
    </WagmiConfig>

  );
}

export default App;

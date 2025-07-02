![image info](https://github.com/KreonLabs/kreon-labs/blob/main/frontend/public/logo-long-nobg.png?raw=true)

# Kreon Labs

Claim, verify, and protect ownership of your visual assets using C2PA metadata, invisible watermarking, perceptual hashing, and decentralized IP scanning. Integrated with Story Protocol for on-chain attribution.

[🌐 Visit Live Site](https://kreon.onrender.com) • [🧾 Built with Story Protocol](https://www.story.foundation/) • [📦 Tomo Wallet Login](https://tomo.inc/) 

<br>

##  Overview

**Kreon Labs** is a decentralized digital rights infrastructure for registering and tracking ownership of visual assets. It leverages open standards like [C2PA](https://c2pa.org/), invisible watermarking techniques, and [Story Protocol](https://storyprotocol.xyz/) to provide a tamper-evident, interoperable, and legally enforceable IP registration and enforcement workflow.

<br>


##  Core Principles

- **Trustless Provenance**: Provenance and attribution are embedded into the content itself and anchored to a public, composable protocol (Story Protocol).
- **Tamper Evident**: Assets are embedded with digitally signed C2PA manifests and invisible watermarks that survive common transformations.
- **Decentralized Detection**: The system includes an extensible engine to scan public data sources for unauthorized distribution using pHash-based similarity and watermark decoding.
- **Legal Enforceability**: Kreon supports DMCA workflows by generating machine-verifiable PDFs with embedded metadata for downstream legal systems.

<br>

##  Features

#### 1. Asset Registration
- Accepts image uploads from creators via a frontend dashboard.
- Verifies if the asset already contains existing C2PA manifests.
- Supports `.jpg`, `.png`, and other standard visual formats.

#### 2. C2PA Manifest Embedding
- Dynamically generates C2PA manifests containing:
  - Creator identity
  - Content creation metadata
  - Content hash (SHA-256)
  - Cryptographic signature (ECDSA/Ed25519 via custom or system keys)
- Embeds the manifest using [`c2pa-node`](https://github.com/contentauth/c2pa-node).

#### 3. Invisible Watermarking
- Embeds a frequency-domain invisible watermark.
- Resistant to:
  - JPEG recompression
  - Cropping and resizing
  - Minor color transformations
- Extractable even from modified images for attribution validation.

#### 4. Decentralized On-Chain Registration
- Uses the **Story Protocol SDK** to register:
  - Asset fingerprint
  - Metadata hash
- Enables interoperability with downstream Web3 composability.

#### 5. Distributed Fingerprint Storage
- Stores asset metadata, perceptual hashes, and manifest details on:
  - **IPFS** (content-addressed permanence)
  - **Supabase** (fast lookup, user queries, and dashboard sync)

#### 6. Derivative Detection & Infringement Alerts
- Scans across:
  - Major image hosting sites 
  - Web2 Platforms
  - User-submitted suspect assets
- Uses:
  - pHash (perceptual hashing) for similarity detection
  - Watermark decoding for embedded signature match

#### 7. DMCA Automation
- Generates legally compliant DMCA takedown PDF notices
- Includes:
  - Original manifest data
  - Hashes and evidence of infringement
  - Timestamp and signature

<br>

##  Usage Guide

1. **Register Asset**: Upload your image through the Kreon frontend. Existing C2PA metadata (if any) is detected and extracted.
2. **Embed Metadata**: A custom C2PA manifest is generated and embedded. Invisible watermarking is applied.
3. **Story Protocol Registration**: The asset’s hash and manifest are registered on-chain via the Story Protocol SDK.
4. **Store Metadata**: All relevant metadata (C2PA, watermark hash, pHash) is stored on IPFS and indexed in Supabase.
5. **Scan & Monitor**: Decentralized scanners continuously monitor the web for similar assets using perceptual hashing and watermark detection.
6. **Infringement Response**: If a match is found, you’re notified via the dashboard. You can auto-generate a DMCA takedown PDF with embedded provenance.

<br>

## Architecture

```
        ┌──────────── Upload Asset ─────────────┐
                            │
                   ┌────────▼────────┐
                   │ C2PA Embedder   │ ◄──── Existing metadata check
                   └────────┬────────┘
                            │
                   ┌────────▼────────┐
                   │ Watermark Engine│
                   └────────┬────────┘
                            │
                 ┌──────────▼──────────┐
                 │ Story Protocol SDK  │ ◄── On-chain attribution
                 └──────────┬──────────┘
                            │
                 ┌──────────▼──────────┐
                 │ IPFS + Supabase     │ ◄── Fingerprint & Metadata Store
                 └──────────┬──────────┘
                            │
                 ┌──────────▼──────────┐
                 │ Infringement Scanner│ ◄── Uses pHash + watermark recovery
                 └──────────┬──────────┘
                            │
                 ┌──────────▼──────────┐
                 │ DMCA Generator      │
                 └─────────────────────┘
```

<br>

## Tech Stack

| Layer       | Stack / Tools                              |
|-------------|---------------------------------------------|
| Frontend    | React, Tailwind CSS, React Router           |
| Backend     | Node.js, Express, Axios, PDFKit             |
| Storage     | Supabase (PostgreSQL, Auth), IPFS           |
| Protocols   | C2PA CLI, Story Protocol SDK                |
| Detection   | pHash (perceptual hashing), invisible watermarking, ffmpeg |
| Infra/CI    | Docker, Render              |

<br>

## Security Considerations

- **C2PA Manifests**: Signed manifests with cryptographic proof of authorship; supports validation against known public keys.
- **Watermarking**: Resistant to lossy transformations (scaling, compression, cropping).
- **Storage**: IPFS ensures tamper-resistance and decentralization; Supabase supports real-time metadata lookup.
- **DMCA Integration**: PDFKit auto-generates machine-verifiable takedown requests containing signed metadata for legal use.

<br>

##  Key Integrations

- **Story Protocol SDK** – Registers asset metadata and attribution on-chain.
- **IPFS** – Stores asset metadata, fingerprints, and manifests.
- **Supabase** – Real-time asset metadata database and dashboard backend.
- **C2PA Tools** – Embeds and verifies content provenance manifests.
- **Tomo SDK** – Handles social authentication and wallet management.

<br>

### Tomo SDK Integration

* **User Authentication**: Kreon Labs uses Tomo SDK to authenticate users via social logins directly within our registration flow. This allows creators to sign in without any external wallet setup or browser extension.

* **Wallet Generation for Signing**: When a user registers a visual asset, the Tomo-generated wallet is used under the hood to sign the Story Protocol transaction that anchors the asset's provenance on-chain.

* **Session Management**: The Tomo session is maintained across user interactions, ensuring that wallet-based signing and metadata submission are seamless within a single UI session.

* **Simplified Onboarding**: All users on Kreon Labs are provisioned a wallet on first login using Tomo SDK, which removes the need to educate users on Web3 tools and improves adoption among non-technical creators.

* **Integrated with Asset Pipeline**: Tomo wallet addresses are directly tied to asset registration records, ensuring that ownership attribution is cryptographically verifiable and persistent across all metadata layers (C2PA, Supabase, IPFS, Story Protocol).

<br>

##  Folder Structure

```bash
.
├── frontend/               # React frontend with dashboard and uploader
├── backend/                # Express server with API routes and DMCA generation
├── watermarking/           # Watermark embed/extract logic
├── scanner/                # pHash and web monitoring engine
└── README.md

```

<br>

## References

* [C2PA Specification](https://c2pa.org/specifications/)
* [Story Protocol Whitepaper](https://storyprotocol.xyz/whitepaper)
* [pHash Paper](https://www.phash.org/)
* [Invisible Watermarking (Survey)](https://arxiv.org/abs/2003.06158)

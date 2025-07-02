

export default function LandingPage() {

  return (
    <div>
      <style>
        {`
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Inter';
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  line-height: 1.6;
  color: #ffffff;
  background: linear-gradient(135deg, #121212 0%, #23272f 100%);
  min-height: 100vh;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* Header */
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 4rem;
}



.logo-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
  background: linear-gradient(135deg, #8b5cf6, #06b6d4);
  color: white;
}

.logo-text {
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
}

.nav {
  display: none;
  align-items: center;
  gap: 2rem;
}

.nav-link {
  font-size: 0.875rem;
  font-weight: 500;
  color: #d1d5db;
  text-decoration: none;
  transition: color 0.3s ease;
}

.nav-link:hover {
  color: #ffffff;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-outline {
  border: 1px solid #8b5cf6;
  color: #a855f7;
  background: transparent;
}

.btn-outline:hover {
  background: #8b5cf6;
  color: white;
}

.btn-primary {
  background: linear-gradient(135deg, #8b5cf6, #06b6d4);
  color: white;
  font-weight: 600;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #7c3aed, #0891b2);
  transform: translateY(-1px);
}

.btn-large {
  padding: 1rem 3rem;
  font-size: 1.125rem;
}

/* Hero Section */
.hero {
  position: relative;
  padding: 8rem 0;
  overflow: hidden;
}

.hero-bg-effects {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.hero-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(6, 182, 212, 0.1));
  filter: blur(60px);
}

.hero-circle-1 {
  position: absolute;
  top: 25%;
  left: 25%;
  width: 18rem;
  height: 18rem;
  background: rgba(139, 92, 246, 0.2);
  border-radius: 50%;
  filter: blur(60px);
}

.hero-circle-2 {
  position: absolute;
  bottom: 25%;
  right: 25%;
  width: 24rem;
  height: 24rem;
  background: rgba(6, 182, 212, 0.2);
  border-radius: 50%;
  filter: blur(60px);
}

.hero-content {
  position: relative;
  max-width: 4xl;
  margin: 0 auto;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
  background: rgba(139, 92, 246, 0.2);
  color: #c4b5fd;
  border: 1px solid rgba(139, 92, 246, 0.3);
  width: fit-content;
  margin: 0 auto;
}

.badge-cyan {
  background: rgba(6, 182, 212, 0.2);
  color: #67e8f9;
  border: 1px solid rgba(6, 182, 212, 0.3);
}

.hero-title {
  font-size: 3rem;
  font-weight: 700;
  line-height: 1.1;
  color: white;
}

.gradient-text {
  background: linear-gradient(135deg, #a855f7, #06b6d4);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: #d1d5db;
  max-width: 48rem;
  margin: 0 auto;
  line-height: 1.6;
}

.waitlist-form {
  max-width: 28rem;
  margin: 0 auto;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.email-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.375rem;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1rem;
}

.email-input::placeholder {
  color: #9ca3af;
}

.email-input:focus {
  outline: none;
  border-color: #8b5cf6;
}

.success-message {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: #10b981;
  font-weight: 500;
}

.hero-features {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  font-size: 0.875rem;
  color: #9ca3af;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.feature-item svg {
  color: #10b981;
}

/* Sections */
.section {
  padding: 5rem 0;
}

.section-dark {
  background: rgba(0, 0, 0, 0.2);
}

.section-header {
  text-align: center;
  margin-bottom: 4rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
}

.section-subtitle {
  font-size: 1.25rem;
  color: #d1d5db;
  max-width: 50rem;
  margin: 0 auto;
}

/* Steps Grid */
.steps-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  max-width: 6xl;
  margin: 0 auto;
}

.step-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  padding: 2rem;
  text-align: center;
  backdrop-filter: blur(10px);
  transition: background-color 0.3s ease;
}

.step-card:hover {
  background: rgba(255, 255, 255, 0.1);
}

.step-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  margin: 0 auto 1rem;
  color: white;
}

.step-icon-purple {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
}

.step-icon-cyan {
  background: linear-gradient(135deg, #06b6d4, #0891b2);
}

.step-icon-gradient {
  background: linear-gradient(135deg, #8b5cf6, #06b6d4);
}

.step-icon-green {
  background: linear-gradient(135deg, #10b981, #059669);
}

.step-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.step-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  background: #8b5cf6;
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
}

.step-number-cyan {
  background: #06b6d4;
}

.step-number-gradient {
  background: linear-gradient(135deg, #8b5cf6, #06b6d4);
}

.step-number-green {
  background: #10b981;
}

.step-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: white;
}

.step-description {
  color: #d1d5db;
}

/* Features Grid */
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  max-width: 6xl;
  margin: 0 auto;
}

.feature-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  padding: 2rem;
  backdrop-filter: blur(10px);
  transition: background-color 0.3s ease;
}

.feature-card:hover {
  background: rgba(255, 255, 255, 0.1);
}

.feature-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  color: white;
}

.feature-icon-purple {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
}

.feature-icon-cyan {
  background: linear-gradient(135deg, #06b6d4, #0891b2);
}

.feature-icon-green {
  background: linear-gradient(135deg, #10b981, #059669);
}

.feature-icon-orange {
  background: linear-gradient(135deg, #f97316, #ea580c);
}

.feature-icon-blue {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
}

.feature-icon-pink {
  background: linear-gradient(135deg, #ec4899, #db2777);
}

.feature-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: white;
  margin-bottom: 0.5rem;
}

.feature-description {
  color: #d1d5db;
}

/* Use Cases Grid */
.use-cases-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  max-width: 6xl;
  margin: 0 auto;
}

.use-case-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  padding: 2rem;
  text-align: center;
  backdrop-filter: blur(10px);
  transition: background-color 0.3s ease;
}

.use-case-card:hover {
  background: rgba(255, 255, 255, 0.1);
}

.use-case-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  margin: 0 auto 1rem;
  color: white;
}

.use-case-icon-purple {
  background: linear-gradient(135deg, #8b5cf6, #ec4899);
}

.use-case-icon-cyan {
  background: linear-gradient(135deg, #06b6d4, #3b82f6);
}

.use-case-icon-green {
  background: linear-gradient(135deg, #10b981, #14b8a6);
}

.use-case-icon-orange {
  background: linear-gradient(135deg, #f97316, #ef4444);
}

.use-case-icon-pink {
  background: linear-gradient(135deg, #ec4899, #8b5cf6);
}

.use-case-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: white;
  margin-bottom: 0.5rem;
}

.use-case-description {
  font-size: 0.875rem;
  color: #d1d5db;
}

/* CTA Section */
.cta-section {
  padding: 8rem 0;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.2), rgba(34, 24, 39, 0.2));
}

.cta-content {
  text-align: center;
  max-width: 48rem;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  align-items: center;
}

.cta-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
}

.cta-subtitle {
  font-size: 1.25rem;
  color: #d1d5db;
}

.cta-note {
  font-size: 0.875rem;
  color: #9ca3af;
}

/* Footer */
.footer {
  background: rgba(0, 0, 0, 0.4);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 4rem 0;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.footer-brand {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.footer-description {
  color: #9ca3af;
  max-width: 20rem;
}

.footer-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.footer-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: white;
}

.footer-links {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.footer-link {
  color: #9ca3af;
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer-link:hover {
  color: white;
}

.footer-contact {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #9ca3af;
}

.contact-link {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  color: #a855f7;
  text-decoration: none;
  transition: color 0.3s ease;
}

.contact-link:hover {
  color: #c084fc;
}

.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 2rem;
  text-align: center;
}

.copyright {
  color: #9ca3af;
  font-size: 0.875rem;
}

/* Responsive Design */
@media (min-width: 768px) {
  .nav {
    display: flex;
  }

  .form {
    flex-direction: row;
  }

  .hero-title {
    font-size: 4rem;
  }

  .section-title {
    font-size: 3rem;
  }

  .cta-title {
    font-size: 3rem;
  }
}

@media (min-width: 1024px) {
  .hero-title {
    font-size: 5rem;
  }

  .steps-grid {
    grid-template-columns: repeat(4, 1fr);
  }

  .features-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .use-cases-grid {
    grid-template-columns: repeat(5, 1fr);
  }
}

@media (max-width: 767px) {
  .hero {
    padding: 6rem 0 4rem;
  }

  .hero-title {
    font-size: 2.5rem;
  }

  .hero-subtitle {
    font-size: 1.125rem;
  }

  .section-title {
    font-size: 2rem;
  }

  .cta-title {
    font-size: 2rem;
  }

  .hero-features {
    flex-direction: column;
    gap: 1rem;
  }
}

        `}
      </style>
    <header className="header">
        <div className="container">
            <div className="header-content">
                <div className="logo">
                    <div className="w-2xl">
                      <img src="./logo-long-nobg.png" width={"20%"} />
                    </div>
                  
                </div>

                <nav className="nav">
                    <a href="#how-it-works" className="nav-link">How It Works</a>
                    <a href="#features" className="nav-link">Features</a>
                    <a href="#use-cases" className="nav-link">Use Cases</a>
                </nav>
                <a href="/dashboard">
                  <button className="btn btn-outline">Dashboard</button>
                </a>
            </div>
        </div>
    </header>

    <section className="hero">
        <div className="hero-bg-effects">
            <div className="hero-gradient"></div>
            <div className="hero-circle-1"></div>
            <div className="hero-circle-2"></div>
        </div>
        
        <div className="container">
            <div className="hero-content">
                <div className="badge">
                  <img src="https://images.ctfassets.net/5ei3wx54t1dp/2u45PFyEAo9vChaRnqAiBL/66ae1c979350b4849d29018a21b3b7a9/favicon.png" className="w-8"/>
                  <p className="font-bold w-45">
                     Built with Story Protocol
                  </p>
                </div>

                <h1 className="hero-title">
                    Your Creativity.
                    <span className="gradient-text"> Protected Forever.</span>
                </h1>

                <p className="hero-subtitle">
                    Kreon Labs helps you claim, track, and enforce ownership of your visual assets using watermarking, C2PA metadata, decentralized scanning of <br/> Story Protocol based 🧩IP Assets.
                </p>

                <div className="waitlist-form" id="waitlistForm">
                    <a className="form" href="/dashboard">
                        
                        <button type="submit" className="btn btn-primary">
                            Protect your Assets
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M5 12h14M12 5l7 7-7 7"/>
                            </svg>
                        </button>
                    </a>
                </div>

                <div className="hero-features">
                    <div className="feature-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                            <polyline points="22,4 12,14.01 9,11.01"/>
                        </svg>
                        <span>Early access</span>
                    </div>
                    <div className="feature-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                            <polyline points="22,4 12,14.01 9,11.01"/>
                        </svg>
                        <span>Web3 Native</span>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section id="how-it-works" className="section section-dark">
        <div className="container">
            <div className="section-header">
                <div className="badge badge-cyan">How It Works</div>
                <h2 className="section-title">Protect Your Content in 4 Simple Steps</h2>
                <p className="section-subtitle">
                    Our product suite ensures your creative work is protected across the entire Web2 and Web3 Landscape.
                </p>
            </div>

            <div className="steps-grid">
                <div className="step-card">
                    <div className="step-icon step-icon-purple">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="7,10 12,15 17,10"/>
                            <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                    </div>
                    <div className="step-header">
                        <span className="step-number">1</span>
                        <h3 className="step-title">Upload Image</h3>
                    </div>
                    <p className="step-description">Upload your IP Asset to our platform</p>
                </div>

                <div className="step-card">
                    <div className="step-icon step-icon-cyan">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                        </svg>
                    </div>
                    <div className="step-header">
                        <span className="step-number step-number-cyan">2</span>
                        <h3 className="step-title">Watermark + Metadata</h3>
                    </div>
                    <p className="step-description">Invisible watermark and C2PA metadata embedded automatically</p>
                </div>

                <div className="step-card">
                    <div className="step-icon step-icon-gradient">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                            <circle cx="12" cy="16" r="1"/>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                    </div>
                    <div className="step-header">
                        <span className="step-number step-number-gradient">3</span>
                        <h3 className="step-title">Story Protocol</h3>
                    </div>
                    <p className="step-description">Content registered on Story Protocol for Proof of Creativity</p>
                </div>

                <div className="step-card">
                    <div className="step-icon step-icon-green">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z"/>
                            <line x1="8" y1="1" x2="8" y2="4"/>
                            <line x1="16" y1="1" x2="16" y2="4"/>
                        </svg>
                    </div>
                    <div className="step-header">
                        <span className="step-number step-number-green">4</span>
                        <h3 className="step-title">24/7 Monitoring</h3>
                    </div>
                    <p className="step-description">Decentralized scanners monitor the web for infringement</p>
                </div>
            </div>
        </div>
    </section>

    <section id="features" className="section">
        <div className="container">
            <div className="section-header">
                <div className="badge">Key Features</div>
                <h2 className="section-title">Advanced Protection Technology</h2>
                <p className="section-subtitle">
                    Cutting-edge tools designed specifically for digital creators
                </p>
            </div>

            <div className="features-grid">
                <div className="feature-card">
                    <div className="feature-icon feature-icon-purple">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2"/>
                        </svg>
                    </div>
                    <h3 className="feature-title">AI-Based Invisible Watermarking</h3>
                    <p className="feature-description">
                        Advanced AI algorithms embed invisible watermarks that survive compression and editing*
                    </p>
                </div>

                <div className="feature-card">
                    <div className="feature-icon feature-icon-cyan">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                        </svg>
                    </div>
                    <h3 className="feature-title">C2PA Metadata Integration</h3>
                    <p className="feature-description">
                        Industry-standard C2PA metadata for provenance and ownership traceability
                    </p>
                </div>

                <div className="feature-card">
                    <div className="feature-icon feature-icon-green">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                            <circle cx="12" cy="16" r="1"/>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                    </div>
                    <h3 className="feature-title">Story Protocol Registration</h3>
                    <p className="feature-description">
                        IP Asset registration on Story Protocol for immutable ownership records
                    </p>
                </div>

                <div className="feature-card">
                    <div className="feature-icon feature-icon-orange">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="2" y1="12" x2="22" y2="12"/>
                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                        </svg>
                    </div>
                    <h3 className="feature-title">Decentralized Scanner Network</h3>
                    <p className="feature-description">
                        24/7 real-time detection across the web using our distributed scanner network
                    </p>
                </div>

                <div className="feature-card">
                    <div className="feature-icon feature-icon-blue">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="11" cy="11" r="8"/>
                            <path d="M21 21l-4.35-4.35"/>
                        </svg>
                    </div>
                    <h3 className="feature-title">Social Media Monitoring</h3>
                    <p className="feature-description">
                        Comprehensive monitoring across X (Twitter), Reddit, and other major platforms
                    </p>
                </div>

                <div className="feature-card">
                    <div className="feature-icon feature-icon-pink">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="20" x2="18" y2="10"/>
                            <line x1="12" y1="20" x2="12" y2="4"/>
                            <line x1="6" y1="20" x2="6" y2="14"/>
                        </svg>
                    </div>
                    <h3 className="feature-title">Copyright Dashboard</h3>
                    <p className="feature-description">
                        Comprehensive dashboard with takedown tools and violation tracking
                    </p>
                </div>
            </div>
        </div>
    </section>

    <section id="use-cases" className="section section-dark">
        <div className="container">
            <div className="section-header">
                <div className="badge badge-cyan">Use Cases</div>
                <h2 className="section-title">Built for Digital Creators</h2>
                <p className="section-subtitle">
                    Whether you're an artist, photographer, or brand, Kreon Labs protects your creative work
                </p>
            </div>

            <div className="use-cases-grid">
                <div className="use-case-card">
                    <div className="use-case-icon use-case-icon-purple">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                    </div>
                    <h3 className="use-case-title">Digital Artists</h3>
                    <p className="use-case-description">
                        Protect your digital art and illustrations from unauthorized use
                    </p>
                </div>

                <div className="use-case-card">
                    <div className="use-case-icon use-case-icon-cyan">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                        </svg>
                    </div>
                    <h3 className="use-case-title">NFT Creators</h3>
                    <p className="use-case-description">
                        Ensure authenticity and ownership of your NFT collections
                    </p>
                </div>

                <div className="use-case-card">
                    <div className="use-case-icon use-case-icon-green">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                            <circle cx="12" cy="13" r="4"/>
                        </svg>
                    </div>
                    <h3 className="use-case-title">Photographers</h3>
                    <p className="use-case-description">
                        Safeguard your photography portfolio and commercial work
                    </p>
                </div>

                <div className="use-case-card">
                    <div className="use-case-icon use-case-icon-orange">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                            <line x1="8" y1="21" x2="16" y2="21"/>
                            <line x1="12" y1="17" x2="12" y2="21"/>
                        </svg>
                    </div>
                    <h3 className="use-case-title">Media Studios</h3>
                    <p className="use-case-description">
                        Protect large-scale content libraries and brand assets
                    </p>
                </div>

                <div className="use-case-card">
                    <div className="use-case-icon use-case-icon-pink">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                            <circle cx="9" cy="7" r="4"/>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                        </svg>
                    </div>
                    <h3 className="use-case-title">Brand Marketers</h3>
                    <p className="use-case-description">
                        Monitor and protect your brand's visual identity online
                    </p>
                </div>
            </div>
        </div>
    </section>

    <section className="cta-section">
        <div className="container">
            <div className="cta-content">
                <h2 className="cta-title">Ready to Protect Your Creative Work?</h2>
                <p className="cta-subtitle">
                    Register your assets and be among the first to experience next-generation copyright protection
                </p>
                
                <p className="cta-note">Early access • Built on Story Protocol • Decentralised</p>
            </div>
        </div>
    </section>


    <footer className="footer">
        <div className="container">
            <div className="footer-content">
                <div className="footer-brand">
                    <div className="logo">
                        <img src="./logo-long-nobg.png" width={"40%"} />
                    </div>
                    <p className="footer-description">
                        Protecting digital creativity through advanced Web3 technology and decentralized monitoring.
                    </p>
                </div>

                <div className="footer-section">
                    <h3 className="footer-title">Legal</h3>
                    <div className="footer-links">
                        <a href="/privacy" className="footer-link">Privacy Policy</a>
                        <a href="/terms" className="footer-link">Terms of Service</a>
                    </div>
                </div>

                <div className="footer-section">
                    <h3 className="footer-title">Contact</h3>
                    <div className="footer-contact">
                        <div className="contact-item">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                <polyline points="22,6 12,13 2,6"/>
                            </svg>
                            <span>hello@kreonlabs.com</span>
                        </div>
                        <a href="mailto:hello@kreonlabs.com" className="contact-link">
                            <span>Get in touch</span>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                                <polyline points="15,3 21,3 21,9"/>
                                <line x1="10" y1="14" x2="21" y2="3"/>
                            </svg>
                        </a>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <p className="copyright">© <span id="currentYear"></span> Kreon Labs. All rights reserved.</p>
            </div>
        </div>
    </footer>

    <script src="script.js"></script>
    </div>
  );
}

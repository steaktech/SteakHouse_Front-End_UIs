import React, { useState } from "react";
import dynamic from "next/dynamic";
import styles from "./UI/Footer.module.css";

const CreateTokenModal = dynamic(
  () => import("./Modals/CreateTokenModal/CreateTokenModal"),
  { ssr: false }
);

const Footer: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCertikHovered, setIsCertikHovered] = useState(false);

  return (
    <>
      <footer className={styles.enterpriseFooter} role="contentinfo">
        <div className={styles.container}>
          {/* Top */}
          <div className={styles.footerTop}>
            <div>
              <div className={styles.brandRow} aria-label="SteakHouse">
                <div className={styles.brandBlock}>
                  <h2>
                    SteakHouse
                    <img
                      className={styles.brandMark}
                      src="/images/steakhouse-logo-v2.png"
                      alt="SteakHouse logo"
                    />
                  </h2>
                  <p>
                    ERC‑20 launchpad on Ethereum focused on fair, customizable
                    launches.
                  </p>
                </div>
              </div>
            </div>

            <div
              className={styles.topActions}
              aria-label="Social and quick actions"
            >
              <nav className={styles.social} aria-label="Social media">
                <a href="/coming-soon" aria-label="YouTube" title="YouTube">
                  <i className="ri-youtube-fill" aria-hidden="true"></i>
                </a>
                <a href="https://medium.com/@steakhousefinance" aria-label="Medium" title="Medium">
                  <i className="ri-medium-fill" aria-hidden="true"></i>
                </a>
                <a href="https://github.com/steaktech" target="_blank" rel="noopener noreferrer" aria-label="GitHub" title="GitHub">
                  <i className="ri-github-fill" aria-hidden="true"></i>
                </a>
                <a href="https://x.com/steak_tech" target="_blank" rel="noopener noreferrer" aria-label="Twitter" title="Twitter">
                  <i className="ri-twitter-x-fill" aria-hidden="true"></i>
                </a>
                <a href="/coming-soon" aria-label="Discord" title="Discord">
                  <i className="ri-discord-fill" aria-hidden="true"></i>
                </a>
                <a href="https://t.me/steakhouse" target="_blank" rel="noopener noreferrer" aria-label="Telegram" title="Telegram">
                  <i className="ri-telegram-fill" aria-hidden="true"></i>
                </a>
              </nav>

              <button
                className={`${styles.btn} ${styles.primary}`}
                onClick={() => setIsModalOpen(true)}
                title="Create ERC‑20"
              >
                Create Token
              </button>
              <a className={styles.btn} href="/coming-soon" title="Documentation">
                Docs
              </a>
            </div>
          </div>

          {/* Middle: Corporate links */}
          <div className={styles.footerMiddle}>
            <nav className={styles.mega} aria-label="Footer site map">
              <div className={styles.col}>
                <h3>Solutions</h3>
                <ul>
                  <li>
                    <a href="/coming-soon">Stealth Launchpad</a>
                  </li>
                  <li>
                    <a href="/coming-soon">Bonding Curve For Tax / Limit Tokens</a>
                  </li>
                  <li>
                    <a href="/coming-soon">Virtual AMM Trades</a>
                  </li>
                  <li>
                    <a href="/coming-soon">Liquidity Lock & Vesting</a>
                  </li>
                  <li>
                    <a href="/coming-soon">$3 ERC-20 Deploys</a>
                  </li>
                </ul>

                {/* CertiK certificate block under Solutions */}
              </div>

              <div className={styles.col}>
                <h3>FAQ'S</h3>
                <ul>
                  <li>
                    <a href="/coming-soon">Developer</a>
                  </li>
                  <li>
                    <a href="/coming-soon">Investor</a>
                  </li>
                </ul>
                
                <h3 style={{ marginTop: '24px' }}>Partner With Us</h3>
                <ul>
                  <li>
                    <a href="https://form.typeform.com/to/cCMVLuxI" target="_blank" rel="noopener noreferrer">Request Form</a>
                  </li>
                </ul>
              </div>

              <div className={styles.col}>
                <h3>Developers</h3>
                <ul>
                  <li>
                    <a href="/coming-soon">Kitchen Docs</a>
                  </li>
                  <li>
                    <a href="/coming-soon">SDK / API</a>
                  </li>
                  <li>
                    <a href="/coming-soon">Marketing Menu</a>
                  </li>
                  <li>
                    <a href="/coming-soon">Direct Launch</a>
                  </li>
                  <li>
                    <a href="/coming-soon">Creation Fees</a>
                  </li>
                  <li>
                    <a href="https://form.typeform.com/to/cCMVLuxI" target="_blank" rel="noopener noreferrer">Support</a>
                  </li>
                </ul>
              </div>

              <div className={styles.col}>
                <h3>Investors</h3>
                <ul>
                  <li>
                    <a href="/coming-soon">Fair Distribution Policy</a>
                  </li>
                  <li>
                    <a href="/coming-soon">Anti‑Bot & Anti‑Snipe Standard</a>
                  </li>
                  <li>
                    <a href="/coming-soon">Fee Structure</a>
                  </li>
                  <li>
                    <a href="/coming-soon">Security & Responsible Disclosure</a>
                  </li>
                  <li>
                    <a href="/coming-soon">Login / Setup</a>
                  </li>
                </ul>
              </div>

              <div className={styles.col}>
                <h3>Company</h3>
                <ul>
                  <li>
                    <a href="/coming-soon">About SteakHouse</a>
                  </li>
                  <li>
                    <a href="/media-kit">Media Kit</a>
                  </li>
                  <li>
                    <a href="/docs/certificate.pdf" download>Certificate of Incorporation</a>
                  </li>
                  <li>
                    <a href="/coming-soon">Careers</a>
                  </li>
                  <li>
                    <a href="/coming-soon">Brand & Press</a>
                  </li>
                  <li>
                    <a href="https://form.typeform.com/to/cCMVLuxI" target="_blank" rel="noopener noreferrer">Contact</a>
                  </li> 
                </ul>
              </div>

              <div className={styles.col}>
                <h3>Legal</h3>
                <ul>
                  <li>
                    <a href="/coming-soon">Terms of Service</a>
                  </li>
                  <li>
                    <a href="/coming-soon">Privacy Policy</a>
                  </li>
                  <li>
                    <a href="/coming-soon">Cookie Policy</a>
                  </li>
                  <li>
                    <a href="/coming-soon">Risk Disclosure</a>
                  </li>
                </ul>
              </div>
            </nav>
          </div>

          {/* Bottom: only disclaimer and copyright */}
          <div className={styles.footerBottom} aria-label="Legal">
            <p><a href="mailto:contact@steakhouse.finance">contact@steakhouse.finance</a></p>
            <div className={styles.certikBadge} aria-label="CertiK certificate">
              {/* paste the following code into the div you would like to show certik emblem */}
              <style
                dangerouslySetInnerHTML={{
                  __html: `
                    @keyframes fireShine {
                      0%, 100% {
                        filter: drop-shadow(0 0 8px rgba(255, 140, 0, 0.8)) drop-shadow(0 0 16px rgba(255, 69, 0, 0.6)) brightness(1);
                      }
                      50% {
                        filter: drop-shadow(0 0 20px rgba(255, 140, 0, 1)) drop-shadow(0 0 32px rgba(255, 69, 0, 0.9)) brightness(1.2);
                      }
                    }
                    @keyframes fireParticle {
                      0% {
                        transform: translateY(0) scale(1);
                        opacity: 1;
                      }
                      100% {
                        transform: translateY(-40px) scale(0);
                        opacity: 0;
                      }
                    }
                    @keyframes fireFlicker {
                      0%, 100% { opacity: 0.8; }
                      50% { opacity: 1; }
                    }
                    .certik-wrapper-animated {
                      animation: fireShine 1.5s ease-in-out infinite;
                    }
                    .fire-particle {
                      position: absolute;
                      width: 8px;
                      height: 8px;
                      border-radius: 50%;
                      background: radial-gradient(circle, #ff8c00, #ff4500);
                      box-shadow: 0 0 10px #ff4500;
                      animation: fireParticle 1.5s ease-out infinite, fireFlicker 0.3s ease-in-out infinite;
                      pointer-events: none;
                    }
                    .fire-particle:nth-child(1) { left: 10%; bottom: 0; animation-delay: 0s; }
                    .fire-particle:nth-child(2) { left: 30%; bottom: 0; animation-delay: 0.3s; }
                    .fire-particle:nth-child(3) { left: 50%; bottom: 0; animation-delay: 0.6s; }
                    .fire-particle:nth-child(4) { left: 70%; bottom: 0; animation-delay: 0.9s; }
                    .fire-particle:nth-child(5) { left: 90%; bottom: 0; animation-delay: 1.2s; }
                  `
                }}
              />
              <div 
                className={isCertikHovered ? "certik-wrapper certik-wrapper-animated" : "certik-wrapper"}
                onMouseEnter={() => setIsCertikHovered(true)}
                onMouseLeave={() => setIsCertikHovered(false)}
                style={{ 
                  transform: isCertikHovered ? 'scale(2.0)' : 'scale(1.9)', 
                  transformOrigin: 'left center', 
                  marginRight: '30px', 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  position: 'relative', 
                  top: '20px', 
                  left: '10px',
                  transition: 'transform 0.3s ease, filter 0.3s ease',
                  cursor: 'pointer'
                }}>
                {isCertikHovered && (
                  <>
                    <div className="fire-particle"></div>
                    <div className="fire-particle"></div>
                    <div className="fire-particle"></div>
                    <div className="fire-particle"></div>
                    <div className="fire-particle"></div>
                  </>
                )}
                <div className="certik-emblem" data-id="39b5f42f">
                  <a href="https://skynet.certik.com/projects/steakhouse?utm_source=SkyEmblem&utm_campaign=steakhouse&utm_medium=link">View project at certik.com</a>
                </div>
              </div>
              <script async src="https://emblem.certik-assets.com/script?pid=steakhouse&vid=39b5f42f"></script>
              <span className={styles.spacer}></span>
              <a
                className={`${styles.btn} ${styles.sm}`}
                href="#certik"
                target="_blank"
                rel="noopener noreferrer"
                title="View CertiK Certificate"
                style={{ marginLeft: '-20px' }}
              >
                <i className="ri-shield-check-line" aria-hidden="true"></i>
                Audit Certificate
              </a>
            </div>
            <p className={styles.disclaimer}>
              SteakHouse provides a non‑custodial interface to open‑source smart
              contracts on Ethereum. No investment advice. Launch responsibly
              and DYOR.
            </p>
            <p className={styles.copyright}>© 2025 SteakHouse</p>
          </div>
        </div>
      </footer>

      {/* Create Token Modal */}
      <CreateTokenModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default Footer;
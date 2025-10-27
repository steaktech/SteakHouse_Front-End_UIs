import React, { useState } from "react";
import dynamic from "next/dynamic";
import styles from "./UI/Footer.module.css";

const CreateTokenModal = dynamic(
  () => import("./Modals/CreateTokenModal/CreateTokenModal"),
  { ssr: false }
);

const Footer: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

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
                <a href="/coming-soon" target="_blank" rel="noopener noreferrer" aria-label="YouTube" title="YouTube">
                  <i className="ri-youtube-fill" aria-hidden="true"></i>
                </a>
                <a href="https://medium.com/@steakhousefinance" target="_blank" rel="noopener noreferrer" aria-label="Medium" title="Medium">
                  <i className="ri-medium-fill" aria-hidden="true"></i>
                </a>
                <a href="https://github.com/steaktech" target="_blank" rel="noopener noreferrer" aria-label="GitHub" title="GitHub">
                  <i className="ri-github-fill" aria-hidden="true"></i>
                </a>
                <a href="https://x.com/steak_tech" target="_blank" rel="noopener noreferrer" aria-label="Twitter" title="Twitter">
                  <i className="ri-twitter-x-fill" aria-hidden="true"></i>
                </a>
                <a href="/coming-soon" target="_blank" rel="noopener noreferrer" aria-label="Discord" title="Discord">
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
              <a className={styles.btn} href="https://docs.steakhouse.finance/" target="_blank" rel="noopener noreferrer" title="Documentation">
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
                    <a href="https://docs.steakhouse.finance/getting-started/what-is-steakhouse" target="_blank" rel="noopener noreferrer">Launchpad Overview</a>
                  </li>
                  <li>
                    <a href="https://docs.steakhouse.finance/getting-started/what-is-steakhouse/problem-solution" target="_blank" rel="noopener noreferrer">Problem / Solution</a>
                  </li>
                  <li>
                    <a href="https://docs.steakhouse.finance/getting-started/what-is-steakhouse/ecosystem-overview" target="_blank" rel="noopener noreferrer">Ecosystem Overview</a>
                  </li>
                  <li>
                    <a href="https://docs.steakhouse.finance/getting-started/what-is-steakhouse/launchpad-benefits" target="_blank" rel="noopener noreferrer">Launchpad Benefits</a>
                  </li>
                  <li>
                    <a href="https://docs.steakhouse.finance/user-basics/technical-architecture" target="_blank" rel="noopener noreferrer">Technical Architecture</a>
                  </li>
                </ul>

                {/* CertiK certificate block under Solutions */}
              </div>

              <div className={styles.col}>
                <h3>FAQ'S</h3>
                <ul>
                  <li>
                    <a href="https://docs.steakhouse.finance/extras/faqs/developer" target="_blank" rel="noopener noreferrer">Developer</a>
                  </li>
                  <li>
                    <a href="https://docs.steakhouse.finance/extras/faqs/investor" target="_blank" rel="noopener noreferrer">Investor</a>
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
                    <a href="https://docs.steakhouse.finance/user-basics/developer-documentation" target="_blank" rel="noopener noreferrer">Kitchen Docs</a>
                  </li>
                  <li>
                    <a href="https://docs.steakhouse.finance/api-reference" target="_blank" rel="noopener noreferrer">SDK / API</a>
                  </li>
                  <li>
                    <a href="https://docs.steakhouse.finance/extras/marketing-menu" target="_blank" rel="noopener noreferrer">Marketing Menu</a>
                  </li>
                  <li>
                    <a href="/coming-soon" target="_blank" rel="noopener noreferrer">Direct Launch</a>
                  </li>
                  <li>
                    <a href="https://docs.steakhouse.finance/user-basics/fees" target="_blank" rel="noopener noreferrer">Creation Fees</a>
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
                    <a href="https://docs.steakhouse.finance/getting-started/quickstart/login" target="_blank" rel="noopener noreferrer">Login / Setup</a>
                  </li>
                  <li>
                    <a href="https://docs.steakhouse.finance/user-basics/investor-handbook" target="_blank" rel="noopener noreferrer">Investor Handbook</a>
                  </li>
                  <li>
                    <a href="https://t.me/SteakDeploys" target="_blank" rel="noopener noreferrer">New Deploys</a>
                  </li>
                  <li>
                    <a href="https://t.me/SteakTrending" target="_blank" rel="noopener noreferrer">Trending Tokens</a>
                  </li>
                  <li>
                    <a href="/explore" target="_blank" rel="noopener noreferrer">Explorer</a>
                  </li>
                  <li>
                    <a href="https://docs.steakhouse.finance/user-basics/fees" target="_blank" rel="noopener noreferrer">Fee Structure</a>
                  </li>
                  <li>
                    <a href="https://docs.steakhouse.finance/extras/security" target="_blank" rel="noopener noreferrer">Security</a>
                  </li>
                </ul>
              </div>

              <div className={styles.col}>
                <h3>Company</h3>
                <ul>
                  <li>
                    <a href="https://docs.steakhouse.finance/getting-started/what-is-steakhouse" target="_blank" rel="noopener noreferrer">About SteakHouse</a>
                  </li>
                  <li>
                    <a href="/media-kit" target="_blank" rel="noopener noreferrer">Media Kit</a>
                  </li>
                  <li>
                    <a href="/docs/certificate.pdf" download target="_blank" rel="noopener noreferrer">Certificate of Incorporation</a>
                  </li>
                  <li>
                    <a href="/coming-soon" target="_blank" rel="noopener noreferrer">Careers</a>
                  </li>
                  <li>
                    <a href="/coming-soon" target="_blank" rel="noopener noreferrer">Brand & Press</a>
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
                    <a href="https://docs.steakhouse.finance/extras/legal/terms-of-service" target="_blank" rel="noopener noreferrer">Terms of Service</a>
                  </li>
                  <li>
                    <a href="https://docs.steakhouse.finance/extras/legal/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
                  </li>
                  <li>
                    <a href="https://docs.steakhouse.finance/extras/legal/cookie-policy" target="_blank" rel="noopener noreferrer">Cookie Policy</a>
                  </li>
                  <li>
                    <a href="https://docs.steakhouse.finance/extras/legal/risk-disclosure" target="_blank" rel="noopener noreferrer">Risk Disclosure</a>
                  </li>
                </ul>
              </div>
            </nav>
          </div>

          {/* Bottom: only disclaimer and copyright */}
          <div className={styles.footerBottom} aria-label="Legal">
            <p><a href="mailto:contact@steakhouse.finance" target="_blank" rel="noopener noreferrer">contact@steakhouse.finance</a></p>
            <div className={styles.certikBadge} aria-label="CertiK certificate">
              <img
                className={styles.certikBadgeimg}
                src="/images/certik-logo-v2.png"
                alt="CertiK logo"
              />
              <span className={styles.spacer}></span>
              <a
                className={`${styles.btn} ${styles.sm}`}
                href="#certik"
                target="_blank"
                rel="noopener noreferrer"
                title="View CertiK Certificate"
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
            <p className={styles.disclaimer}>
              Charts by <a href="https://www.tradingview.com/" target="_blank" rel="noopener noreferrer">TradingView</a>
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

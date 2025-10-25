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
                    <a href="https://docs.steakhouse.finance/getting-started/what-is-steakhouse">Launchpad Overview</a>
                  </li>
                  <li>
                    <a href="https://docs.steakhouse.finance/getting-started/what-is-steakhouse/problem-solution">Problem / Solution</a>
                  </li>
                  <li>
                    <a href="https://docs.steakhouse.finance/getting-started/what-is-steakhouse/ecosystem-overview">Ecosystem Overview</a>
                  </li>
                  <li>
                    <a href="https://docs.steakhouse.finance/getting-started/what-is-steakhouse/launchpad-benefits">Launchpad Benefits</a>
                  </li>
                  <li>
                    <a href="https://docs.steakhouse.finance/user-basics/technical-architecture">Technical Architecture</a>
                  </li>
                </ul>

                {/* CertiK certificate block under Solutions */}
              </div>

              <div className={styles.col}>
                <h3>FAQ'S</h3>
                <ul>
                  <li>
                    <a href="https://docs.steakhouse.finance/extras/faqs/developer">Developer</a>
                  </li>
                  <li>
                    <a href="https://docs.steakhouse.finance/extras/faqs/investor">Investor</a>
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
                    <a href="https://docs.steakhouse.finance/user-basics/developer-documentation">Kitchen Docs</a>
                  </li>
                  <li>
                    <a href="https://docs.steakhouse.finance/api-reference">SDK / API</a>
                  </li>
                  <li>
                    <a href="https://docs.steakhouse.finance/extras/marketing-menu">Marketing Menu</a>
                  </li>
                  <li>
                    <a href="/coming-soon">Direct Launch</a>
                  </li>
                  <li>
                    <a href="https://docs.steakhouse.finance/user-basics/fees">Creation Fees</a>
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
                    <a href="https://docs.steakhouse.finance/getting-started/quickstart/login">Login / Setup</a>
                  </li>
                  <li>
                    <a href="https://docs.steakhouse.finance/user-basics/investor-handbook">Investor Handbook</a>
                  </li>
                  <li>
                    <a href="https://t.me/SteakDeploys" target="_blank" rel="noopener noreferrer">New Deploys</a>
                  </li>
                  <li>
                    <a href="https://t.me/SteakTrending" target="_blank" rel="noopener noreferrer">Trending Tokens</a>
                  </li>
                  <li>
                    <a href="/explore">Explorer</a>
                  </li>
                  <li>
                    <a href="https://docs.steakhouse.finance/user-basics/fees">Fee Structure</a>
                  </li>
                  <li>
                    <a href="https://docs.steakhouse.finance/extras/security">Security</a>
                  </li>
                </ul>
              </div>

              <div className={styles.col}>
                <h3>Company</h3>
                <ul>
                  <li>
                    <a href="https://docs.steakhouse.finance/getting-started/what-is-steakhouse">About SteakHouse</a>
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
                    <a href="https://docs.steakhouse.finance/extras/legal/terms-of-service">Terms of Service</a>
                  </li>
                  <li>
                    <a href="https://docs.steakhouse.finance/extras/legal/privacy-policy">Privacy Policy</a>
                  </li>
                  <li>
                    <a href="https://docs.steakhouse.finance/extras/legal/cookie-policy">Cookie Policy</a>
                  </li>
                  <li>
                    <a href="https://docs.steakhouse.finance/extras/legal/risk-disclosure">Risk Disclosure</a>
                  </li>
                </ul>
              </div>
            </nav>
          </div>

          {/* Bottom: only disclaimer and copyright */}
          <div className={styles.footerBottom} aria-label="Legal">
            <p><a href="mailto:contact@steakhouse.finance">contact@steakhouse.finance</a></p>
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

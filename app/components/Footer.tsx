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
                <a href="#" aria-label="YouTube" title="YouTube">
                  <i className="ri-youtube-fill" aria-hidden="true"></i>
                </a>
                <a href="#" aria-label="Medium" title="Medium">
                  <i className="ri-medium-fill" aria-hidden="true"></i>
                </a>
                <a href="#" aria-label="GitHub" title="GitHub">
                  <i className="ri-github-fill" aria-hidden="true"></i>
                </a>
                <a href="#" aria-label="Twitter" title="Twitter">
                  <i className="ri-twitter-x-fill" aria-hidden="true"></i>
                </a>
                <a href="#" aria-label="Discord" title="Discord">
                  <i className="ri-discord-fill" aria-hidden="true"></i>
                </a>
                <a href="#" aria-label="Telegram" title="Telegram">
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
                  <li>
                    <a href="/coming-soon">Partner</a>
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
                    <a href="/coming-soon">Direct Launch </a>
                  </li>
                  <li>
                    <a href="/coming-soon">Creation Fees</a>
                  </li>
                  <li>
                    <a href="/coming-soon">Support</a>
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
                    <a href="/coming-soon">Careers</a>
                  </li>
                  <li>
                    <a href="/coming-soon">Brand & Press</a>
                  </li>
                  <li>
                    <a href="/coming-soon">Contact</a>
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

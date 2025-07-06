# LastPing Factory

> **Secure Digital Asset Inheritance on the Internet Computer**

LastPing Factory is a decentralized application (dApp) built on the Internet Computer Protocol (ICP) that provides automated digital asset inheritance and backup wallet functionality. The platform combines ICRC-1 compliant token management with a "dead man's switch" mechanism to ensure your digital assets are safely transferred to designated beneficiaries.

## 🌟 Features

### 🔐 **Digital Asset Inheritance**
- **Automated Backup System**: Set backup wallets that inherit your assets if you fail to "ping" within a specified timeframe
- **Customizable Timeout Periods**: Configure how long before your backup wallet can claim ownership
- **Secure Claiming Process**: Only designated backup wallets can claim expired accounts

### 💰 **ICRC-1 Token Integration**
- **LastPing Token (LPT)**: Native utility token with full ICRC-1 compliance
- **Reward System**: Earn 10 LPT for each ping, 1000 LPT for account initialization
- **Token Transfers**: Send and receive LPT tokens with low fees
- **Inheritance**: Tokens automatically transfer to backup wallets upon claiming

### 🎯 **User-Friendly Interface**
- **Internet Identity Integration**: Secure authentication without passwords
- **Real-time Status Monitoring**: Track ping timers and account health
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Transaction History**: View all ping and token activities

## 🏗️ Architecture

### Backend (Motoko)
- **Smart Contract**: Deployed on Internet Computer canisters
- **ICRC-1 Compliance**: Full token standard implementation
- **Persistent Storage**: Maintains user data across canister upgrades
- **Security**: Built-in access controls and validation

### Frontend (React)
- **Modern UI**: Built with React and Tailwind CSS
- **Internet Identity**: Seamless authentication integration
- **Real-time Updates**: Dynamic status monitoring
- **Error Handling**: Comprehensive error messages and loading states

### Login
<img width="476" alt="Screenshot 2025-07-05 at 7 26 13 AM" src="https://github.com/user-attachments/assets/e3ff1191-a36e-42fc-8be0-79c7e72bd225" />

### Internet Identity Auth Page
<img width="580" alt="Screenshot 2025-07-05 at 7 26 44 AM" src="https://github.com/user-attachments/assets/734dea4c-29ca-4c76-9f6b-0e86fa1c2cdc" />

### Initialize Account Page
<img width="939" alt="Screenshot 2025-07-05 at 7 27 08 AM" src="https://github.com/user-attachments/assets/fc15395d-9743-4974-8cc8-8a1d51161cb8" />

### Account Created 
<img width="909" alt="Screenshot 2025-07-05 at 7 27 23 AM" src="https://github.com/user-attachments/assets/2cc3853f-da68-421d-a270-025cdd605020" />

### Settings and Transfer Tokens 
 <img width="1075" alt="Screenshot 2025-07-05 at 7 27 32 AM" src="https://github.com/user-attachments/assets/68fb2392-aabf-4b4c-b5d9-0ea0254e4a73" />

### Full Page Image
![idksx-gqaaa-aaaad-aanua-cai icp1 io_](https://github.com/user-attachments/assets/7d45fc13-d073-490b-9b3e-7d50ca8e1ba3)


## 🚀 Getting Started

### Prerequisites
- [DFX SDK](https://sdk.dfinity.org/) (latest version)
- [Node.js](https://nodejs.org/) (16+ recommended)
- [Internet Identity](https://identity.ic0.app/) account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/lastping-factory.git
   cd lastping-factory
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start local replica**
   ```bash
   dfx start --background
   ```

4. **Deploy the canisters**
   ```bash
   dfx deploy
   ```

5. **Start the development server**
   ```bash
   npm start
   ```

6. **Open your browser**
   ```
   http://localhost:3000
   ```

## 💻 Usage

### 1. **Initialize Your Account**
- Connect with Internet Identity
- Click "Initialize Account" to create your LastPing profile
- Receive 1000 LPT welcome bonus

### 2. **Set Up Backup Wallet**
- Enter your backup wallet's principal ID
- This wallet will inherit your assets if you don't ping in time
- You can change this anytime

### 3. **Configure Timeout**
- Set how many days before your backup can claim ownership
- Recommended: 30-90 days depending on your activity level

### 4. **Regular Pinging**
- Click "Ping Now" to reset your timer
- Earn 10 LPT for each successful ping
- Monitor your account status to stay active

### 5. **Token Management**
- View your LPT balance
- Transfer tokens to other users
- All transfers include inheritance features

## 🔧 API Reference

### Core Functions

#### Account Management
```motoko
// Initialize new user account
public shared(msg) func initializeUser() : async Result.Result<Text, Text>

// Reset timer and earn rewards
public shared(msg) func ping() : async Result.Result<Text, Text>

// Set backup wallet for inheritance
public shared(msg) func setBackup(backupPrincipal : Principal) : async Result.Result<Text, Text>

// Configure timeout period
public shared(msg) func setTimeout(newTimeout : Nat) : async Result.Result<Text, Text>
```

#### Token Operations
```motoko
// Get account balance
public query func icrc1_balance_of(account : Account) : async Nat

// Transfer tokens
public shared(msg) func icrc1_transfer(args : TransferArgs) : async TransferResult

// Get token metadata
public query func icrc1_metadata() : async [(Text, MetadataValue)]
```

#### Inheritance System
```motoko
// Claim ownership of expired account
public shared(msg) func claim(originalOwner : Principal) : async Result.Result<Text, Text>

// Get user status and token balance
public shared(msg) func getMyStatus() : async Result.Result<UserStatus, Text>
```

## 📊 Token Economics

### LastPing Token (LPT)
- **Symbol**: LPT
- **Decimals**: 8
- **Transfer Fee**: 0.0001 LPT
- **Total Supply**: Dynamic (increases with rewards)

### Reward Structure
- **Account Initialization**: 1000 LPT
- **Successful Ping**: 10 LPT
- **Token Inheritance**: 100% of balance transfers to backup wallet

### Fee Structure
- **Transfer Fee**: 0.0001 LPT (burned to reduce supply)
- **Account Operations**: Free (ping, set backup, claim)

## 🛡️ Security Features

### Smart Contract Security
- **Access Controls**: Only account owners can modify their settings
- **Validation**: All inputs are validated before processing
- **Upgrade Safety**: Stable storage preserves data across updates

### Inheritance Security
- **Time Locks**: Backup wallets can only claim after timeout expires
- **Single Beneficiary**: Only one designated backup wallet per account
- **Audit Trail**: All claiming activities are recorded

## 🗺️ Roadmap

### Phase 1: Core Platform ✅
- [x] Basic LastPing functionality
- [x] ICRC-1 token integration
- [x] Web interface
- [x] Internet Identity authentication

### Phase 2: Enhanced Features 🔄
- [ ] Multiple backup wallets
- [ ] Mobile app
- [ ] Advanced analytics dashboard
- [ ] Email/SMS notifications

### Phase 3: Enterprise & DeFi 📋
- [ ] Corporate inheritance solutions
- [ ] Token staking rewards
- [ ] Cross-chain bridges
- [ ] Insurance partnerships

### Phase 4: Ecosystem Growth 🌱
- [ ] Governance token features
- [ ] Developer API
- [ ] Third-party integrations
- [ ] Educational platform

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Code Style
- Use Motoko best practices for backend
- Follow React/JavaScript standards for frontend
- Include comprehensive error handling
- Add comments for complex logic

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation
- [Internet Computer Developer Guide](https://internetcomputer.org/docs/)
- [ICRC-1 Token Standard](https://github.com/dfinity/ICRC-1)
- [Motoko Language Guide](https://internetcomputer.org/docs/current/motoko/main/motoko/)

### Community
- [Discord](https://discord.gg/lastping-factory)
- [Telegram](https://t.me/lastping_factory)
- [Forum](https://forum.dfinity.org/)

### Issues
If you encounter any problems, please [open an issue](https://github.com/yourusername/lastping-factory/issues) with:
- Detailed description
- Steps to reproduce
- Environment information
- Screenshots (if applicable)

## 🏆 Acknowledgments

- **DFINITY Foundation** for the Internet Computer Protocol
- **Internet Identity** for secure authentication
- **ICRC-1 Standard** for token interoperability
- **Open Source Community** for tools and inspiration

## 📞 Contact

- **Website**: [lastping.factory](https://lastping.factory)
- **Email**: [contact@lastping.factory](mailto:contact@lastping.factory)
- **Twitter**: [@LastPingFactory](https://twitter.com/LastPingFactory)

---

**⚠️ Disclaimer**: This is experimental software. Use at your own risk. Always test thoroughly before deploying to mainnet with real assets.

**🔒 Security**: If you discover a security vulnerability, please report it privately to [tob.adoba2000@gmail.com](mailto:security@lastping.factory).

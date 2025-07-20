import { WebIrys } from '@irys/sdk';
import { ethers } from 'ethers';

class IrysService {
  constructor() {
    this.irys = null;
    this.isInitialized = false;
    this.devnetUrl = 'https://devnet.irys.xyz';
    this.gatewayUrl = 'https://gateway.irys.xyz';
  }

  async connectWallet() {
    if (!window.ethereum) {
      throw new Error('MetaMask not detected. Please install MetaMask to continue.');
    }

    try {
      // Request account access
      await window.ethereum.enable();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      
      return provider;
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw new Error('Failed to connect wallet. Please try again.');
    }
  }

  async initializeIrys() {
    if (this.isInitialized && this.irys) {
      return this.irys;
    }

    try {
      const provider = await this.connectWallet();
      
      const wallet = { name: 'ethersv5', provider };
      const webIrys = new WebIrys({
        url: this.devnetUrl,
        token: 'ethereum',
        wallet
      });
      
      await webIrys.ready();
      
      this.irys = webIrys;
      this.isInitialized = true;
      
      console.log('✅ Irys initialized successfully');
      return webIrys;
    } catch (error) {
      console.error('Error initializing Irys:', error);
      throw new Error('Failed to initialize Irys. Please ensure your wallet is connected.');
    }
  }

  async getBalance() {
    if (!this.irys) {
      await this.initializeIrys();
    }

    try {
      const atomicBalance = await this.irys.getLoadedBalance();
      const balance = this.irys.utils.fromAtomic(atomicBalance);
      return balance.toString();
    } catch (error) {
      console.error('Error getting balance:', error);
      return '0';
    }
  }

  async getUploadPrice(data) {
    if (!this.irys) {
      await this.initializeIrys();
    }

    try {
      const size = new Blob([JSON.stringify(data)]).size;
      const atomicPrice = await this.irys.getPrice(size);
      const price = this.irys.utils.fromAtomic(atomicPrice);
      return {
        price: price.toString(),
        size: size
      };
    } catch (error) {
      console.error('Error getting upload price:', error);
      return { price: '0', size: 0 };
    }
  }

  async fundNode(amountInEth) {
    if (!this.irys) {
      await this.initializeIrys();
    }

    try {
      const atomicAmount = this.irys.utils.toAtomic(amountInEth);
      const response = await this.irys.fund(atomicAmount);
      console.log(`✅ Funded ${response.quantity} to Irys node`);
      return response;
    } catch (error) {
      console.error('Error funding node:', error);
      throw new Error('Failed to fund Irys node. Please try again.');
    }
  }

  async uploadArticle(articleData) {
    if (!this.irys) {
      await this.initializeIrys();
    }

    try {
      // Get wallet address
      const address = await this.irys.address;

      // Prepare article data with metadata
      const enrichedData = {
        ...articleData,
        author: address,
        publishedAt: Date.now(),
        version: 1,
        type: 'article'
      };

      // Create tags for Irys
      const tags = [
        { name: 'App-Name', value: 'Mirror-Clone' },
        { name: 'Content-Type', value: 'article' },
        { name: 'Title', value: articleData.title },
        { name: 'Author', value: address },
        { name: 'Category', value: articleData.category || 'General' },
        { name: 'Unix-Time', value: Math.floor(Date.now() / 1000).toString() },
        ...articleData.tags.map(tag => ({ name: 'Tag', value: tag }))
      ];

      console.log('🚀 Uploading article to Irys...', {
        title: articleData.title,
        tags: tags.length,
        size: new Blob([JSON.stringify(enrichedData)]).size
      });

      // Upload to Irys
      const receipt = await this.irys.upload(JSON.stringify(enrichedData), { tags });

      const result = {
        id: receipt.id,
        url: `${this.gatewayUrl}/${receipt.id}`,
        size: receipt.size,
        timestamp: receipt.timestamp,
        tags
      };

      console.log('✅ Article uploaded to Irys:', result);
      return result;

    } catch (error) {
      console.error('Error uploading article:', error);
      throw new Error('Failed to upload article to Irys. Please try again.');
    }
  }

  async uploadImage(imageFile) {
    if (!this.irys) {
      await this.initializeIrys();
    }

    try {
      const tags = [
        { name: 'Content-Type', value: imageFile.type },
        { name: 'App-Name', value: 'Mirror-Clone' },
        { name: 'File-Type', value: 'image' }
      ];

      console.log('🖼️ Uploading image to Irys...');
      const receipt = await this.irys.uploadFile(imageFile, { tags });

      const result = {
        id: receipt.id,
        url: `${this.gatewayUrl}/${receipt.id}`,
        type: imageFile.type,
        size: receipt.size
      };

      console.log('✅ Image uploaded to Irys:', result);
      return result;

    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload image to Irys. Please try again.');
    }
  }

  async getArticleContent(irysId) {
    try {
      const response = await fetch(`${this.gatewayUrl}/${irysId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching article content:', error);
      throw new Error('Failed to fetch article content.');
    }
  }

  getGatewayUrl(irysId) {
    return `${this.gatewayUrl}/${irysId}`;
  }

  async getWalletAddress() {
    if (!this.irys) {
      await this.initializeIrys();
    }
    return await this.irys.address;
  }

  isConnected() {
    return this.isInitialized && this.irys !== null;
  }
}

// Export singleton instance
export const irysService = new IrysService();
export default irysService;
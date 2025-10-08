declare module 'tronweb' {
  interface TronWebConfig {
    fullHost: string
    privateKey?: string
    headers?: Record<string, string>
    solidityNode?: string
    eventServer?: string
  }

  interface ContractOptions {
    abi?: any[]
    address?: string
    bytecode?: string
  }

  interface ContractMethod {
    call(): Promise<any>
    send(options?: any): Promise<string>
  }

  interface Contract {
    [methodName: string]: (...args: any[]) => ContractMethod
  }

  class TronWeb {
    constructor(config: TronWebConfig)
    
    static address: {
      fromPrivateKey(privateKey: string): string
      fromHex(hex: string): string
      toHex(address: string): string
    }
    
    contract(abi?: any[], address?: string): Contract
    contract(): {
      new(options: ContractOptions): Promise<Contract>
      at(address: string): Contract
    }
    
    isAddress(address: string): boolean
    isConnected(): boolean
    ready: boolean
  }

  export = TronWeb
}

// Global window.tronWeb interface
declare global {
  interface Window {
    tronWeb?: {
      ready: boolean
      defaultAddress: {
        base58: string
        hex: string
      }
      contract(abi?: any[], address?: string): any
      isConnected(): boolean
      isAddress(address: string): boolean
      address: {
        fromPrivateKey(privateKey: string): string
        fromHex(hex: string): string
        toHex(address: string): string
      }
    }
  }
}

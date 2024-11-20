import { FIAT_METHOD, MODE, NETWORK, FIAT_CURRENCY, PRODUCT, CRYPTO_CURRENCY, THEME } from 'types/kado';
import {
  FIAT_METHODS_LIST,
  MODES_LIST,
  NETWORKS_LIST,
  PAY_CURRENCIES_LIST,
  PRODUCTS_LIST,
  REV_CURRENCIES_LIST,
  THEMES_LIST,
} from '@constants/kado';

export function validateFiatCurrency(currency: FIAT_CURRENCY): boolean {
  return PAY_CURRENCIES_LIST.includes(currency);
}

export function validateFiatCurrencies(currencies: FIAT_CURRENCY[]): boolean {
  return currencies.every(validateFiatCurrency);
}

export function validateCryptoCurrency(currency: CRYPTO_CURRENCY): boolean {
  return REV_CURRENCIES_LIST.includes(currency);
}

export function validateCryptoCurrencies(currencies: CRYPTO_CURRENCY[]): boolean {
  return currencies.every(validateCryptoCurrency);
}

export function validateProduct(product: PRODUCT): boolean {
  return PRODUCTS_LIST.includes(product);
}

export function validateProducts(products: PRODUCT[]): boolean {
  return products.every(validateProduct);
}

export function validateNetwork(network: NETWORK): boolean {
  return NETWORKS_LIST.includes(network);
}

export function validateNetworks(networks: NETWORK[]): boolean {
  return networks.every(validateNetwork);
}

export function validateFiatMethod(method: FIAT_METHOD): boolean {
  return FIAT_METHODS_LIST.includes(method);
}

export function validateFiatMethods(methods: FIAT_METHOD[]): boolean {
  return methods.every(validateFiatMethod);
}

export function validateTheme(theme: THEME): boolean {
  return THEMES_LIST.includes(theme);
}

export function validateMode(mode: MODE): boolean {
  return MODES_LIST.includes(mode);
}

export function validateAmount(amount: number): boolean {
  return !Number.isNaN(amount) && amount > 0;
}

export function validateColor(color: string): boolean {
  // validate hex color or rgb color
  return /^#[0-9A-F]{6}$/i.test(color) || color.includes('rgb');
}

export function cleanColorString(color: string): string {
  let cleanColor = color.replace(/ /g, '');
  cleanColor = cleanColor.replace('#', '');
  cleanColor = cleanColor.replace('rgb(', '');
  cleanColor = cleanColor.replace(')', '');
  return cleanColor;
}

export function validateIxoAddress(address: string): boolean {
  return address.startsWith('ixo');
}

export function validateNobleAddress(address: string): boolean {
  return address.startsWith('noble');
}

export function validateAddress(address: string, network?: NETWORK): boolean {
  if (network) {
    if (!validateNetwork(network)) {
      return false;
    }
    if (network === NETWORK.IXO) {
      return validateIxoAddress(address);
    }
    if (network === NETWORK.NOBLE) {
      return validateNobleAddress(address);
    }
  }
  return validateIxoAddress(address) || validateNobleAddress(address);
}

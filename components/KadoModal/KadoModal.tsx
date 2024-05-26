import React, { useContext, useEffect, FC, useRef, useState, useMemo } from 'react';

import { FIAT_METHOD, MODE, NETWORK, FIAT_CURRENCY, PRODUCT, CRYPTO_CURRENCY, THEME } from 'types/kado';
import useWindowDimensions from '@hooks/useWindowDimensions';
import { WalletContext } from '@contexts/wallet';
import { getCSSVariable } from '@utils/styles';
import { ThemeContext } from '@contexts/theme';
import { KADO_API_KEY } from '@utils/secrets';
import styles from './KadoModal.module.scss';
import {
  validateFiatCurrency,
  validateCryptoCurrency,
  validateProduct,
  validateAmount,
  validateNetwork,
  validateFiatCurrencies,
  validateCryptoCurrencies,
  validateNetworks,
  validateProducts,
  validateTheme,
  validateMode,
  validateFiatMethods,
  validateColor,
  validateAddress,
  cleanColorString,
} from '@utils/kado';

interface ModalProps {
  visible: boolean;
  allowClose?: boolean;
  onClose: () => void;
  // KADO params
  apiKey?: string;
  onPayCurrency?: FIAT_CURRENCY;
  onRevCurrency?: CRYPTO_CURRENCY;
  offPayCurrency?: CRYPTO_CURRENCY;
  offRevCurrency?: FIAT_CURRENCY;
  product?: PRODUCT;
  onPayAmount?: number;
  onToAddress?: string;
  onToAddressMulti?: Array<{ [network: string]: string }>;
  offFromAddress?: string;
  network?: NETWORK;
  cryptoList?: Array<CRYPTO_CURRENCY>;
  fiatList?: Array<FIAT_CURRENCY>;
  networkList?: Array<NETWORK>;
  productList?: Array<PRODUCT>;
  theme?: THEME;
  mode?: MODE;
  fiatMethodList?: Array<FIAT_METHOD>;
  primaryColor?: string;
  secondaryColor?: string;
  successColor?: string;
  warningColor?: string;
  errorColor?: string;
}

const KadoModal: FC<ModalProps> = ({
  visible,
  allowClose = false,
  onClose,
  // KADO params
  onPayCurrency,
  onRevCurrency,
  offPayCurrency,
  offRevCurrency,
  product,
  onPayAmount,
  onToAddress,
  // onToAddressMulti,
  offFromAddress,
  network,
  cryptoList,
  fiatList,
  networkList,
  productList,
  theme,
  mode,
  fiatMethodList,
  primaryColor,
  secondaryColor,
  successColor,
  warningColor,
  errorColor,
}) => {
  const [loading, setLoading] = useState(false);

  const { wallet } = useContext(WalletContext);
  const { theme: appTheme } = useContext(ThemeContext);
  const windowSize = useWindowDimensions();

  const urlRef = useRef<string>('');

  const modalWidth = useMemo(() => {
    if (!windowSize?.width || (windowSize.width ?? 0) * 0.9 < 420 * 0.9) {
      return '100vw';
    }
    const modalWidth = Math.min((windowSize.width ?? 0) * 0.9, 420);
    if (typeof modalWidth === 'string' && (modalWidth as string).includes('px')) {
      return modalWidth;
    }
    return modalWidth + 'px';
  }, [windowSize.width]);
  const modalHeight = useMemo(() => {
    if (!windowSize?.height || (windowSize.height ?? 0) * 0.9 < 700 * 0.9) {
      return '100vh';
    }
    const modalHeight = Math.min((windowSize.height ?? 0) * 0.9, 700);
    if (typeof modalHeight === 'string' && (modalHeight as string).includes('px')) {
      return modalHeight;
    }
    return modalHeight + 'px';
  }, [windowSize.height]);
  const modalStyle = useMemo(() => {
    return {
      width: modalWidth,
      height: modalHeight,
      maxWidth: '420px',
      maxHeight: '700px',
      borderRadius: modalWidth === '100vw' && modalHeight === '100vh' ? 0 : getCSSVariable('--card-border-radius'),
    };
  }, [modalWidth, modalHeight]);

  useEffect(
    function () {
      if (visible && !urlRef.current) {
        urlRef.current = generateKadoUrl();
        setLoading(false);
      }

      return () => {
        urlRef.current = '';
      };
    },
    [visible],
  );

  function generateKadoUrl() {
    let url = 'https://app.kado.money/?apiKey=' + KADO_API_KEY;
    if (onPayCurrency && validateFiatCurrency(onPayCurrency)) {
      url += '&onPayCurrency=' + onPayCurrency;
    } else {
      url += '&onPayCurrency=USD';
    }
    if (onRevCurrency && validateCryptoCurrency(onRevCurrency)) {
      url += '&onRevCurrency=' + onRevCurrency;
    } else {
      url += '&onRevCurrency=IXO';
    }
    if (offPayCurrency && validateCryptoCurrency(offPayCurrency)) {
      url += '&offPayCurrency=' + offPayCurrency;
    } else {
      url += '&offPayCurrency=IXO';
    }
    if (offRevCurrency && validateFiatCurrency(offRevCurrency)) {
      url += '&offRevCurrency=' + offRevCurrency;
    } else {
      url += '&offRevCurrency=USD';
    }
    if (product && validateProduct(product)) {
      url += '&product=' + product;
    } else {
      url += '&product=BUY';
    }
    if (onPayAmount && validateAmount(onPayAmount)) {
      url += '&onPayAmount=' + onPayAmount;
    }
    if (onToAddress && validateAddress(onToAddress)) {
      url += '&onToAddress=' + onToAddress;
    } else if (wallet?.user?.address && validateAddress(wallet.user.address)) {
      url += '&onToAddress=' + wallet.user.address;
    }
    // if (onToAddressMulti) {
    //   url += '&onToAddressMulti=' + JSON.stringify(onToAddressMulti);
    // }
    if (offFromAddress && validateAddress(offFromAddress)) {
      url += '&offFromAddress=' + offFromAddress;
    } else if (wallet?.user?.address && validateAddress(wallet.user.address)) {
      url += '&offFromAddress=' + wallet.user.address;
    }
    if (network && validateNetwork(network)) {
      url += '&network=' + network;
    } else {
      url += '&network=IXO';
    }
    if (fiatList && validateFiatCurrencies(fiatList)) {
      url += '&fiatList=' + fiatList.join(',');
    } else {
      url += '&fiatList=USD';
    }
    if (cryptoList && validateCryptoCurrencies(cryptoList)) {
      url += '&cryptoList=' + cryptoList.join(',');
    } else {
      url += '&cryptoList=IXO,USDC';
    }
    if (networkList && validateNetworks(networkList)) {
      url += '&networkList=' + networkList.join(',');
    } else {
      url += '&networkList=IXO,NOBLE';
    }
    if (productList && validateProducts(productList)) {
      url += '&productList=' + productList.join(',');
    } else {
      url += '&productList=BUY';
    }
    if (theme && validateTheme(theme)) {
      url += '&theme=' + (appTheme || 'dark');
    } else {
      url += '&theme=dark';
    }
    if (mode && validateMode(mode)) {
      url += '&mode=' + mode;
    } else {
      url += '&mode=full';
    }
    if (fiatMethodList && validateFiatMethods(fiatMethodList)) {
      url += '&fiatMethodList=' + fiatMethodList.join(',');
    } else {
      url += '&fiatMethodList=card';
    }
    if (primaryColor && validateColor(primaryColor)) {
      url += '&primaryColor=' + cleanColorString(primaryColor);
    } else {
      url += '&primaryColor=' + cleanColorString(getCSSVariable('--primary-color') || '#1db3d3');
    }
    if (secondaryColor && validateColor(secondaryColor)) {
      url += '&secondaryColor=' + cleanColorString(secondaryColor);
    } else {
      url += '&secondaryColor=' + cleanColorString(getCSSVariable('--secondary-color') || '#1297b4');
    }
    if (successColor && validateColor(successColor)) {
      url += '&successColor=' + cleanColorString(successColor);
    } else {
      url += '&successColor=' + cleanColorString(getCSSVariable('--success-color') || '#22c55e');
    }
    if (warningColor && validateColor(warningColor)) {
      url += '&warningColor=' + cleanColorString(warningColor);
    } else {
      url += '&warningColor=' + cleanColorString(getCSSVariable('--warning-color') || '#fc9a63');
    }
    if (errorColor && validateColor(errorColor)) {
      url += '&errorColor=' + cleanColorString(errorColor);
    } else {
      url += '&errorColor=' + cleanColorString(getCSSVariable('--error-color') || '#a11c43');
    }
    return url;
  }

  if (!visible) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent} style={modalStyle}>
        {!!allowClose && (
          <button className={styles.closeButton} onClick={onClose}>
            &times;
          </button>
        )}
        {loading ? (
          'loading...'
        ) : (
          <iframe
            src={urlRef.current}
            style={{
              flex: 1,
              border: 'none',
              backgroundColor: getCSSVariable('--bg-color'),
              width: '100%',
              height: '100%',
              padding: 0,
              margin: 0,
            }}
            allow='clipboard-write; payment; accelerometer; gyroscope; camera; geolocation; autoplay; fullscreen;'
          />
        )}
      </div>
    </div>
  );
};

export default KadoModal;

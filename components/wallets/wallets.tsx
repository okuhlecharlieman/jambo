import { HTMLAttributes } from 'react';
import cls from 'classnames';

import styles from './wallets.module.scss';
import { getKeplr } from '@utils/keplr';
import { getOpera } from '@utils/opera';
import { WALLET_TYPE } from 'types/wallet';
import WalletImg from '@icons/wallet.svg';
import { WalletCard } from '@components/card/card';

type WalletsProps = {
	onSelected: (type: WALLET_TYPE) => void;
} & HTMLAttributes<HTMLDivElement>;

const Wallets = ({ onSelected, className, ...other }: WalletsProps) => {
	const keplrWallet = getKeplr();
	const operaWallet = getOpera();

	return (
		<div className={cls(styles.wallets, className)} {...other}>
			<div className={styles.flex2} />
			<WalletImg width={58} height={58} />
			<h3>Choose Wallet</h3>
			{/* {keysafe && <Button label="Keysafe" onClick={() => onSelected(WALLET_TYPE.keysafe)} />} */}
			{/* <WalletCard name="Wallet Connect" img="/images/wallets/opera.png" onClick={() => onSelected(WALLET_TYPE.walletConnect)} /> */}
			{keplrWallet && <WalletCard name="Keplr Wallet" img="/images/wallets/keplr.png" onClick={() => onSelected(WALLET_TYPE.keplr)} />}
			{operaWallet && <WalletCard name="Opera Wallet" img="/images/wallets/opera.png" onClick={() => onSelected(WALLET_TYPE.opera)} />}
			<div className={styles.flex3} />
		</div>
	);
};

export default Wallets;

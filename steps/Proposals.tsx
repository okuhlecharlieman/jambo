import React, { FC } from 'react';
import cls from 'classnames';

import Header from '@components/Header/Header';
import utilsStyles from '@styles/utils.module.scss';
<<<<<<< HEAD
// import styles from '@styles/stepsPages.module.scss';
import WalletCard from '@components/CardWallet/CardWallet';
// import Footer from '@components/Footer/Footer';
=======
import styles from '@styles/stepsPages.module.scss';
import WalletCard from '@components/CardWallet/CardWallet';
import Footer from '@components/Footer/Footer';
>>>>>>> main
import Loader from '@components/Loader/Loader';
import WalletImg from '@icons/wallet.svg';
import 'swiper/swiper.min.css';
import { StepConfigType, StepDataType, STEPS } from 'types/steps';
// import GovProposals from '@components/GovProposals/GovProposals';
import GovProposals2 from '@components/GovProposals/GovProposals2';
import { pushNewRoute } from '@utils/router';

<<<<<<< HEAD
=======



>>>>>>> main
type RequestProposalsProps = {
    onSuccess: (data: StepDataType<STEPS.gov_MsgVote>) => void;
    onBack?: () => void;
    data?: StepDataType<STEPS.gov_MsgVote>;
    config?: StepConfigType<STEPS.gov_MsgVote>;
    header?: string;
    loading?: boolean;
    signedIn?: boolean;
};

const Proposals: FC<RequestProposalsProps> = ({ loading = false, signedIn = true }) => {
    const navigateToAccount = () => pushNewRoute('/account');
    return (
        // <div style={{ position: 'relative', top: '90px' }} >
        //     <Header header={header} />
        //     <GovProposals2 />
        // </div >
<<<<<<< HEAD
=======

>>>>>>> main
        <>
            <Header />

            <main className={cls(utilsStyles.main, utilsStyles.columnJustifyCenter)}>
                {/* <div className={utilsStyles.spacer3} /> */}
                {loading ? (
                    <Loader />
                ) : !signedIn ? (
                    <WalletCard name='Connect your Wallet' Img={WalletImg} onClick={navigateToAccount} />
                ) : (
                    <GovProposals2 />
                )}
                {/* <div className={utilsStyles.spacer3} /> */}
            </main>

<<<<<<< HEAD
            {/* <Footer onBackUrl='/' backLabel='Home' selectedVoteOption={''} setSelectedVoteOption={null} /> */}
=======
            <Footer onBackUrl='/' backLabel='Home' selectedVoteOption={''} setSelectedVoteOption={null} />
>>>>>>> main
        </>

    )
}

export default Proposals
import { FC, useContext, useEffect, useState } from 'react';
import cls from 'classnames';

import utilsStyles from '@styles/utils.module.scss';
import styles from '@styles/stepsPages.module.scss';
import Button, { BUTTON_BG_COLOR, BUTTON_BORDER_COLOR, BUTTON_SIZE } from '@components/Button/Button';
import MultiSendBottomSheet from '../components/MultiSendBottomSheet/MultiSendBottomSheet';
import ButtonRound, { BUTTON_ROUND_SIZE } from '@components/ButtonRound/ButtonRound';
import ValidatorListItem from '@components/ValidatorListItem/ValidatorListItem';
import AmountAndDenom from '@components/AmountAndDenom/AmountAndDenom';
import MultiSendCard from '@components/MultiSendCard/MultiSendCard';
import IconText from '@components/IconText/IconText';
import Header from '@components/Header/Header';
import Footer from '@components/Footer/Footer';
import Loader from '@components/Loader/Loader';
import Input from '@components/Input/Input';
import Anchor from '@components/Anchor/Anchor';
import Success from '@icons/success.svg';
import { ReviewStepsTypes, STEP, StepConfigType, StepDataType, STEPS } from 'types/steps';
import { KEPLR_CHAIN_INFO_TYPE } from 'types/chain';
import { VALIDATOR } from 'types/validators';
import { TRX_MSG } from 'types/transactions';
import {
  defaultTrxFeeOption,
  generateBankMultiSendTrx,
  generateBankSendTrx,
  generateDelegateTrx,
  generateRedelegateTrx,
  generateSubmitClaimTrx,
  generateUndelegateTrx,
} from '@utils/transactions';
import { WalletContext } from '@contexts/wallet';
import { ChainContext } from '@contexts/chain';
import { CURRENCY_TOKEN } from 'types/wallet';
import ImageWithFallback from '@components/ImageFallback/ImageFallback';

type ReviewAndSignProps = {
  onSuccess: (data: StepDataType<STEPS.review_and_sign>) => void;
  onBack?: () => void;
  handleNextMultiSend?: (nextIndex: number) => void;
  deleteMultiSend?: (deleteIndex: number) => void;
  steps: STEP[];
  header?: string;
  message: ReviewStepsTypes;
};

const ReviewAndSign: FC<ReviewAndSignProps> = ({
  onSuccess,
  onBack,
  handleNextMultiSend,
  deleteMultiSend,
  steps,
  header,
  message,
}) => {
  const { wallet } = useContext(WalletContext);
  const [successHash, setSuccessHash] = useState<string | undefined>();
  const [loading, setLoading] = useState<boolean>(false);
  const [amount, setAmount] = useState<number | number[]>(0);
  const [token, setToken] = useState<CURRENCY_TOKEN | CURRENCY_TOKEN[] | undefined>();
  const [dstAddress, setDstAddress] = useState<string | string[]>(''); // destination address
  const [srcAddress, setSrcAddress] = useState<string>(''); // source address
  const [dstValidator, setDstValidator] = useState<VALIDATOR | undefined>(); // destination validator
  const [srcValidator, setSrcValidator] = useState<VALIDATOR | undefined>(); // source validator
  const [image, setImage] = useState<any>();
  const [claimConfig, setClaimConfig] = useState<any>();
  const { chainInfo } = useContext(ChainContext);
  const [trxCancelId, setTrxCancelId] = useState<number | undefined>();

  const showCancelTransactionModal = (index: number) => () => {
    setTrxCancelId(index);
  };

  const hideCancelTransactionModal = () => setTrxCancelId(undefined);

  const addingNewTransaction = (e: Event | any) => {
    e.preventDefault();
    if (handleNextMultiSend)
      handleNextMultiSend(
        steps.find(
          (step) => step.id === STEPS.select_token_and_amount || step.id === STEPS.get_receiver_address,
          // @ts-ignore
        )?.data?.data?.length,
      );
  };

  const handleDeleteMultiSend = () => {
    if (deleteMultiSend) deleteMultiSend(trxCancelId!);
    hideCancelTransactionModal();
  };

  const handleEditMultiSend = (index: number) => () => {
    if (handleNextMultiSend) {
      handleNextMultiSend(index);
    }
  };

  useEffect(() => {
    steps.forEach((s) => {
      if (s.id === STEPS.select_token_and_amount) {
        setAmount((s.data as StepDataType<STEPS.select_token_and_amount>)?.data.map((v) => v.amount) ?? []);
        setToken((s.data as StepDataType<STEPS.select_token_and_amount>)?.data.map((v) => v.token) ?? []);
      }
      if (
        s.id === STEPS.select_amount_delegate ||
        s.id === STEPS.select_amount_undelegate ||
        s.id === STEPS.select_amount_redelegate
      ) {
        setAmount((s.data as StepDataType<STEPS.select_amount_delegate>)?.amount ?? 0);
        setToken((s.data as StepDataType<STEPS.select_amount_delegate>)?.token);
      }
      if (s.id === STEPS.get_receiver_address || s.id === STEPS.get_qr_consent) {
        setDstAddress((s.data as StepDataType<STEPS.get_receiver_address>)?.address ?? '');
      }
      if (
        s.id === STEPS.get_validator_delegate ||
        s.id === STEPS.get_delegated_validator_undelegate ||
        s.id === STEPS.get_validator_redelegate
      ) {
        setDstAddress((s.data as StepDataType<STEPS.get_validator_delegate>)?.validator?.address ?? '');
        setDstValidator((s.data as StepDataType<STEPS.get_validator_delegate>)?.validator);
      }
      if (s.id === STEPS.get_delegated_validator_redelegate) {
        setSrcAddress((s.data as StepDataType<STEPS.get_validator_delegate>)?.validator?.address ?? '');
        setSrcValidator((s.data as StepDataType<STEPS.get_validator_delegate>)?.validator);
      }
      if (s.id === STEPS.get_camera_image) {
        setImage(s.data as StepDataType<STEPS.get_camera_image>);
      }
      if (s.id === STEPS.claims_MsgSubmitClaim) {
        setClaimConfig(s.config as StepConfigType<STEPS.claims_MsgSubmitClaim>);
      }
    });
  }, [steps]);

  const signTX = async (): Promise<void> => {
    setLoading(true);
    const trxMsgs: TRX_MSG[] = [];
    let memo: string | undefined;
    switch (message) {
      case STEPS.bank_MsgSend:
        trxMsgs.push(
          generateBankSendTrx({
            fromAddress: wallet.user!.address,
            toAddress: dstAddress[0] as string,
            denom: getDenomFromCurrencyToken(Array.isArray(token) ? token[0] : token),
            amount: getMicroAmount(amount.toString()),
          }),
        );
        break;
      case STEPS.bank_MsgMultiSend:
        trxMsgs.push(
          generateBankMultiSendTrx({
            fromAddress: wallet.user!.address,
            toAddresses: dstAddress as string[],
            denoms: (token as CURRENCY_TOKEN[]).map((token) => token.denom),
            amounts: (amount as number[]).map((a) => getMicroAmount(a.toString())),
          }),
        );
        break;
      case STEPS.staking_MsgDelegate:
        trxMsgs.push(
          generateDelegateTrx({
            delegatorAddress: wallet.user!.address,
            validatorAddress: dstAddress as string,
            denom: getDenomFromCurrencyToken(token as CURRENCY_TOKEN),
            amount: getMicroAmount(amount.toString()),
          }),
        );
        break;
      case STEPS.staking_MsgUndelegate:
        trxMsgs.push(
          generateUndelegateTrx({
            delegatorAddress: wallet.user!.address,
            validatorAddress: dstAddress as string,
            denom: getDenomFromCurrencyToken(token as CURRENCY_TOKEN),
            amount: getMicroAmount(amount.toString()),
          }),
        );
        break;
      case STEPS.staking_MsgRedelegate:
        trxMsgs.push(
          generateRedelegateTrx({
            delegatorAddress: wallet.user!.address,
            validatorSrcAddress: srcAddress,
            validatorDstAddress: dstAddress as string,
            denom: getDenomFromCurrencyToken(token as CURRENCY_TOKEN),
            amount: getMicroAmount(amount.toString()),
          }),
        );
        break;
      case STEPS.claims_MsgSubmitClaim:
        trx = generateSubmitClaimTrx({
          claimId: claimConfig.claimId!,
          collectionId: claimConfig.collectionId!,
          adminAddress: claimConfig.adminAddress!,
          agentDid: wallet.user?.did!,
          agentAddress: wallet.user?.address!,
        });
        break;
      default:
        throw new Error('Unsupported review type');
    }
    console.log('trx', trx);
    const hash = await broadCastMessages(
      wallet,
      trxMsgs,
      memo,
      defaultTrxFeeOption,
      (Array.isArray(token) ? token[0]?.denom : token?.denom) ?? '',
      chainInfo as KEPLR_CHAIN_INFO_TYPE,
    );
    if (hash) setSuccessHash(hash);
    setLoading(false);
  };

  if (successHash)
    return (
      <>
        <Header header={header} />

        <main className={cls(utilsStyles.main, utilsStyles.columnJustifyCenter, styles.stepContainer)}>
          <IconText title='Your transaction was successful!' Img={Success} imgSize={50}>
            {chainInfo?.txExplorer && (
              <Anchor active openInNewTab href={`${chainInfo.txExplorer.txUrl.replace(/\${txHash}/i, successHash)}`}>
                <Button
                  label={`View on ${chainInfo.txExplorer.name}`}
                  size={BUTTON_SIZE.mediumLarge}
                  rounded
                  bgColor={BUTTON_BG_COLOR.lightGrey}
                  borderColor={BUTTON_BORDER_COLOR.lightGrey}
                />
              </Anchor>
            )}
          </IconText>
        </main>

        <Footer showAccountButton={!!successHash} showActionsButton={!!successHash} />
      </>
    );

  return (
    <>
      <Header header={header} />

      <main className={cls(utilsStyles.main, utilsStyles.columnJustifyCenter, styles.stepContainer)}>
        {loading ? (
          <Loader />
        ) : message === STEPS.bank_MsgSend ? (
          <form className={styles.stepsForm} autoComplete='none'>
            <p className={utilsStyles.label}>I am sending</p>
            <AmountAndDenom
              amount={(Array.isArray(amount) ? amount[0] ?? '' : amount) ?? ''}
              denom={getDisplayDenomFromCurrencyToken(
                Array.isArray(token) ? (token[0] as CURRENCY_TOKEN) : (token as CURRENCY_TOKEN),
              )}
              microUnits={0}
            />
            <br />
            <p className={utilsStyles.label}>to the address:</p>
            <Input name='address' required value={dstAddress} className={styles.stepInput} align='center' disabled />
          </form>
        ) : message === STEPS.claims_MsgSubmitClaim ? (
          <form className={styles.stepsForm} autoComplete='none'>
            {!!image && (
              <>
                <ImageWithFallback
                  fallbackSrc='/images/picture.png'
                  src={image.image}
                  width={image.width * 0.75}
                  height={image.height * 0.75}
                  alt='image'
                  className={styles.image}
                />
                <br />
              </>
            )}
            <br />
            <p className={utilsStyles.paragraph}>Does the customer like their new pic?</p>
            <p className={utilsStyles.paragraph}>
              <em>
                Approve to submit or
                <br />
                Cancel to take a new photo
              </em>
            </p>
          </form>
        ) : message === STEPS.staking_MsgDelegate ? (
          <form className={styles.stepsForm} autoComplete='none'>
            {message === STEPS.staking_MsgDelegate && <p>Delegating</p>}
            <AmountAndDenom
              amount={amount as number}
              denom={getDisplayDenomFromCurrencyToken(token as CURRENCY_TOKEN)}
              microUnits={0}
            />
            <br />
            {message === STEPS.staking_MsgDelegate && <p>to the validator</p>}

            <ValidatorListItem validator={dstValidator!} onClick={() => () => {}} />
          </form>
        ) : message === STEPS.staking_MsgUndelegate ? (
          <form className={styles.stepsForm} autoComplete='none'>
            {message === STEPS.staking_MsgUndelegate && <p>Undelegate</p>}
            <AmountAndDenom
              amount={(Array.isArray(amount) ? amount[0] : amount) ?? ''}
              denom={getDisplayDenomFromCurrencyToken(token as CURRENCY_TOKEN)}
              microUnits={0}
            />
            <br />
            {message === STEPS.staking_MsgUndelegate && <p>from the validator</p>}

            <ValidatorListItem validator={dstValidator!} onClick={() => () => {}} />
          </form>
        ) : message === STEPS.staking_MsgRedelegate ? (
          <form className={styles.stepsForm} autoComplete='none'>
            <p>Redelegate</p>
            <AmountAndDenom
              amount={(Array.isArray(amount) ? amount[0] : amount) ?? ''}
              denom={getDisplayDenomFromCurrencyToken(token as CURRENCY_TOKEN)}
              microUnits={0}
            />
            <br />
            <p>from</p>
            <ValidatorListItem validator={srcValidator!} onClick={() => () => {}} />
            <p>to</p>
            <ValidatorListItem validator={dstValidator!} onClick={() => () => {}} />
          </form>
        ) : (
          <p>Unsupported review type</p>
        )}
      </main>

      <Footer
        onBack={loading || successHash ? null : onBack}
        onBackUrl={onBack ? undefined : ''}
        onCorrect={loading || !!successHash ? null : signTX}
        correctLabel={loading ? 'Signing' : !successHash ? 'Sign' : undefined}
      />
    </>
  );
};

export default ReviewAndSign;

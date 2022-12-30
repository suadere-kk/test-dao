import { useAddress, ConnectWallet, useNetwork, useContract, useNFTBalance, Web3Button } from "@thirdweb-dev/react";
import { useState, useEffect, useMemo } from "react";
import { AddressZero } from "@ethersproject/constants";
import { ChainId } from "@thirdweb-dev/sdk";

const App = () => {

  const address = useAddress();

  const editionDropAddress = "0xbed337AaA5dE6DcAA96734Bfe8BC621C40B0ab4b"
  const { contract: editionDrop } = useContract(editionDropAddress, "edition-drop");
  const { contract: token } = useContract("0x36108Ac36A6865c597F15235F7c38bD23cC0B733", "token");
  const { contract: vote } = useContract("0x167AcC6f761E04a46548EF8fA677c5C744dB369E", "vote");
  const { data: nftBalance } = useNFTBalance(editionDrop, address, "0")
  const hasClaimedNFT = useMemo(() => {
    return nftBalance && nftBalance.gt(0)
  }, [nftBalance])
  const [memberTokenAmounts, setMemberTokenAmounts] = useState([]);
  const [memberAddresses, setMemberAddresses] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const network = useNetwork();

  // アドレスの短縮表示用
  const shorterAddress = (str) => {
    return str.substring(0,6) + "..." + str.substring(str.length - 4); 
  };

  //　提案一覧の洗い出し
  useEffect(() => {
    if(!hasClaimedNFT) {
      return;
    }
    const getAllProposals = async () => {
      try {
        const proposals = await vote.getAll();
        setProposals(proposals);
        console.log("Proposals", proposals);
      } catch (error) {
        console.error("Failed to get proposals", error);
      } 
    }
    getAllProposals();
  }, [hasClaimedNFT, vote]);

  // 既に投票したかどうか？
  useEffect(() => {
    if(!hasClaimedNFT) {
      return;
    }

    if(!proposals.length){
      return;
    }

    const checkIfUserHasVoted = async () => {
      try {
        const hasVoted = await vote.hasVoted(proposals[0].proposalId, address);
        setHasVoted(hasVoted);
        if(hasVoted) {
          console.log("User has already voted");
        } else {
          console.log("User has not vote");
        }
      } catch (error) {
        console.error("Failed to check if user voted", error);
      } 
    }
    checkIfUserHasVoted();
  }, [hasClaimedNFT, proposals, address, vote]);

  // メンバーシップNFTの所有者の洗い出し
  useEffect(() => {
    if(!hasClaimedNFT) {
      return;
    }
    const getAllAdresses = async () => {
      try {
        const memberAddresses = await editionDrop?.history.getAllClaimerAddresses(0);
        setMemberAddresses(memberAddresses);
        console.log("Member Address", memberAddresses);
      } catch (error) {
        console.error("Failed to get member list", error);
      } 
    }
    getAllAdresses();
  }, [hasClaimedNFT, editionDrop?.history]);

  // メンバーシップ所有者の所有トークン数
  useEffect(() => {
    if(!hasClaimedNFT){
      return;
    }
    const getAllBalances = async () => {
      try {
        const amounts = await token?.history.getAllHolderBalances();
        setMemberTokenAmounts(amounts);
        console.log("Amounts", amounts);
      } catch (error) {
        console.error("Failed to get member balances", error);
      }
    }
    getAllBalances();
  }, [hasClaimedNFT, token?.history]);

  const memberList = useMemo(() => {
    return memberAddresses.map((address) => {
      const member = memberTokenAmounts?.find(({ holder }) => holder === address);
      return {
        address,
        tokenAmount: member?.balance.displayValue || "0",
      };
    });
  }, [memberAddresses, memberTokenAmounts]);

  //goeri以外のネットワークなら切り替えるように通知する
  if(address && (network?.[0].data.chain.id !== ChainId.Goerli)) {
    return (
      <div className="unsupported-network">
        <h2>Please connetc to Goerli</h2>
        <p>ネットワークを切り替えてください</p>
      </div>
    );
  }

  if(!address){
    return (
      <div className="landing">
        <h1>Welcome to HealthDAO</h1>
        <div className="btn-hero">
          <ConnectWallet />
        </div>
      </div>
    );
  }

  if(hasClaimedNFT){
    return (
      <div className="member-page">
        <h1>HealthDAO Member Page</h1>
        <p>Thank you join us!</p>
        <div>
          <div>
            <h2>Member List</h2>
            <table className="card">
              <thead>
                <tr>
                  <th>Address</th>
                  <th>Token Amount</th>
                </tr>
              </thead>
              <tbody>
                {memberList.map((member) => {
                  return (
                    <tr key={member.address}>
                      <td>{shorterAddress(member.address)}</td>
                      <td>{member.tokenAmount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div>
            <h2>Active Proposals</h2>
            <form onSubmit={
              async (e) => {
                e.preventDefault();
                e.stopPropagation();
                // 二重登録を防ぐため
                setIsVoting(true);
                const votes = proposals.map((proposal) => {
                  const voteResult = {
                    proposalId: proposal.proposalId,
                    // デフォルト値で棄権ステータス
                    vote: 2,
                  };
                  proposal.votes.forEach((vote) => {
                    const elem = document.getElementById(proposal.proposalId + "-" + vote.type,);
                    if (elem.checked) {
                      voteResult.vote  = vote.type;
                      return;
                    }
                  });
                  return voteResult;
                });
                try {
                  // トークンの委譲が必要が確認
                  const delegation = await token.getDelegationOf(address);
                  if (delegation == AddressZero){
                    //トークンを委譲してもらう
                    await token.delegateTo(address);
                  }
                  // 提案へ投票する
                  try {
                    await Promise.all(
                      votes.map(async ({proposalId, vote: _vote}) => {
                        //提案が投票可能か確認する
                        const proposal = await vote.get(proposalId);
                        if(proposal.state === 1){
                          //投票する
                          return vote.vote(proposalId, _vote);
                        }
                        //何もしない
                        console.log("Can't vote");
                        return;
                      }),
                    );
                    // 提案を実行する(24時間後に投票できる)
                    try {
                      await Promise.all(
                        votes.map(async ({ proposalId }) => {
                          //提案が投票可能か確認する
                          const proposal = await vote.get(proposalId);
                          if(proposal.state === 4){
                            //実行する
                            return vote.execute(proposalId);
                          }
                          //何もしない
                          console.log("Can't execute");
                        }),
                      );
                      setHasVoted(true);
                      console.log("success voted");
                    } catch(error){
                      console.error("Failed to execute proposal", error);
                    }
                  } catch(error){
                    console.error("Failed to vote", error);
                  }
                } catch (error) {
                  console.error("Failed to check passion vote", error);
                } finally {
                  //ボタンを有効化する
                  setIsVoting(false);
                }
              }
            }
            >
              {proposals.map((proposal) => (
                <div key={proposal.proposalId} className="card">
                  <h5>{proposal.description}</h5>
                  <div>
                    {proposal.votes.map(({ type, label }) => (
                      <div key={type}>
                        <input 
                          type="radio"
                          id={proposal.proposalId + "-" + type}
                          name={proposal.proposalId}
                          value={type}
                          defaultChecked={type === 2}
                        />
                        <label
                          htmlFor={proposal.proposalId + "-" + type}
                          >
                            {label}
                          </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <button
                disabled={isVoting || hasVoted}
                type="submit"
              >
                {
                  isVoting 
                  ? "Voting..."
                  : hasVoted
                  ? "Already Voted"
                  : "Submit Votes"
                }
              </button>
              {
                !hasVoted && (
                  <small>
                    これはトランザクションに署名する必要がある
                  </small>
                )
              }
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mint-nft">
      <h1>Mint free HealthDAO NFT</h1>
      <div className="btn-hero">
        <Web3Button
        contractAddress={editionDropAddress}
        action={
          contract => {
            contract.erc1155.claim(0,1)
          }
        }
        onSuccess={
          () => {
            console.log(`Success NFT OpenSea: https://testnets.opensea.io/assets/${editionDrop.getAddress()}/0`);
          }
        }
        onError={
          error => {
            console.error("Failed to mint NFT", error);
          }
        }>
          Mint your Free NFT
        </Web3Button>
      </div>
    </div>
  );
};

export default App;

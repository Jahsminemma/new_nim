import { LoginStatus } from "../redux/slice/authSlice";
import {
  useGetFollowingsQuery,
  useGetHostedGiveawaysQuery,
  useGetParticipatedGiveawaysQuery,
} from "../redux/slice/userApiSlice";

const useQuery = (args?: any[], page?: number, size?: number) => {
  const loginStatus  = LoginStatus.ACTIVE 

  const { data: followings, refetch: followingsRefetch } =
    useGetFollowingsQuery(
      {},
      {
        skip:
          !args?.includes("FOLLOWINGS") && loginStatus === LoginStatus.INACTIVE,
      }
    );

  const {
    data: hostedGiveaways,
    refetch: hostedGiveawayRefetch,
    isFetching: hostedIsFetching,
  } = useGetHostedGiveawaysQuery(
    { page: page ? page : 0, size: size ? size : 10 },
    {
      skip: loginStatus === LoginStatus.INACTIVE,
    }
  );

  const {
    data: participatedGiveaways,
    refetch: participatedGiveawayRefetch,
    isFetching: participatedIsFetching,
    error: parterror,
    isSuccess
  } = useGetParticipatedGiveawaysQuery(
    { page: 0, size: size ? size : 10 },
    {
      skip: loginStatus === LoginStatus.INACTIVE,
    }
  );

  const isAFollower = (userId: string) => {
    return followings?.data && followings?.data.some(
      (following: any) => following?.userId === userId
    );
  };
  
  const isAParticipant = (giveawayId: string) => {
    if (giveawayId && participatedGiveaways?.data?.data) {        
        return participatedGiveaways?.data?.data && participatedGiveaways?.data?.data.some((giveaway: any) => `${giveaway?.giveawayId}` === `${giveawayId}`);        
    }
};


  return {
    followings,
    hostedGiveaways,
    hostedGiveawayRefetch,
    participatedGiveaways,
    followingsRefetch,
    isAFollower,
    isAParticipant,
    participatedGiveawayRefetch,
    participatedIsFetching,
    hostedIsFetching,
  };
};

export default useQuery;

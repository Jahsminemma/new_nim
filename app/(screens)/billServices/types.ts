
export type SocialType = "twitter" | "discord" | "instagram" | "youtube" | "facebook" | "telegram"
export type TaskType = "follow" | "like" | "join_server" | "quote_tweet" | "retweet" | "comment" | "subscribe" | "join"
export type ActionStatus = "not_started" | "in_progress" | "completed"

export type Task = {
    taskId: number,
    type: TaskType;
    socialType: SocialType,
    description: string;
    socialContentId: string;
    socialIntentLink: string
}

export type SocialActionStatus = {
    id: string
    actionType: TaskType
    socialType: SocialType
    actionStatus: ActionStatus
}

export interface IGiveawayRouteProps {
  searchQuery: string;
  refreshing: boolean;
  activeTabName: string;
  setRefreshing: (value: boolean) => void;
}

export interface IHandleSearchProps {
  query: string;
  storedGiveaways: IGiveAwayData;
  giveawayRecords: IGiveAwayData;
  setGiveawayRecord: (val: IGiveAwayData) => void;
}

export interface IGiveawayCardData {
    giveawayId: string;
    title: string;
    description: string;
    startTime: Date;
    endTime: Date;
    status: string;
    participants: any[];
    hostUser: any;
    priceValue: string;
    priceType: string;
    numberOfWinners: number;
    participantRestrictionType: string;
    price: string;
  }
  
  export interface IGiveAwayData {
    data: IGiveawayCardData[];
    isLoading: boolean;
    page: number;
    end: boolean;
  }

  export type OrderRequest = {
    category: string;
    provider: string;
    amount: number;
    fee: number;
    narration?: string;
    pin: string;
    saveBeneficiary: boolean;
    phoneNumber: string;
    data?: {
      serviceID: string;
      variationCode: string;
      billersCode: string;
      amount: number;
      phone: string;
    },
    airtime?: {
      serviceID: string;
      amount: number;
      phone: string;
    },
    cable?:{
      serviceID: string;
      variationCode: string;
      billersCode: string;
      amount: number;
      phone?: string;
      subscriptionType?: "change" | "renew"
    }
    electricity?: {
      serviceID: string;
      variationCode: string;
      billersCode: string;
      amount: number;
      phone: string;
    }
    giftCard?: {
      unitPrice: number;
      productId: number;
      recipientEmail: string;
    }
  }
  
  export interface UpdateGameStreakRequest {
    streak: number;
    level: number;
    points: number;
    lastPlayed: Date;
    dailyRewardClaimed: boolean;
    dailyGamePoints: number;
    lastStreakUpdate: Date;
  }

  export interface IOrderDetailItem {
    label: string;
    value: string;
  }
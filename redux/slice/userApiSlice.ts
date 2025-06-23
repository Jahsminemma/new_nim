import { Platform } from "react-native";
import { apiSlice } from "./apiSlice";

const USER_URL = "user";

const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllUsers: builder.query({
      query: (userRequest: { page: number; size: number; search?: string }) => {        
        let url = `${USER_URL}/all?page=${userRequest.page}&size=${userRequest.size}`;
        if (userRequest.search) {
          url += `&search=${userRequest.search}`;
        }
        console.log(url);
        
        return {
          url,
          method: "GET",
        };
      },
    }),
    getProfile: builder.query({
      query: () => ({
        url: `${USER_URL}/currentuser`,
        method: "GET",
      }),
      providesTags: ["Users"],
    }),
    getProfileById: builder.query({
      query: (userId) => ({
        url: `${USER_URL}/profile?userId=${userId}`,
        method: "GET",
      }),
      providesTags: ["Users"],
    }),
    updateUseInfo: builder.mutation({
      query: (queryData) => ({
        url: `${USER_URL}/update`,
        method: "PUT",
        body: queryData,
      }),
      invalidatesTags: ["Users"],
    }),
    updatePin: builder.mutation({
      query: (queryData) => ({
        url: `${USER_URL}/update-pin`,
        method: "PUT",
        body: queryData,
      }),
      invalidatesTags: ["Users"],
    }),
    followUser: builder.mutation({
      query: (userId) => ({
        url: `${USER_URL}/follow?followingId=${userId}`,
        method: "POST",
      }),
      invalidatesTags: ["Users", "Followings"],
    }),
    unFollowUser: builder.mutation({
      query: (userId) => ({
        url: `${USER_URL}/unfollow?followingId=${userId}`,
        method: "POST",
      }),
      invalidatesTags: ["Users", "Followings"],
    }),
    getFollowers: builder.query({
      query: () => ({
        url: `${USER_URL}/followers`,
        method: "GET",
      }),
      providesTags: ["Followers"],
    }),

    getStreak: builder.query({
      query: () => ({
        url: `${USER_URL}/streak`,
        method: "GET",
      }),
      providesTags: ["Streaks"],
    }),

    updateStreak: builder.mutation({
      query: (queryData) => ({
        url: `${USER_URL}/streak`,
        method: "POST",
        body: queryData,
      }),
      invalidatesTags: ["Streaks"],
    }),
    getFollowings: builder.query({
      query: () => ({
        url: `${USER_URL}/following`,
        method: "GET",
      }),
      providesTags: ["Followings"],
    }),
    getHostedGiveaways: builder.query({
      query: (getGiveawayRequest) => ({
        url: `${USER_URL}/giveaways/hosted?page=${getGiveawayRequest.page}&size=${getGiveawayRequest.size}`,
        method: "GET",
      }),
      providesTags: ["Hosted"],
    }),
    getParticipatedGiveaways: builder.query({
      query: (getGiveawayRequest) => ({
        url: `${USER_URL}/giveaways/participated?page=${getGiveawayRequest.page}&size=${getGiveawayRequest.size}`,
        method: "GET",
      }),
      providesTags: ["Participated"],
    }),
    uploadProfilePicture: builder.mutation<any, any>({
      query: (imageFile) => {
        let filename = imageFile.split("/").pop();
        let match = /\.(\w+)$/.exec(filename);
        let type = match ? `image/${match[1]}` : `image`;
        const imageUri =
          Platform.OS === "android"
            ? imageFile
            : imageFile && imageFile?.replace("file://", "");
        let formData = new FormData();
        const imageData = { uri: imageUri, name: filename, type };
        //@ts-ignore
        formData.append("file", imageData);
        return {
          url: `${USER_URL}/upload/profileImage`,
          method: "POST",
          headers: {
            "Content-Type": `multipart/form-data`,
          },
          body: formData,
          formData: true,
        };
      },
      invalidatesTags: ["Users"],
    }),
    enablePushNotification: builder.mutation({
      query: (enablePush) => ({
        url: `${USER_URL}/notification/enablePush?enablePush=${enablePush}`,
        method: "POST",
      }),
      invalidatesTags: ["Users"],
    }),
    inAppNotification: builder.mutation({
      query: (notificationRequest) => ({
        url: `${USER_URL}/notification?page=${notificationRequest.page}&size=${notificationRequest.size}`,
        method: "POST",
        body: {},
      }),
    }),
    updateReadNotifications: builder.mutation({
      query: (notificationId) => ({
        url: `${USER_URL}/notification/update?notificationId=${notificationId}`,
        method: "POST",
        body: {},
      }),
      invalidatesTags: ["Notification"],
    }),
    notificationStats: builder.mutation({
      query: () => ({
        url: `${USER_URL}/notification/stats`,
        method: "POST",
      }),
    }),
    addPushNotificationToken: builder.mutation({
      query: (token) => ({
        url: `${USER_URL}/notification/token`,
        method: "POST",
        body: { token },
      }),
    }),
    deleteAccount: builder.mutation({
      query: () => ({
        url: `${USER_URL}/delete-account`,
        method: "POST",
      }),
    }),
  }),
});

export const {
  useGetAllUsersQuery,
  useFollowUserMutation,
  useGetProfileQuery,
  useUnFollowUserMutation,
  useGetFollowersQuery,
  useGetFollowingsQuery,
  useGetHostedGiveawaysQuery,
  useGetParticipatedGiveawaysQuery,
  useGetProfileByIdQuery,
  useUploadProfilePictureMutation,
  useAddPushNotificationTokenMutation,
  useEnablePushNotificationMutation,
  useNotificationStatsMutation,
  useUpdateReadNotificationsMutation,
  useInAppNotificationMutation,
  useUpdateUseInfoMutation,
  useUpdatePinMutation,
  useGetStreakQuery,
  useUpdateStreakMutation,
  useDeleteAccountMutation,
} = userApiSlice;

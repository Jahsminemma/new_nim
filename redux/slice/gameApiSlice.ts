import { apiSlice } from "./apiSlice";

const GAME_URL = "game";
const gameApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    addTriviaQuizGame: builder.mutation({
      query: (gameRequest) => ({
        url: `${GAME_URL}/triviaQuiz?giveawayId=${gameRequest?.giveawayId}`,
        method: "POST",
        body: gameRequest?.addTriviaQuizGameRequest,
        variables: { gameRequest },
      }),
      invalidatesTags: [
        "Followers",
        "Followings",
        "Users",
        "Giveaways",
        "Hosted",
        "Participated",
      ],
    }),
    addWordGuessGame: builder.mutation({
      query: (gameRequest) => ({
        url: `${GAME_URL}/wordguess?giveawayId=${gameRequest?.giveawayId}`,
        method: "POST",
        body: gameRequest?.addWordGuessRequest,
        variables: { gameRequest },
      }),
      invalidatesTags: [
        "Followers",
        "Followings",
        "Users",
        "Giveaways",
        "Hosted",
        "Participated",
      ],
    }),
    addWordNumberPuzzleGame: builder.mutation({
      query: (gameRequest) => ({
        url: `${GAME_URL}/number-puzzle?giveawayId=${gameRequest?.giveawayId}`,
        method: "POST",
        variables: { gameRequest },
      }),
      invalidatesTags: [
        "Followers",
        "Followings",
        "Users",
        "Giveaways",
        "Hosted",
        "Participated",
      ],
    }),
    addSocialGame: builder.mutation({
      query: (gameRequest) => ({
        url: `${GAME_URL}/socialTask?giveawayId=${gameRequest?.giveawayId}`,
        method: "POST",
        body: gameRequest?.socialTasks,
        variables: { gameRequest },
      }),
      invalidatesTags: [
        "Followers",
        "Followings",
        "Users",
        "Giveaways",
        "Hosted",
        "Participated",
      ],
    }),
    submitAnswer: builder.mutation({
      query: (gameAnswerRequest) => {
        return {
          url: `${GAME_URL}/triviaQuiz/answer?giveawayId=${gameAnswerRequest.giveawayId}`,
          method: "POST",
          body: gameAnswerRequest.answerRequest,
        };
      },
      invalidatesTags: [
        "Followers",
        "Followings",
        "Users",
        "Giveaways",
        "Hosted",
        "Participated",
      ],
    }),
    submitTaskGamePoint: builder.mutation({
      query: (gameAnswerRequest) => {
        return {
          url: `${GAME_URL}/task/points?giveawayId=${gameAnswerRequest.giveawayId}`,
          method: "POST",
          body: gameAnswerRequest.answerRequest,
        };
      },
      invalidatesTags: [
        "Followers",
        "Followings",
        "Users",
        "Giveaways",
        "Hosted",
        "Participated",
      ],
    }),
    updateTaskActionStatus: builder.mutation({
      query: (request) => {
        return {
          url: `${GAME_URL}/socialTask/update-status?giveawayId=${request.giveawayId}`,
          method: "POST",
          body: request.updateActionStatusRequest,
        };
      },
      invalidatesTags: ["Giveaways"],
    }),
    determineWinner: builder.mutation({
      query: (giveawayId) => {
        return {
          url: `${GAME_URL}/winners?giveawayId=${giveawayId}`,
          method: "POST",
        };
      },
      invalidatesTags: [
        "Followers",
        "Followings",
        "Users",
        "Giveaways",
        "Hosted",
        "Participated",
      ],
    }),
    getQuestionCategory: builder.mutation({
      query: () => {
        return {
          url: `${GAME_URL}/question-bank/category`,
          method: "POST",
        };
      },
    }),
    generateQuestion: builder.mutation({
      query: (request) => {
        return {
          url: `${GAME_URL}/question-bank/get`,
          method: "POST",
          body: request,
        };
      },
    }),
  }),
});

export const {
  useGenerateQuestionMutation,
  useGetQuestionCategoryMutation,
  useAddTriviaQuizGameMutation,
  useSubmitAnswerMutation,
  useAddWordGuessGameMutation,
  useSubmitTaskGamePointMutation,
  useDetermineWinnerMutation,
  useUpdateTaskActionStatusMutation,
  useAddSocialGameMutation,
  useAddWordNumberPuzzleGameMutation
} = gameApiSlice;

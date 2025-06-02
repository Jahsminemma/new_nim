import { createSlice } from "@reduxjs/toolkit"

const notificationSlice = createSlice({
    name: 'notification',
    initialState: {
        notificationStats:
        {
            read: 0,
            total: 0,
            unread: 0
        },
        newGiveaways: [],
        notificationLoadingState: true
    },
    reducers: {
        setNotificationStats: (state, action) => {
            state.notificationStats = action.payload
        },
        setLoadingState: (state, action) => {
            state.notificationLoadingState = action.payload
        },
        setNotifiedNewGiveaways: (state, action) => {
            state.newGiveaways = action.payload
        },
    },
})

export const {  setNotificationStats, setNotifiedNewGiveaways, setLoadingState } = notificationSlice.actions
export default notificationSlice.reducer
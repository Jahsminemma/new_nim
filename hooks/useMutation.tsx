import  { useState } from 'react'
import Toast from 'react-native-toast-message'
import { useFollowUserMutation } from '../redux/slice/userApiSlice'
import { useJoinGiveawayMutation } from '../redux/slice/giveawayApiSlice'
import { router } from 'expo-router'

const useMutation = () => {
    const [followUser] = useFollowUserMutation()
    const [joinGiveaway] = useJoinGiveawayMutation()

    const [isFollowing, setIsFollowing] = useState(false)
    const [isJoining, setIsJoining] = useState(false)

    const followUserHandler = async (userId: string, username: string) => {
      setIsFollowing(true)            
      try {
          const res = await followUser(userId).unwrap()          
          if(res){
            Toast.show({
              type: 'success',
              text1: 'Success',
              text2: `Successfully followed ${username}`
            });
            setIsFollowing(false)
          }
      }catch(error: any){        
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: `${error?.data?.message}`
        });  
        setIsFollowing(false)
      }
    }

    const joinGiveawayHandler = async (giveawayId: string ) => {
        setIsJoining(true)       
        try {
            const res = await joinGiveaway(giveawayId).unwrap()          
            if(res){      
              Toast.show({
                type: 'success',
                text1: 'Success',
                text2: `Joined successfully`
              });
              setIsJoining(false)
              router.push({
                pathname: "/(screens)/detailedGiveawayScreen",
                params: { giveawayId },
              })
            }
        }catch(error: any){
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: `${error.data.message}`
          });            
          router.push('/')
          setIsJoining(false)
        }
    }
  
    return {isFollowing, isJoining, followUserHandler, joinGiveawayHandler}
}

export default useMutation

import { Alert } from "react-native"

export enum ErrorType {
    ERROR = "Error",
    SOMETHING_WENT_WRONG = "Something Went Wrong",
}

const useError = (errorType: ErrorType, message: string) => {
    return Alert.alert(
        errorType,
        message
    );
}

export const useHandleMutationError = (error: any) => {
    if(error?.data?.message) return useError(ErrorType.ERROR, error.data.message)    
   const errorMessage = error?.message && error?.message?.substring(error.message.indexOf("{"));
   useError(ErrorType.ERROR, JSON.parse(errorMessage).response.errors[0].message);
}

export default useError;
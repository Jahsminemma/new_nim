import { useMemo, useState } from 'react';
import { useGetActiveProvidersQuery } from '../redux/slice/servicesApiSlice';

const useServiceProviderOptions = (serviceCategory: string) => {
    const { data, isSuccess, isLoading, error } = useGetActiveProvidersQuery(serviceCategory);    

    const [serviceProviderOptions, setServiceProviderOptions] = useState([]);
    
    useMemo(() => {
        if (data && isSuccess) {
            setServiceProviderOptions(data?.data);
        }
    }, [data, isSuccess]);
    
    return { serviceProviderOptions, isLoading, errorFetching: error };
}

export default useServiceProviderOptions;
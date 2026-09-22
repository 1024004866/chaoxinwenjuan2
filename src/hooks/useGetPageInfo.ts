import {useSelector} from 'react-redux'
import {StateType} from '../store/index'
import {PageInfoType} from '../store/pageInfoReducer'
function useGetPageInfo() {
    const pageInfo = useSelector((state: StateType) => state.pageInfo) as PageInfoType
    return pageInfo
}
export default useGetPageInfo

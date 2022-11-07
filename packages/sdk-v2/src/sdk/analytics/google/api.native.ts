import analytics from '@react-native-firebase/analytics'
import { IGoogleAPI, IGoogleConfig } from './types'

export default (_: IGoogleConfig): IGoogleAPI => <any>analytics as IGoogleAPI

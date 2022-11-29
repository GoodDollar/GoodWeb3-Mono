import analytics from '@react-native-firebase/analytics'
import { IGoogleAPI, IGoogleConfig } from './types'

const GoogleAPIFactory = (_: IGoogleConfig): IGoogleAPI => <any>analytics as IGoogleAPI;

export default GoogleAPIFactory;

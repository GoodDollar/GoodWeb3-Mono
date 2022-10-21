import analytics from '@react-native-firebase/analytics'

export default {
  logEvent(event: string, data: any = {}) {
    analytics.logEvent(event, data)
  }
}

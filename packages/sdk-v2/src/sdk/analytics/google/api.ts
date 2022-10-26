const { dataLayer } = <any>window

export default !dataLayer ? null : {
  logEvent(event: string, data: any = {}) {
    dataLayer.push({ event, ...data })
  }
}

import { isFunction } from 'lodash'
import { IIndicativeApi } from '.';

// EXAMPLE OF INDICATIVE.COM SNIPPET TO USE WITH THIS LIBRARY
// DO NOT INITIALIZE IT BY API KEY JUST ADD ASYNC SCRIPT
//
// <script type="text/javascript">
//         (function() {
//                 var ind = document.createElement('script');
//                 ind.src = '//cdn.indicative.com/js/1.0.2/Indicative.min.js';
//                 ind.type = 'text/javascript';
//                 ind.async = 'true';
//
//                 var s = document.getElementsByTagName('script')[0];
//                 s.parentNode.insertBefore(ind, s);
//         })();
// </script>

function hasIndicativeSnippet(): boolean {
  return document
    .querySelectorAll('script[src*="//cdn.indicative.com"]')
    .length > 0
}

async function isIndicativeLoaded(): Promise<boolean> {
  let ts = Date.now();
  const timeout = 5 * 1000;

  return new Promise<boolean>(resolve => {
    const check = () => {
      if ('Indicative' in window) {
        resolve(true)
        return
      }

      if ((Date.now() - ts) >= timeout) {
        resolve(false)
        return
      }

      requestIdleCallback(check)
    }

    check()
  })
}

class IndicativeAPIWeb implements IIndicativeApi {
  private api: any;

  constructor() {
    return new Proxy(this, {
      get: (target, property) => {
        const { api } = target
        const propName: string = String(property || '')
        let propertyTarget = api
        let propertyValue: any

        // override initialize()
        if (propName === "initialize") {
          propertyTarget = this
        }

        propertyValue = propertyTarget[property]

        if (isFunction(propertyValue)) {
          propertyValue = propertyValue.bind(propertyTarget)
        }

        return propertyValue
      }
    })
  }

  async initialize(apiKey: string): Promise<boolean> {
    const isLoaded = await isIndicativeLoaded()

    if (!isLoaded) {
      throw new Error('Error loading indicative.com snippet')
    }

    const api = (<any>window).Indicative;
    const { initialized, apiKey: initializedWithKey } = api;

    if (initialized && initializedWithKey !== apiKey) {
      throw new Error('indicative.com already initialized with the different API key')
    }

    if (!initialized) {
      api.initialize(apiKey)
    }

    return api.initialized;
  }

  // just for typings compatibility, those methods will be
  // called never, proxied to window.Indicative instead
  addProperties(props: object): void {}
  setUniqueID(id: string): void {}
  buildEvent(eventName: string, props?: object) {}
}

export default hasIndicativeSnippet() ? new IndicativeAPIWeb() : null
